import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/providers/ToastProvider';
import { DEFAULT_SETTINGS, useUpdateSettings } from '@/features/settings';
import type { UserSettings } from '@/features/settings';
import { ROUTES } from '@/constants/routes';
import { OnboardingProgress } from '@/features/onboarding/components/OnboardingProgress';
import { IntroStep } from '@/features/onboarding/components/IntroStep';
import { NicknameStep } from '@/features/onboarding/components/NicknameStep';
import { NotificationStep } from '@/features/onboarding/components/NotificationStep';
import {
  isOnboardingCompleted,
  markOnboardingCompleted,
} from '@/features/onboarding/services/onboardingMockService';

const TOTAL_STEPS = 3;

export function OnboardingView() {
  const { user, updateNickname } = useAuth();
  const { mutateAsync: saveSettings } = useUpdateSettings();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [notificationDraft, setNotificationDraft] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (user && isOnboardingCompleted(user.uid)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  function goNext() {
    setStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  }

  function goPrevious() {
    setStep((prev) => Math.max(prev - 1, 1));
  }

  async function handleComplete() {
    if (!user) {
      return;
    }
    setIsSubmitting(true);
    try {
      const trimmed = nickname.trim();
      if (trimmed && trimmed !== user.nickname) {
        await updateNickname(trimmed);
      }
      await saveSettings(notificationDraft);
      markOnboardingCompleted(user.uid);
      showToast('설정이 완료되었습니다.');
      void navigate(ROUTES.DASHBOARD, { replace: true });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-screen max-w-sm flex-col justify-center gap-6 px-4 py-10">
      <OnboardingProgress currentStep={step} totalSteps={TOTAL_STEPS} />

      {step === 1 && <IntroStep />}
      {step === 2 && <NicknameStep nickname={nickname} onChange={setNickname} />}
      {step === 3 && (
        <NotificationStep
          settings={notificationDraft}
          onChange={(patch) => setNotificationDraft((prev) => ({ ...prev, ...patch }))}
        />
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={goPrevious}
            className="rounded-2xl px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-200"
          >
            이전
          </button>
        ) : (
          <span />
        )}

        {step < TOTAL_STEPS ? (
          <button
            type="button"
            onClick={goNext}
            className="rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700"
          >
            다음
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void handleComplete()}
            disabled={isSubmitting}
            className="rounded-2xl bg-primary-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 disabled:opacity-50"
          >
            {isSubmitting ? '처리 중...' : '시작하기'}
          </button>
        )}
      </div>
    </div>
  );
}
