import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { RISK_LABEL, RISK_DOT_CLASS } from '@/constants/riskDisplay';
import type { RiskLevelCount } from '@/features/analytics/types/analytics.types';

type RiskLevelBreakdownSectionProps = {
  riskLevelCounts: RiskLevelCount[];
  totalCount: number;
};

export function RiskLevelBreakdownSection({
  riskLevelCounts,
  totalCount,
}: RiskLevelBreakdownSectionProps) {
  return (
    <section aria-label="위험도별 물건 수">
      <h2 className="mb-3 text-lg font-bold text-gray-900">위험도별 물건 수</h2>
      <Card className="flex flex-col gap-4">
        {riskLevelCounts.map((item) => {
          const percentage = totalCount === 0 ? 0 : Math.round((item.count / totalCount) * 100);
          return (
            <div key={item.riskLevel}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">{RISK_LABEL[item.riskLevel]}</span>
                <span className="text-gray-500">{item.count}개</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                <div
                  className={cn('h-full rounded-full', RISK_DOT_CLASS[item.riskLevel])}
                  style={{ width: `${String(percentage)}%` }}
                />
              </div>
            </div>
          );
        })}
      </Card>
    </section>
  );
}
