import { z } from 'zod';

const envSchema = z.object({
  VITE_FIREBASE_API_KEY: z.string().min(1),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().min(1),
  VITE_FIREBASE_PROJECT_ID: z.string().min(1),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().min(1),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().min(1),
  VITE_FIREBASE_APP_ID: z.string().min(1),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  VITE_FIREBASE_VAPID_KEY: z.string().optional(),
  VITE_USE_FIREBASE_EMULATOR: z.string().optional(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const missingKeys = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(
    `다음 환경 변수가 누락되었거나 올바르지 않습니다: ${missingKeys}\n.env.example을 참고하여 .env.local을 구성해주세요.`,
  );
}

export const env = parsed.data;

export const isFirebaseEmulatorEnabled = env.VITE_USE_FIREBASE_EMULATOR === 'true';
