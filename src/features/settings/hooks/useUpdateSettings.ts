import { useMutation, useQueryClient } from '@tanstack/react-query';
import { saveSettings } from '@/features/settings/services/settingsMockService';
import { SETTINGS_QUERY_KEY } from '@/features/settings/hooks/useSettings';

export function useUpdateSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: saveSettings,
    onSuccess: (updated) => {
      queryClient.setQueryData(SETTINGS_QUERY_KEY, updated);
    },
  });
}
