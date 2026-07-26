/**
 * 알림 읽음 상태만 로컬에 유지하는 Mock 계층이다.
 * 알림 자체는 Inventory+Prediction 데이터에서 매번 파생되므로 별도 저장소가 필요 없으며,
 * 실제 Firebase 연동 시 이 파일만 Firestore notifications 컬렉션 갱신으로 교체하면 된다.
 */
const READ_IDS_STORAGE_KEY = 'refill_notification_read_ids';

export function getReadNotificationIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_IDS_STORAGE_KEY);
    return raw ? new Set(JSON.parse(raw) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function setReadNotificationIds(ids: Set<string>): void {
  localStorage.setItem(READ_IDS_STORAGE_KEY, JSON.stringify(Array.from(ids)));
}
