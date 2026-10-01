import { useState } from "react";
import { Info } from "lucide-react";
import { GOALS, HIGH_PROTEIN_NOTE, canCut, type GoalId, type Profile } from "@palate/core";
import { cn } from "@/lib/utils";

interface Props {
  body: Pick<Profile, "weightLb" | "heightIn">;
  goal: GoalId;
  highProtein: boolean;
  onGoal: (goal: GoalId) => void;
  onHighProtein: (on: boolean) => void;
  compact?: boolean;
}

export function GoalPicker({ body, goal, highProtein, onGoal, onHighProtein, compact }: Props) {
  const cutAllowed = canCut(body);
  const selected = goal === "cut" && !cutAllowed ? "maintain" : goal;
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <div className="space-y-2.5">
      <div className={cn("grid gap-2", compact ? "grid-cols-3" : "grid-cols-1")}>
        {GOALS.map((g) => {
          const disabled = g.id === "cut" && !cutAllowed;
          return (
            <div key={g.id} className="relative">
              <button
                type="button"
                disabled={disabled}
                aria-pressed={selected === g.id}
                aria-describedby={disabled ? "cut-why" : undefined}
                onClick={() => onGoal(g.id)}
                className={cn(
                  "w-full rounded-2xl border px-3 py-3 text-left transition-colors",
                  selected === g.id
                    ? "border-olive bg-olive text-primary-foreground"
                    : "border-foreground/20 bg-card",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <span className="font-display block text-base font-bold">{g.label}</span>
                {!compact && (
                  <span className="mt-0.5 block text-[0.72rem] leading-snug opacity-80">
                    {g.note}
                  </span>
                )}
              </button>
              {disabled && (
                <button
                  type="button"
                  onClick={() => setWhyOpen((open) => !open)}
                  aria-expanded={whyOpen}
                  aria-controls="cut-why"
                  aria-label="Why is Cut unavailable?"
                  className="absolute top-2 right-2 grid size-8 place-items-center rounded-full text-foreground"
                >
                  <Info className="size-4" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {!cutAllowed && whyOpen && (
        <p id="cut-why" role="note" className="rounded-xl bg-olive-soft px-3 py-2 text-[0.78rem]">
          Cut is off for your height and weight. Eating less than you need right now could work
          against you, so Palate plans for Maintain or Lean Bulk instead.
        </p>
      )}

      <label className="flex items-center justify-between gap-3 rounded-2xl border border-foreground/20 bg-card px-3 py-3">
        <span>
          <span className="font-display block text-base font-bold">High Protein</span>
          {!compact && (
            <span className="mt-0.5 block text-[0.72rem] leading-snug opacity-80">
              {HIGH_PROTEIN_NOTE}
            </span>
          )}
        </span>
        <input
          type="checkbox"
          role="switch"
          checked={highProtein}
          onChange={(e) => onHighProtein(e.target.checked)}
          className="size-5 accent-[var(--olive)]"
        />
      </label>
    </div>
  );
}
