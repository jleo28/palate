import type { Sex } from "../../core/types";
import type { UnitSystem } from "../../context/ProfileContext";
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from "../../lib/units";
import { Chip } from "../../components/Chip";
import type { Draft } from "./onboardingDraft";

interface BasicsStepProps {
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
}

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unspecified", label: "Prefer not to say" },
];

export function BasicsStep({ draft, setDraft, units, setUnits }: BasicsStepProps) {
  const { feet, inches } = cmToFtIn(draft.heightCm);
  const lb = kgToLb(draft.weightKg);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl text-ink">Basics</h1>
        <p className="mt-1 text-sm text-ink-soft">Used only to estimate your calorie and protein needs.</p>
      </div>

      <div className="flex gap-2">
        <Chip active={units === "imperial"} onClick={() => setUnits("imperial")}>
          Imperial
        </Chip>
        <Chip active={units === "metric"} onClick={() => setUnits("metric")}>
          Metric
        </Chip>
      </div>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-ink-soft">Age</span>
        <input
          type="number"
          inputMode="numeric"
          min={16}
          max={30}
          value={draft.age}
          onChange={(e) => setDraft({ age: Number(e.target.value) })}
          className="tap-target rounded-row border border-line bg-plate px-3 text-base text-ink"
        />
      </label>

      {units === "imperial" ? (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-soft">Height</span>
          <div className="flex gap-2">
            <label className="flex flex-1 items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={3}
                max={8}
                value={feet}
                onChange={(e) => setDraft({ heightCm: ftInToCm(Number(e.target.value), inches) })}
                className="tap-target w-full rounded-row border border-line bg-plate px-3 text-base text-ink"
                aria-label="Height feet"
              />
              <span className="text-sm text-ink-soft">ft</span>
            </label>
            <label className="flex flex-1 items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                value={inches}
                onChange={(e) => setDraft({ heightCm: ftInToCm(feet, Number(e.target.value)) })}
                className="tap-target w-full rounded-row border border-line bg-plate px-3 text-base text-ink"
                aria-label="Height inches"
              />
              <span className="text-sm text-ink-soft">in</span>
            </label>
          </div>
        </div>
      ) : (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm text-ink-soft">Height (cm)</span>
          <input
            type="number"
            inputMode="numeric"
            value={draft.heightCm}
            onChange={(e) => setDraft({ heightCm: Number(e.target.value) })}
            className="tap-target rounded-row border border-line bg-plate px-3 text-base text-ink"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm text-ink-soft">Weight ({units === "imperial" ? "lb" : "kg"})</span>
        <input
          type="number"
          inputMode="numeric"
          value={units === "imperial" ? lb : Math.round(draft.weightKg)}
          onChange={(e) =>
            setDraft({ weightKg: units === "imperial" ? lbToKg(Number(e.target.value)) : Number(e.target.value) })
          }
          className="tap-target rounded-row border border-line bg-plate px-3 text-base text-ink"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="text-sm text-ink-soft">Sex used for the estimate</span>
        <div className="flex flex-wrap gap-2">
          {SEX_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={draft.sex === opt.value} onClick={() => setDraft({ sex: opt.value })}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
