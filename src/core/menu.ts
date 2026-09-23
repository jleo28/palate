import type { HallId, MealPeriod, MenuFile, MenuItem } from "./types";

const DAY_MS = 24 * 60 * 60 * 1000;
const DOW_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"] as const;

function daysBetween(anchorIso: string, dateIso: string): number {
  const anchor = Date.UTC(...parseIso(anchorIso));
  const date = Date.UTC(...parseIso(dateIso));
  return Math.floor((date - anchor) / DAY_MS);
}

function parseIso(iso: string): [number, number, number] {
  const [y, m, d] = iso.split("-").map(Number);
  return [y, m - 1, d];
}

function dowKey(dateIso: string): (typeof DOW_KEYS)[number] {
  const [y, m, d] = parseIso(dateIso);
  return DOW_KEYS[new Date(Date.UTC(y, m, d)).getUTCDay()];
}

export function rotationWeek(menu: Pick<MenuFile, "rotationAnchor" | "rotationWeeks">, dateIso: string): number {
  const diff = daysBetween(menu.rotationAnchor, dateIso);
  const weeksSinceAnchor = Math.floor(diff / 7);
  const mod = ((weeksSinceAnchor % menu.rotationWeeks) + menu.rotationWeeks) % menu.rotationWeeks;
  return mod + 1;
}

export function getMenu(menu: MenuFile, hall: HallId, period: MealPeriod, dateIso: string): MenuItem[] {
  const itemsById = new Map(menu.items.map((i) => [i.id, i]));
  const everydayIds = menu.everyday[hall]?.[period] ?? [];
  const week = rotationWeek(menu, dateIso);
  const rotationKey = `w${week}-${dowKey(dateIso)}`;
  const rotationIds = menu.rotation[hall]?.[rotationKey]?.[period] ?? [];

  const seen = new Set<string>();
  const result: MenuItem[] = [];
  for (const id of [...everydayIds, ...rotationIds]) {
    if (seen.has(id)) continue;
    const item = itemsById.get(id);
    if (!item) continue;
    seen.add(id);
    result.push(item);
  }
  return result;
}
