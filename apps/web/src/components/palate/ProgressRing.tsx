import { cn } from "@/lib/utils";
import { useHideNumbers } from "@/lib/palate/hide-numbers";

/** Today's calories against the daily target. Fills to complete and stays complete. */
export function ProgressRing({
  value,
  target,
  className,
}: {
  value: number;
  target: number;
  className?: string;
}) {
  const pct = target > 0 ? Math.min(1, value / target) : 0;
  const r = 22;
  const circumference = 2 * Math.PI * r;
  if (useHideNumbers()) return null;

  return (
    <div
      className={cn("relative grid size-14 place-items-center", className)}
      role="img"
      aria-label={
        pct >= 1
          ? `Calorie goal reached · ${Math.round(value)} today`
          : `${Math.round(value)} of ${target} calories today`
      }
    >
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle cx="28" cy="28" r={r} className="fill-none stroke-foreground/10" strokeWidth="6" />
        <circle
          cx="28"
          cy="28"
          r={r}
          className="fill-none stroke-olive transition-[stroke-dashoffset] duration-700"
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - pct)}
        />
      </svg>
      <span className="font-display text-[0.7rem] font-bold">{Math.round(pct * 100)}%</span>
    </div>
  );
}
