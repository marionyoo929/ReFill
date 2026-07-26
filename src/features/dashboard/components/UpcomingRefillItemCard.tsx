import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import type { DashboardItem } from '@/features/dashboard/types/dashboard.types';

const RISK_LABEL: Record<DashboardItem['riskLevel'], string> = {
  danger: '긴급',
  warning: '주의',
  success: '여유',
};

const RISK_BADGE_CLASS: Record<DashboardItem['riskLevel'], string> = {
  danger: 'bg-danger-50 text-danger-600',
  warning: 'bg-warning-50 text-warning-600',
  success: 'bg-success-50 text-success-600',
};

type UpcomingRefillItemCardProps = {
  item: DashboardItem;
};

export function UpcomingRefillItemCard({ item }: UpcomingRefillItemCardProps) {
  const remainingLabel =
    item.remainingDays < 0
      ? '기한 지남'
      : item.remainingDays === 0
        ? '오늘 소진 예정'
        : `${item.remainingDays}일 남음`;

  return (
    <Card className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate font-semibold text-gray-900">{item.name}</p>
        <p className="truncate text-sm text-gray-500">{item.category}</p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        <span
          className={cn(
            'rounded-2xl px-2.5 py-1 text-xs font-medium',
            RISK_BADGE_CLASS[item.riskLevel],
          )}
        >
          {RISK_LABEL[item.riskLevel]}
        </span>
        <span className="text-sm text-gray-500">{remainingLabel}</span>
      </div>
    </Card>
  );
}
