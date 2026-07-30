import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Card } from '@/components/ui/Card';
import { ROUTES } from '@/constants/routes';
import type { InventoryItem } from '@/features/inventory/types/inventory.types';

type ItemCardProps = {
  item: InventoryItem;
};

export function ItemCard({ item }: ItemCardProps) {
  return (
    <Link to={ROUTES.ITEM_DETAIL.replace(':itemId', item.id)} aria-label={`${item.name} 상세보기`}>
      <Card className="flex items-center justify-between gap-3 transition-colors hover:border-primary-200">
        <div className="min-w-0">
          <p className="truncate font-semibold text-gray-900">{item.name}</p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span className="text-sm text-gray-500">
            {format(item.expectedEndDate, 'M월 d일')} 소진 예정
          </span>
        </div>
      </Card>
    </Link>
  );
}
