type NavBadgeProps = {
  count: number;
};

export function NavBadge({ count }: NavBadgeProps) {
  if (count <= 0) {
    return null;
  }

  return (
    <span
      aria-hidden="true"
      className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-danger-500 px-1 text-[10px] font-semibold text-white"
    >
      {count > 9 ? '9+' : count}
    </span>
  );
}
