import type { EnrichedInventoryItem } from '@/features/inventory';
import type { RiskLevel } from '@/features/prediction';

export type { RiskLevel };

export type DashboardItem = EnrichedInventoryItem;

export type DashboardSummary = {
  totalItemCount: number;
  soonToExpireCount: number;
  thisWeekRefillCount: number;
  nearestExpectedDate: Date | null;
};

export type DashboardData = {
  summary: DashboardSummary;
  upcomingItems: DashboardItem[];
};
