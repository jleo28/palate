import type { PlateItem } from "./types";

export const HISTORY_LIMIT = 10;

/** A stack of plate variations the user can swipe through. */
export interface PlateHistory {
  plates: PlateItem[][];
  index: number;
}

export const startHistory = (plate: PlateItem[]): PlateHistory => ({ plates: [plate], index: 0 });

export const currentPlate = (h: PlateHistory): PlateItem[] => h.plates[h.index] ?? [];

export const canGoBack = (h: PlateHistory) => h.index > 0;

/** Step back to the previous variation, if there is one. */
export function back(h: PlateHistory): PlateHistory {
  return canGoBack(h) ? { ...h, index: h.index - 1 } : h;
}

/**
 * Step forward: to the next variation already in the stack, or else to `fresh`
 * (a new variation), dropping the oldest once there are more than HISTORY_LIMIT.
 */
export function forward(h: PlateHistory, fresh: () => PlateItem[]): PlateHistory {
  if (h.index < h.plates.length - 1) return { ...h, index: h.index + 1 };
  const plates = [...h.plates, fresh()].slice(-HISTORY_LIMIT);
  return { plates, index: plates.length - 1 };
}

/** Apply an edit to the current variation only. */
export function editCurrent(
  h: PlateHistory,
  edit: (plate: PlateItem[]) => PlateItem[],
): PlateHistory {
  const plates = h.plates.map((p, i) => (i === h.index ? edit(p) : p));
  return { plates, index: h.index };
}
