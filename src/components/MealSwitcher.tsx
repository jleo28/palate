import type { MealPeriod } from "../core/types";
import { MEAL_WINDOWS } from "../config/mealPeriods";
import { tap } from "../lib/haptics";

interface MealSwitcherProps {
  value: MealPeriod;
  clockMeal: MealPeriod;
  onChange: (period: MealPeriod) => void;
  id?: string;
}

/**
 * Segmented control. The period matching the device clock carries a "Now" dot,
 * so a manual choice never hides what time it actually is.
 */
export function MealSwitcher({ value, clockMeal, onChange, id }: MealSwitcherProps) {
  return (
    <div
      id={id}
      role="tablist"
      aria-label="Meal"
      className="flex gap-1 rounded-chip border border-line bg-plate p-1"
    >
      {MEAL_WINDOWS.map((window) => {
        const active = value === window.period;
        const isNow = clockMeal === window.period;
        return (
          <button
            key={window.period}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => {
              tap();
              onChange(window.period);
            }}
            className={`tap-target relative flex flex-1 items-center justify-center gap-1.5 rounded-chip px-2 text-sm transition-colors ${
              active ? "bg-accent font-bold text-plate" : "text-ink-soft"
            }`}
          >
            {window.label}
            {isNow && (
              <span
                aria-label="Current meal period"
                title="Now"
                className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? "bg-plate" : "bg-accent"}`}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
