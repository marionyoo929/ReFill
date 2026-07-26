import { Navigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { RouteLoadingFallback } from '@/components/common/RouteLoadingFallback';
import { ROUTES } from '@/constants/routes';

export default function LandingPage() {
  const { user, isInitializing } = useAuth();

  if (isInitializing) {
    return <RouteLoadingFallback />;
  }

  return <Navigate to={user ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />;
}
