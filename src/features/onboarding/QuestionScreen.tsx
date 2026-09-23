import type { UnitSystem } from "../../context/ProfileContext";
import { OptionList } from "../../components/OptionList";
import { cmToFtIn, ftInToCm, kgToLb, lbToKg } from "../../lib/units";
import type { Draft } from "./onboardingDraft";
import type { Question } from "./questions";

interface QuestionScreenProps {
  question: Question;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
  units: UnitSystem;
  setUnits: (units: UnitSystem) => void;
  /** Called when a single-select answer is chosen, so the flow can auto-advance. */
  onAnswered?: () => void;
  showLetters?: boolean;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

const numberFieldClass =
  "w-full rounded-row border-2 border-line-strong bg-plate px-4 py-3 font-display text-xl text-ink";

export function QuestionScreen({
  question,
  draft,
  setDraft,
  units,
  setUnits,
  onAnswered,
  showLetters = true,
}: QuestionScreenProps) {
  const body = () => {
    if (question.kind === "single") {
      return (
        <OptionList
          name={question.prompt}
          multi={false}
          showLetters={showLetters}
          options={question.options}
          selected={[draft[question.field]]}
          onPick={(value) => {
            setDraft({ [question.field]: value } as Partial<Draft>);
            onAnswered?.();
          }}
        />
      );
    }

    if (question.kind === "multi") {
      const current = draft[question.field] as unknown[];
      return (
        <OptionList
          name={question.prompt}
          multi
          showLetters={showLetters}
          options={question.options}
          selected={current}
          onPick={(value) => {
            setDraft({ [question.field]: toggle(current, value) } as Partial<Draft>);
            onAnswered?.();
          }}
        />
      );
    }

    return <NumberField question={question} draft={draft} setDraft={setDraft} units={units} setUnits={setUnits} />;
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="font-display text-xl leading-tight text-ink">{question.prompt}</h1>
        {question.helper && <p className="mt-2 text-sm text-ink-soft">{question.helper}</p>}
      </div>
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
          autoFocus
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
                autoFocus
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
              autoFocus
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
          autoFocus
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
