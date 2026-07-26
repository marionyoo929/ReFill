import { Card } from '@/components/ui/Card';
import type { CycleExtremeItem } from '@/features/analytics/types/analytics.types';

type CycleExtremesSectionProps = {
  shortestCycleItem: CycleExtremeItem | null;
  longestCycleItem: CycleExtremeItem | null;
};

function formatCycleItem(item: CycleExtremeItem | null): string {
  return item ? `${item.name} · ${String(item.cycleDays)}일` : '데이터 없음';
}

export function CycleExtremesSection({
  shortestCycleItem,
  longestCycleItem,
}: CycleExtremesSectionProps) {
  return (
    <section aria-label="소비 주기 극단값" className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <Card>
        <p className="text-sm text-gray-500">가장 소비 주기가 짧은 물건</p>
        <p className="mt-1 text-lg font-bold text-gray-900">{formatCycleItem(shortestCycleItem)}</p>
      </Card>
      <Card>
        <p className="text-sm text-gray-500">가장 소비 주기가 긴 물건</p>
        <p className="mt-1 text-lg font-bold text-gray-900">{formatCycleItem(longestCycleItem)}</p>
      </Card>
    </section>
  );
}
