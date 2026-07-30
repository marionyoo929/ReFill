import { useNavigate, useLocation } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { useToast } from '@/providers/ToastProvider';
import { ItemForm, useCreateInventoryItem } from '@/features/inventory';
import type { InventoryItemInput } from '@/features/inventory';
import { parseAnalyzedItem } from '@/features/inventory/utils/parseAnalyzedItem';

export default function AddItemPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { mutateAsync, isPending } = useCreateInventoryItem();
  const location = useLocation();
  const prefill = location.state?.prefill ? parseAnalyzedItem(location.state.prefill) : undefined;

  async function handleSubmit(values: InventoryItemInput) {
    await mutateAsync(values);
    showToast(`${values.name}이(가) 등록되었습니다.`);
    void navigate(ROUTES.INVENTORY);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">물건 등록</h1>
      <ItemForm mode="create" isSubmitting={isPending} onSubmit={handleSubmit} defaultValues={prefill} />
    </div>
  );
}
