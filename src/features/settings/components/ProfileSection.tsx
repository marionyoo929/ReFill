import { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';

export function ProfileSection() {
  const { user, updateNickname } = useAuth();
  const { showToast } = useToast();
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return null;
  }

  const trimmedNickname = nickname.trim();
  const isUnchanged = trimmedNickname === user.nickname;

  async function handleSave() {
    if (!trimmedNickname || isUnchanged) {
      return;
    }
    setIsSaving(true);
    try {
      await updateNickname(trimmedNickname);
      showToast('이름이 변경되었습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Card className="flex flex-col gap-4">
      <h2 className="text-lg font-bold text-gray-900">기본 정보</h2>

      <div>
        <label htmlFor="settings-email" className="mb-1.5 block text-sm font-medium text-gray-700">
          이메일
        </label>
        <Input id="settings-email" value={user.email} disabled readOnly />
      </div>

      <div>
        <label
          htmlFor="settings-nickname"
          className="mb-1.5 block text-sm font-medium text-gray-700"
        >
          이름
        </label>
        <div className="flex gap-2">
          <Input
            id="settings-nickname"
            value={nickname}
            onChange={(event) => setNickname(event.target.value)}
          />
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={isSaving || isUnchanged || trimmedNickname.length === 0}
            className="shrink-0 rounded-2xl bg-primary-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSaving ? '저장 중...' : '저장'}
          </button>
        </div>
      </div>
    </Card>
  );
}
