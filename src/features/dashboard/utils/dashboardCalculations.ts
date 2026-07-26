import { isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import type { DashboardItem, DashboardSummary } from '@/features/dashboard/types/dashboard.types';

export function buildDashboardSummary(sortedItems: DashboardItem[]): DashboardSummary {
  const today = new Date();
  const thisWeekInterval = { start: startOfWeek(today), end: endOfWeek(today) };

  const soonToExpireCount = sortedItems.filter((item) => item.riskLevel === 'danger').length;
  const thisWeekRefillCount = sortedItems.filter((item) =>
    isWithinInterval(item.expectedEndDate, thisWeekInterval),
  ).length;

  return {
    totalItemCount: sortedItems.length,
    soonToExpireCount,
    thisWeekRefillCount,
    nearestExpectedDate: sortedItems[0]?.expectedEndDate ?? null,
  };
}
