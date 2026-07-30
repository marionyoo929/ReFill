import { createRemoteJWKSet, importPKCS8, jwtVerify, SignJWT } from 'jose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * 카카오톡 "나에게 보내기" 발송 엔드포인트.
 *
 * 카카오 REST API 키가 노출되면 안 되므로 브라우저는 이 함수를 호출하기만 하고,
 * 실제 카카오 호출은 여기(서버)에서만 일어난다.
 *
 * 의도적으로 자기완결적으로 작성했다.
 * - api/ 디렉터리의 모든 파일은 Vercel 에서 각각 하나의 엔드포인트가 되므로 헬퍼를 옆에 둘 수 없다.
 * - firebase-admin 은 jwks-rsa -> jose(ESM 전용) 조합이 Vercel CJS 런타임에서 죽는다(커밋 1b589da).
 *   Firestore 는 REST API 를, 인증은 jose 를 직접 써서 무거운 의존성을 아예 만들지 않는다.
 *
 * 로직 원본: functions/src/kakao/{kakaoClient,notificationMessage,sendKakaoMemo}.ts
 * (실제 카카오 API 로 검증된 코드) — 한쪽을 고치면 다른 쪽도 함께 확인할 것.
 */

const KAKAO_TOKEN_ENDPOINT = 'https://kauth.kakao.com/oauth/token';
const KAKAO_MEMO_SEND_ENDPOINT = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';
const GOOGLE_TOKEN_ENDPOINT = 'https://oauth2.googleapis.com/token';
const FIRESTORE_SCOPE = 'https://www.googleapis.com/auth/datastore';
const TOKEN_COLLECTION = 'kakao_tokens';

/** 나에게 보내기 text 템플릿 본문 최대 길이 */
const TEXT_MAX_LENGTH = 200;

const APP_URL = process.env.KAKAO_LINK_URL || 'https://re-fill-sand.vercel.app';
const BUTTON_TITLE = 'Re:Fill 열기';
const DEFAULT_TEXT = '[Re:Fill] 카카오톡 연동 테스트 메시지입니다.';

// ---------------------------------------------------------------------------
// Firebase ID 토큰 검증 (api/analyze.ts 와 동일한 방식)
// ---------------------------------------------------------------------------

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com',
  ),
);

/**
 * 배포 환경 변수가 없거나 형식이 잘못된 경우.
 * 일반 오류(500 internal)와 구분해서 어떤 변수가 문제인지 알 수 있게 한다.
 * detail 에는 변수 "이름"만 담는다 — 값은 절대 응답에 싣지 않는다.
 */
class ConfigError extends Error {
  readonly detail: string;

  constructor(detail: string) {
    super(`설정 오류: ${detail}`);
    this.name = 'ConfigError';
    this.detail = detail;
  }
}

function requireProjectId(): string {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new ConfigError('FIREBASE_PROJECT_ID 없음');
  }
  return projectId;
}

/** 검증에 성공하면 uid 를 돌려준다. */
async function verifyFirebaseIdToken(idToken: string): Promise<string> {
  const projectId = requireProjectId();
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.sub) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
  return payload.sub;
}

// ---------------------------------------------------------------------------
// 서비스 계정 -> Google 액세스 토큰 (Firestore REST 호출용)
// ---------------------------------------------------------------------------

type CachedAccessToken = { token: string; expiresAt: number };

// 람다 인스턴스가 재사용되는 동안 토큰을 재사용한다. 만료 1분 전에 폐기한다.
let cachedAccessToken: CachedAccessToken | null = null;

