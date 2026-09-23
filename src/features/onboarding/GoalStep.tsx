import type { Goal } from "../../core/types";
import type { Draft } from "./onboardingDraft";

const OPTIONS: { value: Goal; label: string; description: string }[] = [
  { value: "steady", label: "Stay steady", description: "Eat to match what you burn, day to day." },
  { value: "energy", label: "More energy", description: "Same calories, a bit more carbs for steadier energy." },
  { value: "build", label: "Build muscle", description: "A modest surplus and more protein to support training." },
  {
    value: "lean",
    label: "Lean out gently",
    description: "A small, capped calorie dip. Never below what your body needs to function.",
  },
];

interface GoalStepProps {
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
}

export function GoalStep({ draft, setDraft }: GoalStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl text-ink">Goal</h1>
        <p className="mt-1 text-sm text-ink-soft">What you want your meals to give you.</p>
      </div>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDraft({ goal: opt.value })}
            aria-pressed={draft.goal === opt.value}
            className={`tap-target rounded-row border p-4 text-left ${
              draft.goal === opt.value ? "border-cardinal bg-cardinal/10" : "border-line bg-plate"
            }`}
          >
            <div className="font-display text-base text-ink">{opt.label}</div>
            <div className="text-sm text-ink-soft">{opt.description}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
