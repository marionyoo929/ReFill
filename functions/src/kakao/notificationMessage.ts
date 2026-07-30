/**
 * Re:Fill 알림 목록 → 카카오톡 text 템플릿 본문 변환.
 *
 * 프론트의 NotificationItem(src/features/notification/types/notification.types.ts) 중
 * 발송에 필요한 필드만 사용한다. functions 는 src/ 를 import 할 수 없으므로
 * 필드명을 그대로 따르는 로컬 타입을 정의한다.
 *
 * scripts/kakao/notificationMessage.mjs 와 동일한 문구를 만들어야 한다.
 */
import { TEXT_MAX_LENGTH } from './kakaoClient';

export type KakaoNotificationType = 'upcoming' | 'today' | 'overdue';

export type KakaoNotificationItem = {
  itemName: string;
  remainingDays: number;
  type: KakaoNotificationType;
};

const HEADER = '[Re:Fill] 소진 임박 알림';
const FOOTER = '지금 확인하고 미리 채워두세요.';

/** overdue → today → upcoming 순서로, 같은 그룹 안에서는 임박한 것부터 */
const TYPE_ORDER: Record<KakaoNotificationType, number> = { overdue: 0, today: 1, upcoming: 2 };

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

/** 전달받은 값이 발송 가능한 알림 항목인지 확인한다 (callable 입력 검증용). */
export function isKakaoNotificationItem(value: unknown): value is KakaoNotificationItem {
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

/**
 * 알림 항목들을 카카오 본문 길이 제한 안에서 문자열로 만든다.
 * 항목이 많아 길이를 초과하면 앞쪽 항목만 남기고 "외 N건" 으로 요약한다.
 */
export function formatNotificationText(
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
  return text;
}
