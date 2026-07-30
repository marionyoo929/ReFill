import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Pencil, Trash2, Check, X, Plus } from 'lucide-react';
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [newDate, setNewDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  const history = item.purchaseHistory ?? [];
  const rows = history
    .map((date, index) => ({ date, index }))
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  useEffect(() => {
    if (!isAddOpen) {
      return;
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsAddOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAddOpen]);

  function openAdd() {
    setNewDate(format(new Date(), 'yyyy-MM-dd'));
    setIsAddOpen(true);
  }

  function addPurchase() {
    if (!newDate || updateMutation.isPending) {
      return;
    }
    const newHistory = [...history, new Date(newDate)];
    void updateMutation.mutateAsync({
      id: item.id,
      input: buildPurchaseHistoryUpdateInput(item, newHistory),
    });
    setIsAddOpen(false);
  }

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
      <div className="mb-3 flex shrink-0 items-center justify-between">
        <p className="text-sm font-medium text-gray-700">구매 내역</p>
        <button
          type="button"
          onClick={openAdd}
          disabled={updateMutation.isPending}
          aria-label="구매일 추가"
          className="rounded-xl p-1.5 text-primary-600 hover:bg-primary-50 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
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

      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-label="구매일 추가"
            className="w-full max-w-xs rounded-2xl bg-white p-5 shadow-lg"
          >
            <p className="mb-3 text-sm font-medium text-gray-700">구매일 추가</p>
            <input
              type="date"
              value={newDate}
              onChange={(event) => setNewDate(event.target.value)}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                disabled={updateMutation.isPending}
                className="rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                취소
              </button>
              <button
                type="button"
                onClick={addPurchase}
                disabled={updateMutation.isPending}
                className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
              >
                추가
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
