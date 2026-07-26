import { useInventoryItems } from '@/features/inventory/hooks/useInventoryItems';
import { ItemCard } from '@/features/inventory/components/ItemCard';
import { InventoryEmptyState } from '@/features/inventory/components/InventoryEmptyState';
import { InventoryListSkeleton } from '@/features/inventory/components/InventoryListSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export function InventoryListView() {
  const { data, isLoading, isError } = useInventoryItems();

  if (isLoading) {
    return <InventoryListSkeleton />;
  }

  if (isError || !data) {
    return <ErrorState message="물건 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  if (data.length === 0) {
    return <InventoryEmptyState />;
  }

  return (
    <div className="flex flex-col gap-3">
      {data.map((item) => (
        <ItemCard key={item.id} item={item} />
      ))}
    </div>
  );
}
