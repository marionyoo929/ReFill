/**
 * Re:Fill 알림 목록 → 카카오톡 text 템플릿 본문 변환.
 *
 * 입력 형태는 프론트의 NotificationItem
 * (src/features/notification/types/notification.types.ts) 중
 * 발송에 필요한 필드(itemName, remainingDays, type)만 사용한다.
 *
 * 이 파일은 functions/src/kakao/notificationMessage.ts 의 원형이며,
 * 두 구현은 동일한 문구를 만들어야 한다.
 */

import { TEXT_MAX_LENGTH } from './kakaoApi.mjs';

const HEADER = '[Re:Fill] 소진 임박 알림';
const FOOTER = '지금 확인하고 미리 채워두세요.';

/** overdue → today → upcoming 순서로, 같은 그룹 안에서는 임박한 것부터 */
const TYPE_ORDER = { overdue: 0, today: 1, upcoming: 2 };

function formatLine({ itemName, remainingDays, type }) {
  switch (type) {
    case 'overdue':
      return `· ${itemName} — ${Math.abs(remainingDays)}일 전 소진 예정 (확인 필요)`;
    case 'today':
      return `· ${itemName} — 오늘 소진 예정`;
    default:
      return `· ${itemName} — ${remainingDays}일 뒤 소진 예정`;
  }
}

/**
 * 알림 항목들을 200자 이내의 카카오 본문으로 만든다.
 * 항목이 많아 길이를 초과하면 앞쪽 항목만 남기고 "외 N건"으로 요약한다.
 *
 * @param {{ itemName: string, remainingDays: number, type: 'upcoming' | 'today' | 'overdue' }[]} items
 * @param {number} [maxLength]
 * @returns {string}
 */
export function formatNotificationText(items, maxLength = TEXT_MAX_LENGTH) {
  if (!items || items.length === 0) {
    return `${HEADER}\n소진 임박한 소모품이 없습니다.`;
  }

  const sorted = [...items].sort((a, b) => {
    const byType = (TYPE_ORDER[a.type] ?? 3) - (TYPE_ORDER[b.type] ?? 3);
    return byType !== 0 ? byType : a.remainingDays - b.remainingDays;
  });

  const lines = sorted.map(formatLine);

  const assemble = (visibleCount) => {
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

  // 항목 하나조차 길이를 넘기는 극단적인 경우에는 잘라낸다.
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
