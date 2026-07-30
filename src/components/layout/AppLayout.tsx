import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/constants/routes';

export function AppLayout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    void navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50 md:pl-[17.85rem]">
      <Sidebar onLogout={() => void handleLogout()} />
      <main className="pb-24 md:pb-8">
        <Outlet />
      </main>
      <BottomNavigation onLogout={() => void handleLogout()} />
    </div>
  );
}
