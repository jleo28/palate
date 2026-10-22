/**
 * Badges and the weekly recap. Badges reward showing up and exploring, never calories or eating
 * less. Everything is worked out from the meal log, so nothing extra is stored.
 */
import type { LoggedMeal } from "./types";

export type BadgeId = "first-plate" | "week-streak" | "all-halls";

export const BADGES: { id: BadgeId; name: string; description: string }[] = [
  { id: "first-plate", name: "First plate", description: "Logged your first plate" },
  { id: "week-streak", name: "7-day streak", description: "Logged 7 days in a row" },
  { id: "all-halls", name: "Hall explorer", description: "Tried all 3 dining halls" },
];

type Log = Pick<LoggedMeal, "date" | "hall" | "source">;

const fromHall = (m: Log) => m.source !== "outside";

const addDays = (date: string, n: number) => {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
};

/** The longest run of consecutive days with something logged. */
export function longestRun(dates: readonly string[]) {
  const days = new Set(dates);
  let best = 0;
  for (const d of days) {
    if (days.has(addDays(d, -1))) continue; // only count from the start of a run
    let n = 1;
    while (days.has(addDays(d, n))) n++;
    best = Math.max(best, n);
  }
  return best;
}

/** Badges earned so far. Outside meals count toward streaks but not hall badges. */
export function earnedBadges(log: readonly Log[]): BadgeId[] {
  const earned: BadgeId[] = [];
  if (log.some(fromHall)) earned.push("first-plate");
  if (longestRun(log.map((m) => m.date)) >= 7) earned.push("week-streak");
  if (new Set(log.filter(fromHall).map((m) => m.hall)).size >= 3) earned.push("all-halls");
  return earned;
}

/** Badges a new log just earned (for the logged pop-up). */
export function newBadges(before: readonly Log[], after: readonly Log[]): BadgeId[] {
  const had = new Set(earnedBadges(before));
  return earnedBadges(after).filter((b) => !had.has(b));
}

export interface TasteRating {
  itemName: string;
  rating: 1 | -1;
  /** YYYY-MM-DD */
  date: string;
}

/** Monday of the week containing `date`. */
export function weekStart(date: string) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const weekday = (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7; // Mon = 0
  return addDays(date, -weekday);
}

/** This week so far (Monday on): meals logged, halls visited, and the most-liked dish. */
export function weeklyRecap(log: readonly Log[], ratings: readonly TasteRating[], today: string) {
  const start = weekStart(today);
  const week = log.filter((m) => m.date >= start && m.date <= today);
  const likes = new Map<string, number>();
  for (const r of ratings) {
    if (r.date < start || r.date > today) continue;
    likes.set(r.itemName, (likes.get(r.itemName) ?? 0) + r.rating);
  }
  const [favorite] = [...likes.entries()].filter(([, n]) => n > 0).sort((a, b) => b[1] - a[1]);
  return {
    meals: week.length,
    halls: new Set(week.filter(fromHall).map((m) => m.hall)).size,
    favorite: favorite?.[0] ?? null,
  };
}
