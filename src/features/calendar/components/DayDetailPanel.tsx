import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { ItemStatusCard } from '@/components/common/ItemStatusCard';
import { cn } from '@/lib/cn';
import type { EnrichedInventoryItem } from '@/features/inventory';

type DayDetailPanelProps = {
  date: Date;
  items: EnrichedInventoryItem[];
  className?: string;
};

export function DayDetailPanel({ date, items, className }: DayDetailPanelProps) {
  return (
    <section
      aria-label={`${format(date, 'M월 d일')} 리필 예정 물건`}
      className={cn('flex flex-1 flex-col md:min-h-0', className)}
    >
      <h2 className="mb-3 shrink-0 text-lg font-bold text-gray-900">
        {format(date, 'M월 d일 (EEE)', { locale: ko })}
      </h2>
      {items.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-12 text-center">
          <p className="text-sm text-gray-500">이 날짜에 예정된 리필이 없습니다.</p>
        </div>
      ) : (
        <div className="flex flex-1 flex-col gap-3 overflow-y-auto md:min-h-0">
          {items.map((item) => (
            <ItemStatusCard
              key={item.id}
              name={item.name}
              remainingDays={item.remainingDays}
            />
          ))}
        </div>
      )}
    </section>
  );
}
