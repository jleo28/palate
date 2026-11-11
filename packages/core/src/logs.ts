import { MAX_QTY } from "./plate";
import { PORTION_STEP, portionText } from "./portions";
import type { LoggedItem, LoggedMeal, PlateItem } from "./types";

const label = portionText;

/** Snapshot plate rows for the log, keeping per-portion macros so the meal can be edited. */
export function logItems(rows: readonly PlateItem[]): LoggedItem[] {
  // Rows turned down to 0 stay on the plate but aren't part of the meal.
  return rows
    .filter((r) => r.qty > 0)
    .map(({ item, qty }) => ({
      name: item.name,
      portion: label(qty, item.unit, item.unitPlural),
      qty,
      unit: item.unit,
      unitPlural: item.unitPlural,
      per: {
        kcal: item.kcal,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        ...(item.fiber !== undefined ? { fiber: item.fiber } : {}),
      },
    }));
}

/** Portions can be edited when every item kept its per-portion macros (outside meals don't). */
export const portionsEditable = (m: LoggedMeal) =>
  m.items.length > 0 && m.items.every((i) => i.per && i.qty && i.unit && i.unitPlural);

function retotal(m: LoggedMeal, items: LoggedItem[]): LoggedMeal {
  const sum = (key: "kcal" | "protein" | "carbs" | "fat" | "fiber") =>
    items.reduce((total, i) => total + (i.per?.[key] ?? 0) * (i.qty ?? 1), 0);
  return {
    ...m,
    items,
    kcal: sum("kcal"),
    protein: sum("protein"),
    carbs: sum("carbs"),
    fat: sum("fat"),
    fiber: sum("fiber"),
  };
}

/** Change one item's portions (½–MAX_QTY, in half steps) and recompute the meal's totals. */
export function setLoggedQty(m: LoggedMeal, index: number, qty: number): LoggedMeal {
  if (!portionsEditable(m)) return m;
  const q = Math.min(
    MAX_QTY,
    Math.max(PORTION_STEP, Math.round(qty / PORTION_STEP) * PORTION_STEP),
  );
  const items = m.items.map((i, n) =>
    n === index ? { ...i, qty: q, portion: label(q, i.unit!, i.unitPlural!) } : i,
  );
  return retotal(m, items);
}

/** Remove one item and recompute totals. A meal keeps at least one item. */
export function removeLoggedItem(m: LoggedMeal, index: number): LoggedMeal {
  if (!portionsEditable(m) || m.items.length <= 1) return m;
  return retotal(
    m,
    m.items.filter((_, n) => n !== index),
  );
}

/** Set a meal's totals directly, for outside meals and older logs without per-portion macros. */
export function setLoggedTotals(
  m: LoggedMeal,
  t: { kcal: number; protein: number; carbs: number; fat: number },
): LoggedMeal {
  const clean = (v: number) => Math.max(0, Math.round(v));
  return {
    ...m,
    kcal: clean(t.kcal),
    protein: clean(t.protein),
    carbs: clean(t.carbs),
    fat: clean(t.fat),
  };
}
