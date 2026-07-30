import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { addMonths, subMonths, startOfMonth, isSameDay, format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { useEnrichedInventoryItems } from '@/features/inventory';
import { Skeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { CalendarGrid } from '@/features/calendar/components/CalendarGrid';
import { DayDetailPanel } from '@/features/calendar/components/DayDetailPanel';

export function CalendarView() {
  const { data: items, isLoading, isError } = useEnrichedInventoryItems();
  const [referenceMonth, setReferenceMonth] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(() => new Date());

  const selectedDayItems = useMemo(
    () => (items ?? []).filter((item) => isSameDay(item.expectedEndDate, selectedDate)),
    [items, selectedDate],
  );

  function handlePreviousMonth() {
    const next = subMonths(referenceMonth, 1);
    setReferenceMonth(next);
    setSelectedDate(startOfMonth(next));
  }

  function handleNextMonth() {
    const next = addMonths(referenceMonth, 1);
    setReferenceMonth(next);
    setSelectedDate(startOfMonth(next));
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-80" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  if (isError || !items) {
    return <ErrorState message="캘린더 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요." />;
  }

  return (
    <div className="flex flex-1 flex-col gap-6 md:min-h-0">
      <div className="shrink-0 flex items-center justify-between">
        <button
          type="button"
          aria-label="이전 달"
          onClick={handlePreviousMonth}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <h1 className="text-lg font-bold text-gray-900">
          {format(referenceMonth, 'yyyy년 M월', { locale: ko })}
        </h1>
        <button
          type="button"
          aria-label="다음 달"
          onClick={handleNextMonth}
          className="flex h-9 w-9 items-center justify-center rounded-2xl text-gray-500 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <div className="flex flex-col md:min-h-0 md:flex-[3]">
        <CalendarGrid
          referenceMonth={referenceMonth}
          selectedDate={selectedDate}
          items={items}
          onSelectDate={setSelectedDate}
          className="flex-1"
        />
      </div>

      <DayDetailPanel date={selectedDate} items={selectedDayItems} className="md:flex-[2]" />
    </div>
  );
}
