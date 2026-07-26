import { AnalyticsView } from '@/features/analytics';

export default function AnalyticsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">분석</h1>
      <AnalyticsView />
    </div>
  );
}
