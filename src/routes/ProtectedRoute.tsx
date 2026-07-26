import type { ReactNode } from 'react';

type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * Authentication Feature 구현 전까지 임시로 통과시키는 Placeholder다.
 * Auth Feature 구현 시 useAuthStatus() 훅으로 로그인 여부를 확인하고
 * 미인증 사용자를 ROUTES.LOGIN으로 리다이렉트하도록 교체한다.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  return <>{children}</>;
}
