import { useAnalyticsSummary } from '@/features/analytics/hooks/useAnalyticsSummary';
import { AnalyticsSummarySection } from '@/features/analytics/components/AnalyticsSummarySection';
import { RiskLevelBreakdownSection } from '@/features/analytics/components/RiskLevelBreakdownSection';
import { CycleExtremesSection } from '@/features/analytics/components/CycleExtremesSection';
import { AnalyticsEmptyState } from '@/features/analytics/components/AnalyticsEmptyState';
import { AnalyticsSkeleton } from '@/features/analytics/components/AnalyticsSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export function AnalyticsView() {
  const { summary, isLoading, isError } = useAnalyticsSummary();

  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  if (isError || !summary) {
    return <ErrorState message="분석 데이터를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  if (summary.totalCount === 0) {
    return <AnalyticsEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <AnalyticsSummarySection summary={summary} />
      <RiskLevelBreakdownSection
        riskLevelCounts={summary.riskLevelCounts}
        totalCount={summary.totalCount}
      />
      <CycleExtremesSection
        shortestCycleItem={summary.shortestCycleItem}
        longestCycleItem={summary.longestCycleItem}
      />
    </div>
  );
}
