import { LayoutDashboard, Package, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: '대시보드', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: '물건', path: ROUTES.INVENTORY, icon: Package },
  { label: '설정', path: ROUTES.SETTINGS, icon: Settings },
];
