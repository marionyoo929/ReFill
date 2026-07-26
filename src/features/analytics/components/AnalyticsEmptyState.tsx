import { BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function AnalyticsEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl bg-white px-6 py-20 text-center">
      <BarChart3 className="h-12 w-12 text-gray-300" aria-hidden="true" />
      <div className="space-y-1">
        <p className="text-lg font-bold text-gray-900">아직 분석할 데이터가 없습니다.</p>
        <p className="text-sm text-gray-500">물건을 등록하면 소비 패턴 통계를 확인할 수 있어요.</p>
      </div>
      <Link
        to={ROUTES.ADD_ITEM}
        className="rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
      >
        첫 물건 등록하기
      </Link>
    </div>
  );
}
