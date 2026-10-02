/** Streaks: a day counts when a meal is logged, not when a target is hit. */

export const FREEZES_PER_MONTH = 2;

export interface Streak {
  /** Logged days in the current streak (frozen days bridge gaps but don't add to the count). */
  days: number;
  /** Something is logged today. Today never breaks a streak before it's over. */
  loggedToday: boolean;
  /** Days covered by an automatic freeze, newest first. */
  frozen: string[];
  /** Freezes still available this calendar month. */
  freezesLeft: number;
}

/** The day before a YYYY-MM-DD date, in plain calendar terms (no time zones). */
function previousDay(date: string) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const prev = new Date(Date.UTC(y, m - 1, d - 1));
  return prev.toISOString().slice(0, 10);
}

const monthOf = (date: string) => date.slice(0, 7);

/**
 * Walk back from today counting logged days. A missed day is covered by an automatic freeze
 * (two per calendar month), but only if an earlier logged day follows; freezes are never
 * spent on a gap the streak doesn't survive.
 */
export function streak(loggedDates: readonly string[], today: string): Streak {
  const logged = new Set(loggedDates);
  const earliest = [...logged].sort()[0];
  const used = new Map<string, number>();
  const frozen: string[] = [];
  const loggedToday = logged.has(today);

  let days = 0;
  let pending: string[] = [];
  let cursor = loggedToday ? today : previousDay(today);

  while (earliest && cursor >= earliest) {
    if (logged.has(cursor)) {
      days += 1;
      for (const day of pending) used.set(monthOf(day), (used.get(monthOf(day)) ?? 0) + 1);
      frozen.push(...pending);
      pending = [];
    } else {
      const month = monthOf(cursor);
      const spent = (used.get(month) ?? 0) + pending.filter((p) => monthOf(p) === month).length;
      if (spent >= FREEZES_PER_MONTH) break;
      pending.push(cursor);
    }
    cursor = previousDay(cursor);
  }

  return {
    days,
    loggedToday,
    frozen,
    freezesLeft: FREEZES_PER_MONTH - (used.get(monthOf(today)) ?? 0),
  };
}
