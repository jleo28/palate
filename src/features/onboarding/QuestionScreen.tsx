import type { UnitSystem } from "../../context/ProfileContext";
import type { Goal } from "../../core/types";
import { OptionList } from "../../components/OptionList";
import { OliveSays } from "../../components/OliveSays";
import { GoalIcon } from "../../components/icons/GoalIcon";
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from "../../lib/units";
import type { Draft } from "./onboardingDraft";
import type { Question } from "./questions";

interface QuestionScreenProps {
  question: Question;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  onPickSingle?: (value: unknown) => void;
  onToggleMulti?: (value: unknown) => void;
  confirmingKey?: string | null;
  locked?: boolean;
  /** Profile reuses these as plain editable sections: no letters, no Olive. */
  asSection?: boolean;
}

const numberFieldClass =
  "w-full rounded-row border-2 border-line-strong bg-plate px-4 py-3 font-display text-xl text-ink";

export function QuestionScreen({
  question,
  draft,
  setDraft,
  units,
  setUnits,
  onPickSingle,
  onToggleMulti,
  confirmingKey = null,
  locked = false,
  asSection = false,
}: QuestionScreenProps) {
  const body = () => {
    if (question.kind === "single") {
      const options = question.options.map((opt) =>
        question.field === "goal"
          ? { ...opt, icon: <GoalIcon goal={opt.value as Goal} size={22} /> }
          : opt
      );
      return (
        <OptionList
          name={question.prompt}
          multi={false}
          showLetters={!asSection}
          options={options}
          selected={[draft[question.field]]}
          confirmingKey={confirmingKey}
          disabled={locked}
          onPick={(value) =>
            onPickSingle
              ? onPickSingle(value)
              : setDraft({ [question.field]: value } as Partial<Draft>)
          }
        />
      );
    }

    if (question.kind === "multi") {
      const current = draft[question.field] as unknown[];
      return (
        <OptionList
          name={question.prompt}
          multi
          showLetters={!asSection}
          options={question.options}
          selected={current}
          confirmingKey={confirmingKey}
          disabled={locked}
          onPick={(value) => {
            if (onToggleMulti) {
              onToggleMulti(value);
              return;
            }
            const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
            setDraft({ [question.field]: next } as Partial<Draft>);
          }}
        />
      );
    }

    return <NumberField question={question} draft={draft} setDraft={setDraft} units={units} setUnits={setUnits} />;
  };

  return (
    <div className="flex flex-col gap-5">
      {asSection ? (
        <div>
          <h2 className="font-display text-lg leading-tight text-ink">{question.prompt}</h2>
          {question.helper && <p className="mt-1 text-sm text-ink-soft">{question.helper}</p>}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {/* Olive asks. She is the voice of the survey. */}
          <OliveSays size={44}>
            <span className="font-display text-xl leading-snug text-ink">{question.prompt}</span>
          </OliveSays>
          {question.helper && <p className="text-sm text-ink-soft">{question.helper}</p>}
        </div>
      )}
      {body()}
    </div>
  );
}

interface NumberFieldProps {
  question: Extract<Question, { kind: "number" }>;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
}

function NumberField({ question, draft, setDraft, units, setUnits }: NumberFieldProps) {
  if (question.field === "age") {
    return (
      <label className="flex items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          min={16}
          max={30}
          value={draft.age}
          onChange={(e) => setDraft({ age: Number(e.target.value) })}
          className={numberFieldClass}
          aria-label="Age in years"
        />
        <span className="shrink-0 text-base text-ink-soft">years</span>
      </label>
    );
  }

  const unitToggle = (
    <div className="flex gap-2" role="group" aria-label="Units">
      <UnitButton active={units === "imperial"} onClick={() => setUnits("imperial")} label="Imperial" />
      <UnitButton active={units === "metric"} onClick={() => setUnits("metric")} label="Metric" />
    </div>
  );

  if (question.field === "heightCm") {
    const { feet, inches } = cmToFtIn(draft.heightCm);
    return (
      <div className="flex flex-col gap-4">
        {units === "imperial" ? (
          <div className="flex gap-3">
            <label className="flex flex-1 items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={3}
                max={8}
                value={feet}
                onChange={(e) => setDraft({ heightCm: ftInToCm(Number(e.target.value), inches) })}
                className={numberFieldClass}
                aria-label="Height, feet"
              />
              <span className="shrink-0 text-base text-ink-soft">ft</span>
            </label>
            <label className="flex flex-1 items-center gap-2">
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={11}
                value={inches}
                onChange={(e) => setDraft({ heightCm: ftInToCm(feet, Number(e.target.value)) })}
                className={numberFieldClass}
                aria-label="Height, inches"
              />
              <span className="shrink-0 text-base text-ink-soft">in</span>
            </label>
          </div>
        ) : (
          <label className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={draft.heightCm}
              onChange={(e) => setDraft({ heightCm: Number(e.target.value) })}
              className={numberFieldClass}
              aria-label="Height in centimetres"
            />
            <span className="shrink-0 text-base text-ink-soft">cm</span>
          </label>
        )}
        {unitToggle}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <label className="flex items-center gap-3">
        <input
          type="number"
          inputMode="numeric"
          value={units === "imperial" ? kgToLb(draft.weightKg) : Math.round(draft.weightKg)}
          onChange={(e) =>
            setDraft({ weightKg: units === "imperial" ? lbToKg(Number(e.target.value)) : Number(e.target.value) })
          }
          className={numberFieldClass}
          aria-label={units === "imperial" ? "Weight in pounds" : "Weight in kilograms"}
        />
        <span className="shrink-0 text-base text-ink-soft">{units === "imperial" ? "lb" : "kg"}</span>
      </label>
      {unitToggle}
    </div>
  );
}

function UnitButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`tap-target rounded-chip border-2 px-4 text-sm ${
        active ? "border-accent bg-accent text-plate" : "border-line-strong bg-plate text-ink"
      }`}
    >
      {label}
    </button>
  );
}
