import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  getCurrentUser,
  login as loginRequest,
  signup as signupRequest,
  logout as logoutRequest,
  updateNickname as updateNicknameRequest,
} from '@/features/auth';
import type { AuthUser, LoginInput, SignupInput } from '@/features/auth';

type AuthContextValue = {
  user: AuthUser | null;
  isInitializing: boolean;
  login: (input: LoginInput) => Promise<void>;
  signup: (input: SignupInput) => Promise<void>;
  logout: () => Promise<void>;
  updateNickname: (nickname: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void getCurrentUser()
      .then((currentUser) => {
        if (isMounted) {
          setUser(currentUser);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsInitializing(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  async function login(input: LoginInput) {
    const loggedInUser = await loginRequest(input);
    setUser(loggedInUser);
  }

  async function signup(input: SignupInput) {
    const newUser = await signupRequest(input);
    setUser(newUser);
  }

  async function logout() {
    await logoutRequest();
    setUser(null);
  }

  async function updateNickname(nickname: string) {
    if (!user) {
      return;
    }
    const updatedUser = await updateNicknameRequest(user.uid, nickname);
    setUser(updatedUser);
  }

  return (
    <AuthContext.Provider value={{ user, isInitializing, login, signup, logout, updateNickname }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}
