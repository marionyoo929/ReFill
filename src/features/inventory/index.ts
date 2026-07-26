export { InventoryListView } from '@/features/inventory/components/InventoryListView';
export { ItemDetailView } from '@/features/inventory/components/ItemDetailView';
export { ItemForm } from '@/features/inventory/components/ItemForm';
export {
  useCreateInventoryItem,
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from '@/features/inventory/hooks/useInventoryMutations';
export type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';
