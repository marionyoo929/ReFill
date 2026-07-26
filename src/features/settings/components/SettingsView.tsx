import { useState } from 'react';
import { useSettings } from '@/features/settings/hooks/useSettings';
import { useUpdateSettings } from '@/features/settings/hooks/useUpdateSettings';
import { useToast } from '@/providers/ToastProvider';
import { ProfileSection } from '@/features/settings/components/ProfileSection';
import { NotificationSettingsSection } from '@/features/settings/components/NotificationSettingsSection';
import { ThemeSettingsSection } from '@/features/settings/components/ThemeSettingsSection';
import { LogoutSection } from '@/features/settings/components/LogoutSection';
import { SettingsSkeleton } from '@/features/settings/components/SettingsSkeleton';
import { ErrorState } from '@/components/common/ErrorState';
import type { UserSettings } from '@/features/settings/types/settings.types';

export function SettingsView() {
  const { data: settings, isLoading, isError } = useSettings();
  const { mutateAsync, isPending } = useUpdateSettings();
  const { showToast } = useToast();
  const [prevSettings, setPrevSettings] = useState(settings);
  const [draft, setDraft] = useState<UserSettings | null>(settings ?? null);

  if (settings !== prevSettings) {
    setPrevSettings(settings);
    setDraft(settings ?? null);
  }

  if (isLoading || !draft) {
    return <SettingsSkeleton />;
  }

  if (isError) {
    return <ErrorState message="설정 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  async function handleSave() {
    if (!draft) {
      return;
    }
    try {
      await mutateAsync(draft);
      showToast('설정이 저장되었습니다.');
    } catch {
      showToast('설정 저장에 실패했습니다.');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <ProfileSection />

      <NotificationSettingsSection
        settings={draft}
        onChange={(patch) => setDraft((prev) => (prev ? { ...prev, ...patch } : prev))}
      />

      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={isPending}
        className="w-full rounded-2xl bg-primary-600 px-5 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50 md:w-auto"
      >
        {isPending ? '저장 중...' : '설정 저장'}
      </button>

      <ThemeSettingsSection />

      <LogoutSection />
    </div>
  );
}
