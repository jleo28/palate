import type { MacroTargets } from "./macros";
import { totals } from "./plate";
import type { MealPeriod, PlateItem } from "./types";

export const MEALS: MealPeriod[] = ["Breakfast", "Lunch", "Dinner"];
const SHARE: Record<MealPeriod, number> = { Breakfast: 0.28, Lunch: 0.36, Dinner: 0.36 };
const MACROS = ["kcal", "protein", "carbs", "fat"] as const;
export type Macro = (typeof MACROS)[number];

const map = (fn: (m: Macro) => number): MacroTargets => ({
  kcal: fn("kcal"),
  protein: fn("protein"),
  carbs: fn("carbs"),
  fat: fn("fat"),
});

/** What's left of the day's targets. Never negative. */
export function remainingToday(daily: MacroTargets, consumed: MacroTargets): MacroTargets {
  return map((m) => Math.max(0, daily[m] - consumed[m]));
}

/**
 * Rolling guide for one meal: what's left of the day, split by share across this meal and
 * every other meal not logged yet. Logged meals move the guide ("heavy lunch, lighter
 * dinner"); a meal that wasn't logged keeps its share, since many people won't log everything.
 */
export function mealGuide(
  daily: MacroTargets,
  consumed: MacroTargets,
  meal: MealPeriod,
  loggedMeals: readonly MealPeriod[],
): MacroTargets {
  const open = MEALS.filter((m) => m === meal || !loggedMeals.includes(m));
  const share = SHARE[meal] / open.reduce((sum, m) => sum + SHARE[m], 0);
  const left = remainingToday(daily, consumed);
  return map((m) => Math.round(left[m] * share));
}

/**
 * Enforce the day's calorie cap on a plate: trim portions (largest items first), then drop
 * extras, until the plate fits. Anchor rows stay at one portion, so a plate is never empty.
 */
export function capPlate(plate: readonly PlateItem[], capKcal: number): PlateItem[] {
  let rows = plate.map((row) => ({ ...row }));
  while (totals(rows).kcal > capKcal) {
    const trimmable = rows.filter((r) => r.qty > 1).sort((a, b) => b.item.kcal - a.item.kcal)[0];
    if (trimmable) {
      trimmable.qty -= 1;
      continue;
    }
    const extra = [...rows].reverse().find((r) => r.item.role === "extra");
    if (!extra) break;
    rows = rows.filter((r) => r !== extra);
  }
  return rows;
}

export interface Fit {
  /** Macros on the plate meaningfully above the meal guide. */
  over: { macro: Macro; by: number }[];
  /** True when eating this plate takes the day past its calorie target. */
  dayOverCap: boolean;
  /** True when the day was already at or past its calorie target before this plate. */
  capReached: boolean;
  /** Protein is well under the guide. */
  lowProtein: boolean;
}

// Small overshoots are noise; only flag what someone would notice.
const OVER_TOLERANCE: Record<Macro, number> = { kcal: 60, protein: 8, carbs: 8, fat: 5 };

export function fitCheck(
  plate: MacroTargets,
  guide: MacroTargets,
  consumed: MacroTargets,
  daily: MacroTargets,
): Fit {
  const over = MACROS.filter((m) => plate[m] - guide[m] > OVER_TOLERANCE[m]).map((macro) => ({
    macro,
    by: Math.round(plate[macro] - guide[macro]),
  }));
  return {
    over,
    capReached: consumed.kcal >= daily.kcal,
    dayOverCap: consumed.kcal + plate.kcal > daily.kcal,
    lowProtein: plate.protein < guide.protein * 0.8,
  };
}

const LABEL: Record<Macro, string> = {
  kcal: "calories",
  protein: "protein",
  carbs: "carbs",
  fat: "fat",
};
const unit = (m: Macro) => (m === "kcal" ? " cal" : " g");

/** One plain-language line about how a plate fits, in Seedling's voice. */
export function fitSummary(fit: Fit, meal: MealPeriod): string {
  const nextMeal = MEALS[MEALS.indexOf(meal) + 1]?.toLowerCase();
  if (fit.capReached) {
    return "You've reached today's calories. If you're still hungry, this is a balanced, lighter option.";
  }
  if (fit.dayOverCap) {
    return "This plate goes a little past today's calories. A smaller side keeps the day on track.";
  }
  // Lead with what's most useful to adjust; extra protein is the least concerning.
  const priority: Macro[] = ["fat", "carbs", "kcal", "protein"];
  const top = [...fit.over].sort(
    (a, b) => priority.indexOf(a.macro) - priority.indexOf(b.macro),
  )[0];
  if (top) {
    const balance = nextMeal
      ? ` ${nextMeal[0]!.toUpperCase()}${nextMeal.slice(1)} can balance it out.`
      : "";
    return `A bit heavy on ${LABEL[top.macro]} (+${top.by}${unit(top.macro)}).${balance}`;
  }
  if (fit.lowProtein) return "Light on protein. Another protein would round this plate out.";
  return `This plate fits your ${meal.toLowerCase()} nicely.`;
}
