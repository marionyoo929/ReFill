import type { EnrichedInventoryItem } from '@/features/inventory';
import type {
  NotificationItem,
  NotificationType,
} from '@/features/notification/types/notification.types';

const NOTIFICATION_TITLE: Record<NotificationType, string> = {
  upcoming: '곧 소진 예정',
  today: '오늘 소진 예정',
  overdue: '소진일 경과',
};

function getNotificationType(
  item: EnrichedInventoryItem,
): NotificationType | null {
  if (item.notificationEnabled === false) {
    return null;
  }

  const leadTime = item.notificationLeadTimeDays ?? 7;

  if (item.remainingDays < 0) {
    return 'overdue';
  }
  if (item.remainingDays === 0) {
    return 'today';
  }
  if (item.remainingDays <= leadTime && item.riskLevel !== 'success') {
    return 'upcoming';
  }
  return null;
}

function buildNotificationBody(item: EnrichedInventoryItem, type: NotificationType): string {
  if (type === 'overdue') {
    return `${item.name}의 소진 예정일이 지났습니다. 확인해보세요.`;
  }
  if (type === 'today') {
    return `${item.name}이(가) 오늘 소진될 예정입니다.`;
  }
  return `${item.name}이(가) ${String(item.remainingDays)}일 후 소진될 예정입니다.`;
}

export function buildNotificationsFromItems(
  items: EnrichedInventoryItem[],
): Omit<NotificationItem, 'read'>[] {
  return items
    .map((item) => {
      const type = getNotificationType(item);
      if (!type) {
        return null;
      }
      return {
        id: `${item.id}-${type}`,
        itemId: item.id,
        itemName: item.name,
        type,
        remainingDays: item.remainingDays,
        riskLevel: item.riskLevel,
        title: NOTIFICATION_TITLE[type],
        body: buildNotificationBody(item, type),
        expectedEndDate: item.expectedEndDate,
      };
    })
    .filter((notification): notification is Omit<NotificationItem, 'read'> => notification !== null)
    .sort((a, b) => a.remainingDays - b.remainingDays);
}
