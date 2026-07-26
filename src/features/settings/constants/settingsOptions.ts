import type { ThemeMode } from '@/features/settings/types/settings.types';

export const LEAD_TIME_OPTIONS: number[] = [1, 3, 7];

export const THEME_OPTIONS: { value: ThemeMode; label: string }[] = [
  { value: 'system', label: '시스템 설정' },
  { value: 'light', label: '라이트' },
  { value: 'dark', label: '다크' },
];
