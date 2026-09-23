import { LETTERS } from "../features/onboarding/questions";

export interface OptionItem {
  value: unknown;
  label: string;
  description?: string;
}

interface OptionListProps {
  options: OptionItem[];
  selected: unknown[];
  multi: boolean;
  onPick: (value: unknown) => void;
  /** The letter key shortcut is desktop-only affordance; hidden from screen readers. */
  showLetters?: boolean;
  name: string;
}

export function OptionList({ options, selected, multi, onPick, showLetters = true, name }: OptionListProps) {
  return (
    <ul className="flex flex-col gap-2.5" role={multi ? "group" : "radiogroup"} aria-label={name}>
      {options.map((opt, i) => {
        const isSelected = selected.includes(opt.value);
        return (
          <li key={String(opt.value)}>
            <button
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={isSelected}
              onClick={() => onPick(opt.value)}
              className={`option-button flex w-full items-start gap-3 rounded-row border-2 p-4 text-left ${
                isSelected
                  ? "border-accent bg-accent-tint"
                  : "border-line-strong bg-plate hover:border-ink-soft"
              }`}
            >
              {showLetters && (
                <span
                  aria-hidden="true"
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-row border text-sm font-bold ${
                    isSelected ? "border-accent bg-accent text-plate" : "border-line-strong text-ink-soft"
                  }`}
                >
                  {LETTERS[i]}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block font-display text-base text-ink">{opt.label}</span>
                {opt.description && <span className="block text-sm text-ink-soft">{opt.description}</span>}
              </span>
              {multi && (
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                    isSelected ? "border-accent bg-accent text-plate" : "border-line-strong text-transparent"
                  }`}
                >
                  {isSelected ? "✓" : ""}
                </span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
