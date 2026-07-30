export { InventoryListView } from '@/features/inventory/components/InventoryListView';
export { useInventoryItems } from '@/features/inventory/hooks/useInventoryItems';
export { useEnrichedInventoryItems } from '@/features/inventory/hooks/useEnrichedInventoryItems';
export type { EnrichedInventoryItem } from '@/features/inventory/hooks/useEnrichedInventoryItems';
export { ItemDetailView } from '@/features/inventory/components/ItemDetailView';
export { ItemForm } from '@/features/inventory/components/ItemForm';
export {
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from '@/features/inventory/hooks/useInventoryMutations';
export type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';
export { buildPurchaseHistoryUpdateInput } from '@/features/inventory/utils/purchaseHistory';
