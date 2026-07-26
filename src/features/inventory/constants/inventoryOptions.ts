import type { ImportanceLevel } from '@/features/inventory/types/inventory.types';

export const CATEGORY_OPTIONS: string[] = ['위생용품', '생활용품', '식품', '문구류', '기타'];

export const IMPORTANCE_OPTIONS: { value: ImportanceLevel; label: string }[] = [
  { value: 'essential', label: '필수' },
  { value: 'important', label: '중요' },
  { value: 'normal', label: '일반' },
  { value: 'low', label: '낮음' },
];

export const IMPORTANCE_LABEL: Record<ImportanceLevel, string> = {
  essential: '필수',
  important: '중요',
  normal: '일반',
  low: '낮음',
};
