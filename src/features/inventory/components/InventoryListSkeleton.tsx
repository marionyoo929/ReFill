import { Skeleton } from '@/components/ui/Skeleton';

const SKELETON_COUNT = 4;

export function InventoryListSkeleton() {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-label="물건 목록 불러오는 중">
      {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
        <Skeleton key={index} className="h-16" />
      ))}
    </div>
  );
}
