import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/firebase/config';
import type { AuthUser, LoginInput, SignupInput } from '@/features/auth/types/auth.types';

/**
 * Firebase Authentication + Firestore(users 컬렉션) 기반 실제 구현이다.
 * Mock 구현(authMockService.ts)은 개발/오프라인 참고용으로 유지한다.
 */
const USERS_COLLECTION = 'users';

function toAuthUser(firebaseUser: FirebaseUser, nickname: string): AuthUser {
  return { uid: firebaseUser.uid, email: firebaseUser.email ?? '', nickname };
}

async function fetchNickname(uid: string): Promise<string> {
  const snapshot = await getDoc(doc(db, USERS_COLLECTION, uid));
  return snapshot.exists() ? ((snapshot.data().nickname as string | undefined) ?? '') : '';
}

function toFriendlyAuthError(error: unknown): Error {
  const code = (error as { code?: string } | undefined)?.code;
  if (code === 'auth/email-already-in-use') {
    return new Error('이미 가입된 이메일입니다.');
  }
  if (
    code === 'auth/invalid-credential' ||
    code === 'auth/wrong-password' ||
    code === 'auth/user-not-found'
  ) {
    return new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
  }
  if (code === 'auth/weak-password') {
    return new Error('비밀번호가 너무 약합니다. 6자 이상 입력해주세요.');
  }
  if (code === 'auth/invalid-email') {
    return new Error('올바른 이메일 형식이 아닙니다.');
  }
  return new Error('요청을 처리하지 못했습니다. 잠시 후 다시 시도해주세요.');
}

export async function signup(input: SignupInput): Promise<AuthUser> {
  try {
    const credential = await createUserWithEmailAndPassword(auth, input.email, input.password);
    await setDoc(doc(db, USERS_COLLECTION, credential.user.uid), {
      uid: credential.user.uid,
      email: input.email,
      nickname: input.nickname,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return toAuthUser(credential.user, input.nickname);
  } catch (error) {
    throw toFriendlyAuthError(error);
  }
}

export async function login(input: LoginInput): Promise<AuthUser> {
  try {
    const credential = await signInWithEmailAndPassword(auth, input.email, input.password);
    const nickname = await fetchNickname(credential.user.uid);
    return toAuthUser(credential.user, nickname);
  } catch (error) {
    throw toFriendlyAuthError(error);
  }
}

export async function logout(): Promise<void> {
  await signOut(auth);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      unsubscribe();
      if (!firebaseUser) {
        resolve(null);
        return;
      }
      fetchNickname(firebaseUser.uid)
        .then((nickname) => resolve(toAuthUser(firebaseUser, nickname)))
        .catch(() => resolve(toAuthUser(firebaseUser, '')));
    });
  });
}

export async function updateNickname(uid: string, nickname: string): Promise<AuthUser> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser || firebaseUser.uid !== uid) {
    throw new Error('로그인이 필요합니다.');
  }
  try {
    await setDoc(
      doc(db, USERS_COLLECTION, uid),
      { nickname, updatedAt: serverTimestamp() },
      { merge: true },
    );
    return toAuthUser(firebaseUser, nickname);
  } catch {
    throw new Error('이름을 변경하지 못했습니다. 잠시 후 다시 시도해주세요.');
  }
}
