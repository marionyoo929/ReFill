import type { LucideIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { cn } from '@/lib/cn';

type StatCardProps = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'default' | 'danger';
};

export function StatCard({ label, value, icon: Icon, tone = 'default' }: StatCardProps) {
  return (
    <Card className="flex items-center gap-3">
      <div
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl',
          tone === 'danger' ? 'bg-danger-50 text-danger-600' : 'bg-primary-50 text-primary-600',
        )}
      >
        <Icon className="h-5 w-5" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm text-gray-500 dark:text-gray-400">{label}</p>
        <p className="truncate text-lg font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </Card>
  );
}
