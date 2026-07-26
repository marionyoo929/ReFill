import type { RiskLevel } from '@/features/prediction';

export type CategoryCount = {
  category: string;
  count: number;
};

export type RiskLevelCount = {
  riskLevel: RiskLevel;
  count: number;
};

export type CycleExtremeItem = {
  name: string;
  cycleDays: number;
};

export type AnalyticsSummary = {
  totalCount: number;
  soonToExpireCount: number;
  averageCycleDays: number;
  categoryCounts: CategoryCount[];
  riskLevelCounts: RiskLevelCount[];
  upcomingWithin7Days: number;
  upcomingWithin30Days: number;
  shortestCycleItem: CycleExtremeItem | null;
  longestCycleItem: CycleExtremeItem | null;
};
