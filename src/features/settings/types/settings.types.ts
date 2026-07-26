export type ThemeMode = 'system' | 'light' | 'dark';

export type UserSettings = {
  notificationEnabled: boolean;
  leadTimeDays: number;
  theme: ThemeMode;
};
