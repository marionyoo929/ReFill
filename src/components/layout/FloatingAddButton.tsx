import { Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';

export function FloatingAddButton() {
  return (
    <Link
      to={ROUTES.ADD_ITEM}
      aria-label="새 물건 등록하기"
      className="fixed right-4 bottom-20 z-30 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-600 text-white shadow-md transition-colors hover:bg-primary-700 md:right-6 md:bottom-6"
    >
      <Plus className="h-6 w-6" aria-hidden="true" />
    </Link>
  );
}
