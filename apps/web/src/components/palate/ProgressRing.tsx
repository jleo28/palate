import { cn } from "@/lib/utils";

/** Today's calories against the daily target. Past the target it turns muted clay, never red. */
export function ProgressRing({
  value,
  target,
  className,
}: {
  value: number;
  target: number;
  className?: string;
}) {
  const pct = target > 0 ? value / target : 0;
  const r = 22;
  const circumference = 2 * Math.PI * r;
  const over = pct > 1;

  return (
    <div
      className={cn("relative grid size-14 place-items-center", className)}
      role="img"
      aria-label={`${Math.round(value)} of ${target} calories today`}
    >
      <svg viewBox="0 0 56 56" className="absolute inset-0 -rotate-90">
        <circle cx="28" cy="28" r={r} className="fill-none stroke-foreground/10" strokeWidth="6" />
        <circle
          cx="28"
          cy="28"
          r={r}
          className={cn(
            "fill-none transition-[stroke-dashoffset] duration-700",
            over ? "stroke-clay" : "stroke-olive",
          )}
          strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - Math.min(1, pct))}
        />
      </svg>
      <span className="font-display text-[0.7rem] font-bold">{Math.round(pct * 100)}%</span>
    </div>
  );
}
