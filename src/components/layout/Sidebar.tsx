import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { NAV_ITEMS } from '@/constants/navigation';
import { ROUTES } from '@/constants/routes';
import { NavBadge } from '@/components/layout/NavBadge';
import { useNotifications } from '@/features/notification';
import { cn } from '@/lib/cn';

type SidebarProps = {
  onLogout: () => void;
};

export function Sidebar({ onLogout }: SidebarProps) {
  const { unreadCount } = useNotifications();

  return (
    <aside className="hidden md:fixed md:inset-y-0 md:left-0 md:flex md:w-[17.85rem] md:flex-col md:border-r md:border-gray-100 md:bg-white md:px-4 md:py-6">
      <span className="px-3 text-xl font-bold text-primary-600">Re:Fill</span>
      <nav aria-label="주요 메뉴" className="mt-8 flex flex-col gap-1">
        {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-50 text-primary-700'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900',
              )
            }
          >
            <span className="relative flex">
              <Icon className="h-5 w-5" aria-hidden="true" />
              {path === ROUTES.NOTIFICATIONS && <NavBadge count={unreadCount} />}
            </span>
            {label}
          </NavLink>
        ))}
      </nav>
      <button
        type="button"
        onClick={onLogout}
        className="mt-auto flex items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
      >
        <span className="relative flex">
          <LogOut className="h-5 w-5" aria-hidden="true" />
        </span>
        로그아웃
      </button>
    </aside>
  );
}
