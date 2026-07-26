import { useMemo } from 'react';
import { useInventoryItems } from '@/features/inventory';
import { getItemStatus } from '@/features/prediction';
import { buildDashboardSummary } from '@/features/dashboard/utils/dashboardCalculations';
import type { DashboardData, DashboardItem } from '@/features/dashboard/types/dashboard.types';

export function useDashboardData() {
  const { data: inventoryItems, isLoading, isError } = useInventoryItems();

  const data: DashboardData | undefined = useMemo(() => {
    if (!inventoryItems) {
      return undefined;
    }

    const upcomingItems: DashboardItem[] = inventoryItems
      .map((item) => ({ ...item, ...getItemStatus(item.expectedEndDate) }))
      .sort((a, b) => a.remainingDays - b.remainingDays);

    return {
      summary: buildDashboardSummary(upcomingItems),
      upcomingItems,
    };
  }, [inventoryItems]);

  return { data, isLoading, isError };
}
