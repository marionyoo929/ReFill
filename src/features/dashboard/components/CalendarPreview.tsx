import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  format,
} from 'date-fns';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { cn } from '@/lib/cn';
import type { DashboardItem, RiskLevel } from '@/features/dashboard/types/dashboard.types';

const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

const RISK_DOT_CLASS: Record<RiskLevel, string> = {
  danger: 'bg-danger-500',
  warning: 'bg-warning-500',
  success: 'bg-success-500',
};

function getMostUrgentRisk(items: DashboardItem[]): RiskLevel {
  if (items.some((item) => item.riskLevel === 'danger')) {
    return 'danger';
  }
  if (items.some((item) => item.riskLevel === 'warning')) {
    return 'warning';
  }
  return 'success';
}

type CalendarPreviewProps = {
  items: DashboardItem[];
};

export function CalendarPreview({ items }: CalendarPreviewProps) {
  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <section aria-label="이번 달 리필 예정 미리보기">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-gray-900">{format(today, 'M월')} 리필 캘린더</h2>
        <Link
          to={ROUTES.CALENDAR}
          className="text-sm font-medium text-primary-600 hover:text-primary-700"
        >
          전체 캘린더 보기
        </Link>
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
                      ? RISK_DOT_CLASS[getMostUrgentRisk(dayItems)]
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
