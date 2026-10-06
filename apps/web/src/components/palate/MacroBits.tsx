import { cn } from "@/lib/utils";
import type { Macro, MacroTargets } from "@palate/core";

export function MacroPill({
  label,
  value,
  target,
  unit,
  over,
}: {
  label: string;
  value: number;
  target?: number | undefined;
  unit?: string | undefined;
  over?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-2.5 py-2 text-center",
        over ? "border-amber-ink/30 bg-amber-soft" : "border-foreground/15 bg-background/60",
      )}
    >
      <p className={cn("label-caps", over ? "text-amber-ink" : "text-muted-foreground")}>{label}</p>
      <p className="font-display text-base font-bold leading-tight">
        {Math.round(value)}
        {unit}
        {target !== undefined && (
          <span className="text-[0.7rem] font-medium text-muted-foreground">
            /{Math.round(target)}
          </span>
        )}
      </p>
    </div>
  );
}

export function MacroRow({
  t,
  target,
  over = [],
}: {
  t: MacroTargets;
  target?: MacroTargets;
  over?: Macro[];
}) {
  return (
    <div className="grid grid-cols-4 gap-2">
      <MacroPill label="Cal" value={t.kcal} target={target?.kcal} over={over.includes("kcal")} />
      <MacroPill
        label="Protein"
        value={t.protein}
        target={target?.protein}
        unit="g"
        over={over.includes("protein")}
      />
      <MacroPill
        label="Carbs"
        value={t.carbs}
        target={target?.carbs}
        unit="g"
        over={over.includes("carbs")}
      />
      <MacroPill
        label="Fat"
        value={t.fat}
        target={target?.fat}
        unit="g"
        over={over.includes("fat")}
      />
    </div>
  );
}

export function MacroBar({
  label,
  value,
  target,
  unit = "g",
}: {
  label: string;
  value: number;
  target: number;
  unit?: string;
}) {
  const pct = Math.min(100, target ? (value / target) * 100 : 0);
  const left = Math.max(0, Math.round(target - value));
  const overBy = Math.round(value - target);
  // Over on calories is the day's cap (muted clay); over on a macro is a soft amber note.
  const isCalories = unit !== "g";
  const over = overBy > 0;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="label-caps">{label}</span>
        <span
          className={cn(
            "text-xs font-medium",
            over ? (isCalories ? "text-foreground" : "text-amber-ink") : "text-muted-foreground",
          )}
        >
          {Math.round(value)}
          {unit} · {over ? `${overBy}${unit} over` : `${left}${unit} left`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-500",
            over ? (isCalories ? "bg-clay" : "bg-amber-ink/60") : "bg-olive",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
