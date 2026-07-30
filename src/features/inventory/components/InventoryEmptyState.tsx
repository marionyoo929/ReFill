import { PackagePlus } from 'lucide-react';

export function InventoryEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white px-6 py-20 text-center">
      <PackagePlus className="h-12 w-12 text-gray-300" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-lg font-bold text-gray-900">아직 등록된 물건이 없습니다.</p>
        <p className="text-sm text-gray-500">자주 쓰는 생필품을 등록해보세요.</p>
      </div>
    </div>
  );
}
