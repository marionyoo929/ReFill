import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ItemStatusCard } from '@/components/common/ItemStatusCard';
import type { EnrichedInventoryItem } from '@/features/inventory';

type DayDetailPanelProps = {
  date: Date;
  items: EnrichedInventoryItem[];
};

export function DayDetailPanel({ date, items }: DayDetailPanelProps) {
  return (
    <section aria-label={`${format(date, 'M월 d일')} 리필 예정 물건`}>
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
        {format(date, 'M월 d일 (EEE)', { locale: ko })}
      </h2>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-12 text-center">
          <p className="text-sm text-gray-500">이 날짜에 예정된 리필이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <ItemStatusCard
              key={item.id}
              name={item.name}
              category={item.category}
              remainingDays={item.remainingDays}
              riskLevel={item.riskLevel}
            />
          ))}
        </div>
      )}
    </section>
  );
}
