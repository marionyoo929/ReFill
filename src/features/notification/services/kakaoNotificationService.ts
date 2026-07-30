/**
 * 알림 목록을 서버로 보내 카카오톡("나에게 보내기")으로 발송한다.
 *
 * 카카오 REST API 는 브라우저에서 직접 호출할 수 없고(CORS) REST API 키가 노출되므로,
 * 실제 발송은 Vercel 서버리스 함수(api/kakao-send.ts)에서만 일어난다.
 * 여기서는 Firebase ID 토큰으로 신원만 증명한다 (useAnalyzeItemImage 와 같은 패턴).
 */
import { auth } from '@/firebase/config';
import { env } from '@/config/env';
import type {
  NotificationItem,
  NotificationType,
} from '@/features/notification/types/notification.types';

/**
 * 서버의 KakaoNotificationItem(api/kakao-send.ts)과 필드가 일치해야 한다.
 * 하나라도 어긋나면 서버 검증에서 invalid-argument 로 거절된다.
 */
export type KakaoNotificationPayloadItem = {
  itemName: string;
  remainingDays: number;
  type: NotificationType;
};

type KakaoSendResponse =
  | { status: 'ok'; text: string }
  | { status: 'error'; code?: string; detail?: string };

/** 서버가 내려준 에러 코드를 보존해 호출부에서 문구로 바꿀 수 있게 한다. */
export class KakaoSendError extends Error {
  readonly code: string;
  /** 배포 설정 오류일 때 문제가 된 환경 변수 이름 (값은 담기지 않는다). */
  readonly detail?: string;

  constructor(code: string, detail?: string) {
    super(`카카오 발송 실패: ${code}`);
    this.name = 'KakaoSendError';
    this.code = code;
    this.detail = detail;
  }
}

// 같은 도메인의 서버리스 함수라 기본값은 상대 경로면 충분하다.
// 로컬 vite dev 처럼 함수가 같이 뜨지 않는 환경에서만 환경 변수로 덮어쓴다.
const ENDPOINT = env.VITE_KAKAO_SEND_ENDPOINT || '/api/kakao-send';

export function toKakaoPayloadItems(
  notifications: NotificationItem[],
): KakaoNotificationPayloadItem[] {
  return notifications.map(({ itemName, remainingDays, type }) => ({
    itemName,
    remainingDays,
    type,
  }));
}

function isKakaoSendResponse(value: unknown): value is KakaoSendResponse {
  return typeof value === 'object' && value !== null && 'status' in value;
}

/** 발송에 성공하면 실제로 보낸 본문을 돌려준다. */
export async function sendKakaoNotification(notifications: NotificationItem[]): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new KakaoSendError('unauthenticated');
  }

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ items: toKakaoPayloadItems(notifications) }),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok || !isKakaoSendResponse(data) || data.status !== 'ok') {
    const error = isKakaoSendResponse(data) && data.status === 'error' ? data : undefined;
    throw new KakaoSendError(error?.code ?? 'internal', error?.detail);
  }

  return data.text;
}

/** 발송 에러를 사용자에게 보여줄 문구로 바꾼다. */
export function toKakaoErrorMessage(error: unknown): string {
  if (!(error instanceof KakaoSendError)) {
    return '카카오 발송 중 오류가 발생했습니다.';
  }

  switch (error.code) {
    case 'unauthenticated':
      return '로그인이 필요합니다. 다시 로그인해 주세요.';
    case 'not-linked':
      return '카카오 연동이 필요합니다. 카카오 계정을 먼저 연결해 주세요.';
    case 'reauth-required':
      return '카카오 연동이 만료되었습니다. 카카오 계정을 다시 연결해 주세요.';
    case 'invalid-argument':
      return '알림 내용을 만들지 못했습니다. 새로고침 후 다시 시도해 주세요.';
    case 'kakao-unavailable':
      return '카카오 메시지 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.';
    case 'server-misconfigured':
      // 재시도해도 소용없는 배포 설정 문제라, 어떤 변수가 문제인지 그대로 보여준다.
      return `서버 설정 오류: ${error.detail ?? '배포 환경 변수를 확인해 주세요.'}`;
    default:
      return '카카오 발송 중 오류가 발생했습니다.';
  }
}
