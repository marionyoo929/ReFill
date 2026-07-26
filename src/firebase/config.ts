import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { env, isFirebaseEmulatorEnabled } from '@/config/env';

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);
export const storage = getStorage(firebaseApp);

/**
 * VITE_USE_FIREBASE_EMULATOR=true 인 경우 로컬 Firebase Emulator Suite로 연결한다.
 * 실제 Firebase 프로젝트 없이도 인증/Firestore 동작을 테스트할 수 있다.
 * HMR로 이 모듈이 재실행되어도 중복 연결되지 않도록 전역 플래그로 가드한다.
 */
declare global {
  var __refillFirebaseEmulatorConnected: boolean | undefined;
}

if (isFirebaseEmulatorEnabled && !globalThis.__refillFirebaseEmulatorConnected) {
  connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
  connectFirestoreEmulator(db, '127.0.0.1', 8080);
  globalThis.__refillFirebaseEmulatorConnected = true;
}
