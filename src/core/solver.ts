import type { Macros, MenuItem, Plate, PlateLine } from "./types";
import { topByProteinPerKcal } from "./rank";
import { portionLabel } from "./portion";
import { buildWhy } from "./why";
import { PROTEIN_SERVINGS, CARB_SERVINGS } from "./servings";

const TOP_PROTEIN = 8;
const TOP_CARB = 6;
const TOP_VEG = 6;
const TOP_EXTRA = 5;

const LEADERBOARD_SIZE = 30;

interface Choice {
  item: MenuItem;
  servings: number;
}

interface Candidate {
  protein: Choice | null;
  carb: Choice | null;
  veg: Choice[];
  extra: Choice | null;
  score: number;
  totals: Macros;
}

const round = (n: number) => Math.round(n);

function choiceMacros(choice: Choice): Macros {
  return {
    kcal: choice.item.kcal * choice.servings,
    protein: choice.item.protein * choice.servings,
    carbs: choice.item.carbs * choice.servings,
    fat: choice.item.fat * choice.servings,
  };
}

function scoreCombo(
  totals: Macros,
  target: Macros,
  lineCount: number,
  proteinId: string | null,
  usedProteinIds: Set<string>
): number {
  const safe = (n: number) => (n === 0 ? 1 : n);
  let s = 0;
  s += (1.0 * Math.abs(totals.kcal - target.kcal)) / safe(target.kcal);
  s += (1.5 * Math.max(0, target.protein - totals.protein)) / safe(target.protein);
  s += (0.3 * Math.max(0, totals.protein - 1.3 * target.protein)) / safe(target.protein);
  s += (0.5 * Math.abs(totals.carbs - target.carbs)) / safe(target.carbs);
  s += (0.5 * Math.abs(totals.fat - target.fat)) / safe(target.fat);
  s += 0.15 * (proteinId !== null && usedProteinIds.has(proteinId) ? 1 : 0);
  s += 0.05 * Math.max(0, lineCount - 3);
  return s;
}

function vegCombos(vegs: MenuItem[]): Choice[][] {
  const combos: Choice[][] = [];
  for (let i = 0; i < vegs.length; i++) {
    combos.push([{ item: vegs[i], servings: 1 }]);
  }
  for (let i = 0; i < vegs.length; i++) {
    for (let j = i + 1; j < vegs.length; j++) {
      combos.push([
        { item: vegs[i], servings: 1 },
        { item: vegs[j], servings: 1 },
      ]);
    }
  }
  return combos;
}

function insertIntoLeaderboard(board: Candidate[], candidate: Candidate): void {
  if (board.length < LEADERBOARD_SIZE) {
    board.push(candidate);
    board.sort((a, b) => a.score - b.score);
    return;
  }
  if (candidate.score < board[board.length - 1].score) {
    board[board.length - 1] = candidate;
    board.sort((a, b) => a.score - b.score);
  }
}

function candidateLines(candidate: Candidate): PlateLine[] {
  const lines: PlateLine[] = [];
  const push = (choice: Choice | null) => {
    if (!choice) return;
    const m = choiceMacros(choice);
    lines.push({
      itemId: choice.item.id,
      servings: choice.servings,
      portionLabel: portionLabel(choice.servings, choice.item.servingUnit),
      kcal: round(m.kcal),
      protein: round(m.protein),
      carbs: round(m.carbs),
      fat: round(m.fat),
    });
  };
  push(candidate.protein);
  push(candidate.carb);
  for (const v of candidate.veg) push(v);
  push(candidate.extra);
  return lines;
}

