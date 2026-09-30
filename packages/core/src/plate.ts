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

  const p1 = pick(proteins, seed);
  if (p1) plate.push({ item: p1, qty: qtyFor(p1, target.protein * 0.65, "protein") });

  const c1 = pick(carbs, seed + 1);
  if (c1) plate.push({ item: c1, qty: qtyFor(c1, target.carbs * 0.6, "carbs") });

  const v1 = pick(vegs, seed + 2);
  if (v1) plate.push({ item: v1, qty: 2 });

  // top up protein if short
  let t = totals(plate);
  if (t.protein < target.protein * 0.85 && proteins.length > 1) {
    const p2 = pick(
      proteins.filter((i) => i.id !== p1?.id),
      seed + 3,
    );
    if (p2) plate.push({ item: p2, qty: qtyFor(p2, target.protein - t.protein, "protein") });
  }

  t = totals(plate);
  if (t.kcal < target.kcal * 0.85) {
    const e1 = pick(extras, seed + 4);
    if (e1) plate.push({ item: e1, qty: qtyFor(e1, target.kcal - t.kcal, "kcal") });
  }

  return plate;
}

/** Find a macro-equivalent alternative in the same hall/role. */
export function swapItem(
  menu: readonly MenuItem[],
  current: PlateItem,
  hall: HallId,
  meal: MealPeriod,
  diets: DietTag[],
): PlateItem {
  const pool = availableItems(menu, hall, meal, diets).filter(
    (i) => i.role === current.item.role && i.id !== current.item.id,
  );
  if (!pool.length) return current;

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
  return { item: best, qty: bestQty };
}
