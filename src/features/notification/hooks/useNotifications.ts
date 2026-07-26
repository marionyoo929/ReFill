import { useCallback, useMemo, useState } from 'react';
import { useEnrichedInventoryItems } from '@/features/inventory';
import { buildNotificationsFromItems } from '@/features/notification/utils/notificationCalculations';
import {
  getReadNotificationIds,
  setReadNotificationIds,
} from '@/features/notification/services/notificationMockService';
import type { NotificationItem } from '@/features/notification/types/notification.types';

export function useNotifications() {
  const { data: items, isLoading, isError } = useEnrichedInventoryItems();
  const [readIds, setReadIds] = useState<Set<string>>(() => getReadNotificationIds());

  const notifications: NotificationItem[] = useMemo(() => {
    if (!items) {
      return [];
    }
    return buildNotificationsFromItems(items).map((notification) => ({
      ...notification,
      read: readIds.has(notification.id),
    }));
  }, [items, readIds]);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.read).length,
    [notifications],
  );

  const markAsRead = useCallback((id: string) => {
    setReadIds((prev) => {
      if (prev.has(id)) {
        return prev;
      }
      const next = new Set(prev);
      next.add(id);
      setReadNotificationIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((prev) => {
      const next = new Set(prev);
      notifications.forEach((notification) => next.add(notification.id));
      setReadNotificationIds(next);
      return next;
    });
  }, [notifications]);

  return { notifications, unreadCount, isLoading, isError, markAsRead, markAllAsRead };
}