function totalsFromLines(lines: PlateLine[]): Macros {
  return lines.reduce(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      protein: acc.protein + l.protein,
      carbs: acc.carbs + l.carbs,
      fat: acc.fat + l.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

function isOnTarget(totals: Macros, target: Macros): boolean {
  return Math.abs(totals.kcal - target.kcal) <= 0.1 * target.kcal && totals.protein >= 0.9 * target.protein;
}

function buildPlate(candidate: Candidate, target: Macros): Plate {
  const lines = candidateLines(candidate);
  const totals = totalsFromLines(lines);
  const notes: string[] = [];
  if (!candidate.protein) notes.push("No protein option fits your filters for this meal today.");
  if (!candidate.carb) notes.push("No carb option fits your filters for this meal today.");
  if (candidate.veg.length === 0) notes.push("No veg option fits your filters for this meal today.");
  const onTarget = isOnTarget(totals, target);
  if (!onTarget && notes.length === 0) {
    if (totals.protein < 0.9 * target.protein) {
      notes.push("Short of the protein target with today's options. Consider a swap or a side at another station.");
    } else {
      notes.push("A little off the calorie target today, but the closest fit available.");
    }
  }
  const proteinGrams = candidate.protein ? candidate.protein.item.protein * candidate.protein.servings : 0;

  return {
    lines,
    totals,
    target,
    score: candidate.score,
    onTarget,
    notes,
    why: buildWhy(candidate.protein?.item ?? null, proteinGrams, candidate.carb?.item ?? null, totals, target),
  };
}

export interface SolveResult {
  plate: Plate;
  alternatives: Plate[];
}

/** Pure, deterministic brute-force plate solver. Same inputs always produce the same output. */
export function solvePlate(
  eligibleItems: MenuItem[],
  target: Macros,
  usedProteinIds: Set<string> = new Set()
): SolveResult {
  const items = eligibleItems.filter((i) => i.role !== "dessert");

  const proteinItems = topByProteinPerKcal(items, "protein", TOP_PROTEIN);
  const carbItems = topByProteinPerKcal(items, "carb", TOP_CARB);
  const vegItems = topByProteinPerKcal(items, "veg", TOP_VEG);
  const extraItems = topByProteinPerKcal(items, "extra", TOP_EXTRA);

  const proteinOptions: (Choice | null)[] =
    proteinItems.length === 0
      ? [null]
      : proteinItems.flatMap((item) => PROTEIN_SERVINGS.map((servings) => ({ item, servings })));

  const carbOptions: (Choice | null)[] =
    carbItems.length === 0
      ? [null]
      : carbItems.flatMap((item) => CARB_SERVINGS.map((servings) => ({ item, servings })));

  const vegOptions: Choice[][] = vegItems.length === 0 ? [[]] : vegCombos(vegItems);

  const extraOptions: (Choice | null)[] = [null, ...extraItems.map((item) => ({ item, servings: 1 }))];

  const board: Candidate[] = [];

  for (const protein of proteinOptions) {
    for (const carb of carbOptions) {
      for (const veg of vegOptions) {
        for (const extra of extraOptions) {
          const lineCount = (protein ? 1 : 0) + (carb ? 1 : 0) + veg.length + (extra ? 1 : 0);

          let kcal = 0;
          let proteinG = 0;
          let carbs = 0;
          let fat = 0;
          if (protein) {
            kcal += protein.item.kcal * protein.servings;
            proteinG += protein.item.protein * protein.servings;
            carbs += protein.item.carbs * protein.servings;
            fat += protein.item.fat * protein.servings;
          }
          if (carb) {
            kcal += carb.item.kcal * carb.servings;
            proteinG += carb.item.protein * carb.servings;
            carbs += carb.item.carbs * carb.servings;
            fat += carb.item.fat * carb.servings;
          }
          for (const v of veg) {
            kcal += v.item.kcal * v.servings;
            proteinG += v.item.protein * v.servings;
            carbs += v.item.carbs * v.servings;
            fat += v.item.fat * v.servings;
          }
          if (extra) {
            kcal += extra.item.kcal * extra.servings;
            proteinG += extra.item.protein * extra.servings;
            carbs += extra.item.carbs * extra.servings;
            fat += extra.item.fat * extra.servings;
          }

          const totals: Macros = { kcal, protein: proteinG, carbs, fat };
          const proteinId = protein?.item.id ?? null;
          const s = scoreCombo(totals, target, lineCount, proteinId, usedProteinIds);
          insertIntoLeaderboard(board, { protein, carb, veg, extra, score: s, totals });
        }
      }
    }
  }

  const best = board[0];
  const plate = buildPlate(best, target);

  const alternatives: Plate[] = [];
  const seenProteinIds = new Set<string>([best.protein?.item.id ?? "__none__"]);
  for (const candidate of board.slice(1)) {
    const proteinId = candidate.protein?.item.id ?? "__none__";
    if (seenProteinIds.has(proteinId)) continue;
    seenProteinIds.add(proteinId);
    alternatives.push(buildPlate(candidate, target));
    if (alternatives.length === 2) break;
  }

  return { plate, alternatives };
}
