import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { CAPACITY_UNIT_OPTIONS } from '@/features/inventory/constants/inventoryOptions';
import type { InventoryItem, InventoryItemInput } from '@/features/inventory/types/inventory.types';

const itemFormSchema = z.object({
  name: z.string().trim().min(1, '이름을 입력해주세요').max(50, '50자 이하로 입력해주세요'),
  brand: z.preprocess(
    (value) => {
      if (typeof value === 'string') {
        return value.trim() || undefined;
      }
      return value;
    },
    z.string().optional(),
  ),
  cycleDays: z.coerce
    .number()
    .int()
    .min(1, '1일 이상 입력해주세요')
    .max(365, '365일 이하로 입력해주세요'),
  capacityValue: z.coerce.number().positive('0보다 큰 수를 입력해주세요').optional(),
  capacityUnit: z.string().optional(),
  capacityUnitCustom: z.string().optional(),
  registeredAt: z.string().optional(),
  notificationEnabled: z.boolean().default(true),
  notificationLeadTimeDays: z.coerce
    .number()
    .int()
    .min(1, '1일 이상 입력해주세요')
    .max(365, '365일 이하로 입력해주세요')
    .optional(),
});

type ItemFormOutput = z.infer<typeof itemFormSchema>;

type ItemFormValues = {
  name: string;
  brand?: string;
  cycleDays: number;
  capacityValue?: number;
  capacityUnit?: string;
  capacityUnitCustom?: string;
  registeredAt?: string;
  notificationEnabled: boolean;
  notificationLeadTimeDays: number;
};

type ItemFormProps = {
  mode: 'create' | 'edit';
  defaultValues?: InventoryItem;
  isSubmitting: boolean;
  formId?: string;
  showSubmitButton?: boolean;
  onSubmit: (values: InventoryItemInput) => Promise<void>;
};

export function ItemForm({ mode, defaultValues, isSubmitting, formId, showSubmitButton, onSubmit }: ItemFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ItemFormValues>({
    resolver: zodResolver(itemFormSchema) as any,
    defaultValues: defaultValues
      ? {
          name: defaultValues.name,
          brand: defaultValues.brand ?? '',
          cycleDays: defaultValues.cycleDays,
          capacityValue: defaultValues.capacityValue,
          capacityUnit: defaultValues.capacityUnit
            ? CAPACITY_UNIT_OPTIONS.some((option) => option.value === defaultValues.capacityUnit)
              ? defaultValues.capacityUnit
              : 'custom'
            : '',
          capacityUnitCustom:
            defaultValues.capacityUnit && !CAPACITY_UNIT_OPTIONS.some((option) => option.value === defaultValues.capacityUnit)
              ? defaultValues.capacityUnit
              : '',
          registeredAt: defaultValues.registeredAt
            ? format(defaultValues.registeredAt, 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          notificationEnabled: defaultValues.notificationEnabled ?? true,
          notificationLeadTimeDays: defaultValues.notificationLeadTimeDays ?? 7,
        }
      : {
          registeredAt: format(new Date(), 'yyyy-MM-dd'),
          notificationEnabled: true,
          notificationLeadTimeDays: 7,
        },
  });

  const selectedCapacityUnit = watch('capacityUnit');

  const submitHandler = async (values: ItemFormOutput) => {
    const capacityUnit =
      values.capacityUnit === 'custom'
        ? values.capacityUnitCustom?.trim() || undefined
        : values.capacityUnit;
    const registeredAt = values.registeredAt ? new Date(values.registeredAt) : undefined;
    // 카메라 스캔으로 등록해도 defaultValues(사전 채움 데이터)가 있으므로,
    // 신규 등록 여부는 defaultValues가 아니라 mode로 판단해야 한다.
    const purchaseHistory =
      mode === 'edit'
        ? defaultValues?.purchaseHistory
        : registeredAt
          ? [registeredAt]
          : undefined;

    await onSubmit({
      name: values.name,
      brand: values.brand?.trim() || undefined,
      cycleDays: values.cycleDays,
      capacityValue: values.capacityValue,
      capacityUnit,
      registeredAt,
      purchaseHistory,
      notificationEnabled: values.notificationEnabled ?? true,
      notificationLeadTimeDays: values.notificationLeadTimeDays ?? 7,
    });
  }

  const getErrorMessage = (error: unknown): string | undefined =>
    typeof error === 'object' && error !== null && 'message' in error
      ? String((error as { message?: string }).message)
      : undefined;

  return (
    <form
      id={formId}
      onSubmit={handleSubmit(submitHandler)}
      className="flex flex-col gap-5"
      noValidate
    >
      {/* 사진 입력 섹션은 카메라 모달로 분리되어 통합될 예정. */}
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          이름
        </label>
        <Input id="name" placeholder="예: 헤드앤숄더 샴푸" {...register('name')} />
        {errors.name && (
          <p className="mt-1 text-sm text-danger-600">{getErrorMessage(errors.name)}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="brand"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          구매 URL (선택)
        </label>
        <Input id="brand" placeholder="예: https://example.com/product" {...register('brand')} />
        {errors.brand && (
          <p className="mt-1 text-sm text-danger-600">{getErrorMessage(errors.brand)}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="cycleDays"
          className="mb-1.5 block text-sm font-medium text-gray-700"
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
          <p className="mt-1 text-sm text-danger-600">{getErrorMessage(errors.cycleDays)}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label
            htmlFor="capacityValue"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            용량
          </label>
          <Input
            id="capacityValue"
            type="number"
            min={0}
            step={0.1}
            placeholder="예: 500"
            {...register('capacityValue')}
          />
          {errors.capacityValue && (
            <p className="mt-1 text-sm text-danger-600">{getErrorMessage(errors.capacityValue)}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="capacityUnit"
            className="mb-1.5 block text-sm font-medium text-gray-700"
          >
            단위
          </label>
          <Select id="capacityUnit" {...register('capacityUnit')}>
            <option value="">단위 선택</option>
            {CAPACITY_UNIT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.capacityUnit && (
            <p className="mt-1 text-sm text-danger-600">{getErrorMessage(errors.capacityUnit)}</p>
          )}
        </div>

        {selectedCapacityUnit === 'custom' && (
          <div>
            <label
              htmlFor="capacityUnitCustom"
              className="mb-1.5 block text-sm font-medium text-gray-700"
            >
              단위 직접 입력
            </label>
            <Input id="capacityUnitCustom" placeholder="예: 병" {...register('capacityUnitCustom')} />
          </div>
        )}
      </div>

      <div>
        <label
          htmlFor="registeredAt"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          첫 구매일
        </label>
        <Input id="registeredAt" type="date" {...register('registeredAt')} />
      </div>


      <div>
        <label
          htmlFor="notificationLeadTimeDays"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          예정일 몇일 전 알림
        </label>
        <Input
          id="notificationLeadTimeDays"
          type="number"
          min={1}
          max={365}
          placeholder="예: 7"
          {...register('notificationLeadTimeDays')}
        />
        {errors.notificationLeadTimeDays && (
          <p className="mt-1 text-sm text-danger-600">{getErrorMessage(errors.notificationLeadTimeDays)}</p>
        )}
      </div>

      {showSubmitButton !== false && (
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
        >
          {mode === 'create' ? '등록하기' : '수정 완료'}
        </button>
      )}
    </form>
  );
}
