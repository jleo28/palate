import type { MacroTargets } from "./macros";
import type { DietTag, HallId, MealPeriod, MenuItem, PlateItem } from "./types";

export function availableItems(
  menu: readonly MenuItem[],
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
) {
  return menu.filter(
    (i) => i.hall === hall && i.meals.includes(meal) && diets.every((d) => i.tags.includes(d)),
  );
}

function pick<T>(arr: T[], seed: number): T | undefined {
  if (!arr.length) return undefined;
  return arr[seed % arr.length];
}

function qtyFor(item: MenuItem, targetGrams: number, macro: "protein" | "carbs" | "kcal") {
  const per = macro === "kcal" ? item.kcal : item[macro];
  if (per <= 0) return 1;
  return Math.min(4, Math.max(1, Math.round(targetGrams / per)));
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

/** Build a balanced plate: protein anchor, carb, veg, optional extra. */
export function buildPlate(
  menu: readonly MenuItem[],
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
  target: MacroTargets,
  seed = 0,
): PlateItem[] {
  const pool = availableItems(menu, hall, meal, diets);
  const proteins = pool.filter((i) => i.role === "protein").sort((a, b) => b.protein - a.protein);
  const carbs = pool.filter((i) => i.role === "carb");
  const vegs = pool.filter((i) => i.role === "veg");
  const extras = pool.filter((i) => i.role === "extra");

  const plate: PlateItem[] = [];
  const add = (item: MenuItem, qty: number) => plate.push({ id: `row-${plate.length}`, item, qty });

  const p1 = pick(proteins, seed);
  if (p1) add(p1, qtyFor(p1, target.protein * 0.65, "protein"));

  const c1 = pick(carbs, seed + 1);
  if (c1) add(c1, qtyFor(c1, target.carbs * 0.6, "carbs"));

  const v1 = pick(vegs, seed + 2);
  if (v1) add(v1, 2);

  // top up protein if short
  let t = totals(plate);
  if (t.protein < target.protein * 0.85 && proteins.length > 1) {
    const p2 = pick(
      proteins.filter((i) => i.id !== p1?.id),
      seed + 3,
    );
    if (p2) add(p2, qtyFor(p2, target.protein - t.protein, "protein"));
  }

  t = totals(plate);
  if (t.kcal < target.kcal * 0.85) {
    const e1 = pick(extras, seed + 4);
    if (e1) add(e1, qtyFor(e1, target.kcal - t.kcal, "kcal"));
  }

  return plate;
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

  const onPlate = new Set(plate.map((row) => row.item.id));
  const pool = availableItems(menu, hall, meal, diets).filter(
    (i) => i.role === current.item.role && !onPlate.has(i.id),
  );
  if (!pool.length) return [...plate];

  const { item, qty } = closestMatch(current, pool);
  return replace(plate, rowId, (row) => ({ id: row.id, item, qty }));
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
  return replace(plate, rowId, (row) => ({ id: row.id, item, qty: closestMatch(row, [item]).qty }));
}

/** Set a row's portions, clamped to 1–MAX_QTY. */
export function setQty(plate: readonly PlateItem[], rowId: string, qty: number): PlateItem[] {
  const clamped = Math.min(MAX_QTY, Math.max(1, Math.round(qty)));
  return replace(plate, rowId, (row) => ({ ...row, qty: clamped }));
}

export function removeRow(plate: readonly PlateItem[], rowId: string): PlateItem[] {
  return plate.filter((row) => row.id !== rowId);
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
  const snack: PlateItem[] = [{ id: "row-0", item: first, qty: portion(first, aim) }];

  const left = target.kcal - totals(snack).kcal;
  // A piece of fruit rounds out a snack best; otherwise the most protein that fits.
  const isFruit = (i: MenuItem) => /fruit/i.test(i.station);
  const second = choices
    .filter((i) => i.role !== first.role && i.kcal <= left * 1.15)
    .sort((a, b) => Number(isFruit(b)) - Number(isFruit(a)) || b.protein - a.protein)[0];
  if (second && left >= 60) snack.push({ id: "row-1", item: second, qty: 1 });
  return snack;
}
