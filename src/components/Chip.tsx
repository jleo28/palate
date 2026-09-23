import type { ButtonHTMLAttributes } from "react";

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active = false, className = "", ...props }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`tap-target rounded-chip border px-4 py-2 text-sm transition-colors ${
        active
          ? "border-cardinal bg-cardinal text-plate"
          : "border-line bg-plate text-ink hover:border-ink-soft"
      } ${className}`.trim()}
      {...props}
    />
  );
}
