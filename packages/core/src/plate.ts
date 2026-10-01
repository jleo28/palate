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

  const targetKcal = current.item.kcal * current.qty;
  const targetProtein = current.item.protein * current.qty;

  let best = pool[0]!;
  let bestQty = 1;
  let bestScore = Infinity;
  for (const cand of pool) {
    for (let q = 1; q <= 4; q++) {
      const score =
        Math.abs(cand.kcal * q - targetKcal) / 25 + Math.abs(cand.protein * q - targetProtein) / 4;
      if (score < bestScore) {
        bestScore = score;
        best = cand;
        bestQty = q;
      }
    }
  }
  return plate.map((row) => (row.id === rowId ? { id: row.id, item: best, qty: bestQty } : row));
}
