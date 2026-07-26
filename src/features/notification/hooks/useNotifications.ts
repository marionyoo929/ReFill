import { useCallback, useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEnrichedInventoryItems } from '@/features/inventory';
import { buildNotificationsFromItems } from '@/features/notification/utils/notificationCalculations';
import {
  getReadNotificationIds,
  setReadNotificationIds,
} from '@/features/notification/services/notificationMockService';
import type { NotificationItem } from '@/features/notification/types/notification.types';

// queryClient 캐시를 단일 소스로 사용해, 이 훅을 호출하는 모든 컴포넌트(사이드바 배지,
// 하단 메뉴, 알림 목록 등)가 읽음 상태를 항상 동일하게 공유하도록 한다.
export const NOTIFICATION_READ_IDS_QUERY_KEY = ['notifications', 'readIds'] as const;

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data: items, isLoading, isError } = useEnrichedInventoryItems();

  const { data: readIds = new Set<string>() } = useQuery({
    queryKey: NOTIFICATION_READ_IDS_QUERY_KEY,
    queryFn: getReadNotificationIds,
    staleTime: Infinity,
  });

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

  const updateReadIds = useMutation({
    mutationFn: (nextIds: Set<string>) => {
      setReadNotificationIds(nextIds);
      return Promise.resolve(nextIds);
    },
    onMutate: async (nextIds) => {
      await queryClient.cancelQueries({ queryKey: NOTIFICATION_READ_IDS_QUERY_KEY });
      const previousIds = queryClient.getQueryData<Set<string>>(NOTIFICATION_READ_IDS_QUERY_KEY);
      queryClient.setQueryData(NOTIFICATION_READ_IDS_QUERY_KEY, nextIds);
      return { previousIds };
    },
    onError: (_error, _nextIds, context) => {
      // 서버/저장 반영에 실패하면 낙관적으로 반영했던 읽음 상태를 이전 값으로 되돌린다.
      queryClient.setQueryData(NOTIFICATION_READ_IDS_QUERY_KEY, context?.previousIds ?? new Set());
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: NOTIFICATION_READ_IDS_QUERY_KEY });
    },
  });

  const markAsRead = useCallback(
    (id: string) => {
      if (readIds.has(id)) {
        return;
      }
      const next = new Set(readIds);
      next.add(id);
      updateReadIds.mutate(next);
    },
    [readIds, updateReadIds],
  );

  const markAllAsRead = useCallback(async () => {
    const next = new Set(readIds);
    notifications.forEach((notification) => next.add(notification.id));
    await updateReadIds.mutateAsync(next);
  }, [readIds, notifications, updateReadIds]);

  return {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead: updateReadIds.isPending,
  };
}
