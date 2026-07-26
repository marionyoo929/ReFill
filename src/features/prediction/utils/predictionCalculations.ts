import { addDays, differenceInCalendarDays } from 'date-fns';
import type { RiskLevel } from '@/features/prediction/types/prediction.types';

const DANGER_THRESHOLD_DAYS = 3;
const WARNING_THRESHOLD_DAYS = 7;

export function calculateExpectedEndDate(registeredAt: Date, cycleDays: number): Date {
  return addDays(registeredAt, cycleDays);
}

export function calculateRemainingDays(expectedEndDate: Date, today: Date = new Date()): number {
  return differenceInCalendarDays(expectedEndDate, today);
}

export function calculateRiskLevel(remainingDays: number): RiskLevel {
  if (remainingDays <= DANGER_THRESHOLD_DAYS) {
    return 'danger';
  }
  if (remainingDays <= WARNING_THRESHOLD_DAYS) {
    return 'warning';
  }
  return 'success';
}

export function getMostUrgentRiskLevel(riskLevels: RiskLevel[]): RiskLevel {
  if (riskLevels.includes('danger')) {
    return 'danger';
  }
  if (riskLevels.includes('warning')) {
    return 'warning';
  }
  return 'success';
}