async function getGoogleAccessToken(): Promise<string> {
  if (cachedAccessToken && cachedAccessToken.expiresAt > Date.now() + 60_000) {
    return cachedAccessToken.token;
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (!clientEmail) {
    throw new ConfigError('FIREBASE_CLIENT_EMAIL 없음');
  }
  if (!rawPrivateKey) {
    throw new ConfigError('FIREBASE_PRIVATE_KEY 없음');
  }

  // 환경 변수 UI 로 키를 옮기는 과정에서 흔히 깨지는 두 가지를 흡수한다.
  //  - JSON 에서 값을 복사할 때 딸려오는 양끝 큰따옴표
  //  - 개행이 \n 두 글자로 들어오는 경우 (실제 개행으로 넣었다면 그대로 통과한다)
  const privateKey = rawPrivateKey
    .trim()
    .replace(/^["']|["']$/g, '')
    .replace(/\\n/g, '\n')
    .trim();

  if (!privateKey.startsWith('-----BEGIN')) {
    throw new ConfigError('FIREBASE_PRIVATE_KEY 형식 오류 (-----BEGIN 으로 시작해야 함)');
  }

  let key;
  try {
    key = await importPKCS8(privateKey, 'RS256');
  } catch {
    throw new ConfigError('FIREBASE_PRIVATE_KEY 파싱 실패 (개행이 보존됐는지 확인)');
  }
  const assertion = await new SignJWT({ scope: FIRESTORE_SCOPE })
    .setProtectedHeader({ alg: 'RS256' })
    .setIssuer(clientEmail)
    .setSubject(clientEmail)
    .setAudience(GOOGLE_TOKEN_ENDPOINT)
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(key);

  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }).toString(),
  });

  const json = (await response.json()) as { access_token?: string; expires_in?: number };
  if (!response.ok || !json.access_token) {
    throw new Error(`Google 액세스 토큰 발급 실패 (HTTP ${response.status})`);
  }

  cachedAccessToken = {
    token: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedAccessToken.token;
}

// ---------------------------------------------------------------------------
// Firestore REST — kakao_tokens/{uid} 읽기/쓰기
// (firestore.rules 가 클라이언트 접근을 전면 차단하므로 서버만 이 문서를 다룬다)
// ---------------------------------------------------------------------------

function documentUrl(uid: string): string {
  const projectId = requireProjectId();
  return `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${TOKEN_COLLECTION}/${encodeURIComponent(uid)}`;
}

type FirestoreDocument = {
  fields?: Record<string, { stringValue?: string; timestampValue?: string }>;
};

/** 저장된 리프레시 토큰. 문서가 없거나 값이 비어 있으면 null. */
async function getRefreshToken(uid: string): Promise<string | null> {
  const accessToken = await getGoogleAccessToken();
  const response = await fetch(documentUrl(uid), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error(`Firestore 조회 실패 (HTTP ${response.status})`);
  }

  const doc = (await response.json()) as FirestoreDocument;
  return doc.fields?.refreshToken?.stringValue || null;
}

