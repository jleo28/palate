import { cn } from "@/lib/utils";
import type { MacroTargets } from "@/lib/8te/macros";

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
          <span className="text-[0.7rem] font-medium text-muted-foreground">/{Math.round(target)}</span>
        )}
      </p>
    </div>
  );
}

export function MacroRow({ t, target }: { t: MacroTargets; target?: MacroTargets }) {
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
  const pct = Math.min(100, target ? (value / target) * 100 : 0);
  const left = Math.max(0, Math.round(target - value));
  return (
    <div>
      <div className="mb-1 flex items-baseline justify-between gap-2">
        <span className="label-caps">{label}</span>
        <span className="text-xs font-medium text-muted-foreground">
          {Math.round(value)}
          {unit} · {left}
          {unit} left
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
        <div
          className={cn("h-full rounded-full transition-[width] duration-500", "bg-olive")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
