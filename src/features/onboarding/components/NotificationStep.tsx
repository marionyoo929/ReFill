import { NotificationSettingsSection } from '@/features/settings';
import type { UserSettings } from '@/features/settings';

type NotificationStepProps = {
  settings: UserSettings;
  onChange: (patch: Partial<UserSettings>) => void;
};

export function NotificationStep({ settings, onChange }: NotificationStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">알림을 설정해주세요</h1>
        <p className="mt-1 text-sm text-gray-500">필요하면 나중에 설정에서 다시 바꿀 수 있어요.</p>
      </div>
      <NotificationSettingsSection settings={settings} onChange={onChange} />
    </div>
  );
}
