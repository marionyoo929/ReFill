import { Card } from '@/components/ui/Card';
import type { CategoryCount } from '@/features/analytics/types/analytics.types';

type CategoryBreakdownSectionProps = {
  categoryCounts: CategoryCount[];
  totalCount: number;
};

export function CategoryBreakdownSection({
  categoryCounts,
  totalCount,
}: CategoryBreakdownSectionProps) {
  return (
    <section aria-label="카테고리별 물건 수">
      <h2 className="mb-3 text-lg font-bold text-gray-900">카테고리별 물건 수</h2>
      <Card className="flex flex-col gap-4">
        {categoryCounts.map((item) => {
          const percentage = totalCount === 0 ? 0 : Math.round((item.count / totalCount) * 100);
          return (
            <div key={item.category}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{item.category}</span>
                <span className="text-gray-500">{item.count}개</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className="h-full rounded-full bg-primary-500"
                  style={{ width: `${String(percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </Card>
    </section>
  );
}
