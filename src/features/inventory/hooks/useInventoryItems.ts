import { useQuery } from '@tanstack/react-query';
import { getInventoryItems } from '@/features/inventory/services/inventoryFirebaseService';

export const INVENTORY_QUERY_KEY = ['inventory'] as const;

export function useInventoryItems() {
  return useQuery({
    queryKey: INVENTORY_QUERY_KEY,
    queryFn: getInventoryItems,
  });
}
