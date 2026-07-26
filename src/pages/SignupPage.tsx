import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { SignupForm } from '@/features/auth';

export default function SignupPage() {
  const navigate = useNavigate();

  function handleSuccess() {
    void navigate(ROUTES.ONBOARDING, { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Re:Fill 회원가입</h1>
        <p className="mt-1 text-sm text-gray-500">2분이면 시작할 수 있어요.</p>
      </div>
      <SignupForm onSuccess={handleSuccess} />
      <p className="text-center text-sm text-gray-500">
        이미 계정이 있으신가요?{' '}
        <Link to={ROUTES.LOGIN} className="font-medium text-primary-600 hover:text-primary-700">
          로그인
        </Link>
      </p>
    </div>
  );
}
