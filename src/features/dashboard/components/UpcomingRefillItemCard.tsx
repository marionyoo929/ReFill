import { ItemStatusCard } from '@/components/common/ItemStatusCard';
import type { DashboardItem } from '@/features/dashboard/types/dashboard.types';

type UpcomingRefillItemCardProps = {
  item: DashboardItem;
};

export function UpcomingRefillItemCard({ item }: UpcomingRefillItemCardProps) {
  return (
    <ItemStatusCard
      name={item.name}
      category={item.category}
      remainingDays={item.remainingDays}
      riskLevel={item.riskLevel}
    />
  );
}
