import { useQuery } from '@tanstack/react-query';
import { getInventoryItemById } from '@/features/inventory/services/inventoryFirebaseService';

export function useInventoryItem(id: string) {
  return useQuery({
    queryKey: ['inventory', id] as const,
    queryFn: () => getInventoryItemById(id),
    enabled: Boolean(id),
  });
}
