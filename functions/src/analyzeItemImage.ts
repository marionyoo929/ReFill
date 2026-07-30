import { onRequest, Request } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Busboy from 'busboy';
import OpenAI from 'openai';
import type { Response } from 'express';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const SYSTEM_PROMPT = `You are a product identification assistant for a household inventory/repurchase tracker app.

You will receive a photo of a household product. Identify it and estimate how it should be tracked.

Return ONLY a JSON object with this exact shape, no explanation, no markdown:
{
  "name": "<short Korean product name, include brand if visible, e.g. '농심 신라면'>",
  "capacity_value": <number, the package size/quantity printed on the product (e.g. 500 for "500mL", 5 for "5입"). If not legible, give your best estimate for a typical package of this product>,
  "unit": "<unit for capacity_value, e.g. mL, L, g, kg, 개, 통, 병>",
  "repurchase_period_days": <integer, realistic number of days until an average household finishes/repurchases this specific product, based on its type and package size>
}

If the image does not contain an identifiable product, return ONLY:
{"error": "unknown"}`;

type LlmAnalyzedItem = {
  name: string;
  capacity_value?: number;
  repurchase_period_days: number;
  unit: string;
};

type AnalyzedItem = LlmAnalyzedItem & { purchase_url: string };

function buildCoupangSearchUrl(name: string, capacityValue: number | undefined, unit: string): string {
  const query = capacityValue ? `${name} ${capacityValue}${unit}` : `${name} ${unit}`;
  return `https://www.coupang.com/np/search?component=&q=${encodeURIComponent(query)}`;
}

function isAnalyzedItem(value: unknown): value is LlmAnalyzedItem {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.name === 'string' &&
    (v.capacity_value === undefined || typeof v.capacity_value === 'number') &&
    typeof v.repurchase_period_days === 'number' &&
    typeof v.unit === 'string'
  );
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

async function readUploadedImage(req: Request): Promise<{ buffer: Buffer; mimeType: string } | null> {
  const bb = Busboy({ headers: req.headers, limits: { fileSize: MAX_IMAGE_BYTES } });
  let fileBuffer: Buffer | null = null;
  let fileMime = '';
  let truncated = false;

  await new Promise<void>((resolve, reject) => {
    bb.on('file', (_name, stream, info) => {
      const chunks: Buffer[] = [];
      fileMime = info.mimeType;
      stream.on('data', (data: Buffer) => chunks.push(data));
      stream.on('limit', () => {
        truncated = true;
      });
      stream.on('end', () => {
        fileBuffer = Buffer.concat(chunks);
      });
    });

    bb.on('close', () => resolve());
    bb.on('error', (err) => reject(err));
    req.pipe(bb);
  });

  if (!fileBuffer || truncated || !ALLOWED_MIME_TYPES.has(fileMime)) {
    return null;
  }

  return { buffer: fileBuffer, mimeType: fileMime };
}

export const analyzeItemImage = onRequest(
  { secrets: ['OPENAI_API_KEY'], timeoutSeconds: 30 },
  async (req: Request, res: Response) => {
    if (req.method !== 'POST') {
      res.status(405).send({ status: 'error', message: 'Method not allowed' });
      return;
    }

    try {
      const authHeader = req.get('Authorization') || '';
      const match = authHeader.match(/^Bearer\s+(.*)$/i);
      if (!match) {
        res.status(401).send({ status: 'error', message: 'Authorization header missing' });
        return;
      }
      await admin.auth().verifyIdToken(match[1]);

      const image = await readUploadedImage(req);
      if (!image) {
        res.status(400).send({ status: 'error', message: '이미지 파일을 확인해주세요 (jpeg/png/webp, 10MB 이하)' });
        return;
      }

      const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        max_tokens: 256,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'text', text: '이 제품을 식별해줘.' },
              {
                type: 'image_url',
                image_url: { url: `data:${image.mimeType};base64,${image.buffer.toString('base64')}` },
              },
            ],
          },
        ],
      });

      const text = completion.choices[0]?.message?.content ?? '';
      const parsed = extractJson(text);

      if (!parsed || !isAnalyzedItem(parsed)) {
        res.status(422).send({ status: 'error', message: '이미지에서 제품을 인식하지 못했어요' });
        return;
      }

      const item: AnalyzedItem = {
        name: parsed.name,
        capacity_value: parsed.capacity_value,
        repurchase_period_days: parsed.repurchase_period_days,
        unit: parsed.unit,
        purchase_url: buildCoupangSearchUrl(parsed.name, parsed.capacity_value, parsed.unit),
      };

      res.status(200).send({ status: 'ok', item });
    } catch (error) {
      console.error('analyzeItemImage error:', error);
      res.status(500).send({ status: 'error', message: '이미지 분석 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.' });
    }
  },
);
