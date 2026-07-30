import { useMemo } from 'react';
import { useEnrichedInventoryItems } from '@/features/inventory';
import { buildDashboardSummary } from '@/features/dashboard/utils/dashboardCalculations';
import type { DashboardData } from '@/features/dashboard/types/dashboard.types';

export function useDashboardData() {
  const { data: items, isLoading, isError } = useEnrichedInventoryItems();

  const data: DashboardData | undefined = useMemo(() => {
    if (!items) {
      return undefined;
    }

    const overdueItems = items.filter((item) => item.remainingDays <= 0);

    return {
      summary: buildDashboardSummary(items),
      upcomingItems: overdueItems,
    };
  }, [items]);

  return { data, isLoading, isError };
}
