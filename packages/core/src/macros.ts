import type { GoalId, Profile } from "./types";

export const GOALS: { id: GoalId; label: string; note: string }[] = [
  { id: "cut", label: "Cut", note: "A gentle deficit, never more than 500 cal a day" },
  { id: "maintain", label: "Maintain", note: "Hold steady and eat balanced" },
  { id: "lean-bulk", label: "Lean Bulk", note: "Build slowly, with extra carbs" },
];

export const HIGH_PROTEIN_NOTE = "More protein at every meal, whatever your goal";

export interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Daily calories never go below these, whatever the goal. */
export const CALORIE_FLOOR: Record<Profile["gender"], number> = {
  female: 1200,
  other: 1200,
  male: 1500,
};
export const MAX_DEFICIT = 500;

const LB_TO_KG = 0.4536;
const IN_TO_M = 0.0254;

// BMI drives guardrails only. It is never shown to the user.
function bmi(p: Pick<Profile, "weightLb" | "heightIn">) {
  const m = p.heightIn * IN_TO_M;
  return (p.weightLb * LB_TO_KG) / (m * m);
}

/** Cut is unavailable when BMI is under 18.5. */
export function canCut(p: Pick<Profile, "weightLb" | "heightIn">) {
  return bmi(p) >= 18.5;
}

/** The goal the maths actually uses: Cut falls back to Maintain when it isn't available. */
export function effectiveGoal(p: Profile): GoalId {
  return p.goal === "cut" && !canCut(p) ? "maintain" : p.goal;
}

/** Weight used for protein: above BMI 30, the weight at BMI 25 for their height. */
export function proteinWeightLb(p: Pick<Profile, "weightLb" | "heightIn">) {
  if (bmi(p) <= 30) return p.weightLb;
  const m = p.heightIn * IN_TO_M;
  return (25 * m * m) / LB_TO_KG;
}

/** Mifflin-St Jeor with a light student activity factor (1.5). */
export function maintenanceKcal(p: Profile) {
  const kg = p.weightLb * LB_TO_KG;
  const cm = p.heightIn * 2.54;
  const sexConstant = p.gender === "male" ? 5 : p.gender === "female" ? -161 : -78;
  return (10 * kg + 6.25 * cm - 5 * p.age + sexConstant) * 1.5;
}

const KCAL_ADJUST: Record<GoalId, number> = { cut: -0.18, maintain: 0, "lean-bulk": 0.12 };
const PROTEIN_PER_LB: Record<GoalId, number> = { cut: 1.0, maintain: 0.8, "lean-bulk": 0.9 };
const HIGH_PROTEIN_PER_LB = 1.2;

export function dailyTargets(p: Profile): MacroTargets {
  const goal = effectiveGoal(p);
  const tdee = maintenanceKcal(p);
  const adjusted = Math.max(tdee * (1 + KCAL_ADJUST[goal]), tdee - MAX_DEFICIT);
  const kcal = Math.max(CALORIE_FLOOR[p.gender], Math.round(adjusted / 10) * 10);

  const perLb = p.highProtein ? HIGH_PROTEIN_PER_LB : PROTEIN_PER_LB[goal];
  const protein = Math.round(proteinWeightLb(p) * perLb);
  const fat = Math.round((kcal * (goal === "lean-bulk" ? 0.27 : 0.25)) / 9);
  const carbs = Math.max(60, Math.round((kcal - protein * 4 - fat * 9) / 4));

  return { kcal, protein, carbs, fat };
}

/** Lunch and dinner get 36% each, breakfast 28%. */
export function mealTargets(daily: MacroTargets, meal: string): MacroTargets {
  const share = meal === "Breakfast" ? 0.28 : 0.36;
  return {
    kcal: Math.round(daily.kcal * share),
    protein: Math.round(daily.protein * share),
    carbs: Math.round(daily.carbs * share),
    fat: Math.round(daily.fat * share),
  };
}

/** Upgrade profiles saved before High Protein became a toggle. */
export function normalizeProfile(p: Profile | (Omit<Profile, "goal"> & { goal: string })): Profile {
  if (p.goal === "high-protein") return { ...p, goal: "maintain", highProtein: true };
  return p as Profile;
}
