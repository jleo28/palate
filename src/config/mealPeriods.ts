import type { MealPeriod } from "../core/types";

/**
 * The single source of truth for when each meal period runs. These windows
 * cover the whole day with no gaps, so any local time maps to exactly one
 * period. Change them here and the dashboard, the plate view and the demo
 * panel all follow.
 */
export interface MealWindow {
  period: MealPeriod;
  label: string;
  /** Inclusive start, in minutes from midnight. */
  startMinutes: number;
  /** Inclusive end, in minutes from midnight. */
  endMinutes: number;
}

const H = (hours: number, minutes = 0) => hours * 60 + minutes;

export const MEAL_WINDOWS: MealWindow[] = [
  { period: "breakfast", label: "Breakfast", startMinutes: H(0), endMinutes: H(10, 59) },
  { period: "lunch", label: "Lunch", startMinutes: H(11), endMinutes: H(15, 29) },
  { period: "dinner", label: "Dinner", startMinutes: H(15, 30), endMinutes: H(23, 59) },
];

export const MEAL_ORDER: MealPeriod[] = MEAL_WINDOWS.map((w) => w.period);

export function minutesFromHHMM(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** The period the given local time falls inside. */
export function mealPeriodAt(hhmm: string): MealPeriod {
  const minutes = minutesFromHHMM(hhmm);
  const window = MEAL_WINDOWS.find((w) => minutes >= w.startMinutes && minutes <= w.endMinutes);
  return window?.period ?? "dinner";
}

/**
 * The minute at which the current period ends. A manual meal choice is kept
 * until this boundary passes, after which the app goes back to following the
 * clock.
 */
export function periodBoundaryAfter(hhmm: string): number {
  const minutes = minutesFromHHMM(hhmm);
  const window = MEAL_WINDOWS.find((w) => minutes >= w.startMinutes && minutes <= w.endMinutes);
  return window ? window.endMinutes : H(23, 59);
}

export function labelFor(period: MealPeriod): string {
  return MEAL_WINDOWS.find((w) => w.period === period)?.label ?? period;
}
