import type { Macros, MenuItem } from "./types";

const MAX_LENGTH = 140;

function truncate(sentence: string): string {
  if (sentence.length <= MAX_LENGTH) return sentence;
  return `${sentence.slice(0, MAX_LENGTH - 1).trimEnd()}…`;
}

export function buildWhy(
  proteinItem: MenuItem | null,
  proteinGrams: number,
  carbItem: MenuItem | null,
  totals: Macros,
  target: Macros
): string {
  const proteinTarget = Math.round(target.protein);
  const proteinShort = totals.protein < 0.9 * target.protein;

  const lead = proteinItem
    ? `${proteinItem.name} covers ${Math.round(proteinGrams)} of your ${proteinTarget} g protein.`
    : "No protein option fits your filters right now.";

  let tail: string;
  if (proteinShort) {
    tail = `Short of ${proteinTarget} g protein, so another meal can help make it up.`;
  } else if (carbItem) {
    tail = `${carbItem.name} keeps this plate near ${Math.round(totals.kcal)} cal.`;
  } else {
    tail = `This plate lands near ${Math.round(totals.kcal)} cal.`;
  }

  return truncate(`${lead} ${tail}`);
}
