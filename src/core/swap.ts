import type { Macros, MenuItem, Plate, PlateLine, Role } from "./types";
import { portionLabel } from "./portion";
import { buildWhy } from "./why";
import { PROTEIN_SERVINGS, CARB_SERVINGS, SIDE_SERVINGS } from "./servings";

const SERVINGS_BY_ROLE: Record<Role, number[]> = {
  protein: PROTEIN_SERVINGS,
  carb: CARB_SERVINGS,
  veg: SIDE_SERVINGS,
  extra: SIDE_SERVINGS,
  dessert: SIDE_SERVINGS,
};

const MAX_SWAP_OPTIONS = 4;

export interface SwapOption {
  item: MenuItem;
  servings: number;
  portionLabel: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  deltaKcal: number;
  deltaProtein: number;
  plate: Plate;
}

function lineMacros(line: PlateLine): Macros {
  return { kcal: line.kcal, protein: line.protein, carbs: line.carbs, fat: line.fat };
}

function sumMacros(list: Macros[]): Macros {
  return list.reduce(
    (acc, m) => ({ kcal: acc.kcal + m.kcal, protein: acc.protein + m.protein, carbs: acc.carbs + m.carbs, fat: acc.fat + m.fat }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function scoreAgainstTarget(totals: Macros, target: Macros): number {
  const safe = (n: number) => (n === 0 ? 1 : n);
  return (
    Math.abs(totals.kcal - target.kcal) / safe(target.kcal) +
    1.5 * Math.max(0, target.protein - totals.protein) / safe(target.protein) +
    0.5 * Math.abs(totals.carbs - target.carbs) / safe(target.carbs) +
    0.5 * Math.abs(totals.fat - target.fat) / safe(target.fat)
  );
}

function isOnTarget(totals: Macros, target: Macros): boolean {
  return Math.abs(totals.kcal - target.kcal) <= 0.1 * target.kcal && totals.protein >= 0.9 * target.protein;
}

/**
 * Re-solves a single plate line, holding every other line fixed and excluding the
 * item being swapped out. Filtering has already happened upstream: eligibleItems
 * must already reflect diet and allergen exclusions.
 */
export function swapItem(plate: Plate, itemId: string, eligibleItems: MenuItem[]): SwapOption[] {
  const currentLine = plate.lines.find((l) => l.itemId === itemId);
  if (!currentLine) return [];

  const currentItem = eligibleItems.find((i) => i.id === itemId);
  const role = currentItem?.role;
  if (!role) return [];

  const otherLines = plate.lines.filter((l) => l.itemId !== itemId);
  const otherIds = new Set(otherLines.map((l) => l.itemId));
  const otherTotals = sumMacros(otherLines.map(lineMacros));

  const servingOptions = SERVINGS_BY_ROLE[role];
  const pool = eligibleItems.filter((i) => i.role === role && i.id !== itemId && !otherIds.has(i.id) && i.role !== "dessert");

  interface Scored {
    item: MenuItem;
    servings: number;
    totals: Macros;
    score: number;
  }

  const scored: Scored[] = [];
  for (const item of pool) {
    let best: Scored | null = null;
    for (const servings of servingOptions) {
      const line: Macros = {
        kcal: item.kcal * servings,
        protein: item.protein * servings,
        carbs: item.carbs * servings,
        fat: item.fat * servings,
      };
      const totals = sumMacros([otherTotals, line]);
      const score = scoreAgainstTarget(totals, plate.target);
      if (!best || score < best.score) {
        best = { item, servings, totals, score };
      }
    }
    if (best) scored.push(best);
  }

  scored.sort((a, b) => {
    const diff = a.score - b.score;
    if (Math.abs(diff) > 1e-9) return diff;
    return a.item.id.localeCompare(b.item.id);
  });

  return scored.slice(0, MAX_SWAP_OPTIONS).map((s) => {
    const newLine: PlateLine = {
      itemId: s.item.id,
      servings: s.servings,
      portionLabel: portionLabel(s.servings, s.item.servingUnit),
      kcal: Math.round(s.item.kcal * s.servings),
      protein: Math.round(s.item.protein * s.servings),
      carbs: Math.round(s.item.carbs * s.servings),
      fat: Math.round(s.item.fat * s.servings),
    };
    const lines = [...otherLines, newLine];
    const totals = sumMacros(lines.map(lineMacros));

    const proteinLine = lines.find((l) => eligibleItems.find((i) => i.id === l.itemId)?.role === "protein");
    const carbLine = lines.find((l) => eligibleItems.find((i) => i.id === l.itemId)?.role === "carb");
    const proteinItem = proteinLine ? eligibleItems.find((i) => i.id === proteinLine.itemId) ?? null : null;
    const carbItem = carbLine ? eligibleItems.find((i) => i.id === carbLine.itemId) ?? null : null;

    const newPlate: Plate = {
      lines,
      totals,
      target: plate.target,
      score: s.score,
      onTarget: isOnTarget(totals, plate.target),
      notes: plate.notes,
      why: buildWhy(proteinItem, proteinLine?.protein ?? 0, carbItem, totals, plate.target),
    };
    return {
      item: s.item,
      servings: s.servings,
      portionLabel: newLine.portionLabel,
      kcal: newLine.kcal,
      protein: newLine.protein,
      carbs: newLine.carbs,
      fat: newLine.fat,
      deltaKcal: totals.kcal - plate.totals.kcal,
      deltaProtein: totals.protein - plate.totals.protein,
      plate: newPlate,
    };
  });
}
