import { Input } from '@/components/ui/Input';

type NicknameStepProps = {
  nickname: string;
  onChange: (value: string) => void;
};

export function NicknameStep({ nickname, onChange }: NicknameStepProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">이름을 확인해주세요</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-[#C9CED8]">
          알림 등에 사용되는 이름이에요. 필요하면 수정할 수 있어요.
        </p>
      </div>
      <div>
        <label
          htmlFor="onboarding-nickname"
          className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-200"
        >
          이름
        </label>
        <Input
          id="onboarding-nickname"
          value={nickname}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}
