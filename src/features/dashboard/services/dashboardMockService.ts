import { addDays } from 'date-fns';
import type { DashboardData, DashboardItem } from '@/features/dashboard/types/dashboard.types';
import {
  buildDashboardSummary,
  enrichWithRisk,
} from '@/features/dashboard/utils/dashboardCalculations';

/**
 * 실제 Firebase 연동 전까지 사용하는 Mock Data 계층이다.
 * 향후 Inventory/Prediction Feature 구현 시 이 함수의 내부만
 * Firestore + Prediction Engine 호출로 교체하고, useDashboardData 훅과
 * 상위 UI는 그대로 재사용한다.
 */
const MOCK_NETWORK_DELAY_MS = 300;

type MockItemSeed = {
  id: string;
  name: string;
  category: string;
  daysUntilEnd: number;
};

const MOCK_ITEM_SEEDS: MockItemSeed[] = [
  { id: '1', name: '칫솔', category: '위생용품', daysUntilEnd: 1 },
  { id: '2', name: '헤드앤숄더 샴푸', category: '위생용품', daysUntilEnd: 2 },
  { id: '3', name: '다우니 세탁세제', category: '생활용품', daysUntilEnd: 5 },
  { id: '4', name: '마스크', category: '위생용품', daysUntilEnd: 6 },
  { id: '5', name: '화장지', category: '생활용품', daysUntilEnd: 10 },
  { id: '6', name: '캡슐커피', category: '식품', daysUntilEnd: 15 },
];

export async function getDashboardData(): Promise<DashboardData> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_NETWORK_DELAY_MS));

  const today = new Date();
  const upcomingItems: DashboardItem[] = MOCK_ITEM_SEEDS.map((seed) =>
    enrichWithRisk(
      {
        id: seed.id,
        name: seed.name,
        category: seed.category,
        expectedEndDate: addDays(today, seed.daysUntilEnd),
      },
      today,
    ),
  ).sort((a, b) => a.remainingDays - b.remainingDays);

  return {
    summary: buildDashboardSummary(upcomingItems),
    upcomingItems,
  };
}
