import { useMemo } from 'react';
import { useEnrichedInventoryItems } from '@/features/inventory';
import { buildDashboardSummary } from '@/features/dashboard/utils/dashboardCalculations';
import type { DashboardData } from '@/features/dashboard/types/dashboard.types';

export function useDashboardData() {
  const { data: upcomingItems, isLoading, isError } = useEnrichedInventoryItems();

  const data: DashboardData | undefined = useMemo(() => {
    if (!upcomingItems) {
      return undefined;
    }
    return {
      summary: buildDashboardSummary(upcomingItems),
      upcomingItems,
    };
  }, [upcomingItems]);

  return { data, isLoading, isError };
}
