import { useState } from 'react';
import { auth } from '@/firebase/config';
import { env } from '@/config/env';
import { useToast } from '@/providers/ToastProvider';

type AnalyzeResponse =
  | { status: 'ok'; item: Record<string, unknown> }
  | { status: 'error'; message?: string };

function isAnalyzeResponse(value: unknown): value is AnalyzeResponse {
  return typeof value === 'object' && value !== null && 'status' in value;
}

export function useAnalyzeItemImage() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { showToast } = useToast();

  async function analyzeImage(blob: Blob): Promise<Record<string, unknown> | null> {
    if (!env.VITE_ANALYZE_ENDPOINT) {
      showToast('카메라 분석 기능이 설정되지 않았어요.');
      return null;
    }

    setIsAnalyzing(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      const form = new FormData();
      form.append('file', blob, 'capture.jpg');
      const res = await fetch(env.VITE_ANALYZE_ENDPOINT, {
        method: 'POST',
        body: form,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      const data: unknown = await res.json();
      if (isAnalyzeResponse(data) && data.status === 'ok') {
        return data.item;
      }
      showToast('이미지를 분석하지 못했어요. 다시 시도해주세요.');
      return null;
    } catch (error) {
      console.error('analyzeImage error:', error);
      showToast('이미지 분석 중 오류가 발생했어요.');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }

  return { analyzeImage, isAnalyzing };
}
