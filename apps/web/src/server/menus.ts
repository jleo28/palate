import {
  USC_VENUES,
  bestMatch,
  estimateFromFdc,
  parseUscDay,
  type HallId,
  type MenuItem,
  type NutritionEstimate,
  type ParsedItem,
  type UscDay,
} from "@palate/core";
import saved from "./nutrition-estimates.json";
import { searchFnnds } from "./usda";

const FEED = "https://hospitality.usc.edu/wp-json/hsp-api/v1/get-res-dining-menus";
// Identifies us to USC Hospitality, per docs/spikes/usc-menus.md.
const USER_AGENT = `PalateMenuBot/1.0 (+https://palateusc.vercel.app${
  process.env["MENU_BOT_CONTACT"] ? `; ${process.env["MENU_BOT_CONTACT"]}` : ""
})`;

/**
 * Estimates written ahead of time, keyed by item key: for dishes USDA can't match confidently,
 * and team corrections. See scripts/menu-estimates.ts.
 */
const SAVED = saved as Record<string, NutritionEstimate>;

/** Fetch one hall's day from USC Hospitality. */
export async function fetchUscDay(hall: HallId, date: string): Promise<UscDay> {
  const [y, m, d] = date.split("-");
  const url = `${FEED}/${USC_VENUES[hall]}?y=${y}&m=${m}&d=${d}`;
  const res = await fetch(url, { headers: { "User-Agent": USER_AGENT } });
  if (!res.ok) throw new Error(`USC menu ${res.status} for ${hall} ${date}`);
  return (await res.json()) as UscDay;
}

/** Last resort when USDA has nothing at all: a plain generic portion by kind. */
const GENERIC: Record<"dish" | "component", NutritionEstimate> = {
  dish: {
    kcal: 250,
    protein: 12,
    carbs: 25,
    fat: 10,
    unit: "serving",
    unitPlural: "servings",
    role: "protein",
    source: "usda",
  },
  component: {
    kcal: 60,
    protein: 1,
    carbs: 5,
    fat: 4,
    unit: "serving",
    unitPlural: "servings",
    role: "extra",
    source: "usda",
  },
};

/**
 * Nutrition for one dish: a saved estimate if there is one, else USDA's confident match, else
 * USDA's closest entry. Never "not yet estimated".
 */
export async function estimateFor(
  item: ParsedItem,
): Promise<{ estimate: NutritionEstimate; confident: boolean }> {
  const savedEstimate = SAVED[item.key];
  if (savedEstimate) return { estimate: savedEstimate, confident: true };
  const foods = await searchFnnds(item.matchName);
  const match = bestMatch(item.matchName, foods);
  if (match) return { estimate: estimateFromFdc(match), confident: true };
  const closest = foods[0];
  return { estimate: closest ? estimateFromFdc(closest) : GENERIC[item.kind], confident: false };
}

const slug = (s: string) => s.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** One hall's menu for a day, ready for the app. */
export async function hallMenu(hall: HallId, date: string): Promise<MenuItem[]> {
  const parsed = parseUscDay(await fetchUscDay(hall, date), hall);
  const results = await mapLimit(parsed, 6, async (item) => {
    const { estimate } = await estimateFor(item);
    const menuItem: MenuItem = {
      id: `${hall}-${slug(item.key)}`,
      name: item.name,
      hall,
      station: item.station,
      role: estimate.role,
      meals: item.meals,
      unit: estimate.unit,
      unitPlural: estimate.unitPlural,
      kcal: estimate.kcal,
      protein: estimate.protein,
      carbs: estimate.carbs,
      fat: estimate.fat,
      tags: item.tags,
      allergens: item.allergens,
      kind: item.kind,
      ...(item.allergensUnknown ? { allergensUnknown: true } : {}),
    };
    return menuItem;
  });
  return results;
}

/** Run `fn` over `items` with at most `limit` in flight, keeping order. */
export async function mapLimit<T, R>(items: readonly T[], limit: number, fn: (t: T) => Promise<R>) {
  const out: R[] = new Array(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      out[i] = await fn(items[i]!);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return out;
}

/** Dishes on a hall's day that USDA can't match confidently and have no saved estimate yet. */
export async function unmatched(hall: HallId, date: string) {
  const parsed = parseUscDay(await fetchUscDay(hall, date), hall);
  const out: { key: string; name: string; station: string; kind: string; closest?: string }[] = [];
  await mapLimit(parsed, 6, async (item) => {
    if (SAVED[item.key]) return;
    const foods = await searchFnnds(item.matchName);
    if (bestMatch(item.matchName, foods)) return;
    out.push({
      key: item.key,
      name: item.name,
      station: item.station,
      kind: item.kind,
      ...(foods[0] ? { closest: foods[0].description } : {}),
    });
  });
  return out.sort((a, b) => a.key.localeCompare(b.key));
}
