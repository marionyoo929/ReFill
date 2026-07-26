import { useMemo } from 'react';
import { useEnrichedInventoryItems } from '@/features/inventory';
import { buildAnalyticsSummary } from '@/features/analytics/utils/analyticsCalculations';
import type { AnalyticsSummary } from '@/features/analytics/types/analytics.types';

export function useAnalyticsSummary() {
  const { data: items, isLoading, isError } = useEnrichedInventoryItems();

  const summary: AnalyticsSummary | undefined = useMemo(() => {
    if (!items) {
      return undefined;
    }
    return buildAnalyticsSummary(items);
  }, [items]);

  return { summary, isLoading, isError };
}
