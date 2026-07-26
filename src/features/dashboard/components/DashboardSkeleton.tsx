import { Skeleton } from '@/components/ui/Skeleton';

const SUMMARY_SKELETON_COUNT = 4;
const UPCOMING_SKELETON_COUNT = 3;

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="대시보드 불러오는 중">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: SUMMARY_SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {Array.from({ length: UPCOMING_SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-16" />
        ))}
      </div>
      <Skeleton className="h-72" />
    </div>
  );
}
