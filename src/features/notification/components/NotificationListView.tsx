import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { NotificationCard } from '@/features/notification/components/NotificationCard';
import { NotificationEmptyState } from '@/features/notification/components/NotificationEmptyState';
import { NotificationSkeleton } from '@/features/notification/components/NotificationSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export function NotificationListView() {
  const { notifications, unreadCount, isLoading, isError, markAsRead, markAllAsRead } =
    useNotifications();

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (isError) {
    return <ErrorState message="알림을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  if (notifications.length === 0) {
    return <NotificationEmptyState />;
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">읽지 않은 알림 {unreadCount}개</p>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            전체 읽음 처리
          </button>
        )}
      </div>
      <div className="flex flex-col gap-4">
        {notifications.map((notification) => (
          <NotificationCard
            key={notification.id}
            notification={notification}
            onMarkAsRead={markAsRead}
          />
        ))}
      </div>
    </div>
  );
}
