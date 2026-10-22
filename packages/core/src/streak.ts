/** Streaks: a day counts when a meal is logged, not when a target is hit. */

/**
 * One monthly pool of cards. A missed day uses one automatically (so the streak survives), and
 * logging an earlier meal spends one on purpose. Tune here.
 */
export const CARDS_PER_MONTH = 2;
/** How far back "Log an earlier meal" reaches, in days. */
export const BACKFILL_DAYS = 3;

/** A card spent on purpose: logging a meal for an earlier day. Never refunded. */
export interface CardSpend {
  /** YYYY-MM-DD the card was spent (it comes out of that month's pool). */
  spentOn: string;
  /** YYYY-MM-DD the meal was logged for. */
  forDate: string;
}

export interface Streak {
  /** Logged days in the current streak (frozen days bridge gaps but don't add to the count). */
  days: number;
  /** Something is logged today. Today never breaks a streak before it's over. */
  loggedToday: boolean;
  /** Today is a skipped or paused day, so there's nothing to nudge about. */
  restingToday: boolean;
  /** Missed days a card covered automatically, newest first. */
  frozen: string[];
  /** Cards still in this calendar month's pool. */
  cardsLeft: number;
}

/** The day before a YYYY-MM-DD date, in plain calendar terms (no time zones). */
function previousDay(date: string) {
  const [y, m, d] = date.split("-").map(Number) as [number, number, number];
  const prev = new Date(Date.UTC(y, m - 1, d - 1));
  return prev.toISOString().slice(0, 10);
}

const monthOf = (date: string) => date.slice(0, 7);

/**
 * Walk back from today counting logged days. A missed day uses a card from that month's pool
 * (minus cards spent on earlier meals), but only if an earlier logged day follows; cards are
 * never used on a gap the streak doesn't survive. Rest days (skipped or paused) bridge for free.
 */
export function streak(
  loggedDates: readonly string[],
  today: string,
  isRest: (date: string) => boolean = () => false,
  spends: readonly CardSpend[] = [],
): Streak {
  const spentIn = (month: string) => spends.filter((c) => monthOf(c.spentOn) === month).length;
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
    } else if (isRest(cursor)) {
      // Bridges the gap without counting or spending a freeze.
    } else {
      const month = monthOf(cursor);
      const spent = (used.get(month) ?? 0) + pending.filter((p) => monthOf(p) === month).length;
      if (spent + spentIn(month) >= CARDS_PER_MONTH) break;
      pending.push(cursor);
    }
    cursor = previousDay(cursor);
  }

  return {
    days,
    loggedToday,
    restingToday: !loggedToday && isRest(today),
    frozen,
    cardsLeft: Math.max(
      0,
      CARDS_PER_MONTH - spentIn(monthOf(today)) - (used.get(monthOf(today)) ?? 0),
    ),
  };
}

/** The days "Log an earlier meal" can reach: yesterday back to BACKFILL_DAYS ago, newest first. */
export function backfillDays(today: string): string[] {
  const days: string[] = [];
  let d = today;
  for (let i = 0; i < BACKFILL_DAYS; i++) days.push((d = previousDay(d)));
  return days;
}
