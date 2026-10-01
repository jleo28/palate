import type { DislikeId, MenuItem } from "./types";

export const DISLIKES: { id: DislikeId; label: string; matches: RegExp }[] = [
  { id: "chicken", label: "Chicken", matches: /chicken/i },
  { id: "beef", label: "Beef", matches: /beef|carne asada|meatball/i },
  { id: "turkey", label: "Turkey", matches: /turkey/i },
  { id: "seafood", label: "Seafood", matches: /salmon|shrimp/i },
  { id: "tofu", label: "Tofu", matches: /tofu/i },
  { id: "eggs", label: "Eggs", matches: /egg/i },
  { id: "beans", label: "Beans", matches: /bean|chickpea|edamame|falafel/i },
  { id: "rice", label: "Rice", matches: /rice/i },
  { id: "pasta", label: "Pasta & noodles", matches: /pasta|penne|lo mein/i },
  { id: "potatoes", label: "Potatoes", matches: /potato|mashed/i },
  { id: "greens", label: "Greens", matches: /salad|kale|romaine|broccoli/i },
  { id: "vegetables", label: "Other vegetables", matches: /zucchini|carrot|pepper|green bean/i },
  { id: "fruit", label: "Fruit", matches: /berries|banana|honeydew/i },
  { id: "dairy", label: "Dairy foods", matches: /yogurt|cottage cheese|pizza/i },
] as const;

export function dislikedMatches(item: MenuItem, dislikes: DislikeId[] | undefined) {
  if (!dislikes?.length) return [];
  return DISLIKES.filter(
    (preference) => dislikes.includes(preference.id) && preference.matches.test(item.name),
  );
}

/** The menu without foods the user chose to skip. Plates never include skipped foods. */
export function withoutSkipped(menu: readonly MenuItem[], dislikes: DislikeId[] | undefined) {
  if (!dislikes?.length) return [...menu];
  return menu.filter((item) => dislikedMatches(item, dislikes).length === 0);
}
