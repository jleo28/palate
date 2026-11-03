import { cn } from "@/lib/utils";
import { useHideNumbers } from "@/lib/palate/hide-numbers";
import type { MacroTargets } from "@palate/core";

export function MacroPill({
  label,
  value,
  target,
  unit,
}: {
  label: string;
  value: number;
  target?: number | undefined;
  unit?: string | undefined;
}) {
  return (
    <div className="rounded-xl border border-foreground/15 bg-background/60 px-2.5 py-2 text-center">
      <p className="label-caps text-muted-foreground">{label}</p>
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

export function MacroRow({ t, target }: { t: MacroTargets; target?: MacroTargets | undefined }) {
  if (useHideNumbers()) return null;
  return (
    <div className="grid grid-cols-4 gap-2">
      <MacroPill label="Cal" value={t.kcal} target={target?.kcal} />
      <MacroPill label="Protein" value={t.protein} target={target?.protein} unit="g" />
      <MacroPill label="Carbs" value={t.carbs} target={target?.carbs} unit="g" />
      <MacroPill label="Fat" value={t.fat} target={target?.fat} unit="g" />
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
  const hidden = useHideNumbers();
  // Targets are goals: once reached, the bar stays full and says so. Never "over".
  const reached = target > 0 && value >= target;
  const pct = reached ? 100 : target ? (value / target) * 100 : 0;
  const left = Math.max(0, Math.round(target - value));
  if (hidden) return null;
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="label-caps">{label}</span>
        <span
          className={cn("text-xs font-medium", reached ? "text-olive" : "text-muted-foreground")}
        >
          {reached
            ? `Goal reached · ${Math.round(value)}${unit} today`
            : `${Math.round(value)}${unit} · ${left}${unit} to go`}
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className="h-full rounded-full bg-olive transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
