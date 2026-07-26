import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/providers/AuthProvider';
import { ROUTES } from '@/constants/routes';

export function LogoutSection() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    void navigate(ROUTES.LOGIN, { replace: true });
  }

  return (
    <Card>
      <button
        type="button"
        onClick={() => void handleLogout()}
        className="w-full rounded-2xl border border-danger-100 bg-danger-50 px-4 py-3 text-sm font-medium text-danger-600 hover:bg-danger-100"
      >
        로그아웃
      </button>
    </Card>
  );
}
