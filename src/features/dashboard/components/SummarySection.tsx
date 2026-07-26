import { Package, AlertTriangle, CalendarClock, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { StatCard } from '@/components/common/StatCard';
import type { DashboardSummary } from '@/features/dashboard/types/dashboard.types';

type SummarySectionProps = {
  summary: DashboardSummary;
};

export function SummarySection({ summary }: SummarySectionProps) {
  return (
    <section aria-label="소비 현황 요약" className="grid grid-cols-2 gap-3 md:grid-cols-4">
      <StatCard label="전체 등록 품목" value={`${summary.totalItemCount}개`} icon={Package} />
      <StatCard
        label="곧 소진될 품목"
        value={`${summary.soonToExpireCount}개`}
        icon={AlertTriangle}
        tone="danger"
      />
      <StatCard
        label="이번 주 리필 예정"
        value={`${summary.thisWeekRefillCount}개`}
        icon={CalendarClock}
      />
      <StatCard
        label="가장 가까운 소진일"
        value={
          summary.nearestExpectedDate
            ? format(summary.nearestExpectedDate, 'M월 d일', { locale: ko })
            : '없음'
        }
        icon={Clock}
      />
    </section>
  );
}
