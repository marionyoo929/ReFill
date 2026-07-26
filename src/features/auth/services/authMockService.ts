import type { AuthUser, LoginInput, SignupInput } from '@/features/auth/types/auth.types';

/**
 * 실제 Firebase Authentication 연동 전까지 사용하는 Mock 계층이다.
 * 향후 이 파일 내부만 Firebase Auth 호출로 교체하면 되고,
 * AuthProvider/useAuth 인터페이스는 그대로 유지한다.
 */
const USERS_STORAGE_KEY = 'refill_mock_users';
const SESSION_STORAGE_KEY = 'refill_mock_session';
const MOCK_DELAY_MS = 300;

type StoredUser = {
  uid: string;
  email: string;
  password: string;
  nickname: string;
};

function delay(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));
}

function readUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

function toAuthUser(user: StoredUser): AuthUser {
  return { uid: user.uid, email: user.email, nickname: user.nickname };
}

export async function signup(input: SignupInput): Promise<AuthUser> {
  await delay();
  const users = readUsers();
  if (users.some((user) => user.email === input.email)) {
    throw new Error('이미 가입된 이메일입니다.');
  }

  const newUser: StoredUser = {
    uid: crypto.randomUUID(),
    email: input.email,
    password: input.password,
    nickname: input.nickname,
  };
  writeUsers([...users, newUser]);
  localStorage.setItem(SESSION_STORAGE_KEY, newUser.uid);
  return toAuthUser(newUser);
}

export async function login(input: LoginInput): Promise<AuthUser> {
  await delay();
  const users = readUsers();
  const found = users.find(
    (user) => user.email === input.email && user.password === input.password,
  );
  if (!found) {
    throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
  }

  localStorage.setItem(SESSION_STORAGE_KEY, found.uid);
  return toAuthUser(found);
}

export async function updateNickname(uid: string, nickname: string): Promise<AuthUser> {
  await delay();
  const users = readUsers();
  const index = users.findIndex((user) => user.uid === uid);
  if (index === -1) {
    throw new Error('사용자를 찾을 수 없습니다.');
  }

  const updated: StoredUser = { ...users[index], nickname };
  const nextUsers = [...users];
  nextUsers[index] = updated;
  writeUsers(nextUsers);
  return toAuthUser(updated);
}

export async function logout(): Promise<void> {
  await delay();
  localStorage.removeItem(SESSION_STORAGE_KEY);
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  await delay();
  const uid = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!uid) {
    return null;
  }

  const found = readUsers().find((user) => user.uid === uid);
  return found ? toAuthUser(found) : null;
}
