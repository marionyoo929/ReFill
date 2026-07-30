/**
 * 카카오 REST API 호출 래퍼 (의존성 없음, Node 20+ 내장 fetch 사용).
 *
 * 이 파일의 로직은 검증 후 functions/src/kakao/kakaoClient.ts 로 그대로 옮겨진다.
 * 따라서 여기서 동작이 확인되면 Cloud Functions 쪽도 동일하게 동작한다고 볼 수 있다.
 */

const TOKEN_ENDPOINT = 'https://kauth.kakao.com/oauth/token';
const AUTHORIZE_ENDPOINT = 'https://kauth.kakao.com/oauth/authorize';
const MEMO_SEND_ENDPOINT = 'https://kapi.kakao.com/v2/api/talk/memo/default/send';

/** 나에게 보내기 text 템플릿 본문 최대 길이 */
export const TEXT_MAX_LENGTH = 200;

/** 카카오 API가 에러 응답을 준 경우. 카카오의 code 를 보존해 호출부에서 분기할 수 있게 한다. */
export class KakaoApiError extends Error {
  constructor(message, { status, code, body } = {}) {
    super(message);
    this.name = 'KakaoApiError';
    this.status = status;
    this.code = code;
    this.body = body;
  }
}

/** 카카오 에러 코드를 사람이 읽을 수 있는 한국어 안내로 바꾼다. */
export function describeKakaoError(error) {
  if (!(error instanceof KakaoApiError)) return error.message;

  switch (error.code) {
    case -401:
      return '액세스 토큰이 유효하지 않습니다. `node scripts/kakao/kakaoAuth.mjs` 로 다시 인증하세요.';
    case -402:
      return '권한(스코프)이 부족합니다. 카카오 개발자 콘솔 > 카카오 로그인 > 동의항목에서 [접근권한] "카카오톡 메시지 전송(talk_message)"을 활성화한 뒤 다시 인증하세요.';
    case -1:
      return '카카오 플랫폼 일시 장애 또는 점검 중입니다. 잠시 후 다시 시도하세요.';
    case -2:
      return '요청 파라미터가 잘못되었습니다. template_object 형식을 확인하세요.';
    default:
      return error.message;
  }
}

/** 인증 코드를 받기 위한 동의 화면 URL을 만든다. */
export function buildAuthorizeUrl({ restApiKey, redirectUri, state, scope = 'talk_message' }) {
  const params = new URLSearchParams({
    client_id: restApiKey,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    state,
  });
  return `${AUTHORIZE_ENDPOINT}?${params.toString()}`;
}

async function requestToken(body) {
  const response = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8' },
    body: new URLSearchParams(body).toString(),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new KakaoApiError(
      `토큰 요청 실패 (${response.status}): ${json.error_description || json.error || '알 수 없는 오류'}`,
      { status: response.status, code: json.error_code, body: json },
    );
  }
  return json;
}

/** 인가 코드를 액세스/리프레시 토큰으로 교환한다. */
export function exchangeCodeForToken({ restApiKey, clientSecret, redirectUri, code }) {
  return requestToken({
    grant_type: 'authorization_code',
    client_id: restApiKey,
    redirect_uri: redirectUri,
    code,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  });
}

/**
 * 리프레시 토큰으로 액세스 토큰을 갱신한다.
 *
 * 주의: 카카오는 리프레시 토큰 만료가 임박한 경우에만 새 refresh_token 을 함께 내려준다.
 * 응답에 refresh_token 이 없으면 기존 값을 계속 사용해야 하며 절대 비워서는 안 된다.
 */
export function refreshAccessToken({ restApiKey, clientSecret, refreshToken }) {
  return requestToken({
    grant_type: 'refresh_token',
    client_id: restApiKey,
    refresh_token: refreshToken,
    ...(clientSecret ? { client_secret: clientSecret } : {}),
  });
}

/**
 * 나에게 보내기 - text 템플릿 발송.
 * 성공 시 카카오는 { result_code: 0 } 을 반환한다.
 */
export async function sendMemoText(accessToken, { text, linkUrl, buttonTitle }) {
  const templateObject = {
    object_type: 'text',
    text,
    link: { web_url: linkUrl, mobile_web_url: linkUrl },
    ...(buttonTitle ? { button_title: buttonTitle } : {}),
  };

  const response = await fetch(MEMO_SEND_ENDPOINT, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',
    },
    body: new URLSearchParams({ template_object: JSON.stringify(templateObject) }).toString(),
  });

  const json = await response.json().catch(() => ({}));
  if (!response.ok || json.result_code !== 0) {
    throw new KakaoApiError(json.msg || `메시지 발송 실패 (HTTP ${response.status})`, {
      status: response.status,
      code: json.code,
      body: json,
    });
  }
  return json;
}
