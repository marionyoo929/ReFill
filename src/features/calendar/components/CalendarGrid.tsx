import { isSameMonth, isSameDay, isToday, format } from 'date-fns';
import { cn } from '@/lib/cn';
import { getMonthGridDays, WEEKDAY_LABELS } from '@/utils/calendarGrid';
import { RISK_DOT_CLASS } from '@/constants/riskDisplay';
import { getMostUrgentRiskLevel } from '@/features/prediction';
import type { EnrichedInventoryItem } from '@/features/inventory';

type CalendarGridProps = {
  referenceMonth: Date;
  selectedDate: Date;
  items: EnrichedInventoryItem[];
  onSelectDate: (date: Date) => void;
  className?: string;
};

export function CalendarGrid({
  referenceMonth,
  selectedDate,
  items,
  onSelectDate,
  className,
}: CalendarGridProps) {
  const days = getMonthGridDays(referenceMonth);
  const rowCount = Math.ceil(days.length / 7);

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:min-h-0',
        className,
      )}
    >
      <div className="grid shrink-0 grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label}>{label}</span>
        ))}
      </div>
      <div
        className="mt-2 grid flex-1 grid-cols-7 gap-1 md:min-h-0"
        style={{ gridTemplateRows: `repeat(${String(rowCount)}, minmax(0, 1fr))` }}
      >
        {days.map((day) => {
          const dayItems = items.filter((item) => isSameDay(item.expectedEndDate, day));
          const isCurrentMonth = isSameMonth(day, referenceMonth);
          const isSelected = isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onSelectDate(day)}
              aria-label={`${format(day, 'M월 d일')}${dayItems.length > 0 ? `, 리필 예정 ${String(dayItems.length)}건` : ''}`}
              aria-pressed={isSelected}
              className={cn(
                'flex h-full w-full flex-col items-center justify-center gap-1 rounded-2xl text-sm transition-colors',
                isCurrentMonth ? 'text-gray-900' : 'text-gray-300',
                isToday(day) && !isSelected && 'font-bold text-primary-700',
                isSelected ? 'bg-primary-600 text-white' : 'hover:bg-gray-50',
              )}
            >
              <span>{format(day, 'd')}</span>
              <span
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  dayItems.length > 0
                    ? isSelected
                      ? 'bg-white'
                      : RISK_DOT_CLASS[
                          getMostUrgentRiskLevel(dayItems.map((item) => item.riskLevel))
                        ]
                    : 'bg-transparent',
                )}
                aria-hidden="true"
              />
            </button>
          );
        })}
      </div>
    </div>
  );
}
