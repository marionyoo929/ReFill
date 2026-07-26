import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RouteLoadingFallback } from '@/components/common/RouteLoadingFallback';
import { AppLayout } from '@/components/layout/AppLayout';

const LandingPage = lazy(() => import('@/pages/LandingPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const SignupPage = lazy(() => import('@/pages/SignupPage'));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const CalendarPage = lazy(() => import('@/pages/CalendarPage'));
const ItemDetailPage = lazy(() => import('@/pages/ItemDetailPage'));
const AddItemPage = lazy(() => import('@/pages/AddItemPage'));
const NotificationPage = lazy(() => import('@/pages/NotificationPage'));
const AnalyticsPage = lazy(() => import('@/pages/AnalyticsPage'));
const SettingsPage = lazy(() => import('@/pages/SettingsPage'));
const ProfilePage = lazy(() => import('@/pages/ProfilePage'));
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));

function withSuspense(element: ReactNode) {
  return <Suspense fallback={<RouteLoadingFallback />}>{element}</Suspense>;
}

function withProtection(element: ReactNode) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

export const router = createBrowserRouter([
  // Public Routes
  { path: ROUTES.LANDING, element: withSuspense(<LandingPage />) },
  { path: ROUTES.LOGIN, element: withSuspense(<LoginPage />) },
  { path: ROUTES.SIGNUP, element: withSuspense(<SignupPage />) },

  // Protected Routes - 전체 화면 플로우 (공통 App Layout 없이 표시)
  { path: ROUTES.ONBOARDING, element: withProtection(withSuspense(<OnboardingPage />)) },

  // Protected Routes - 공통 App Layout(Sidebar/BottomNav/FAB) 적용
  {
    element: withProtection(<AppLayout />),
    children: [
      { path: ROUTES.DASHBOARD, element: withSuspense(<DashboardPage />) },
      { path: ROUTES.CALENDAR, element: withSuspense(<CalendarPage />) },
      { path: ROUTES.ITEM_DETAIL, element: withSuspense(<ItemDetailPage />) },
      { path: ROUTES.ADD_ITEM, element: withSuspense(<AddItemPage />) },
      { path: ROUTES.NOTIFICATIONS, element: withSuspense(<NotificationPage />) },
      { path: ROUTES.ANALYTICS, element: withSuspense(<AnalyticsPage />) },
      { path: ROUTES.SETTINGS, element: withSuspense(<SettingsPage />) },
      { path: ROUTES.PROFILE, element: withSuspense(<ProfilePage />) },
    ],
  },

  // Not Found
  { path: ROUTES.NOT_FOUND, element: withSuspense(<NotFoundPage />) },
]);
