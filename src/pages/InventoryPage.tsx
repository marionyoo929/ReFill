import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { InventoryListView } from '@/features/inventory';
import { useAnalyzeItemImage } from '@/features/inventory/hooks/useAnalyzeItemImage';
import CameraCapture from '@/components/common/CameraCapture';

export default function InventoryPage() {
  const navigate = useNavigate();
  const { analyzeImage, isAnalyzing } = useAnalyzeItemImage();
  const [cameraOpen, setCameraOpen] = useState(false);

  async function handleCapture(blob: Blob) {
    const item = await analyzeImage(blob);
    if (item) {
      setCameraOpen(false);
      void navigate(ROUTES.ADD_ITEM, { state: { prefill: item } });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 md:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="min-w-0 break-words text-xl font-bold text-gray-900">
          내 물건
        </h1>
        <div className="flex shrink-0 flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setCameraOpen(true)}
            disabled={isAnalyzing}
            className="whitespace-nowrap rounded-2xl border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {isAnalyzing ? '분석 중...' : '카메라로 등록'}
          </button>
          <Link
            to={ROUTES.ADD_ITEM}
            className="whitespace-nowrap rounded-2xl bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
          >
            직접 등록
          </Link>
        </div>
      </div>
      <InventoryListView />

      {cameraOpen && (
        <CameraCapture
          open={cameraOpen}
          onClose={() => setCameraOpen(false)}
          onCapture={(blob) => {
            void handleCapture(blob);
          }}
        />
      )}
    </div>
  );
}
