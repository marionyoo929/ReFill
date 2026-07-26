import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/providers/AuthProvider';

const signupFormSchema = z
  .object({
    nickname: z.string().trim().min(1, '닉네임을 입력해주세요').max(20, '20자 이하로 입력해주세요'),
    email: z.string().trim().min(1, '이메일을 입력해주세요').email('올바른 이메일 형식이 아닙니다'),
    password: z.string().min(6, '비밀번호는 6자 이상이어야 합니다'),
    passwordConfirm: z.string().min(1, '비밀번호를 다시 입력해주세요'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다',
    path: ['passwordConfirm'],
  });

type SignupFormValues = z.infer<typeof signupFormSchema>;

type SignupFormProps = {
  onSuccess: () => void;
};

export function SignupForm({ onSuccess }: SignupFormProps) {
  const { signup } = useAuth();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupFormSchema) });

  async function submitHandler(values: SignupFormValues) {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await signup({ nickname: values.nickname, email: values.email, password: values.password });
      onSuccess();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : '회원가입에 실패했습니다.');
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
        <label
          htmlFor="nickname"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          닉네임
        </label>
        <Input
          id="nickname"
          placeholder="예: 리필이"
          autoComplete="nickname"
          {...register('nickname')}
        />
        {errors.nickname && (
          <p className="mt-1 text-sm text-danger-600">{errors.nickname.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
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
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          비밀번호
        </label>
        <Input
          id="password"
          type="password"
          placeholder="6자 이상 입력해주세요"
          autoComplete="new-password"
          {...register('password')}
        />
        {errors.password && (
          <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
        )}
      </div>

      <div>
        <label
          htmlFor="passwordConfirm"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          비밀번호 확인
        </label>
        <Input
          id="passwordConfirm"
          type="password"
          placeholder="비밀번호를 다시 입력해주세요"
          autoComplete="new-password"
          {...register('passwordConfirm')}
        />
        {errors.passwordConfirm && (
          <p className="mt-1 text-sm text-danger-600">{errors.passwordConfirm.message}</p>
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
        {isSubmitting ? '가입 중...' : '회원가입'}
      </button>
    </form>
  );
}
