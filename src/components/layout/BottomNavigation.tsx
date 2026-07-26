import { NavLink } from 'react-router-dom';
import { NAV_ITEMS } from '@/constants/navigation';
import { cn } from '@/lib/cn';

export function BottomNavigation() {
  return (
    <nav
      aria-label="주요 메뉴"
      className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-around border-t border-gray-100 bg-white py-2 md:hidden"
    >
      {NAV_ITEMS.map(({ label, path, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) =>
            cn(
              'flex min-w-14 flex-col items-center gap-0.5 rounded-2xl px-2 py-1.5 text-xs font-medium',
              isActive ? 'text-primary-700' : 'text-gray-400',
            )
          }
        >
          <Icon className="h-5 w-5" aria-hidden="true" />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
