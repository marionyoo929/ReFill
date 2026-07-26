import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants/routes';
import { LoginForm } from '@/features/auth';

export default function LoginPage() {
  const navigate = useNavigate();

  function handleSuccess() {
    void navigate(ROUTES.DASHBOARD, { replace: true });
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Re:Fill 로그인</h1>
        <p className="mt-1 text-sm text-gray-500">등록한 생필품의 소진일을 확인해보세요.</p>
      </div>
      <LoginForm onSuccess={handleSuccess} />
      <p className="text-center text-sm text-gray-500">
        아직 계정이 없으신가요?{' '}
        <Link to={ROUTES.SIGNUP} className="font-medium text-primary-600 hover:text-primary-700">
          회원가입
        </Link>
      </p>
    </div>
  );
}
