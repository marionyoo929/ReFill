import type { InventoryItem } from '@/features/inventory';
import type { ItemStatus, RiskLevel } from '@/features/prediction';

export type { RiskLevel };

export type DashboardItem = InventoryItem & ItemStatus;

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
