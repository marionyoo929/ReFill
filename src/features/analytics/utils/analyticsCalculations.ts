import type { EnrichedInventoryItem } from '@/features/inventory';
import type { RiskLevel } from '@/features/prediction';
import type {
  AnalyticsSummary,
  CategoryCount,
  CycleExtremeItem,
  RiskLevelCount,
} from '@/features/analytics/types/analytics.types';

const RISK_LEVEL_ORDER: RiskLevel[] = ['danger', 'warning', 'success'];
const UPCOMING_WEEK_DAYS = 7;
const UPCOMING_MONTH_DAYS = 30;

function buildCategoryCounts(items: EnrichedInventoryItem[]): CategoryCount[] {
  const counts = new Map<string, number>();
  items.forEach((item) => {
    counts.set(item.category, (counts.get(item.category) ?? 0) + 1);
  });
  return Array.from(counts.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

function buildRiskLevelCounts(items: EnrichedInventoryItem[]): RiskLevelCount[] {
  return RISK_LEVEL_ORDER.map((riskLevel) => ({
    riskLevel,
    count: items.filter((item) => item.riskLevel === riskLevel).length,
  }));
}

function findExtremeCycleItem(
  items: EnrichedInventoryItem[],
  compare: (a: EnrichedInventoryItem, b: EnrichedInventoryItem) => EnrichedInventoryItem,
): CycleExtremeItem | null {
  if (items.length === 0) {
    return null;
  }
  const found = items.reduce(compare);
  return { name: found.name, cycleDays: found.cycleDays };
}

export function buildAnalyticsSummary(items: EnrichedInventoryItem[]): AnalyticsSummary {
  const totalCount = items.length;
  const soonToExpireCount = items.filter((item) => item.riskLevel === 'danger').length;
  const averageCycleDays =
    totalCount === 0
      ? 0
      : Math.round(items.reduce((sum, item) => sum + item.cycleDays, 0) / totalCount);

  const upcomingWithin7Days = items.filter(
    (item) => item.remainingDays >= 0 && item.remainingDays <= UPCOMING_WEEK_DAYS,
  ).length;
  const upcomingWithin30Days = items.filter(
    (item) => item.remainingDays >= 0 && item.remainingDays <= UPCOMING_MONTH_DAYS,
  ).length;

  return {
    totalCount,
    soonToExpireCount,
    averageCycleDays,
    categoryCounts: buildCategoryCounts(items),
    riskLevelCounts: buildRiskLevelCounts(items),
    upcomingWithin7Days,
    upcomingWithin30Days,
    shortestCycleItem: findExtremeCycleItem(items, (a, b) => (a.cycleDays < b.cycleDays ? a : b)),
    longestCycleItem: findExtremeCycleItem(items, (a, b) => (a.cycleDays > b.cycleDays ? a : b)),
  };
}