/** 카카오가 새 리프레시 토큰을 내려준 경우에만 호출한다. updateMask 로 해당 필드만 병합한다. */
async function updateRefreshToken(uid: string, refreshToken: string): Promise<void> {
  const accessToken = await getGoogleAccessToken();
  const url = `${documentUrl(uid)}?updateMask.fieldPaths=refreshToken&updateMask.fieldPaths=updatedAt`;

  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        refreshToken: { stringValue: refreshToken },
        updatedAt: { timestampValue: new Date().toISOString() },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Firestore 갱신 실패 (HTTP ${response.status})`);
  }
}

// ---------------------------------------------------------------------------
// 카카오 REST
// ---------------------------------------------------------------------------

class KakaoApiError extends Error {
  readonly status?: number;
  readonly code?: number;

  constructor(message: string, options: { status?: number; code?: number } = {}) {
    super(message);
    this.name = 'KakaoApiError';
    this.status = options.status;
    this.code = options.code;
  }

  /** 재인증이 필요한(토큰이 죽은) 상태인지 */
  get requiresReauth(): boolean {
    return this.code === -401 || this.code === -402;
  }
}

async function parseJson(response: Response): Promise<Record<string, unknown>> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

/** 주의: 응답에 refresh_token 이 없으면 기존 리프레시 토큰을 계속 사용해야 한다. */
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken?: string;
}> {
  const restApiKey = process.env.KAKAO_REST_API_KEY?.trim();
  if (!restApiKey) {
    throw new ConfigError('KAKAO_REST_API_KEY 없음');
  }

  const body: Record<string, string> = {
    grant_type: 'refresh_token',
    client_id: restApiKey,
    refresh_token: refreshToken,
  };
  const clientSecret = process.env.KAKAO_CLIENT_SECRET?.trim();
  if (clientSecret) body.client_secret = clientSecret;

  const response = await fetch(KAKAO_TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams(body).toString(),
  });

  const json = await parseJson(response);
  if (!response.ok) {
    const description =
      (json.error_description as string) || (json.error as string) || '알 수 없는 오류';
    throw new KakaoApiError(`카카오 토큰 갱신 실패: ${description}`, {
      status: response.status,
      // 토큰 엔드포인트는 error_code 로 내려주며, 만료/철회 시 -401 계열이다.
      code: typeof json.error_code === 'number' ? json.error_code : -401,
    });
  }

  const token = json as { access_token: string; refresh_token?: string };
  return { accessToken: token.access_token, refreshToken: token.refresh_token };
}

/** 성공 시 카카오는 { result_code: 0 } 을 반환한다. */
async function sendMemoText(accessToken: string, text: string): Promise<void> {
  const templateObject = {
    object_type: 'text',
    text,
    link: { web_url: APP_URL, mobile_web_url: APP_URL },
    button_title: BUTTON_TITLE,
  };

  const response = await fetch(KAKAO_MEMO_SEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: new URLSearchParams({ template_object: JSON.stringify(templateObject) }).toString(),
  });

  const json = await parseJson(response);
  if (!response.ok || json.result_code !== 0) {
    throw new KakaoApiError(
      (json.msg as string) || `카카오 메시지 발송 실패 (HTTP ${response.status})`,
      { status: response.status, code: typeof json.code === 'number' ? json.code : undefined },
    );
  }
}

function truncateForKakao(text: string, maxLength = TEXT_MAX_LENGTH): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}

// ---------------------------------------------------------------------------
// 알림 목록 -> 본문
// ---------------------------------------------------------------------------

type KakaoNotificationType = 'upcoming' | 'today' | 'overdue';

type KakaoNotificationItem = {
  itemName: string;
  remainingDays: number;
  type: KakaoNotificationType;
};

const HEADER = '[Re:Fill] 소진 임박 알림';
const FOOTER = '지금 확인하고 미리 채워두세요.';

/** overdue → today → upcoming 순서로, 같은 그룹 안에서는 임박한 것부터 */
const TYPE_ORDER: Record<KakaoNotificationType, number> = { overdue: 0, today: 1, upcoming: 2 };

function isKakaoNotificationItem(value: unknown): value is KakaoNotificationItem {
  if (typeof value !== 'object' || value === null) return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.itemName === 'string' &&
    item.itemName.length > 0 &&
    typeof item.remainingDays === 'number' &&
    Number.isFinite(item.remainingDays) &&
    (item.type === 'upcoming' || item.type === 'today' || item.type === 'overdue')
  );
}

function formatLine({ itemName, remainingDays, type }: KakaoNotificationItem): string {
  switch (type) {
    case 'overdue':
      return `· ${itemName} — ${Math.abs(remainingDays)}일 전 소진 예정 (확인 필요)`;
    case 'today':
      return `· ${itemName} — 오늘 소진 예정`;
    default:
      return `· ${itemName} — ${remainingDays}일 뒤 소진 예정`;
  }
}

/** 항목이 많아 길이를 초과하면 앞쪽 항목만 남기고 "외 N건" 으로 요약한다. */
function formatNotificationText(
  items: KakaoNotificationItem[],
  maxLength = TEXT_MAX_LENGTH,
): string {
  if (items.length === 0) {
    return `${HEADER}\n소진 임박한 소모품이 없습니다.`;
  }

  const sorted = [...items].sort((a, b) => {
    const byType = TYPE_ORDER[a.type] - TYPE_ORDER[b.type];
    return byType !== 0 ? byType : a.remainingDays - b.remainingDays;
  });

  const lines = sorted.map(formatLine);

  const assemble = (visibleCount: number): string => {
    const hidden = lines.length - visibleCount;
    const parts = [HEADER, ...lines.slice(0, visibleCount)];
    if (hidden > 0) parts.push(`외 ${hidden}건`);
    parts.push(FOOTER);
    return parts.join('\n');
  };

  let text = assemble(lines.length);
  for (let visible = lines.length - 1; visible >= 1 && text.length > maxLength; visible -= 1) {
    text = assemble(visible);
  }
  // 항목 하나만 남겨도 길이를 넘기는 경우(이름이 아주 긴 소모품)에는 잘라낸다.
  return truncateForKakao(text, maxLength);
}

// ---------------------------------------------------------------------------
// 핸들러
// ---------------------------------------------------------------------------

type RequestBody = {
  text?: string;
  items?: unknown[];
};

/** text 가 있으면 우선하고, 없으면 items 로 본문을 만든다. 둘 다 없으면 테스트 문구. */
function resolveText(body: RequestBody): string {
  const trimmed = body.text?.trim();
  if (trimmed) {
    return truncateForKakao(trimmed);
  }
  if (Array.isArray(body.items)) {
    const items = body.items.map((item) => {
      if (!isKakaoNotificationItem(item)) {
        throw new KakaoApiError('INVALID_ITEMS');
      }
      return item;
    });
    return formatNotificationText(items);
  }
  return DEFAULT_TEXT;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ status: 'error', code: 'method-not-allowed' });
    return;
  }

  let uid: string;
  try {
    const match = /^Bearer\s+(.*)$/i.exec(req.headers.authorization ?? '');
    if (!match) {
      res.status(401).json({ status: 'error', code: 'unauthenticated' });
      return;
    }
    uid = await verifyFirebaseIdToken(match[1]);
  } catch (error) {
    console.error('kakao-send auth error:', error);
    res.status(401).json({ status: 'error', code: 'unauthenticated' });
    return;
  }

  try {
    const body = (typeof req.body === 'object' && req.body !== null ? req.body : {}) as RequestBody;

    let text: string;
    try {
      text = resolveText(body);
    } catch {
      res.status(400).json({ status: 'error', code: 'invalid-argument' });
      return;
    }

    const storedRefreshToken = await getRefreshToken(uid);
    if (!storedRefreshToken) {
      res.status(412).json({ status: 'error', code: 'not-linked' });
      return;
    }

    const refreshed = await refreshAccessToken(storedRefreshToken);
    // 카카오가 새 리프레시 토큰을 준 경우에만 저장소를 갱신한다.
    if (refreshed.refreshToken) {
      await updateRefreshToken(uid, refreshed.refreshToken);
    }

    await sendMemoText(refreshed.accessToken, text);

    console.log('카카오 발송 성공', { uid, length: text.length });
    res.status(200).json({ status: 'ok', text });
  } catch (error) {
    if (error instanceof ConfigError) {
      // 배포 환경 변수 문제는 재시도해도 소용없으므로 별도 코드로 알린다.
      console.error('kakao-send 설정 오류:', error.detail);
      res.status(500).json({ status: 'error', code: 'server-misconfigured', detail: error.detail });
      return;
    }
    if (error instanceof KakaoApiError) {
      console.error('카카오 발송 실패', { uid, code: error.code, message: error.message });
      if (error.requiresReauth) {
        res.status(412).json({ status: 'error', code: 'reauth-required' });
        return;
      }
      res.status(503).json({ status: 'error', code: 'kakao-unavailable' });
      return;
    }
    console.error('kakao-send error:', error);
    res.status(500).json({ status: 'error', code: 'internal' });
  }
}
