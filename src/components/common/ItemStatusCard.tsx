import { Card } from '@/components/ui/Card';

type ItemStatusCardProps = {
  name: string;
  remainingDays: number;
};

export function ItemStatusCard({ name, remainingDays }: ItemStatusCardProps) {
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
      </div>
      <span className="shrink-0 text-sm text-gray-500">{remainingLabel}</span>
    </Card>
  );
}
