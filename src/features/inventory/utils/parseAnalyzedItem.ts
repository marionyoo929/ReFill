import type { InventoryItem } from '@/features/inventory/types/inventory.types';
import { predictEndDate } from '@/features/prediction';

type AnalyzedResponse = {
  name?: string;
  capacity_value?: number;
  repurchase_period_days?: number;
  unit?: string;
  purchase_url?: string;
};

export function parseAnalyzedItem(resp: AnalyzedResponse): InventoryItem {
  const name = resp.name ?? '이름 없음';
  const cycleDays = resp.repurchase_period_days ?? 30;
  const capacityValue = resp.capacity_value;
  const capacityUnit = resp.unit ?? undefined;

  const registeredAt = new Date();
  const expectedEndDate = predictEndDate({ registeredAt, cycleDays });

  return {
    id: '',
    name,
    brand: resp.purchase_url,
    cycleDays,
    capacityValue,
    capacityUnit,
    registeredAt,
    expectedEndDate,
    purchaseHistory: [],
    notificationEnabled: true,
    notificationLeadTimeDays: 7,
  };
}
