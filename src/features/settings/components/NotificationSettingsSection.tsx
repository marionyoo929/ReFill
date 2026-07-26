import { Card } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { cn } from '@/lib/cn';
import { LEAD_TIME_OPTIONS } from '@/features/settings/constants/settingsOptions';
import type { UserSettings } from '@/features/settings/types/settings.types';

type NotificationSettingsSectionProps = {
  settings: UserSettings;
  onChange: (patch: Partial<UserSettings>) => void;
};

export function NotificationSettingsSection({
  settings,
  onChange,
}: NotificationSettingsSectionProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900 dark:text-white">알림 설정</h2>

      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
          알림 전체 사용
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.notificationEnabled}
          aria-label="알림 전체 사용"
          onClick={() => onChange({ notificationEnabled: !settings.notificationEnabled })}
          className={cn(
            'relative h-6 w-11 shrink-0 rounded-full transition-colors',
            settings.notificationEnabled ? 'bg-primary-600' : 'bg-gray-200',
          )}
        >
          <span
            className={cn(
              'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
              settings.notificationEnabled ? 'translate-x-5' : 'translate-x-0',
            )}
          />
        </button>
      </div>

      <div>
        <label
          htmlFor="lead-time"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          소진 예정 며칠 전 알림
        </label>
        <Select
          id="lead-time"
          value={settings.leadTimeDays}
          disabled={!settings.notificationEnabled}
          onChange={(event) => onChange({ leadTimeDays: Number(event.target.value) })}
        >
          {LEAD_TIME_OPTIONS.map((days) => (
            <option key={days} value={days}>
              {days}일 전
            </option>
          ))}
        </Select>
      </div>
    </Card>
  );
}
