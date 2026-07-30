import { useMutation } from '@tanstack/react-query';
import {
  sendKakaoNotification,
  toKakaoErrorMessage,
} from '@/features/notification/services/kakaoNotificationService';
import { useToast } from '@/providers/ToastProvider';
import type { NotificationItem } from '@/features/notification/types/notification.types';

/**
 * 알림 목록을 카카오톡으로 발송한다.
 * 캐시를 갱신할 대상이 없어 useMutation 을 비동기 상태 기계로만 사용한다.
 */
export function useSendKakaoNotification() {
  const { showToast } = useToast();

  const mutation = useMutation({
    mutationFn: (notifications: NotificationItem[]) => sendKakaoNotification(notifications),
    onSuccess: () => {
      showToast('카카오톡으로 알림을 보냈어요.');
    },
    onError: (error: unknown) => {
      showToast(toKakaoErrorMessage(error));
    },
  });

  return {
    // mutateAsync 가 아닌 mutate 를 넘겨 거부(rejection)가 onError 에서 소비되도록 한다.
    sendToKakao: mutation.mutate,
    isSending: mutation.isPending,
  };
}
