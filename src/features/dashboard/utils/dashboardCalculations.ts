import { differenceInCalendarDays, isWithinInterval, startOfWeek, endOfWeek } from 'date-fns';
import type {
  DashboardItem,
  DashboardSummary,
  RiskLevel,
} from '@/features/dashboard/types/dashboard.types';

const DANGER_THRESHOLD_DAYS = 3;
const WARNING_THRESHOLD_DAYS = 7;

export function getRiskLevel(remainingDays: number): RiskLevel {
  if (remainingDays <= DANGER_THRESHOLD_DAYS) {
    return 'danger';
  }
  if (remainingDays <= WARNING_THRESHOLD_DAYS) {
    return 'warning';
  }
  return 'success';
}

type DashboardItemDraft = {
  id: string;
  name: string;
  category: string;
  expectedEndDate: Date;
};

export function enrichWithRisk(draft: DashboardItemDraft, today: Date = new Date()): DashboardItem {
  const remainingDays = differenceInCalendarDays(draft.expectedEndDate, today);

  return {
    ...draft,
    remainingDays,
    riskLevel: getRiskLevel(remainingDays),
  };
}

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
