import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { InventoryListView } from '@/features/inventory';

export default function InventoryPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">내 물건</h1>
        <Link
          to={ROUTES.ADD_ITEM}
          className="rounded-2xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
        >
          물건 등록
        </Link>
      </div>
      <InventoryListView />
    </div>
  );
}
