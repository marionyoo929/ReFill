import {
  calculateExpectedEndDate,
  calculateRemainingDays,
  calculateRiskLevel,
} from '@/features/prediction/utils/predictionCalculations';
import type { ItemStatus, PredictionInput } from '@/features/prediction/types/prediction.types';

/**
 * Prediction Engine의 공개 인터페이스다.
 * UI/Firebase/React에 의존하지 않는 독립 Domain으로 유지하며,
 * 향후 ML 모델로 교체되어도 이 인터페이스(predictEndDate/getItemStatus)는 유지한다.
 */
export function predictEndDate(input: PredictionInput): Date {
  return calculateExpectedEndDate(input.registeredAt, input.cycleDays);
}

export function getItemStatus(expectedEndDate: Date, today: Date = new Date()): ItemStatus {
  const remainingDays = calculateRemainingDays(expectedEndDate, today);
  return { remainingDays, riskLevel: calculateRiskLevel(remainingDays) };
}
