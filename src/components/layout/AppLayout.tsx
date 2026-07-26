import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/layout/Sidebar';
import { BottomNavigation } from '@/components/layout/BottomNavigation';
import { FloatingAddButton } from '@/components/layout/FloatingAddButton';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-gray-50 md:pl-64">
      <Sidebar />
      <main className="pb-24 md:pb-8">
        <Outlet />
      </main>
      <BottomNavigation />
      <FloatingAddButton />
    </div>
  );
}
