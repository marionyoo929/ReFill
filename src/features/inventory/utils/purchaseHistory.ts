import type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';

/**
 * item의 현재 값을 기반으로 InventoryItemInput을 만든다.
 * overrides로 넘긴 필드만 바꿔서 부분 업데이트(구매완료, 알림 토글 등)에 재사용한다.
 */
export function toInventoryItemInput(
  item: InventoryItem,
  overrides: Partial<InventoryItemInput> = {},
): InventoryItemInput {
  return {
    name: item.name,
    brand: item.brand,
    cycleDays: item.cycleDays,
    capacityValue: item.capacityValue,
    capacityUnit: item.capacityUnit,
    registeredAt: item.registeredAt,
    purchaseHistory: item.purchaseHistory,
    notificationEnabled: item.notificationEnabled,
    notificationLeadTimeDays: item.notificationLeadTimeDays,
    ...overrides,
  };
}

/**
 * 구매 내역이 바뀔 때(추가/수정/삭제) 사용한다.
 * registeredAt(첫 구매일)은 그대로 유지하고 purchaseHistory만 갱신한다.
 * expectedEndDate는 서비스 계층에서 최근 구매일(getPredictionBasisDate) 기준으로 재계산된다.
 */
export function buildPurchaseHistoryUpdateInput(
  item: InventoryItem,
  newHistory: Date[],
): InventoryItemInput {
  const sorted = [...newHistory].sort((a, b) => a.getTime() - b.getTime());

  return toInventoryItemInput(item, {
    purchaseHistory: sorted,
  });
}
