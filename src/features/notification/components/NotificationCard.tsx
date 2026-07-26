import { Check } from 'lucide-react';
import { ItemStatusCard } from '@/components/common/ItemStatusCard';
import { cn } from '@/lib/cn';
import type { NotificationItem } from '@/features/notification/types/notification.types';

type NotificationCardProps = {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
};

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between gap-3 px-1">
        <div className="flex min-w-0 items-start gap-2">
          <span
            className={cn(
              'mt-1.5 h-2 w-2 shrink-0 rounded-full',
              notification.read ? 'bg-transparent' : 'bg-primary-500',
            )}
            aria-hidden="true"
          />
          <div className="min-w-0">
            <p
              className={cn(
                'text-sm',
                notification.read
                  ? 'font-medium text-gray-500 dark:text-gray-400'
                  : 'font-semibold text-gray-900 dark:text-white',
              )}
            >
              {notification.title}
            </p>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{notification.body}</p>
          </div>
        </div>
        {!notification.read && (
          <button
            type="button"
            onClick={() => onMarkAsRead(notification.id)}
            aria-label="읽음으로 표시"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-gray-400 hover:bg-gray-100 hover:text-primary-600"
          >
            <Check className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
      </div>
      <ItemStatusCard
        name={notification.itemName}
        category={notification.category}
        remainingDays={notification.remainingDays}
        riskLevel={notification.riskLevel}
      />
    </div>
  );
}
