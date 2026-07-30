import { useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { useUpdateInventoryItem } from '@/features/inventory/hooks/useInventoryMutations';
import { buildPurchaseHistoryUpdateInput } from '@/features/inventory/utils/purchaseHistory';
import type { InventoryItem } from '@/features/inventory/types/inventory.types';

type PurchaseHistoryPanelProps = {
  item: InventoryItem;
  className?: string;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function PurchaseHistoryPanel({ item, className }: PurchaseHistoryPanelProps) {
  const updateMutation = useUpdateInventoryItem();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [draftDate, setDraftDate] = useState('');

  const history = item.purchaseHistory ?? [];
  const rows = history
    .map((date, index) => ({ date, index }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  function startEdit(index: number, date: Date) {
    setEditingIndex(index);
    setDraftDate(format(date, 'yyyy-MM-dd'));
  }

  function cancelEdit() {
    setEditingIndex(null);
    setDraftDate('');
  }

  function saveEdit(index: number) {
    if (!draftDate || updateMutation.isPending) {
      return;
    }
    const newHistory = history.map((date, i) => (i === index ? new Date(draftDate) : date));
    void updateMutation.mutateAsync({
      id: item.id,
      input: buildPurchaseHistoryUpdateInput(item, newHistory),
    });
    setEditingIndex(null);
  }

  function deleteEntry(index: number) {
    if (updateMutation.isPending) {
      return;
    }
    const newHistory = history.filter((_, i) => i !== index);
    void updateMutation.mutateAsync({
      id: item.id,
      input: buildPurchaseHistoryUpdateInput(item, newHistory),
    });
    if (editingIndex === index) {
      cancelEdit();
    }
  }

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm',
        className,
      )}
    >
      <p className="mb-3 shrink-0 text-sm font-medium text-gray-700">구매 내역</p>
      {rows.length === 0 ? (
        <p className="text-sm text-gray-500">구매 기록이 없습니다.</p>
      ) : (
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto md:min-h-0">
          {rows.map(({ date, index }) => (
            <div
              key={index}
              className="flex items-center justify-between gap-2 rounded-2xl border border-gray-100 px-3 py-2"
            >
              {editingIndex === index ? (
                <>
                  <input
                    type="date"
                    value={draftDate}
                    onChange={(event) => setDraftDate(event.target.value)}
                    className="min-w-0 flex-1 rounded-xl border border-gray-200 px-2 py-1 text-sm"
                  />
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => saveEdit(index)}
                      disabled={updateMutation.isPending}
                      aria-label="저장"
                      className="rounded-xl p-1.5 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
                    >
                      <Check className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={updateMutation.isPending}
                      aria-label="취소"
                      className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 disabled:opacity-50"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <span className="text-sm text-gray-600">{formatDate(date)}</span>
                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(index, date)}
                      disabled={updateMutation.isPending}
                      aria-label="구매일 수정"
                      className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
                    >
                      <Pencil className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteEntry(index)}
                      disabled={updateMutation.isPending}
                      aria-label="구매 기록 삭제"
                      className="rounded-xl p-1.5 text-gray-400 hover:bg-gray-100 hover:text-danger-600 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
