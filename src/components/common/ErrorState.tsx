import { AlertCircle } from 'lucide-react';

type ErrorStateProps = {
  message?: string;
};

const DEFAULT_ERROR_MESSAGE = '문제가 발생했습니다. 잠시 후 다시 시도해주세요.';

export function ErrorState({ message = DEFAULT_ERROR_MESSAGE }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-white px-6 py-16 text-center">
      <AlertCircle className="h-10 w-10 text-danger-500" aria-hidden="true" />
      <p className="text-base text-gray-500">{message}</p>
    </div>
  );
}
