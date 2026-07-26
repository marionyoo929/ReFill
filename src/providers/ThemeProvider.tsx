import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

export type ThemeMode = 'light' | 'dark';

type ThemeContextValue = {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
};

// index.html의 FOUC 방지 인라인 스크립트와 반드시 동일한 키를 사용해야 한다.
const THEME_STORAGE_KEY = 'refill_theme';

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getStoredTheme(): ThemeMode | null {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    return raw === 'light' || raw === 'dark' ? raw : null;
  } catch {
    return null;
  }
}

function getSystemTheme(): ThemeMode {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return 'light';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

// 1. localStorage에 저장된 사용자 선택 -> 2. 시스템 설정 -> 3. light 순으로 결정한다.
function resolveInitialTheme(): ThemeMode {
  return getStoredTheme() ?? getSystemTheme();
}

function applyThemeClass(theme: ThemeMode): void {
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(resolveInitialTheme);
  const hasExplicitPreference = useRef(getStoredTheme() !== null);

  // 상태가 바뀔 때마다 DOM의 dark 클래스를 동기적으로 정확히 반영한다(깜빡임 방지).
  useLayoutEffect(() => {
    applyThemeClass(theme);
  }, [theme]);

  // 사용자가 명시적으로 테마를 선택한 적이 없다면, 시스템 설정 변경을 계속 따라간다.
  useLayoutEffect(() => {
    if (hasExplicitPreference.current || typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    function handleChange(event: MediaQueryListEvent) {
      setThemeState(event.matches ? 'dark' : 'light');
    }
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  const setTheme = useCallback((next: ThemeMode) => {
    hasExplicitPreference.current = true;
    setThemeState(next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // localStorage 저장 실패는 무시하고 현재 세션의 테마 적용은 계속 유지한다.
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme은 ThemeProvider 내부에서만 사용할 수 있습니다.');
  }
  return context;
}
