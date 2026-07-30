import OpenAI from 'openai';
import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const MIN_CYCLE_DAYS = 1;
const MAX_CYCLE_DAYS = 365;
const MS_PER_DAY = 1000 * 60 * 60 * 24;

// firebase-admin은 jwks-rsa -> jose(ESM 전용) 조합이 Vercel의 CJS 런타임에서
// require()에 실패해 함수가 죽는다. Firebase ID 토큰은 Google의 공개 JWKS로
// 직접 검증해 firebase-admin 의존성 자체를 없앤다. (api/analyze.ts와 동일한 이유로 복제)
const FIREBASE_JWKS = createRemoteJWKSet(
  new URL('https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'),
);

async function verifyFirebaseIdToken(idToken: string): Promise<void> {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) {
    throw new Error('FIREBASE_PROJECT_ID가 설정되지 않았습니다.');
  }
  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
  });
  if (!payload.sub) {
    throw new Error('유효하지 않은 토큰입니다.');
  }
}

const SYSTEM_PROMPT = `You are a consumption-cycle estimation assistant for a household repurchase tracker app.

You will receive a product's current assumed repurchase cycle (in days) and the actual intervals (in days) between the user's real purchases of that exact product, ordered oldest to newest.

Estimate a new repurchase cycle in days that better reflects the user's real behavior. Prioritize the real observed intervals over the old assumed cycle, even when there are very few data points (one or two intervals) - for this app, being responsive to actual behavior matters more than being statistically conservative.

Return ONLY a JSON object with this exact shape, no explanation, no markdown:
{"cycle_days": <integer between 1 and 365>}`;

type RequestBody = {
  name: string;
  brand?: string;
  capacityValue?: number;
  capacityUnit?: string;
  currentCycleDays: number;
  purchaseHistory: string[];
};

function isRequestBody(value: unknown): value is RequestBody {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    (v.brand === undefined || typeof v.brand === 'string') &&
    (v.capacityValue === undefined || typeof v.capacityValue === 'number') &&
    (v.capacityUnit === undefined || typeof v.capacityUnit === 'string') &&
    typeof v.currentCycleDays === 'number' &&
    Array.isArray(v.purchaseHistory) &&
    v.purchaseHistory.every((item) => typeof item === 'string')
  );
}

function clampCycleDays(value: number): number {
  return Math.min(MAX_CYCLE_DAYS, Math.max(MIN_CYCLE_DAYS, Math.round(value)));
}

function computeIntervalDays(sortedDates: Date[]): number[] {
  const intervals: number[] = [];
  for (let i = 1; i < sortedDates.length; i += 1) {
    intervals.push(Math.round((sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / MS_PER_DAY));
  }
  return intervals;
}

function extractJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) return null;
  try {
    return JSON.parse(match[0]);
  } catch {
    return null;
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ status: 'error', message: 'Method not allowed' });
    return;
  }

  try {
    const authHeader = req.headers.authorization ?? '';
    const match = /^Bearer\s+(.*)$/i.exec(authHeader);
    if (!match) {
      res.status(401).json({ status: 'error', message: 'Authorization header missing' });
      return;
    }
    await verifyFirebaseIdToken(match[1]);

    const body: unknown = req.body;
    if (!isRequestBody(body)) {
      res.status(400).json({ status: 'error', message: '요청 형식이 올바르지 않습니다.' });
      return;
    }

    const currentCycleDays = clampCycleDays(body.currentCycleDays);
    const sortedDates = body.purchaseHistory
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => a.getTime() - b.getTime());

    if (sortedDates.length < 2) {
      res.status(200).json({ status: 'ok', cycleDays: currentCycleDays });
      return;
    }

    const intervals = computeIntervalDays(sortedDates);

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      max_tokens: 64,
      response_format: { type: 'json_object' },
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: JSON.stringify({
            productName: body.name,
            brand: body.brand,
            capacityValue: body.capacityValue,
            capacityUnit: body.capacityUnit,
            currentCycleDays,
            recentPurchaseIntervalDays: intervals,
          }),
        },
      ],
    });

    const text = completion.choices[0]?.message?.content ?? '';
    const parsed = extractJson(text) as { cycle_days?: unknown } | null;
    const cycleDays =
      parsed && typeof parsed.cycle_days === 'number'
        ? clampCycleDays(parsed.cycle_days)
        : currentCycleDays;

    res.status(200).json({ status: 'ok', cycleDays });
  } catch (error) {
    console.error('recalculate-cycle error:', error);
    res.status(500).json({ status: 'error', message: '소진 주기 재계산 중 오류가 발생했어요.' });
  }
}
