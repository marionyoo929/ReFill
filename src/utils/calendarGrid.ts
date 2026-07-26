import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns';

export const WEEKDAY_LABELS = ['일', '월', '화', '수', '목', '금', '토'];

export function getMonthGridDays(referenceDate: Date): Date[] {
  const monthStart = startOfMonth(referenceDate);
  const monthEnd = endOfMonth(referenceDate);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}
