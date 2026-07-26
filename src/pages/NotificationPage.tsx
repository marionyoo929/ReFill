import { NotificationListView } from '@/features/notification';

export default function NotificationPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">알림</h1>
      <NotificationListView />
    </div>
  );
}
