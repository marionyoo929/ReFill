import { LayoutDashboard, Calendar, Bell, BarChart3, Settings } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export type NavItem = {
  label: string;
  path: string;
  icon: LucideIcon;
};

export const NAV_ITEMS: NavItem[] = [
  { label: '대시보드', path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: '캘린더', path: ROUTES.CALENDAR, icon: Calendar },
  { label: '알림', path: ROUTES.NOTIFICATIONS, icon: Bell },
  { label: '분석', path: ROUTES.ANALYTICS, icon: BarChart3 },
  { label: '설정', path: ROUTES.SETTINGS, icon: Settings },
];
