import { useSettings } from '@/features/settings/hooks/useSettings';
import { useApplyTheme } from '@/features/settings/hooks/useApplyTheme';

export function ThemeEffect() {
  const { data: settings } = useSettings();
  useApplyTheme(settings?.theme ?? 'system');
  return null;
}
