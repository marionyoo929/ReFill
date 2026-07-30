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
  VITE_ANALYZE_ENDPOINT: z.string().optional(),
  VITE_RECALCULATE_CYCLE_ENDPOINT: z.string().optional(),
  // 미설정 시 같은 도메인의 /api/kakao-send 를 쓴다. 로컬 vite dev 처럼
  // 서버리스 함수가 함께 뜨지 않는 환경에서만 배포된 주소로 덮어쓴다.
  VITE_KAKAO_SEND_ENDPOINT: z.string().optional(),
});

const parsed = envSchema.safeParse(import.meta.env);

if (!parsed.success) {
  const missingKeys = parsed.error.issues.map((issue) => issue.path.join('.')).join(', ');
  throw new Error(
    `다음 환경 변수가 누락되었거나 올바르지 않습니다: ${missingKeys}\n` +
      `.env.example을 참고하여 로컬은 .env.local, 배포 환경(Vercel)은 프로젝트 환경 변수 설정을 확인해주세요.`,
  );
}

export const env = parsed.data;

export const isFirebaseEmulatorEnabled =
  import.meta.env.DEV && env.VITE_USE_FIREBASE_EMULATOR === 'true';
