import { UpcomingRefillItemCard } from '@/features/dashboard/components/UpcomingRefillItemCard';
import { cn } from '@/lib/cn';
import type { DashboardItem } from '@/features/dashboard/types/dashboard.types';

type UpcomingRefillSectionProps = {
  items: DashboardItem[];
  className?: string;
};

export function UpcomingRefillSection({ items, className }: UpcomingRefillSectionProps) {
  return (
    <section aria-label="소진 예정일 당일 또는 지난 품목" className={cn('flex flex-col', className)}>
      <h2 className="mb-3 shrink-0 text-lg font-bold text-gray-900">
        소진 예정일 당일/지난 품목
      </h2>
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto md:min-h-0">
        {items.map((item) => (
          <UpcomingRefillItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
