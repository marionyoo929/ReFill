import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { useInventoryItem } from '@/features/inventory/hooks/useInventoryItem';
import {
  useUpdateInventoryItem,
  useDeleteInventoryItem,
} from '@/features/inventory/hooks/useInventoryMutations';
import { ItemForm } from '@/features/inventory/components/ItemForm';
import { PurchaseHistoryPanel } from '@/features/inventory/components/PurchaseHistoryPanel';
import { NotificationSettingCard } from '@/features/inventory/components/NotificationSettingCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { useToast } from '@/providers/ToastProvider';
import { ROUTES } from '@/constants/routes';
import type { InventoryItemInput } from '@/features/inventory/types/inventory.types';

const EDIT_FORM_ID = 'item-detail-form';

type ItemDetailViewProps = {
  itemId: string;
};

export function ItemDetailView({ itemId }: ItemDetailViewProps) {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { data: item, isLoading, isError } = useInventoryItem(itemId);
  const updateMutation = useUpdateInventoryItem();
  const deleteMutation = useDeleteInventoryItem();
  const [isEditing, setIsEditing] = useState(false);
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
    setIsEditing(false);
  }

  async function handleDelete() {
    const itemName = item?.name ?? '물건';
    await deleteMutation.mutateAsync(itemId);
    showToast(`${itemName}이(가) 삭제되었습니다.`);
    void navigate(ROUTES.INVENTORY);
  }

  function handleEditButtonClick() {
    if (isEditing) {
      const form = document.getElementById(EDIT_FORM_ID);
      if (form instanceof HTMLFormElement) {
        form.requestSubmit();
      }
      return;
    }
    setIsEditing(true);
  }

  function renderField(label: string, value: string | null | undefined) {
    return (
      <div>
        <p className="text-sm font-medium text-gray-700">{label}</p>
        <p className="mt-1 text-sm text-gray-600">{value ?? '없음'}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 md:h-[calc(100vh-9rem)] md:flex-row">
      <div className="flex flex-col gap-6 md:w-3/5 md:min-h-0 md:overflow-y-auto">
        <div className="flex flex-wrap items-start justify-between gap-4 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="min-w-0 flex-1">
            <h1 className="break-words text-xl font-bold text-gray-900">{item.name}</h1>
            <p className="mt-1 text-sm text-gray-500">
              다음 예상 구매일: {format(item.expectedEndDate, 'M월 d일')}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {isEditing ? (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setIsConfirmingDelete(false);
                }}
                className="whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                취소
              </button>
            ) : null}
            <button
              type="button"
              onClick={handleEditButtonClick}
              className="whitespace-nowrap rounded-2xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
            >
              {isEditing ? '수정 완료' : '수정'}
            </button>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsConfirmingDelete(true)}
                className="whitespace-nowrap rounded-2xl border border-danger-200 bg-danger-50 px-4 py-2 text-sm font-medium text-danger-700 hover:bg-danger-100"
              >
                삭제
              </button>
            )}
          </div>
        </div>

        {!isEditing && <NotificationSettingCard item={item} />}

        {isConfirmingDelete && !isEditing && (
          <div className="rounded-2xl border border-danger-100 bg-danger-50 p-4">
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
          </div>
        )}

        {isEditing ? (
          <ItemForm
            mode="edit"
            defaultValues={item}
            formId={EDIT_FORM_ID}
            showSubmitButton={false}
            isSubmitting={updateMutation.isPending}
            onSubmit={handleSubmit}
          />
        ) : (
          <div className="grid gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 md:grid-cols-2">
              {renderField('소비 주기', `${item.cycleDays}일`)}
              {renderField(
                '용량',
                item.capacityValue != null
                  ? `${item.capacityValue}${item.capacityUnit ?? ''}`
                  : null,
              )}
              {renderField(
                '첫 구매일',
                item.registeredAt
                  ? new Intl.DateTimeFormat('ko-KR', {
                      year: 'numeric',
                      month: '2-digit',
                      day: '2-digit',
                    }).format(item.registeredAt)
                  : null,
              )}
            </div>

            {item.brand && (
              <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
                <p className="mb-3 text-sm font-medium text-gray-700">구매 URL</p>
                <a
                  href={item.brand}
                  target="_blank"
                  rel="noreferrer"
                  className="break-all text-sm text-primary-700 underline decoration-primary-200 hover:text-primary-800"
                >
                  {item.brand}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      <PurchaseHistoryPanel item={item} className="md:w-2/5 md:min-h-0" />
    </div>
  );
}
