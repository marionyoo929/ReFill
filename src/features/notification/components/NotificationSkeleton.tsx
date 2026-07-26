import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_COUNT = 3;

export function NotificationSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="알림 불러오는 중">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Skeleton key={index} className="h-24" />
      ))}
    </div>
  );
}
