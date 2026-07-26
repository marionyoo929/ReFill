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
import { predictEndDate } from '@/features/prediction';
import type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';

/**
 * Firestore(user_items 컬렉션) 기반 실제 구현이다.
 * Mock 구현(inventoryMockService.ts)은 개발/오프라인 참고용으로 유지한다.
 *
 * 문서 필드: userId, name, category, brand, cycleDays, importance,
 * registeredAt(Timestamp), expectedEndDate(Timestamp)
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

function toInventoryItem(id: string, data: Record<string, unknown>): InventoryItem {
  return {
    id,
    name: data.name as string,
    category: data.category as string,
    brand: (data.brand as string | null | undefined) ?? undefined,
    cycleDays: data.cycleDays as number,
    importance: data.importance as InventoryItem['importance'],
    registeredAt: toDate(data.registeredAt),
    expectedEndDate: toDate(data.expectedEndDate),
  };
}

function toFriendlyFirestoreError(): Error {
  return new Error('요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.');
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
    const registeredAt = new Date();
    const expectedEndDate = predictEndDate({ registeredAt, cycleDays: input.cycleDays });

    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      userId: uid,
      name: input.name,
      category: input.category,
      brand: input.brand ?? null,
      cycleDays: input.cycleDays,
      importance: input.importance,
      registeredAt: Timestamp.fromDate(registeredAt),
      expectedEndDate: Timestamp.fromDate(expectedEndDate),
    });

    return {
      id: docRef.id,
      name: input.name,
      category: input.category,
      brand: input.brand || undefined,
      cycleDays: input.cycleDays,
      importance: input.importance,
      registeredAt,
      expectedEndDate,
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
    const expectedEndDate = predictEndDate({
      registeredAt: existing.registeredAt,
      cycleDays: input.cycleDays,
    });

    await updateDoc(doc(db, COLLECTION_NAME, id), {
      name: input.name,
      category: input.category,
      brand: input.brand ?? null,
      cycleDays: input.cycleDays,
      importance: input.importance,
      expectedEndDate: Timestamp.fromDate(expectedEndDate),
    });

    return {
      ...existing,
      name: input.name,
      category: input.category,
      brand: input.brand || undefined,
      cycleDays: input.cycleDays,
      importance: input.importance,
      expectedEndDate,
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
