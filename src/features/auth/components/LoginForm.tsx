import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';

const loginFormSchema = z.object({
  email: z.string().trim().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
  password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

type LoginFormProps = {
  onSuccess: () => void;
};

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginFormSchema) });

  async function submitHandler(values: LoginFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await login(values);
      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '로그인에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(submitHandler)(event)}
      className="flex flex-col gap-5"
      noValidate
    >
      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-gray-700">
          이메일
        </label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          {...register('email')}
        />
        {errors.email && <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>}
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-gray-700">
          비밀번호
        </label>
        <Input
          id="password"
          type="password"
          placeholder="6자 이상 입력해주세요"
          autoComplete="current-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
        )}
      </div>

      {submitError && (
        <p role="alert" className="rounded-2xl bg-danger-50 px-4 py-2.5 text-sm text-danger-600">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-2xl bg-primary-600 px-5 py-3 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
      >
        {isSubmitting ? '로그인 중...' : '로그인'}
      </button>
    </form>
  );
}
