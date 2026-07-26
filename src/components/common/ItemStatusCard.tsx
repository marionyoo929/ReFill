import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { RISK_LABEL, RISK_BADGE_CLASS } from '@/constants/riskDisplay';
import type { RiskLevel } from '@/features/prediction';

type ItemStatusCardProps = {
  name: string;
  category: string;
  remainingDays: number;
  riskLevel: RiskLevel;
};

export function ItemStatusCard({ name, category, remainingDays, riskLevel }: ItemStatusCardProps) {
  const remainingLabel =
    remainingDays < 0
      ? '기한 지남'
      : remainingDays === 0
        ? '오늘 소진 예정'
        : `${remainingDays}일 남음`;

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900">{name}</p>
        <p className="truncate text-sm text-gray-500">{category}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn('rounded-2xl px-2.5 py-1 text-xs font-medium', RISK_BADGE_CLASS[riskLevel])}
        >
          {RISK_LABEL[riskLevel]}
        </span>
        <span className="text-sm text-gray-500">{remainingLabel}</span>
      </div>
    </Card>
  );
}
