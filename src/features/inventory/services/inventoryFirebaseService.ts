import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import { db, auth } from '@/firebase/config';
import { predictEndDate, getPredictionBasisDate } from '@/features/prediction';
import { recalculateCycleDays } from '@/features/inventory/services/cycleRecalculationService';
import type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';

/**
 * Firestore(user_items 컬렉션) 기반 실제 구현이다.
 * Mock 구현(inventoryMockService.ts)은 개발/오프라인 참고용으로 유지한다.
 *
 * 문서 필드: userId, name, brand, cycleDays,
 * capacityValue, capacityUnit, registeredAt(Timestamp), expectedEndDate(Timestamp),
 * purchaseHistory(Timestamp[]), notificationEnabled, notificationLeadTimeDays
 * 문서 ID를 InventoryItem.id로 사용하며, Firestore Security Rules가
 * userId 기준으로 소유자 외 접근을 차단한다.
 */
const COLLECTION_NAME = 'user_items';

function requireUid(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error('로그인이 필요합니다.');
  }
  return uid;
}

function toDate(value: unknown): Date {
  return value instanceof Timestamp ? value.toDate() : (value as Date);
}

function getTimestampsAsDates(value: unknown): Date[] | undefined {
  return Array.isArray(value)
    ? value.map((item) => toDate(item))
    : undefined;
}

function toInventoryItem(id: string, data: Record<string, unknown>): InventoryItem {
  return {
    id,
    name: data.name as string,
    brand: (data.brand as string | null | undefined) ?? undefined,
    cycleDays: data.cycleDays as number,
    capacityValue: data.capacityValue as number | undefined,
    capacityUnit: (data.capacityUnit as string) ?? undefined,
    registeredAt: toDate(data.registeredAt),
    expectedEndDate: toDate(data.expectedEndDate),
    purchaseHistory: getTimestampsAsDates(data.purchaseHistory),
    notificationEnabled: (data.notificationEnabled as boolean) ?? true,
    notificationLeadTimeDays: (data.notificationLeadTimeDays as number) ?? 7,
  };
}

function toFriendlyFirestoreError(): Error {
  return new Error('요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.');
}

/**
 * 구매 내역이 실제로 바뀌었는지(추가/수정/삭제) 판단한다.
 * 정렬 후 getTime()으로 비교해 타임존/문자열 변환에 따른 오탐을 피한다.
 */
function havePurchaseHistoriesChanged(existing: Date[] | undefined, incoming: Date[] | undefined): boolean {
  const existingDates = existing ?? [];
  const incomingDates = incoming ?? [];
  if (existingDates.length !== incomingDates.length) {
    return true;
  }
  const sortedExisting = [...existingDates].sort((a, b) => a.getTime() - b.getTime());
  const sortedIncoming = [...incomingDates].sort((a, b) => a.getTime() - b.getTime());
  return sortedExisting.some((date, index) => date.getTime() !== sortedIncoming[index].getTime());
}

/**
 * 구매 내역이 바뀌었고 간격을 계산할 수 있을 만큼(2건 이상) 쌓였으면
 * LLM에게 실제 구매 간격 기반으로 새 소진 주기를 추론시킨다.
 * 호출 실패는 여기서 흡수해 저장 자체가 막히지 않게 한다.
 */
async function resolveCycleDays(
  input: InventoryItemInput,
  existing: InventoryItem,
): Promise<number> {
  const purchaseHistoryChanged =
    !!input.purchaseHistory &&
    input.purchaseHistory.length >= 2 &&
    havePurchaseHistoriesChanged(existing.purchaseHistory, input.purchaseHistory);

  if (!purchaseHistoryChanged || !input.purchaseHistory) {
    return input.cycleDays;
  }

  try {
    const recalculated = await recalculateCycleDays({
      name: input.name,
      brand: input.brand,
      capacityValue: input.capacityValue,
      capacityUnit: input.capacityUnit,
      currentCycleDays: input.cycleDays,
      purchaseHistory: input.purchaseHistory,
    });
    return recalculated ?? input.cycleDays;
  } catch (error) {
    console.warn('[inventoryFirebaseService] cycleDays 재계산 중 오류, 기존 값을 사용합니다.', error);
    return input.cycleDays;
  }
}

