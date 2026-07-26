export type RiskLevel = 'danger' | 'warning' | 'success';

export type PredictionInput = {
  registeredAt: Date;
  cycleDays: number;
};

export type ItemStatus = {
  remainingDays: number;
  riskLevel: RiskLevel;
};
