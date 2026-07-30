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

/**
 * registeredAt(첫 구매일)은 항상 고정값으로 보존하고,
 * 다음 소진 예측은 실제 마지막 구매일(purchaseHistory) 기준으로 계산하기 위한 기준일을 구한다.
 * 구매 내역이 없으면 registeredAt을 기준일로 사용한다.
 */
export function getPredictionBasisDate(registeredAt: Date, purchaseHistory?: Date[]): Date {
  if (!purchaseHistory || purchaseHistory.length === 0) {
    return registeredAt;
  }
  return purchaseHistory.reduce((latest, date) => (date > latest ? date : latest), purchaseHistory[0]);
}

export function getItemStatus(expectedEndDate: Date, today: Date = new Date()): ItemStatus {
  const remainingDays = calculateRemainingDays(expectedEndDate, today);
  return { remainingDays, riskLevel: calculateRiskLevel(remainingDays) };
}
