/**
 * 카카오톡 "나에게 보내기" 호출 가능(callable) 함수.
 *
 * 흐름: 인증 확인 → Firestore 에서 refresh token 조회 → 액세스 토큰 갱신
 *       → 본문 생성 → 카카오 발송
 *
 * 각 사용자가 자신의 카카오 계정으로 자기 자신에게 받는 구조이므로
 * 카카오 검수(비즈앱 전환)가 필요 없다.
 */
import { HttpsError, onCall } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import { logger } from 'firebase-functions';

import { KakaoApiError, refreshAccessToken, sendMemoText, truncateForKakao } from './kakaoClient';
import { getRefreshToken, updateRefreshToken } from './kakaoTokenStore';
import {
  formatNotificationText,
  isKakaoNotificationItem,
  type KakaoNotificationItem,
} from './notificationMessage';

const kakaoRestApiKey = defineSecret('KAKAO_REST_API_KEY');
const kakaoClientSecret = defineSecret('KAKAO_CLIENT_SECRET');

/**
 * 카카오 메시지 버튼이 여는 주소. 배포 시 환경 변수로 덮어쓴다.
 * 기본값은 Vercel 운영 배포 주소다. firebase.json 에 hosting 블록이 없으므로
 * *.web.app 주소를 기본값으로 두면 안 된다 (404 페이지가 열린다).
 */
const APP_URL = process.env.KAKAO_LINK_URL || 'https://re-fill-sand.vercel.app';

const DEFAULT_TEXT = '[Re:Fill] 카카오톡 연동 테스트 메시지입니다.';

type SendKakaoMemoRequest = {
  /** 직접 지정한 본문. items 보다 우선한다. */
  text?: string;
  /** 알림 항목 목록. text 가 없으면 이 값으로 본문을 만든다. */
  items?: unknown[];
};

/** 요청에서 발송할 본문을 결정한다. */
function resolveText(data: SendKakaoMemoRequest | undefined): string {
  if (typeof data?.text === 'string' && data.text.trim().length > 0) {
    return truncateForKakao(data.text.trim());
  }

  if (Array.isArray(data?.items)) {
    const items: KakaoNotificationItem[] = data.items.filter(isKakaoNotificationItem);
    if (items.length !== data.items.length) {
      throw new HttpsError('invalid-argument', 'items 형식이 올바르지 않은 항목이 있습니다.');
    }
    return formatNotificationText(items);
  }

  return DEFAULT_TEXT;
}

export const sendKakaoMemo = onCall<SendKakaoMemoRequest>(
  {
    region: 'asia-northeast3',
    secrets: [kakaoRestApiKey, kakaoClientSecret],
  },
  async (request) => {
    const uid = request.auth?.uid;
    if (!uid) {
      throw new HttpsError('unauthenticated', '로그인이 필요합니다.');
    }

    const stored = await getRefreshToken(uid);
    if (!stored) {
      throw new HttpsError(
        'failed-precondition',
        '카카오 연동이 필요합니다. 카카오 계정을 먼저 연결해 주세요.',
      );
    }

    const text = resolveText(request.data);

    try {
      const refreshed = await refreshAccessToken({
        restApiKey: kakaoRestApiKey.value(),
        clientSecret: kakaoClientSecret.value() || undefined,
        refreshToken: stored.refreshToken,
      });

      // 카카오는 리프레시 토큰 만료가 임박한 경우에만 새 값을 내려준다.
      if (refreshed.refreshToken) {
        await updateRefreshToken(uid, refreshed.refreshToken);
      }

      await sendMemoText(refreshed.accessToken, {
        text,
        linkUrl: APP_URL,
        buttonTitle: 'Re:Fill 열기',
      });
    } catch (error) {
      if (error instanceof KakaoApiError) {
        logger.error('카카오 발송 실패', { uid, code: error.code, message: error.message });
        if (error.requiresReauth) {
          throw new HttpsError(
            'failed-precondition',
            '카카오 연동이 만료되었습니다. 카카오 계정을 다시 연결해 주세요.',
          );
        }
        throw new HttpsError(
          'unavailable',
          '카카오 메시지 발송에 실패했습니다. 잠시 후 다시 시도해 주세요.',
        );
      }
      throw error;
    }

    logger.info('카카오 발송 성공', { uid, length: text.length });
    return { success: true, text };
  },
);
