import { subDays } from 'date-fns';
import type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';
import { predictEndDate, getPredictionBasisDate } from '@/features/prediction';

/**
 * 실제 Firebase 연동 전까지 사용하는 Mock Data 계층이다.
 * Dashboard Feature와 동일하게 Service 내부만 Firestore 호출로 교체하면
 * Hook/UI 계층은 그대로 재사용할 수 있도록 설계했다.
 */
const MOCK_DELAY_MS = 300;

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

type SeedItem = {
  id: string;
  name: string;
  brand?: string;
  cycleDays: number;
  daysAgoRegistered: number;
};

const SEED_ITEMS: SeedItem[] = [
  {
    id: '1',
    name: '칫솔',
    cycleDays: 30,
    daysAgoRegistered: 29,
  },
  {
    id: '2',
    name: '헤드앤숄더 샴푸',
    brand: 'P&G',
    cycleDays: 45,
    daysAgoRegistered: 43,
  },
  {
    id: '3',
    name: '다우니 세탁세제',
    brand: '다우니',
    cycleDays: 60,
    daysAgoRegistered: 55,
  },
  {
    id: '4',
    name: '마스크',
    cycleDays: 20,
    daysAgoRegistered: 14,
  },
  {
    id: '5',
    name: '화장지',
    cycleDays: 25,
    daysAgoRegistered: 15,
  },
  {
    id: '6',
    name: '캡슐커피',
    cycleDays: 40,
    daysAgoRegistered: 25,
  },
];

function buildItemFromSeed(seed: SeedItem): InventoryItem {
  const registeredAt = subDays(new Date(), seed.daysAgoRegistered);
  return {
    id: seed.id,
    name: seed.name,
    brand: seed.brand,
    cycleDays: seed.cycleDays,
    capacityValue: undefined,
    capacityUnit: undefined,
    registeredAt,
    expectedEndDate: predictEndDate({ registeredAt, cycleDays: seed.cycleDays }),
    purchaseHistory: [],
    notificationEnabled: true,
    notificationLeadTimeDays: 7,
  };
}

let mockItems: InventoryItem[] = SEED_ITEMS.map(buildItemFromSeed);

export async function getInventoryItems(): Promise<InventoryItem[]> {
  await delay();
  return [...mockItems].sort((a, b) => a.expectedEndDate.getTime() - b.expectedEndDate.getTime());
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  await delay();
  return mockItems.find((item) => item.id === id) ?? null;
}

export async function createInventoryItem(input: InventoryItemInput): Promise<InventoryItem> {
  await delay();
  const registeredAt = input.registeredAt ?? new Date();
  const basisDate = getPredictionBasisDate(registeredAt, input.purchaseHistory);
  const newItem: InventoryItem = {
    id: crypto.randomUUID(),
    name: input.name,
    brand: input.brand || undefined,
    cycleDays: input.cycleDays,
    capacityValue: input.capacityValue,
    capacityUnit: input.capacityUnit,
    registeredAt,
    expectedEndDate: predictEndDate({ registeredAt: basisDate, cycleDays: input.cycleDays }),
    purchaseHistory: input.purchaseHistory ?? [],
    notificationEnabled: input.notificationEnabled ?? true,
    notificationLeadTimeDays: input.notificationLeadTimeDays ?? 7,
  };
  mockItems = [...mockItems, newItem];
  return newItem;
}

export async function updateInventoryItem(
  id: string,
  input: InventoryItemInput,
): Promise<InventoryItem> {
  await delay();
  const existing = mockItems.find((item) => item.id === id);
  if (!existing) {
    throw new Error('물건을 찾을 수 없습니다.');
  }

  const registeredAt = input.registeredAt ?? existing.registeredAt;
  const purchaseHistory = input.purchaseHistory ?? existing.purchaseHistory;
  const basisDate = getPredictionBasisDate(registeredAt, purchaseHistory);

  const updated: InventoryItem = {
    ...existing,
    name: input.name,
    brand: input.brand || undefined,
    cycleDays: input.cycleDays,
    capacityValue: input.capacityValue,
    capacityUnit: input.capacityUnit,
    registeredAt,
    expectedEndDate: predictEndDate({
      registeredAt: basisDate,
      cycleDays: input.cycleDays,
    }),
    purchaseHistory,
    notificationEnabled: input.notificationEnabled ?? existing.notificationEnabled,
    notificationLeadTimeDays: input.notificationLeadTimeDays ?? existing.notificationLeadTimeDays,
  };
  mockItems = mockItems.map((item) => (item.id === id ? updated : item));
  return updated;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await delay();
  mockItems = mockItems.filter((item) => item.id !== id);
}
