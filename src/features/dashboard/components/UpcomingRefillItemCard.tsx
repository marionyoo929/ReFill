import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { useUpdateInventoryItem, buildPurchaseHistoryUpdateInput } from '@/features/inventory';
import { useToast } from '@/providers/ToastProvider';
import type { DashboardItem } from '@/features/dashboard/types/dashboard.types';

type UpcomingRefillItemCardProps = {
  item: DashboardItem;
};

export function UpcomingRefillItemCard({ item }: UpcomingRefillItemCardProps) {
  const updateMutation = useUpdateInventoryItem();
  const { showToast } = useToast();

  async function handlePurchaseComplete() {
    const today = new Date();
    const input = buildPurchaseHistoryUpdateInput(item, [...(item.purchaseHistory ?? []), today]);
    await updateMutation.mutateAsync({ id: item.id, input });
    showToast(`${item.name} 구매를 완료로 표시했습니다.`);
  }

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900">{item.name}</p>
        <p className="text-sm text-gray-500">
          {format(item.expectedEndDate, 'M월 d일')} 소진 예정
        </p>
      </div>
      <div className="flex shrink-0 gap-1.5">
        {item.brand && (
          <a
            href={item.brand}
            target="_blank"
            rel="noreferrer"
            className="whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50"
          >
            구매하기
          </a>
        )}
        <button
          type="button"
          onClick={() => void handlePurchaseComplete()}
          disabled={updateMutation.isPending}
          className="whitespace-nowrap rounded-2xl bg-primary-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {updateMutation.isPending ? '처리 중...' : '구매완료'}
        </button>
      </div>
    </Card>
  );
}
