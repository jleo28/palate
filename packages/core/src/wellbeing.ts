/**
 * Settings that let someone step back from tracking. Skipped and paused days are rest days:
 * they never break a streak or spend a freeze, and they don't count toward it either.
 */
export interface Wellbeing {
  /** Show portions only, never calories or macros. */
  hideNumbers?: boolean;
  /** YYYY-MM-DD days the user chose to skip logging. */
  skipped?: string[];
  /** Tracking pauses. `to` is the day tracking resumed; it's missing while paused. */
  pauses?: { from: string; to?: string }[];
}

export const isPaused = (w: Wellbeing | undefined) => !!w?.pauses?.some((p) => !p.to);

/** True for a skipped day, or a day inside a pause (the resume day itself counts again). */
export function isRestDay(w: Wellbeing | undefined, date: string) {
  if (!w) return false;
  if (w.skipped?.includes(date)) return true;
  return !!w.pauses?.some((p) => p.from <= date && (!p.to || date < p.to));
}

export function setSkipped(w: Wellbeing | undefined, date: string, skip: boolean): Wellbeing {
  const rest = (w?.skipped ?? []).filter((d) => d !== date);
  return { ...w, skipped: skip ? [...rest, date] : rest };
}

export function setPaused(w: Wellbeing | undefined, today: string, pause: boolean): Wellbeing {
  const pauses = w?.pauses ?? [];
  if (pause) return isPaused(w) ? { ...w } : { ...w, pauses: [...pauses, { from: today }] };
  return {
    ...w,
    pauses: pauses
      .map((p) => (p.to ? p : { ...p, to: today }))
      // A pause started and ended on the same day covers nothing, so drop it.
      .filter((p) => p.from !== p.to),
  };
}
