import { cn } from '@/lib/cn';

type OnboardingProgressProps = {
  currentStep: number;
  totalSteps: number;
};

export function OnboardingProgress({ currentStep, totalSteps }: OnboardingProgressProps) {
  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-label={`${currentStep} / ${totalSteps} 단계`}
    >
      {Array.from({ length: totalSteps }).map((_, index) => (
        <span
          key={index}
          className={cn(
            'h-1.5 rounded-full transition-all',
            index === currentStep - 1 ? 'w-8 bg-primary-600' : 'w-1.5 bg-gray-200',
          )}
        />
      ))}
    </div>
  );
}
