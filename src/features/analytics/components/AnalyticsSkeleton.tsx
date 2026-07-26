import { Skeleton } from '@/components/ui/Skeleton';

const SUMMARY_SKELETON_COUNT = 5;

export function AnalyticsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="분석 데이터 불러오는 중">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        {Array.from({ length: SUMMARY_SKELETON_COUNT }).map((_, index) => (
          <Skeleton key={index} className="h-20" />
        ))}
      </div>
      <Skeleton className="h-40" />
      <Skeleton className="h-40" />
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    </div>
  );
}
