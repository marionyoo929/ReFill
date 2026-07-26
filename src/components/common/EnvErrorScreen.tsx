type EnvErrorScreenProps = {
  error: unknown;
};

export function EnvErrorScreen({ error }: EnvErrorScreenProps) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <h1 className="text-2xl font-bold text-danger-600">앱을 시작할 수 없습니다</h1>
      <p className="max-w-md whitespace-pre-line text-sm text-gray-600">{message}</p>
    </div>
  );
}
