import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInventoryItem } from '@/features/inventory/hooks/useInventoryItem';
import {
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from '@/features/inventory/hooks/useInventoryMutations';
import { ItemForm } from '@/features/inventory/components/ItemForm';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useToast } from '@/providers/ToastProvider';
import { ROUTES } from '@/constants/routes';
import type { InventoryItemInput } from '@/features/inventory/types/inventory.types';

type ItemDetailViewProps = {
  itemId: string;
};

export function ItemDetailView({ itemId }: ItemDetailViewProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: item, isLoading, isError } = useInventoryItem(itemId);
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  if (isLoading) {
    return <Skeleton className="h-96" />;
  }

  if (isError || !item) {
    return <ErrorState message="물건 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  async function handleSubmit(values: InventoryItemInput) {
    await updateMutation.mutateAsync({ id: itemId, input: values });
    showToast(`${values.name} 정보가 수정되었습니다.`);
    void navigate(ROUTES.INVENTORY);
  }

  async function handleDelete() {
    const itemName = item?.name ?? '물건';
    await deleteMutation.mutateAsync(itemId);
    showToast(`${itemName}이(가) 삭제되었습니다.`);
    void navigate(ROUTES.INVENTORY);
  }

  return (
    <div className="flex flex-col gap-6">
      <ItemForm
        mode="edit"
        defaultValues={item}
        isSubmitting={updateMutation.isPending}
        onSubmit={handleSubmit}
      />

      <div className="rounded-2xl border border-danger-100 bg-danger-50 p-4">
        {isConfirmingDelete ? (
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm text-danger-700">정말 삭제하시겠습니까?</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(false)}
                className="rounded-2xl px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                취소
              </button>
              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleteMutation.isPending}
                className="rounded-2xl bg-danger-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-danger-700 disabled:opacity-50"
              >
                삭제
              </button>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            className="text-sm font-medium text-danger-600 hover:text-danger-700"
          >
            물건 삭제
          </button>
        )}
      </div>
    </div>
  );
}
