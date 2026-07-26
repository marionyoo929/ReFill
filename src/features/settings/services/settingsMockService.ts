import type { UserSettings } from '@/features/settings/types/settings.types';

/**
 * 실제 Firebase 연동 전까지 사용하는 Mock 계층이다.
 * 향후 이 파일 내부만 Firestore settings 컬렉션 호출로 교체하면 되고,
 * useSettings/useUpdateSettings 훅 인터페이스는 그대로 유지한다.
 */
const SETTINGS_STORAGE_KEY = 'refill_mock_settings';
const MOCK_DELAY_MS = 300;

export const DEFAULT_SETTINGS: UserSettings = {
  notificationEnabled: true,
  leadTimeDays: 3,
};

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

export async function getSettings(): Promise<UserSettings> {
  await delay();
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    return raw
      ? { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<UserSettings>) }
      : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: UserSettings): Promise<UserSettings> {
  await delay();
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  return settings;
}
