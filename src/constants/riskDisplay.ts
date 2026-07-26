import type { RiskLevel } from '@/features/prediction';

export const RISK_LABEL: Record<RiskLevel, string> = {
  danger: '긴급',
  warning: '주의',
  success: '여유',
};

export const RISK_BADGE_CLASS: Record<RiskLevel, string> = {
  danger: 'bg-danger-50 text-danger-600',
  warning: 'bg-warning-50 text-warning-600',
  success: 'bg-success-50 text-success-600',
};

export const RISK_DOT_CLASS: Record<RiskLevel, string> = {
  danger: 'bg-danger-500',
  warning: 'bg-warning-500',
  success: 'bg-success-500',
};
