import { Card } from '@/components/ui/Card';
import { INTRO_FEATURES } from '@/features/onboarding/constants/onboardingFeatures';

export function IntroStep() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Re:Fill 시작하기</h1>
        <p className="mt-1 text-sm text-gray-500">
          아래 기능으로 소진일을 미리 확인할 수 있어요.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {INTRO_FEATURES.map(({ icon: Icon, title, description }) => (
          <Card key={title} className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary-50 text-primary-600">
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">{title}</p>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
