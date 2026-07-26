import { useParams } from 'react-router-dom';
import { ItemDetailView } from '@/features/inventory';

export default function ItemDetailPage() {
  const { itemId } = useParams<{ itemId: string }>();

  if (!itemId) {
    return null;
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-6 md:px-8">
      <h1 className="mb-6 text-xl font-bold text-gray-900">물건 상세</h1>
      <ItemDetailView itemId={itemId} />
    </div>
  );
}
