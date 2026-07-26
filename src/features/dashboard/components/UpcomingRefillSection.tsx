import { UpcomingRefillItemCard } from '@/features/dashboard/components/UpcomingRefillItemCard';
import type { DashboardItem } from '@/features/dashboard/types/dashboard.types';

type UpcomingRefillSectionProps = {
  items: DashboardItem[];
};

export function UpcomingRefillSection({ items }: UpcomingRefillSectionProps) {
  return (
    <section aria-label="곧 리필이 필요한 품목">
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">곧 소진되는 품목</h2>
      <div className="flex flex-col gap-3">
        {items.map((item) => (
          <UpcomingRefillItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
