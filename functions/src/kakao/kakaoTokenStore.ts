/**
 * 카카오 리프레시 토큰 저장소 (Firestore `kakao_tokens/{uid}`).
 *
 * Admin SDK 로 접근하므로 보안 규칙을 우회한다.
 * firestore.rules 에서 이 컬렉션은 클라이언트 접근을 전면 차단하고 있다.
 */
import { FieldValue, getFirestore } from 'firebase-admin/firestore';

const COLLECTION = 'kakao_tokens';

export type KakaoTokenDoc = {
  refreshToken: string;
  scope?: string;
};

/**
 * 사용자의 리프레시 토큰을 조회한다. 연동 전이면 null.
 *
 * getFirestore() 는 initializeApp() 이후에 호출되어야 하므로 모듈 로드 시점이 아닌
 * 함수 실행 시점에 호출한다.
 */
export async function getRefreshToken(uid: string): Promise<KakaoTokenDoc | null> {
  const snapshot = await getFirestore().collection(COLLECTION).doc(uid).get();
  if (!snapshot.exists) return null;

  const data = snapshot.data();
  if (!data?.refreshToken) return null;

  return { refreshToken: data.refreshToken as string, scope: data.scope as string | undefined };
}

/** 카카오가 새 리프레시 토큰을 내려준 경우에만 호출한다. */
export async function updateRefreshToken(uid: string, refreshToken: string): Promise<void> {
  await getFirestore()
    .collection(COLLECTION)
    .doc(uid)
    .set({ refreshToken, updatedAt: FieldValue.serverTimestamp() }, { merge: true });
}
