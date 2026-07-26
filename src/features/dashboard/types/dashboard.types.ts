export type RiskLevel = 'danger' | 'warning' | 'success';

export type DashboardItem = {
  id: string;
  name: string;
  category: string;
  expectedEndDate: Date;
  remainingDays: number;
  riskLevel: RiskLevel;
};

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
