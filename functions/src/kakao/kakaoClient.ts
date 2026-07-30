/**
 * 카카오 REST API 클라이언트.
 *
 * Firestore/Functions 에 의존하지 않는 순수 래퍼이며,
 * scripts/kakao/kakaoApi.mjs 에서 실제 발송으로 검증된 로직을 그대로 옮긴 것이다.
 * 새로운 npm 의존성 없이 Node 20 내장 fetch 를 사용한다.
 */

const TOKEN_ENDPOINT = 'https://kauth.kakao.com/oauth/token';
const MEMO_SEND_ENDPOINT = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';

/** 나에게 보내기 text 템플릿 본문 최대 길이 */
export const TEXT_MAX_LENGTH = 200;

export type KakaoTokenResponse = {
  access_token: string;
  expires_in: number;
  /** 리프레시 토큰 만료가 임박한 경우에만 내려온다. */
  refresh_token?: string;
  refresh_token_expires_in?: number;
  scope?: string;
  token_type?: string;
};

export type RefreshResult = {
  accessToken: string;
  expiresIn: number;
  /** 값이 있을 때만 저장소를 갱신해야 한다. */
  refreshToken?: string;
  scope?: string;
};

export type SendMemoTextInput = {
  text: string;
  linkUrl: string;
  buttonTitle?: string;
};

/** 카카오 API 에러. 카카오가 준 code 를 보존해 호출부에서 분기할 수 있게 한다. */
export class KakaoApiError extends Error {
  readonly status?: number;
  readonly code?: number;
  readonly body?: unknown;

  constructor(message: string, options: { status?: number; code?: number; body?: unknown } = {}) {
    super(message);
    this.name = 'KakaoApiError';
    this.status = options.status;
    this.code = options.code;
    this.body = options.body;
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

/**
 * 리프레시 토큰으로 액세스 토큰을 갱신한다.
 *
 * 주의: 응답에 refresh_token 이 없으면 기존 리프레시 토큰을 계속 사용해야 한다.
 */
export async function refreshAccessToken(params: {
  restApiKey: string;
  refreshToken: string;
  clientSecret?: string;
}): Promise<RefreshResult> {
  const body: Record<string, string> = {
    grant_type: 'refresh_token',
    client_id: params.restApiKey,
    refresh_token: params.refreshToken,
  };
  if (params.clientSecret) body.client_secret = params.clientSecret;

  const response = await fetch(TOKEN_ENDPOINT, {
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
      body: json,
    });
  }

  const token = json as unknown as KakaoTokenResponse;
  return {
    accessToken: token.access_token,
    expiresIn: token.expires_in,
    refreshToken: token.refresh_token,
    scope: token.scope,
  };
}

/**
 * 카카오톡 "나에게 보내기" - text 템플릿 발송.
 * 성공 시 카카오는 { result_code: 0 } 을 반환한다.
 */
export async function sendMemoText(
  accessToken: string,
  { text, linkUrl, buttonTitle }: SendMemoTextInput,
): Promise<void> {
  const templateObject: Record<string, unknown> = {
    object_type: 'text',
    text,
    link: { web_url: linkUrl, mobile_web_url: linkUrl },
  };
  if (buttonTitle) templateObject.button_title = buttonTitle;

  const response = await fetch(MEMO_SEND_ENDPOINT, {
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
      {
        status: response.status,
        code: typeof json.code === 'number' ? json.code : undefined,
        body: json,
      },
    );
  }
}

/** 본문을 카카오 제한 길이에 맞춰 자른다. */
export function truncateForKakao(text: string, maxLength = TEXT_MAX_LENGTH): string {
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
