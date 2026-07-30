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
  /** 물건에 저장된 구매 URL. 값이 없거나 URL 형식이 아닐 수 있다. */
  purchaseUrl?: string;
};
