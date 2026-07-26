import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  CATEGORY_OPTIONS,
  IMPORTANCE_OPTIONS,
} from '@/features/inventory/constants/inventoryOptions';
import type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';

const itemFormSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요').max(50, '50자 이하로 입력해주세요'),
  category: z.string().min(1, '카테고리를 선택해주세요'),
  brand: z.string().max(50, '50자 이하로 입력해주세요').optional(),
  cycleDays: z.coerce
    .number()
    .int()
    .min(1, '1일 이상 입력해주세요')
    .max(365, '365일 이하로 입력해주세요'),
  importance: z.enum(['essential', 'important', 'normal', 'low']),
});

type ItemFormInput = z.input<typeof itemFormSchema>;
type ItemFormOutput = z.output<typeof itemFormSchema>;

type ItemFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: InventoryItem;
  isSubmitting: boolean;
  onSubmit: (values: InventoryItemInput) => Promise<void>;
};

export function ItemForm({ mode, defaultValues, isSubmitting, onSubmit }: ItemFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ItemFormInput, unknown, ItemFormOutput>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          category: defaultValues.category,
          brand: defaultValues.brand ?? '',
          cycleDays: defaultValues.cycleDays,
          importance: defaultValues.importance,
        }
      : { importance: 'normal' },
  });

  async function submitHandler(values: ItemFormOutput) {
    await onSubmit(values);
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(submitHandler)(event)}
      className="flex flex-col gap-5"
      noValidate
    >
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          이름
        </label>
        <Input id="name" placeholder="예: 헤드앤숄더 샴푸" {...register('name')} />
        {errors.name && <p className="mt-1 text-sm text-danger-600">{errors.name.message}</p>}
      </div>

      <div>
        <label
          htmlFor="category"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          카테고리
        </label>
        <Select
          id="category"
          defaultValue={defaultValues?.category ?? ''}
          {...register('category')}
        >
          <option value="">카테고리 선택</option>
          {CATEGORY_OPTIONS.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Select>
        {errors.category && (
          <p className="mt-1 text-sm text-danger-600">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="brand"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          브랜드 (선택)
        </label>
        <Input id="brand" placeholder="예: P&G" {...register('brand')} />
        {errors.brand && <p className="mt-1 text-sm text-danger-600">{errors.brand.message}</p>}
      </div>

      <div>
        <label
          htmlFor="cycleDays"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          소비 주기 (일)
        </label>
        <Input
          id="cycleDays"
          type="number"
          min={1}
          max={365}
          placeholder="예: 30"
          {...register('cycleDays')}
        />
        {errors.cycleDays && (
          <p className="mt-1 text-sm text-danger-600">{errors.cycleDays.message}</p>
        )}
      </div>

      <fieldset>
        <legend className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200">
          중요도
        </legend>
        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {IMPORTANCE_OPTIONS.map((option) => (
            <label
              key={option.value}
              className="flex cursor-pointer items-center justify-center gap-1.5 rounded-2xl border border-gray-200 px-3 py-2 text-sm font-medium text-gray-600 has-[:checked]:border-primary-500 has-[:checked]:bg-primary-50 has-[:checked]:text-primary-700 dark:text-gray-300"
            >
              <input
                type="radio"
                value={option.value}
                className="sr-only"
                {...register('importance')}
              />
              {option.label}
            </label>
          ))}
        </div>
      </fieldset>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {mode === 'create' ? '등록하기' : '수정 완료'}
      </button>
    </form>
  );
}
