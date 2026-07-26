import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { ProtectedRoute } from '@/routes/ProtectedRoute';
import { RouteLoadingFallback } from '@/components/common/RouteLoadingFallback';

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
  return withSuspense(<ProtectedRoute>{element}</ProtectedRoute>);
}

export const router = createBrowserRouter([
  // Public Routes
  { path: ROUTES.LANDING, element: withSuspense(<LandingPage />) },
  { path: ROUTES.LOGIN, element: withSuspense(<LoginPage />) },
  { path: ROUTES.SIGNUP, element: withSuspense(<SignupPage />) },

  // Protected Routes
  { path: ROUTES.ONBOARDING, element: withProtection(<OnboardingPage />) },
  { path: ROUTES.DASHBOARD, element: withProtection(<DashboardPage />) },
  { path: ROUTES.CALENDAR, element: withProtection(<CalendarPage />) },
  { path: ROUTES.ITEM_DETAIL, element: withProtection(<ItemDetailPage />) },
  { path: ROUTES.ADD_ITEM, element: withProtection(<AddItemPage />) },
  { path: ROUTES.NOTIFICATIONS, element: withProtection(<NotificationPage />) },
  { path: ROUTES.ANALYTICS, element: withProtection(<AnalyticsPage />) },
  { path: ROUTES.SETTINGS, element: withProtection(<SettingsPage />) },
  { path: ROUTES.PROFILE, element: withProtection(<ProfilePage />) },

  // Not Found
  { path: ROUTES.NOT_FOUND, element: withSuspense(<NotFoundPage />) },
]);