export async function getInventoryItems(): Promise<InventoryItem[]> {
  try {
    const uid = requireUid();
    const itemsQuery = query(collection(db, COLLECTION_NAME), where('userId', '==', uid));
    const snapshot = await getDocs(itemsQuery);
    return snapshot.docs
      .map((docSnapshot) => toInventoryItem(docSnapshot.id, docSnapshot.data()))
      .sort((a, b) => a.expectedEndDate.getTime() - b.expectedEndDate.getTime());
  } catch (error) {
    if (error instanceof Error && error.message === '로그인이 필요합니다.') {
      throw error;
    }
    throw toFriendlyFirestoreError();
  }
}

export async function getInventoryItemById(id: string): Promise<InventoryItem | null> {
  try {
    const snapshot = await getDoc(doc(db, COLLECTION_NAME, id));
    return snapshot.exists() ? toInventoryItem(snapshot.id, snapshot.data()) : null;
  } catch {
    throw toFriendlyFirestoreError();
  }
}

export async function createInventoryItem(input: InventoryItemInput): Promise<InventoryItem> {
  try {
    const uid = requireUid();
    const registeredAt = input.registeredAt ?? new Date();
    const basisDate = getPredictionBasisDate(registeredAt, input.purchaseHistory);
    const expectedEndDate = predictEndDate({ registeredAt: basisDate, cycleDays: input.cycleDays });

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId: uid,
      name: input.name,
      brand: input.brand ?? null,
      cycleDays: input.cycleDays,
      capacityValue: input.capacityValue ?? null,
      capacityUnit: input.capacityUnit ?? null,
      registeredAt: Timestamp.fromDate(registeredAt),
      expectedEndDate: Timestamp.fromDate(expectedEndDate),
      purchaseHistory: input.purchaseHistory?.map((date) => Timestamp.fromDate(date)) ?? [],
      notificationEnabled: input.notificationEnabled ?? true,
      notificationLeadTimeDays: input.notificationLeadTimeDays ?? 7,
    });

    return {
      id: docRef.id,
      name: input.name,
      brand: input.brand || undefined,
      cycleDays: input.cycleDays,
      capacityValue: input.capacityValue,
      capacityUnit: input.capacityUnit,
      registeredAt,
      expectedEndDate,
      purchaseHistory: input.purchaseHistory,
      notificationEnabled: input.notificationEnabled ?? true,
      notificationLeadTimeDays: input.notificationLeadTimeDays ?? 7,
    };
  } catch (error) {
    if (error instanceof Error && error.message === '로그인이 필요합니다.') {
      throw error;
    }
    throw toFriendlyFirestoreError();
  }
}

export async function updateInventoryItem(
  id: string,
  input: InventoryItemInput,
): Promise<InventoryItem> {
  try {
    const existingSnapshot = await getDoc(doc(db, COLLECTION_NAME, id));
    if (!existingSnapshot.exists()) {
      throw new Error('물건을 찾을 수 없습니다.');
    }
    const existing = toInventoryItem(existingSnapshot.id, existingSnapshot.data());
    const registeredAt = input.registeredAt ?? existing.registeredAt;
    const cycleDays = await resolveCycleDays(input, existing);
    const basisDate = getPredictionBasisDate(registeredAt, input.purchaseHistory);
    const expectedEndDate = predictEndDate({
      registeredAt: basisDate,
      cycleDays,
    });

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      name: input.name,
      brand: input.brand ?? null,
      cycleDays,
      capacityValue: input.capacityValue ?? null,
      capacityUnit: input.capacityUnit ?? null,
      registeredAt: Timestamp.fromDate(registeredAt),
      expectedEndDate: Timestamp.fromDate(expectedEndDate),
      purchaseHistory: input.purchaseHistory?.map((date) => Timestamp.fromDate(date)) ?? [],
      notificationEnabled: input.notificationEnabled ?? true,
      notificationLeadTimeDays: input.notificationLeadTimeDays ?? 7,
    });

    return {
      ...existing,
      name: input.name,
      brand: input.brand || undefined,
      cycleDays,
      capacityValue: input.capacityValue,
      capacityUnit: input.capacityUnit,
      registeredAt,
      expectedEndDate,
      purchaseHistory: input.purchaseHistory,
      notificationEnabled: input.notificationEnabled ?? true,
      notificationLeadTimeDays: input.notificationLeadTimeDays ?? 7,
    };
  } catch (error) {
    if (error instanceof Error && error.message === '물건을 찾을 수 없습니다.') {
      throw error;
    }
    throw toFriendlyFirestoreError();
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } catch {
    throw toFriendlyFirestoreError();
  }
}
