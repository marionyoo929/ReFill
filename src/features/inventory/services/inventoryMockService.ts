import { subDays } from 'date-fns';
import type {
  ImportanceLevel,
  InventoryItem,
  InventoryItemInput,
} from '@/features/inventory/types/inventory.types';
import { calculateExpectedEndDate } from '@/features/inventory/utils/inventoryCalculations';

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
  category: string;
  brand?: string;
  cycleDays: number;
  importance: ImportanceLevel;
  daysAgoRegistered: number;
};

const SEED_ITEMS: SeedItem[] = [
  {
    id: '1',
    name: '칫솔',
    category: '위생용품',
    cycleDays: 30,
    importance: 'essential',
    daysAgoRegistered: 29,
  },
  {
    id: '2',
    name: '헤드앤숄더 샴푸',
    category: '위생용품',
    brand: 'P&G',
    cycleDays: 45,
    importance: 'essential',
    daysAgoRegistered: 43,
  },
  {
    id: '3',
    name: '다우니 세탁세제',
    category: '생활용품',
    brand: '다우니',
    cycleDays: 60,
    importance: 'important',
    daysAgoRegistered: 55,
  },
  {
    id: '4',
    name: '마스크',
    category: '위생용품',
    cycleDays: 20,
    importance: 'important',
    daysAgoRegistered: 14,
  },
  {
    id: '5',
    name: '화장지',
    category: '생활용품',
    cycleDays: 25,
    importance: 'normal',
    daysAgoRegistered: 15,
  },
  {
    id: '6',
    name: '캡슐커피',
    category: '식품',
    cycleDays: 40,
    importance: 'low',
    daysAgoRegistered: 25,
  },
];

function buildItemFromSeed(seed: SeedItem): InventoryItem {
  const registeredAt = subDays(new Date(), seed.daysAgoRegistered);
  return {
    id: seed.id,
    name: seed.name,
    category: seed.category,
    brand: seed.brand,
    cycleDays: seed.cycleDays,
    importance: seed.importance,
    registeredAt,
    expectedEndDate: calculateExpectedEndDate(registeredAt, seed.cycleDays),
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
  const registeredAt = new Date();
  const newItem: InventoryItem = {
    id: crypto.randomUUID(),
    name: input.name,
    category: input.category,
    brand: input.brand || undefined,
    cycleDays: input.cycleDays,
    importance: input.importance,
    registeredAt,
    expectedEndDate: calculateExpectedEndDate(registeredAt, input.cycleDays),
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

  const updated: InventoryItem = {
    ...existing,
    name: input.name,
    category: input.category,
    brand: input.brand || undefined,
    cycleDays: input.cycleDays,
    importance: input.importance,
    expectedEndDate: calculateExpectedEndDate(existing.registeredAt, input.cycleDays),
  };
  mockItems = mockItems.map((item) => (item.id === id ? updated : item));
  return updated;
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await delay();
  mockItems = mockItems.filter((item) => item.id !== id);
}
