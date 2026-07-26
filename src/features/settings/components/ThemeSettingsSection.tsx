import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { useTheme } from '@/providers/ThemeProvider';

export function ThemeSettingsSection() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Card className="flex items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">테마</h2>
        <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          다크 모드를 켜거나 끌 수 있어요.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label="다크 모드"
        onClick={toggleTheme}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors',
          isDark ? 'bg-primary-600' : 'bg-gray-200',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform',
            isDark ? 'translate-x-5' : 'translate-x-0',
          )}
        />
      </button>
    </Card>
  );
}
