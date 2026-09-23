import type { Activity, DailyTargets, Goal, Macros, MealPeriod, Profile, Sex } from "./types";

const ACTIVITY_MULTIPLIER: Record<Activity, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  very: 1.725,
};

const SEX_OFFSET: Record<Sex, number> = {
  male: 5,
  female: -161,
  unspecified: -78,
};

const DEFAULT_MEAL_WEIGHTS: Record<MealPeriod, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.4,
};

const MEAL_ORDER: MealPeriod[] = ["breakfast", "lunch", "dinner"];

export function bmr(profile: Pick<Profile, "weightKg" | "heightCm" | "age" | "sex">): number {
  return 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + SEX_OFFSET[profile.sex];
}

export function maintenance(profile: Pick<Profile, "weightKg" | "heightCm" | "age" | "sex" | "activity">): number {
  return bmr(profile) * ACTIVITY_MULTIPLIER[profile.activity];
}

const round10 = (n: number) => Math.round(n / 10) * 10;
const round1 = (n: number) => Math.round(n);

function goalCalories(goal: Goal, maint: number, minBmr: number): number {
  let kcal: number;
  switch (goal) {
    case "steady":
    case "energy":
      kcal = maint;
      break;
    case "build":
      kcal = Math.min(maint * 1.1, maint + 300);
      break;
    case "lean":
      kcal = Math.max(Math.max(maint * 0.85, maint - 500), minBmr);
      break;
  }
  return kcal;
}

const PROTEIN_G_PER_KG: Record<Goal, number> = {
  steady: 1.4,
  energy: 1.4,
  build: 1.8,
  lean: 1.8,
};

export function dailyMacros(profile: Profile): Macros {
  const maint = maintenance(profile);
  const minBmr = bmr(profile);
  const kcalRaw = goalCalories(profile.goal, maint, minBmr);

  const proteinG = Math.min(
    PROTEIN_G_PER_KG[profile.goal] * profile.weightKg,
    2.2 * profile.weightKg,
    (0.35 * kcalRaw) / 4
  );

  const fatFloorG = 0.6 * profile.weightKg;
  let fatG = Math.max((0.28 * kcalRaw) / 9, fatFloorG);

  if (profile.goal === "energy") {
    const shiftFatG = (0.05 * kcalRaw) / 9;
    fatG = Math.max(fatG - shiftFatG, fatFloorG);
  }

  const proteinKcal = proteinG * 4;
  const fatKcal = fatG * 9;
  const carbsKcal = Math.max(kcalRaw - proteinKcal - fatKcal, 0);
  const carbsG = carbsKcal / 4;

  return {
    kcal: round10(kcalRaw),
    protein: round1(proteinG),
    carbs: round1(carbsG),
    fat: round1(fatG),
  };
}

export function mealSplit(meals: MealPeriod[]): Record<MealPeriod, number> {
  const active = meals.length > 0 ? meals : MEAL_ORDER;
  const rawTotal = active.reduce((sum, m) => sum + DEFAULT_MEAL_WEIGHTS[m], 0);
  const weights = {} as Record<MealPeriod, number>;
  for (const m of MEAL_ORDER) {
    weights[m] = active.includes(m) ? DEFAULT_MEAL_WEIGHTS[m] / rawTotal : 0;
  }
  return weights;
}

function scaleMacros(macros: Macros, factor: number): Macros {
  return {
    kcal: round10(macros.kcal * factor),
    protein: round1(macros.protein * factor),
    carbs: round1(macros.carbs * factor),
    fat: round1(macros.fat * factor),
  };
}

export function dailyTargets(profile: Profile): DailyTargets {
  const daily = dailyMacros(profile);
  const weights = mealSplit(profile.meals);
  const meals = {} as Record<MealPeriod, Macros>;
  for (const m of MEAL_ORDER) {
    meals[m] = scaleMacros(daily, weights[m]);
  }
  return { daily, meals };
}
