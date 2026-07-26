import { useQuery } from '@tanstack/react-query';
import { getDashboardData } from '@/features/dashboard/services/dashboardMockService';

const DASHBOARD_QUERY_KEY = ['dashboard'] as const;

export function useDashboardData() {
  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: getDashboardData,
  });
}
