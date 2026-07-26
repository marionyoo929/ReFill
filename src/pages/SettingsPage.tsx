import { SettingsView } from '@/features/settings';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">설정</h1>
      <SettingsView />
    </div>
  );
}
