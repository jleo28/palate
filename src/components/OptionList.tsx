import { LETTERS } from "../features/onboarding/questions";

export interface OptionItem {
  value: unknown;
  label: string;
  description?: string;
  icon?: React.ReactNode;
}

interface OptionListProps {
  options: OptionItem[];
  selected: unknown[];
  multi: boolean;
  onPick: (value: unknown) => void;
  /** The letter key shortcut is a desktop affordance; hidden from screen readers. */
  showLetters?: boolean;
  name: string;
  /** Key of the option currently playing its confirmation, if any. */
  confirmingKey?: string | null;
  disabled?: boolean;
}

export function OptionList({
  options,
  selected,
  multi,
  onPick,
  showLetters = true,
  name,
  confirmingKey = null,
  disabled = false,
}: OptionListProps) {
  const somethingConfirming = confirmingKey !== null;

  return (
    <ul className="flex flex-col gap-2.5" role={multi ? "group" : "radiogroup"} aria-label={name}>
      {options.map((opt, i) => {
        const key = String(opt.value);
        const isSelected = selected.includes(opt.value);
        const isConfirming = confirmingKey === key;
        // Everything that is not being chosen steps back while the choice lands.
        const isDimmed = somethingConfirming && !isConfirming;

        return (
          <li key={key}>
            <button
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onPick(opt.value)}
              className={`option-button flex w-full items-start gap-3 rounded-row border-2 p-4 text-left ${
                isSelected ? "border-accent bg-accent-tint" : "border-line-strong bg-plate"
              } ${isConfirming ? "is-confirming" : ""} ${isDimmed ? "is-dimmed" : ""}`}
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

              {opt.icon && (
                <span aria-hidden="true" className="mt-0.5 shrink-0 text-accent">
                  {opt.icon}
                </span>
              )}

              <span className="min-w-0 flex-1">
                <span className="block font-display text-base text-ink">{opt.label}</span>
                {opt.description && <span className="block text-sm text-ink-soft">{opt.description}</span>}
              </span>

              <span
                aria-hidden="true"
                className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-sm ${
                  isSelected ? "border-accent bg-accent text-plate" : "border-line-strong text-transparent"
                }`}
              >
                {isSelected && <span className={isConfirming ? "check-pop" : undefined}>{"✓"}</span>}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
