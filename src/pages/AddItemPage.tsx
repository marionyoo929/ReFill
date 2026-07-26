import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/providers/ToastProvider';
import { ItemForm, useCreateInventoryItem } from '@/features/inventory';
import type { InventoryItemInput } from '@/features/inventory';

export default function AddItemPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { mutateAsync, isPending } = useCreateInventoryItem();

  async function handleSubmit(values: InventoryItemInput) {
    await mutateAsync(values);
    showToast(`${values.name}이(가) 등록되었습니다.`);
    void navigate(ROUTES.INVENTORY);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900 dark:text-white">물건 등록</h1>
      <ItemForm mode="create" isSubmitting={isPending} onSubmit={handleSubmit} />
    </div>
  );
}
