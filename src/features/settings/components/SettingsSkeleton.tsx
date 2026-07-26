import { Skeleton } from '@/components/ui/Skeleton';

export function SettingsSkeleton() {
  return (
    <div className="flex flex-col gap-4" aria-busy="true" aria-label="설정 불러오는 중">
      <Skeleton className="h-48" />
      <Skeleton className="h-40" />
      <Skeleton className="h-28" />
      <Skeleton className="h-16" />
    </div>
  );
}
