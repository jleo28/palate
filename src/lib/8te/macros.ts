import type { GoalId, Profile } from "./types";

export const GOALS: { id: GoalId; label: string; note: string }[] = [
  { id: "cut", label: "Cut", note: "Lose fat, keep protein high" },
  { id: "maintain", label: "Maintain", note: "Hold weight, eat balanced" },
  { id: "lean-bulk", label: "Lean Bulk", note: "Slow gain, heavy on carbs" },
  { id: "high-protein", label: "High Protein", note: "Max protein, flexible rest" },
];

export interface MacroTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/** Mifflin-St Jeor + light student activity factor */
export function dailyTargets(p: Profile): MacroTargets {
  const kg = p.weightLb * 0.4536;
  const cm = p.heightIn * 2.54;
  const base = 10 * kg + 6.25 * cm - 5 * p.age + (p.gender === "male" ? 5 : p.gender === "female" ? -161 : -78);
  const tdee = base * 1.5;

  const adj: Record<GoalId, number> = {
    cut: -0.18,
    maintain: 0,
    "lean-bulk": 0.12,
    "high-protein": -0.05,
  };
  const kcal = Math.round((tdee * (1 + adj[p.goal])) / 10) * 10;

  const proteinPerLb: Record<GoalId, number> = {
    cut: 1.0,
    maintain: 0.8,
    "lean-bulk": 0.9,
    "high-protein": 1.2,
  };
  const protein = Math.round(p.weightLb * proteinPerLb[p.goal]);
  const fat = Math.round((kcal * (p.goal === "lean-bulk" ? 0.27 : 0.25)) / 9);
  const carbs = Math.max(60, Math.round((kcal - protein * 4 - fat * 9) / 4));

  return { kcal, protein, carbs, fat };
}

/** Lunch/Dinner get ~35% each, breakfast ~30% */
export function mealTargets(daily: MacroTargets, meal: string): MacroTargets {
  const share = meal === "Breakfast" ? 0.28 : meal === "Lunch" ? 0.36 : 0.36;
  return {
    kcal: Math.round(daily.kcal * share),
    protein: Math.round(daily.protein * share),
    carbs: Math.round(daily.carbs * share),
    fat: Math.round(daily.fat * share),
  };
}
