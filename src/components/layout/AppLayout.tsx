import { Outlet, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { FloatingAddButton } from '@/components/layout/FloatingAddButton';
import { useAuth } from '@/providers/AuthProvider';
import { useNotifications } from '@/features/notification';
import { ROUTES } from '@/constants/routes';

export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  async function handleLogout() {
    await logout();
    void navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-64 dark:bg-gray-950">
      <Sidebar unreadNotificationCount={unreadCount} />
      <button
        type="button"
        onClick={() => void handleLogout()}
        aria-label="로그아웃"
        className="fixed top-4 right-4 z-30 flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-gray-500 shadow-sm hover:bg-gray-50 md:top-6 md:right-6 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800"
      >
        <LogOut className="h-5 w-5" aria-hidden="true" />
      </button>
      <main className="pb-24 md:pb-8">
        <Outlet />
      </main>
      <BottomNavigation unreadNotificationCount={unreadCount} />
      <FloatingAddButton />
    </div>
  );
}
