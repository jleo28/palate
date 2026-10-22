import type { MacroTargets } from "./macros";
import type { DietTag, HallId, MealPeriod, MenuItem, PlateItem } from "./types";

export function availableItems(
  menu: readonly MenuItem[],
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
) {
  return menu.filter(
    (i) =>
      i.hall === hall &&
      i.meals.includes(meal) &&
      i.kind !== "component" &&
      diets.every((d) => i.tags.includes(d)),
  );
}

export function totals(plate: PlateItem[]): MacroTargets {
  return plate.reduce(
    (acc, p) => ({
      kcal: acc.kcal + p.item.kcal * p.qty,
      protein: acc.protein + p.item.protein * p.qty,
      carbs: acc.carbs + p.item.carbs * p.qty,
      fat: acc.fat + p.item.fat * p.qty,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

/** Recommender tuning. A plate aims to land inside these bands around the meal's budget. */
export const PLATE_KCAL_TOLERANCE = 0.1;
export const PLATE_FAT_TOLERANCE = 0.25;
/** Veg sides and fruit (extras) top out at this many servings each. */
export const MAX_SIDE_SERVINGS = 1.5;

const MAIN_QTYS = [1, 2, 3, 4];
const SECOND_PROTEIN_QTYS = [1, 2];
const SIDE_QTYS = [1, MAX_SIDE_SERVINGS];

const rel = (value: number, goal: number) => (goal > 0 ? (value - goal) / goal : 0);

/** Inside its band a miss costs little; outside, it costs a lot more for every extra percent. */
const band = (miss: number, tolerance: number, weight: number) => {
  const m = Math.abs(miss);
  return m <= tolerance ? (m / tolerance) * weight * 0.2 : weight * (0.2 + (m - tolerance) * 10);
};

/** How far a plate is from a meal's budget. Lower is better. */
export function plateScore(t: MacroTargets, target: MacroTargets, rows: number) {
  return (
    band(rel(t.kcal, target.kcal), PLATE_KCAL_TOLERANCE, 3) +
    band(rel(t.fat, target.fat), PLATE_FAT_TOLERANCE, 2) +
    Math.abs(rel(t.protein, target.protein)) * 1.5 +
    Math.abs(rel(t.carbs, target.carbs)) * 0.5 +
    // A small cost per row keeps plates simple, with no filler.
    rows * 0.03
  );
}

type Portion = { item: MenuItem; qty: number };

/** Each option for one slot of the plate: every item at every allowed quantity. */
const options = (items: readonly MenuItem[], qtys: number[]): Portion[] =>
  items.flatMap((item) => qtys.map((qty) => ({ item, qty })));

/**
 * Build a balanced plate: a protein, a carb and a veg (whichever the hall serves), with an
 * optional second protein and piece of fruit. Every combination is scored on calories, fat,
 * protein and carbs together, and the seed rotates between the near-best plates.
 */
export function buildPlate(
  menu: readonly MenuItem[],
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
  target: MacroTargets,
  seed = 0,
): PlateItem[] {
  const pool = availableItems(menu, hall, meal, diets);
  if (!pool.length) return [];
  const byRole = (role: MenuItem["role"]) => pool.filter((i) => i.role === role);
  const proteins = byRole("protein");

  // A slot the hall can't fill is simply skipped. Optional slots include "nothing".
  const slot = (
    items: readonly MenuItem[],
    qtys: number[],
    optional = false,
  ): (Portion | null)[] => {
    const opts = options(items, qtys);
    return opts.length ? (optional ? [null, ...opts] : opts) : [null];
  };
  const mains = slot(proteins, MAIN_QTYS);
  const carbs = slot(byRole("carb"), MAIN_QTYS);
  const vegs = slot(byRole("veg"), SIDE_QTYS);
  const extras = slot(byRole("extra"), SIDE_QTYS, true);

  const scored: { picks: Portion[]; score: number }[] = [];
  for (const p1 of mains) {
    const seconds = slot(
      proteins.filter((i) => i.id !== p1?.item.id),
      SECOND_PROTEIN_QTYS,
      true,
    );
    for (const p2 of p1 ? seconds : [null]) {
      for (const c of carbs) {
        for (const v of vegs) {
          for (const e of extras) {
            const picks = [p1, p2, c, v, e].filter((x): x is Portion => x !== null);
            if (!picks.length) continue;
            const t = totals(picks.map((x, n) => ({ id: String(n), ...x })));
            scored.push({ picks, score: plateScore(t, target, picks.length) });
          }
        }
      }
    }
  }
  if (!scored.length) return [];

  scored.sort((a, b) => a.score - b.score);
  // Near-best plates with different foods, so the seed (swipe) shows real alternatives.
  const best = scored[0]!.score;
  const seen = new Set<string>();
  const choices = scored.filter(({ picks, score }) => {
    if (score > best * 1.25 + 0.1) return false;
    const key = picks
      .map((x) => x.item.id)
      .sort()
      .join();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const chosen = choices[seed % choices.length]!;
  return chosen.picks.map((x, n) => ({
    id: `row-${n}`,
    item: x.item,
    qty: x.qty,
    suggested: x.qty,
  }));
}

export const MAX_QTY = 6;

/** How closely `qty` portions of `cand` match a calorie and protein target. Lower is better. */
function portionScore(cand: MenuItem, qty: number, kcal: number, protein: number) {
  return Math.abs(cand.kcal * qty - kcal) / 25 + Math.abs(cand.protein * qty - protein) / 4;
}

/** The candidate and portion (1–4) that best match what a row currently provides. */
function closestMatch(current: PlateItem, pool: readonly MenuItem[]) {
  const kcal = current.item.kcal * current.qty;
  const protein = current.item.protein * current.qty;
  let best = { item: pool[0]!, qty: 1, score: Infinity };
  for (const cand of pool) {
    for (let q = 1; q <= 4; q++) {
      const score = portionScore(cand, q, kcal, protein);
      if (score < best.score) best = { item: cand, qty: q, score };
    }
  }
  return best;
}

const replace = (plate: readonly PlateItem[], rowId: string, fn: (row: PlateItem) => PlateItem) =>
  plate.map((row) => (row.id === rowId ? fn(row) : row));

function swapPool(
  menu: readonly MenuItem[],
  plate: readonly PlateItem[],
  current: PlateItem,
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
): MenuItem[] {
  const onPlate = new Set(plate.map((row) => row.item.id));
  return availableItems(menu, hall, meal, diets).filter(
    (i) => i.role === current.item.role && !onPlate.has(i.id),
  );
}

/** Whether Swap has anything to swap to, so the button can hide when it would do nothing. */
export function canSwap(
  menu: readonly MenuItem[],
  plate: readonly PlateItem[],
  rowId: string,
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
): boolean {
  const current = plate.find((row) => row.id === rowId);
  return !!current && swapPool(menu, plate, current, hall, meal, diets).length > 0;
}

/**
 * Swap one row for a macro-equivalent alternative in the same hall and role.
 * Never picks an item that's already on the plate, so rows can't collide.
 */
export function swapItem(
  menu: readonly MenuItem[],
  plate: readonly PlateItem[],
  rowId: string,
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
): PlateItem[] {
  const current = plate.find((row) => row.id === rowId);
  if (!current) return [...plate];

  const pool = swapPool(menu, plate, current, hall, meal, diets);
  if (!pool.length) return [...plate];

  const { item, qty } = closestMatch(current, pool);
  return replace(plate, rowId, (row) => ({ id: row.id, item, qty, suggested: qty }));
}

/** Items that could replace a row: same station and role, not already on the plate. */
export function alternatives(
  menu: readonly MenuItem[],
  plate: readonly PlateItem[],
  rowId: string,
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
): MenuItem[] {
  const current = plate.find((row) => row.id === rowId);
  if (!current) return [];
  const onPlate = new Set(plate.map((row) => row.item.id));
  return availableItems(menu, hall, meal, diets)
    .filter(
      (i) =>
        i.station === current.item.station && i.role === current.item.role && !onPlate.has(i.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

/** Put a chosen item in a row, portioned to roughly match what the row provided. */
export function replaceRow(
  plate: readonly PlateItem[],
  rowId: string,
  item: MenuItem,
): PlateItem[] {
  return replace(plate, rowId, (row) => {
    const { qty } = closestMatch(row, [item]);
    return { id: row.id, item, qty, suggested: qty };
  });
}

/** Set a row's portions, clamped to 0–MAX_QTY. A row at 0 stays on the plate but counts for nothing. */
export function setQty(plate: readonly PlateItem[], rowId: string, qty: number): PlateItem[] {
  const clamped = Math.min(MAX_QTY, Math.max(0, qty));
  return replace(plate, rowId, (row) => ({ ...row, qty: clamped }));
}

/** Add a menu item to a plate: one more portion if it's already there, else a new row. */
export function addItem(plate: readonly PlateItem[], item: MenuItem): PlateItem[] {
  const existing = plate.find((row) => row.item.id === item.id);
  if (existing) return setQty(plate, existing.id, existing.qty + 1);
  const ids = new Set(plate.map((row) => row.id));
  let n = plate.length;
  while (ids.has(`row-${n}`)) n++;
  return [...plate, { id: `row-${n}`, item, qty: 1 }];
}

export function removeRow(plate: readonly PlateItem[], rowId: string): PlateItem[] {
  return plate.filter((row) => row.id !== rowId);
}

/** Undo a removal: put the row back where it was, with its portion. No-op if it's already there. */
export function restoreRow(
  plate: readonly PlateItem[],
  row: PlateItem,
  index: number,
): PlateItem[] {
  if (plate.some((r) => r.id === row.id)) return [...plate];
  const at = Math.min(Math.max(0, index), plate.length);
  return [...plate.slice(0, at), row, ...plate.slice(at)];
}

/** Station names (ours and USC's) where food is easy to grab and carry out. */
const GRAB_AND_GO = /fruit|salad|breakfast|deli|expo|grab|yogurt|sweet/i;

/**
 * A light snack: one item portioned to most of the snack's calories, plus a small second item
 * of a different kind when there's room. Drawn from a hall meal's menu (fruit, yogurt, eggs…).
 */
export function buildSnack(
  menu: readonly MenuItem[],
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
  target: MacroTargets,
  seed = 0,
): PlateItem[] {
  // Snacks skip full carb sides (rice, pasta): they're meal anchors, not snacks.
  const pool = availableItems(menu, hall, meal, diets).filter(
    (i) => i.role !== "carb" && i.kcal <= target.kcal,
  );
  if (!pool.length || target.kcal <= 0) return [];

  // Prefer grab-and-go items from cold stations (fruit, salad bar, breakfast line, deli):
  // berries, edamame, a boiled egg. Hot-line entrées and sides are only a fallback.
  const portable = pool.filter((i) => GRAB_AND_GO.test(i.station));
  const choices = portable.length ? portable : pool;

  const aim = target.kcal * 0.7;
  const portion = (i: MenuItem, kcal: number) =>
    Math.min(2, Math.max(1, Math.round(kcal / i.kcal)));
  const ranked = [...choices].sort(
    (a, b) => Math.abs(a.kcal * portion(a, aim) - aim) - Math.abs(b.kcal * portion(b, aim) - aim),
  );
  const first = ranked[seed % Math.min(3, ranked.length)]!;
  const firstQty = portion(first, aim);
  const snack: PlateItem[] = [{ id: "row-0", item: first, qty: firstQty, suggested: firstQty }];

  const left = target.kcal - totals(snack).kcal;
  // A piece of fruit rounds out a snack best; otherwise the most protein that fits.
  const isFruit = (i: MenuItem) => /fruit/i.test(i.station);
  const second = choices
    .filter((i) => i.role !== first.role && i.kcal <= left * 1.15)
    .sort((a, b) => Number(isFruit(b)) - Number(isFruit(a)) || b.protein - a.protein)[0];
  if (second && left >= 60) snack.push({ id: "row-1", item: second, qty: 1, suggested: 1 });
  return snack;
}
