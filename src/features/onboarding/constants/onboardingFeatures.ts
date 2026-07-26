import { PackagePlus, CalendarClock, BellRing } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type IntroFeature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const INTRO_FEATURES: IntroFeature[] = [
  { icon: PackagePlus, title: '물건 등록', description: '자주 쓰는 생필품을 등록합니다.' },
  {
    icon: CalendarClock,
    title: '예상 소진일 확인',
    description: '등록한 물건의 소진 예정일을 캘린더에서 확인합니다.',
  },
  {
    icon: BellRing,
    title: '리필 일정 관리',
    description: '소진되기 전에 알림으로 미리 안내받습니다.',
  },
];
