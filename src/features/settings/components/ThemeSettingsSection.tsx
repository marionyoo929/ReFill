import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';
import { THEME_OPTIONS } from '@/features/settings/constants/settingsOptions';
import type { ThemeMode } from '@/features/settings/types/settings.types';

type ThemeSettingsSectionProps = {
  theme: ThemeMode;
  onChange: (theme: ThemeMode) => void;
};

export function ThemeSettingsSection({ theme, onChange }: ThemeSettingsSectionProps) {
  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900">테마</h2>
      <div className="grid grid-cols-3 gap-2">
        {THEME_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            aria-pressed={theme === option.value}
            className={cn(
              'rounded-2xl border px-3 py-2.5 text-sm font-medium transition-colors',
              theme === option.value
                ? 'border-primary-500 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
