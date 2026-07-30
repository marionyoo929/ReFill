import { auth } from '@/firebase/config';
import { env } from '@/config/env';

const RECALCULATE_TIMEOUT_MS = 8000;

type RecalculateCycleParams = {
  name: string;
  brand?: string;
  capacityValue?: number;
  capacityUnit?: string;
  currentCycleDays: number;
  purchaseHistory: Date[];
};

type RecalculateResponse =
  | { status: 'ok'; cycleDays: number }
  | { status: 'error'; message?: string };

function isRecalculateResponse(value: unknown): value is RecalculateResponse {
  return typeof value === 'object' && value !== null && 'status' in value;
}

/**
 * 구매 내역 기반으로 LLM에게 새 소진 주기를 추론시킨다.
 * 엔드포인트 미설정/네트워크 오류/응답 오류는 모두 null로 수렴시켜,
 * 호출부가 기존 cycleDays로 안전하게 폴백할 수 있게 한다.
 */
export async function recalculateCycleDays(
  params: RecalculateCycleParams,
): Promise<number | null> {
  if (!env.VITE_RECALCULATE_CYCLE_ENDPOINT) {
    console.warn('[cycleRecalculation] VITE_RECALCULATE_CYCLE_ENDPOINT가 설정되지 않아 재계산을 건너뜁니다.');
    return null;
  }

  try {
    const token = await auth.currentUser?.getIdToken();
    const res = await fetch(env.VITE_RECALCULATE_CYCLE_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        name: params.name,
        brand: params.brand,
        capacityValue: params.capacityValue,
        capacityUnit: params.capacityUnit,
        currentCycleDays: params.currentCycleDays,
        purchaseHistory: params.purchaseHistory.map((date) => date.toISOString()),
      }),
      signal: AbortSignal.timeout(RECALCULATE_TIMEOUT_MS),
    });

    const data: unknown = await res.json();
    if (!isRecalculateResponse(data) || data.status !== 'ok') {
      console.warn('[cycleRecalculation] 재계산 응답이 올바르지 않아 건너뜁니다.', data);
      return null;
    }

    return data.cycleDays;
  } catch (error) {
    console.warn('[cycleRecalculation] 재계산 호출에 실패해 건너뜁니다.', error);
    return null;
  }
}
