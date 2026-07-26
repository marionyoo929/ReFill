import { useEffect } from 'react';
import type { ThemeMode } from '@/features/settings/types/settings.types';

function applyDarkClass(isDark: boolean): void {
  document.documentElement.classList.toggle('dark', isDark);
}

export function useApplyTheme(theme: ThemeMode): void {
  useEffect(() => {
    if (theme === 'light') {
      applyDarkClass(false);
      return;
    }
    if (theme === 'dark') {
      applyDarkClass(true);
      return;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    applyDarkClass(mediaQuery.matches);

    function handleChange(event: MediaQueryListEvent) {
      applyDarkClass(event.matches);
    }

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme]);
}
