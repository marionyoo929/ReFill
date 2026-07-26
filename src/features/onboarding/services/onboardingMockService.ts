/**
 * 사용자별 Onboarding 완료 여부를 localStorage에 유지하는 Mock 계층이다.
 * 실제 Firebase 연동 시 users 컬렉션의 필드로 교체 가능하다.
 */
const COMPLETED_UIDS_STORAGE_KEY = 'refill_onboarding_completed_uids';

function readCompletedUids(): string[] {
  try {
    const raw = localStorage.getItem(COMPLETED_UIDS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function isOnboardingCompleted(uid: string): boolean {
  return readCompletedUids().includes(uid);
}

export function markOnboardingCompleted(uid: string): void {
  const completed = readCompletedUids();
  if (!completed.includes(uid)) {
    localStorage.setItem(COMPLETED_UIDS_STORAGE_KEY, JSON.stringify([...completed, uid]));
  }
}
