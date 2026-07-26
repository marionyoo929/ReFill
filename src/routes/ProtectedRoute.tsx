import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { RouteLoadingFallback } from '@/components/common/RouteLoadingFallback';
import { ROUTES } from '@/constants/routes';

type ProtectedRouteProps = {
  children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoadingFallback />;
  }

  if (!user) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }

  return <>{children}</>;
}
