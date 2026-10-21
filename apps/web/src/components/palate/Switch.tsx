import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/** A labelled on/off switch built on a checkbox, so it works with keyboards and screen readers. */
export function Switch({
  label,
  hint,
  checked,
  onChange,
  className,
}: {
  label: string;
  hint?: ReactNode;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}) {
  return (
    <label className={cn("flex items-center justify-between gap-3", className)}>
      <span className="text-xs">
        <span className="block font-bold">{label}</span>
        {hint && <span className="text-muted-foreground">{hint}</span>}
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="peer sr-only"
      />
      <span
        aria-hidden
        className="relative h-6 w-11 shrink-0 rounded-full bg-foreground/20 transition-colors after:absolute after:left-0.5 after:top-0.5 after:size-5 after:rounded-full after:bg-card after:transition-transform peer-checked:bg-olive peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-olive"
      />
    </label>
  );
}
