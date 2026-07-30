import { MessageCircle } from 'lucide-react';
import { useNotifications } from '@/features/notification/hooks/useNotifications';
import { useSendKakaoNotification } from '@/features/notification/hooks/useSendKakaoNotification';
import { NotificationCard } from '@/features/notification/components/NotificationCard';
import { NotificationEmptyState } from '@/features/notification/components/NotificationEmptyState';
import { NotificationSkeleton } from '@/features/notification/components/NotificationSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useToast } from '@/providers/ToastProvider';

export function NotificationListView() {
  const {
    notifications,
    unreadCount,
    isLoading,
    isError,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useNotifications();
  const { sendToKakao, isSending } = useSendKakaoNotification();
  const { showToast } = useToast();

  async function handleMarkAllAsRead() {
    try {
      await markAllAsRead();
    } catch {
      showToast('전체 읽음 처리에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  }

  if (isLoading) {
    return <NotificationSkeleton />;
  }

  if (isError) {
    return <ErrorState message="알림을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  const isEmpty = notifications.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {!isEmpty && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">읽지 않은 알림 {unreadCount}개</p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => void handleMarkAllAsRead()}
              disabled={isMarkingAllAsRead}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 disabled:opacity-50"
            >
              {isMarkingAllAsRead ? '처리 중...' : '전체 읽음 처리'}
            </button>
          )}
        </div>
      )}
      {/* 읽지 않은 것만이 아니라 목록 전체를 보낸다. 서버가 하나의 요약 메시지를 만들기 때문에
          미읽음만 보내면 "전체 읽음 처리" 직후 빈 메시지가 나간다.
          알림이 없을 때도 누를 수 있다. 서버가 "소진 임박한 소모품이 없습니다." 본문을 만들어
          보내므로, 연동이 살아있는지 확인하는 용도로 쓸 수 있다. */}
      <button
        type="button"
        onClick={() => {
          sendToKakao(notifications);
        }}
        disabled={isSending}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-primary-700 disabled:opacity-50"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        {isSending ? '보내는 중...' : '카카오톡으로 보내기'}
      </button>
      {isEmpty ? (
        <NotificationEmptyState />
      ) : (
        <div className="flex flex-col gap-4">
          {notifications.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkAsRead={markAsRead}
            />
          ))}
        </div>
      )}
    </div>
  );
}
