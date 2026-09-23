import type { MealPeriod } from "../core/types";

const MEAL_WINDOWS: Record<MealPeriod, { start: number; end: number }> = {
  breakfast: { start: 7 * 60, end: 10 * 60 + 30 },
  lunch: { start: 11 * 60, end: 15 * 60 },
  dinner: { start: 16 * 60 + 30, end: 21 * 60 },
};

const MEAL_ORDER: MealPeriod[] = ["breakfast", "lunch", "dinner"];

export function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function toHHMM(date: Date): string {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

function minutesOfDay(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** The meal period in progress, or the next one if none is. Falls back to dinner after the last period ends. */
export function currentOrNextMeal(hhmm: string): MealPeriod {
  const minutes = minutesOfDay(hhmm);
  for (const period of MEAL_ORDER) {
    const window = MEAL_WINDOWS[period];
    if (minutes <= window.end) return period;
  }
  return "dinner";
}

export function formatDateHeading(dateIso: string): string {
  const [y, m, d] = dateIso.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}
