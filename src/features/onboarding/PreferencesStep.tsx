import type { Allergen, DietFilter, HallId, MealPeriod } from "../../core/types";
import { Chip } from "../../components/Chip";
import type { Draft } from "./onboardingDraft";

const DIET_OPTIONS: { value: DietFilter; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "no_pork", label: "No pork" },
  { value: "no_beef", label: "No beef" },
];

const ALLERGEN_OPTIONS: { value: Allergen; label: string }[] = [
  { value: "milk", label: "Milk" },
  { value: "egg", label: "Egg" },
  { value: "fish", label: "Fish" },
  { value: "shellfish", label: "Shellfish" },
  { value: "tree_nuts", label: "Tree nuts" },
  { value: "peanuts", label: "Peanuts" },
  { value: "wheat", label: "Wheat" },
  { value: "soy", label: "Soy" },
  { value: "sesame", label: "Sesame" },
];

const HALL_OPTIONS: { value: HallId; label: string }[] = [
  { value: "evk", label: "EVK" },
  { value: "parkside", label: "Parkside" },
  { value: "village", label: "Village" },
];

const MEAL_OPTIONS: { value: MealPeriod; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

interface PreferencesStepProps {
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function PreferencesStep({ draft, setDraft }: PreferencesStepProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-xl text-ink">Preferences</h1>
        <p className="mt-1 text-sm text-ink-soft">Filtered items never appear, including in swaps.</p>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-ink-soft">Diet</span>
        <div className="flex flex-wrap gap-2">
          {DIET_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={draft.diet.includes(opt.value)}
              onClick={() => setDraft({ diet: toggle(draft.diet, opt.value) })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-ink-soft">Allergens to avoid</span>
        <div className="flex flex-wrap gap-2">
          {ALLERGEN_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={draft.avoidAllergens.includes(opt.value)}
              onClick={() => setDraft({ avoidAllergens: toggle(draft.avoidAllergens, opt.value) })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-ink-soft">Hall you use most</span>
        <div className="flex flex-wrap gap-2">
          {HALL_OPTIONS.map((opt) => (
            <Chip key={opt.value} active={draft.homeHall === opt.value} onClick={() => setDraft({ homeHall: opt.value })}>
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="text-sm text-ink-soft">Meals you eat in hall</span>
        <div className="flex flex-wrap gap-2">
          {MEAL_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              active={draft.meals.includes(opt.value)}
              onClick={() => setDraft({ meals: toggle(draft.meals, opt.value) })}
            >
              {opt.label}
            </Chip>
          ))}
        </div>
      </div>
    </div>
  );
}
