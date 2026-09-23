interface MacroBarProps {
  label: string;
  current: number;
  target: number;
  unit?: string;
  colorVar: "protein" | "carb" | "fat" | "veg";
}

export function MacroBar({ label, current, target, unit = "g", colorVar }: MacroBarProps) {
  const pct = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
  const colorClass = {
    protein: "bg-protein",
    carb: "bg-carb",
    fat: "bg-fat",
    veg: "bg-veg",
  }[colorVar];

  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="w-16 shrink-0 text-sm text-ink-soft">{label}</span>
      <div
        className="h-2.5 flex-1 overflow-hidden rounded-full bg-tray"
        role="progressbar"
        aria-valuenow={current}
        aria-valuemin={0}
        aria-valuemax={target}
        aria-label={`${label}: ${current} of ${target} ${unit}`}
      >
        <div className={`h-full rounded-full ${colorClass}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-24 shrink-0 text-right text-sm tabular-nums text-ink">
        {current} / {target} {unit}
      </span>
    </div>
  );
}
