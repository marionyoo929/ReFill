import { useMemo } from 'react';
import { useInventoryItems } from '@/features/inventory/hooks/useInventoryItems';
import { getItemStatus } from '@/features/prediction';
import type { InventoryItem } from '@/features/inventory/types/inventory.types';
import type { ItemStatus } from '@/features/prediction';

export type EnrichedInventoryItem = InventoryItem & ItemStatus;

export function useEnrichedInventoryItems() {
  const { data, isLoading, isError } = useInventoryItems();

  const items = useMemo<EnrichedInventoryItem[] | undefined>(() => {
    if (!data) {
      return undefined;
    }
    return data
      .map((item) => ({ ...item, ...getItemStatus(item.expectedEndDate) }))
      .sort((a, b) => a.remainingDays - b.remainingDays);
  }, [data]);

  return { data: items, isLoading, isError };
}
