import { BellOff } from 'lucide-react';

export function NotificationEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-6 py-20 text-center">
      <BellOff className="h-12 w-12 text-gray-300" aria-hidden="true" />
      <p className="text-lg font-bold text-gray-900">받은 알림이 없습니다.</p>
      <p className="text-sm text-gray-500">소진 예정 물건이 생기면 이곳에 알려드려요.</p>
    </div>
  );
}
