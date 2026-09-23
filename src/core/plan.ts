import { filterItems } from "./filters";
import { getMenu } from "./menu";
import { solvePlate } from "./solver";
import { dailyTargets } from "./targets";
import type { DayPlan, HallId, Macros, MealPeriod, MenuFile, MenuItem, Plate, Profile } from "./types";

const MEAL_ORDER: MealPeriod[] = ["breakfast", "lunch", "dinner"];

const ZERO: Macros = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

function addMacros(a: Macros, b: Macros): Macros {
  return { kcal: a.kcal + b.kcal, protein: a.protein + b.protein, carbs: a.carbs + b.carbs, fat: a.fat + b.fat };
}

export interface SolvedMeal {
  plate: Plate;
  alternatives: Plate[];
  eligibleItems: MenuItem[];
}

/** Solves one meal period, exposed so Today can re-solve a single meal without recomputing the whole day. */
export function planMeal(
  profile: Profile,
  menu: MenuFile,
  hall: HallId,
  period: MealPeriod,
  dateIso: string,
  usedProteinIds: Set<string> = new Set()
): SolvedMeal {
  const targets = dailyTargets(profile);
  const target = targets.meals[period];
  const available = getMenu(menu, hall, period, dateIso);
  const eligible = filterItems(available, profile.diet, profile.avoidAllergens);
  const { plate, alternatives } = solvePlate(eligible, target, usedProteinIds);
  return { plate, alternatives, eligibleItems: eligible };
}

/** Solves breakfast, lunch, dinner in order for one day, so a protein used earlier is penalised, not banned, later. */
export function planDay(profile: Profile, menu: MenuFile, dateIso: string, hall: HallId): DayPlan {
  const meals: Partial<Record<MealPeriod, Plate>> = {};
  const usedProteinIds = new Set<string>();
  let totals: Macros = ZERO;
  let target: Macros = ZERO;
  let mealsPlanned = 0;

  const targets = dailyTargets(profile);

  for (const period of MEAL_ORDER) {
    if (!profile.meals.includes(period)) continue;
    const { plate, eligibleItems } = planMeal(profile, menu, hall, period, dateIso, usedProteinIds);
    meals[period] = plate;
    totals = addMacros(totals, plate.totals);
    target = addMacros(target, targets.meals[period]);
    mealsPlanned += 1;

    const itemRole = new Map(eligibleItems.map((i) => [i.id, i.role]));
    const proteinLine = plate.lines.find((l) => itemRole.get(l.itemId) === "protein");
    if (proteinLine) usedProteinIds.add(proteinLine.itemId);
  }

  return {
    date: dateIso,
    hall,
    meals,
    daySummary: { mealsPlanned, totals, target },
  };
}
