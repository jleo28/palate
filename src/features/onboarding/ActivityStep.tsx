import type { Activity } from "../../core/types";
import type { Draft } from "./onboardingDraft";

const OPTIONS: { value: Activity; label: string; description: string }[] = [
  { value: "sedentary", label: "Not very active", description: "Little to no exercise most weeks" },
  { value: "light", label: "Lightly active", description: "1 to 3 workouts a week" },
  { value: "moderate", label: "Active", description: "3 to 5 workouts a week" },
  { value: "very", label: "Very active", description: "6 to 7 hard workouts a week" },
];

interface ActivityStepProps {
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
}

export function ActivityStep({ draft, setDraft }: ActivityStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl text-ink">Activity</h1>
        <p className="mt-1 text-sm text-ink-soft">How much you move in a typical week.</p>
      </div>
      <div className="flex flex-col gap-3">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setDraft({ activity: opt.value })}
            aria-pressed={draft.activity === opt.value}
            className={`tap-target rounded-row border p-4 text-left ${
              draft.activity === opt.value ? "border-cardinal bg-cardinal/10" : "border-line bg-plate"
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
