import { isSameMonth, isSameDay, isToday, format } from 'date-fns';
import { cn } from '@/lib/cn';
import { getMonthGridDays, WEEKDAY_LABELS } from '@/utils/calendarGrid';
import { RISK_DOT_CLASS } from '@/constants/riskDisplay';
import { getMostUrgentRiskLevel } from '@/features/prediction';
import type { DashboardItem } from '@/features/dashboard/types/dashboard.types';

type CalendarPreviewProps = {
  items: DashboardItem[];
};

export function CalendarPreview({ items }: CalendarPreviewProps) {
  const today = new Date();
  const days = getMonthGridDays(today);

  return (
    <section aria-label="이번 달 리필 예정 미리보기">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">
          {format(today, 'M월')} 리필 캘린더
        </h2>
      </div>

      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-400">
          {WEEKDAY_LABELS.map((label) => (
            <span key={label}>{label}</span>
          ))}
        </div>
        <div className="mt-2 grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayItems = items.filter((item) => isSameDay(item.expectedEndDate, day));
            const isCurrentMonth = isSameMonth(day, today);

            return (
              <div
                key={day.toISOString()}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-2xl py-1.5 text-sm',
                  isCurrentMonth ? 'text-gray-900' : 'text-gray-300',
                  isToday(day) && 'bg-primary-50 font-bold text-primary-700',
                )}
              >
                <span>{format(day, 'd')}</span>
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    dayItems.length > 0
                      ? RISK_DOT_CLASS[
                          getMostUrgentRiskLevel(dayItems.map((item) => item.riskLevel))
                        ]
                      : 'bg-transparent',
                  )}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
