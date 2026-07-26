import { Package, AlertTriangle, Clock, CalendarRange, CalendarDays } from 'lucide-react';
import { StatCard } from '@/components/common/StatCard';
import type { AnalyticsSummary } from '@/features/analytics/types/analytics.types';

type AnalyticsSummarySectionProps = {
  summary: AnalyticsSummary;
};

export function AnalyticsSummarySection({ summary }: AnalyticsSummarySectionProps) {
  return (
    <section aria-label="전체 통계 요약" className="grid grid-cols-2 gap-3 md:grid-cols-3">
      <StatCard label="전체 등록 물건" value={`${summary.totalCount}개`} icon={Package} />
      <StatCard
        label="곧 소진 예정"
        value={`${summary.soonToExpireCount}개`}
        icon={AlertTriangle}
        tone="danger"
      />
      <StatCard label="평균 소비 주기" value={`${summary.averageCycleDays}일`} icon={Clock} />
      <StatCard
        label="7일 내 소진 예정"
        value={`${summary.upcomingWithin7Days}개`}
        icon={CalendarRange}
      />
      <StatCard
        label="30일 내 소진 예정"
        value={`${summary.upcomingWithin30Days}개`}
        icon={CalendarDays}
      />
    </section>
  );
}
