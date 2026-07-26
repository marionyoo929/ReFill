type PagePlaceholderProps = {
  title: string;
  description: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-white px-6 text-center">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="max-w-md text-base text-gray-500">{description}</p>
    </div>
  );
}
