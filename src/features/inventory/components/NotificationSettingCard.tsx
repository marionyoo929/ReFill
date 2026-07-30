import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { useUpdateInventoryItem } from '@/features/inventory/hooks/useInventoryMutations';
import { toInventoryItemInput } from '@/features/inventory/utils/purchaseHistory';
import type { InventoryItem } from '@/features/inventory/types/inventory.types';

type NotificationSettingCardProps = {
  item: InventoryItem;
};

export function NotificationSettingCard({ item }: NotificationSettingCardProps) {
  const updateMutation = useUpdateInventoryItem();
  const isEnabled = item.notificationEnabled !== false;
  const leadDays = item.notificationLeadTimeDays ?? 7;

  function handleToggle() {
    void updateMutation.mutateAsync({
      id: item.id,
      input: toInventoryItemInput(item, { notificationEnabled: !isEnabled }),
    });
  }

  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-sm font-medium text-gray-700">알림 설정</h2>
        <p className="mt-0.5 text-sm text-gray-500">
          예정일 {leadDays}일 전 알람
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isEnabled}
        aria-label="알림 활성화"
        onClick={handleToggle}
        disabled={updateMutation.isPending}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50',
          isEnabled ? 'bg-primary-600' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            isEnabled ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </Card>
  );
}
