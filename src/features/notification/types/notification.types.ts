import type { RiskLevel } from '@/features/prediction';

export type NotificationType = 'upcoming' | 'today' | 'overdue';

export type NotificationItem = {
  id: string;
  itemId: string;
  itemName: string;
  type: NotificationType;
  remainingDays: number;
  riskLevel: RiskLevel;
  title: string;
  body: string;
  expectedEndDate: Date;
  read: boolean;
};
