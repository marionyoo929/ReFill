import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { SummarySection } from '@/features/dashboard/components/SummarySection';
import { UpcomingRefillSection } from '@/features/dashboard/components/UpcomingRefillSection';
import { CalendarPreview } from '@/features/dashboard/components/CalendarPreview';
import { DashboardEmptyState } from '@/features/dashboard/components/DashboardEmptyState';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export function DashboardView() {
  const { data, isLoading, isError } = useDashboardData();

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return <ErrorState message="대시보드 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  if (data.summary.totalItemCount === 0) {
    return <DashboardEmptyState />;
  }

  return (
    <div className="flex flex-col gap-6">
      <SummarySection summary={data.summary} />
      <UpcomingRefillSection items={data.upcomingItems} />
      <CalendarPreview items={data.upcomingItems} />
    </div>
  );
}
