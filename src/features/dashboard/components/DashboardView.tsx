import { useState } from 'react';
import { CalendarView } from '@/features/calendar';
import { useDashboardData } from '@/features/dashboard/hooks/useDashboardData';
import { UpcomingRefillSection } from '@/features/dashboard/components/UpcomingRefillSection';
import { DashboardSkeleton } from '@/features/dashboard/components/DashboardSkeleton';
import { ErrorState } from '@/components/common/ErrorState';

export function DashboardView() {
  const { data, isLoading, isError } = useDashboardData();
  const [calendarKey] = useState(() => Date.now());

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (isError || !data) {
    return <ErrorState message="대시보드 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  return (
    <div className="flex flex-col gap-6 md:h-[calc(100vh-5rem)] md:flex-row">
      <section
        aria-label="이번 달 리필 캘린더"
        className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:w-3/5 md:min-h-0"
      >
        <CalendarView key={calendarKey} />
      </section>
      <UpcomingRefillSection
        items={data.upcomingItems}
        className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm md:w-2/5 md:min-h-0"
      />
    </div>
  );
}
