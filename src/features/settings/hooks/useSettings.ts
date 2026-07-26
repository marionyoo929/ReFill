import { useQuery } from '@tanstack/react-query';
import { getSettings } from '@/features/settings/services/settingsMockService';

export const SETTINGS_QUERY_KEY = ['settings'] as const;

export function useSettings() {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
  });
}
