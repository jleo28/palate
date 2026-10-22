/**
 * USC Hospitality's daily menu feed → Palate menu items (without nutrition). See
 * docs/spikes/usc-menus.md for the feed and the cleanup rules.
 */
import type { Allergen, DietTag, HallId, MealPeriod } from "./types";

/** The feed's venue slug for each hall. */
export const USC_VENUES: Record<HallId, string> = {
  village: "university-village",
  evk: "evk",
  parkside: "parkside",
};

/** One menu row from the feed. */
export interface UscRow {
  item: string;
  allergens?: string[];
  preferences?: string[];
}

export interface UscDay {
  date?: string;
  meals?: { name: string; stations?: { station: string; menu?: UscRow[] }[] }[];
}

/** What a dish is for planning: a plate item, or something you add to one. */
export type ItemKind = "dish" | "component";

/** A parsed menu item, before nutrition is attached. */
export interface ParsedItem {
  /** Stable across days: the cleaned, lower-cased name. Nutrition is cached by this. */
  key: string;
  /** Display name, whitespace tidied. */
  name: string;
  /** Name with USC's prefixes and brand words removed, for matching. */
  matchName: string;
  hall: HallId;
  station: string;
  meals: MealPeriod[];
  kind: ItemKind;
  tags: DietTag[];
  allergens: Allergen[];
  /** USC marked the item "not-analyzed": allergens are unknown, never safe. */
  allergensUnknown: boolean;
}

const ALLERGEN_MAP: Record<string, Allergen> = {
  dairy: "milk",
  eggs: "egg",
  gluten: "wheat",
  peanuts: "peanut",
  "tree-nuts": "tree-nut",
  soy: "soy",
  sesame: "sesame",
  fish: "fish",
  shellfish: "shellfish",
};

const tidy = (s: string) => s.replace(/\s+/g, " ").trim();

/** USC's own prefixes and brand words that say nothing about the food. */
const NOISE = [
  /^AAZ\s+/i,
  /^Molly's\s+/i,
  /^Homemade\s+/i,
  /^House\s+/i,
  /^Traditional\s+/i,
  /^Gardein\s+/i,
  /^Little Northern Bakehouse\s+/i,
  /\s+Available Upon Request$/i,
  /\s*\(.*\)\s*/g,
];

export function matchName(name: string) {
  let out = tidy(name);
  for (const re of NOISE) out = out.replace(re, " ");
  return tidy(out);
}

/** Section headers and stations-as-items: "SALAD BAR", "Make Your Own Waffle Bar". */
export function isHeader(name: string) {
  const n = tidy(name);
  if (/\b(bar|pop up|station)$/i.test(n) && n === n.toUpperCase()) return true;
  if (/^MADE TO ORDER\b/i.test(n)) return true;
  if (/^make your own\b/i.test(n)) return true;
  if (/^daily .*specials?\b/i.test(n)) return true;
  if (/available upon request$/i.test(n)) return true;
  return false;
}

/** Toppings, condiments and sides-of-a-side: shown on menus, never put on a generated plate. */
const COMPONENT_WORDS =
  /\b(dressing|vinaigrette|sauce|gravy|syrup|salsa|jelly|jam|preserves|mayo|mayonnaise|sour cream|cream cheese|butter balls?|whipped topping|powdered sugar|oil blend|oil|vinegar|chocolate chips|sprinkles|raisins|croutons|lemon wedges?|pickle chips|pickled jalapenos|seed butter|hummus)\b/i;
const PREP_WORDS =
  /^(chopped|sliced|shredded|crumbled|diced|minced|grated|pickled|assorted sliced)\b/i;

export function itemKind(name: string): ItemKind {
  const n = matchName(name);
  if (PREP_WORDS.test(n)) return "component";
  if (COMPONENT_WORDS.test(n)) return "component";
  return "dish";
}

export const itemKey = (name: string) => matchName(name).toLowerCase();

function mealsFor(feedMeal: string): MealPeriod[] {
  // Weekends serve one Brunch in place of Breakfast and Lunch.
  if (/brunch/i.test(feedMeal)) return ["Breakfast", "Lunch"];
  if (/breakfast/i.test(feedMeal)) return ["Breakfast"];
  if (/lunch/i.test(feedMeal)) return ["Lunch"];
  if (/dinner/i.test(feedMeal)) return ["Dinner"];
  return [];
}

function tagsFor(row: UscRow, allergens: Allergen[], analyzed: boolean): DietTag[] {
  const prefs = row.preferences ?? [];
  const tags = new Set<DietTag>();
  if (prefs.includes("halal-ingredients")) tags.add("halal");
  if (prefs.includes("vegan")) tags.add("vegan").add("vegetarian").add("dairy-free");
  if (prefs.includes("vegetarian")) tags.add("vegetarian");
  // Only derive "free-from" tags when USC actually analyzed the item.
  if (analyzed && !allergens.includes("wheat")) tags.add("gluten-free");
  if (analyzed && !allergens.includes("milk")) tags.add("dairy-free");
  return [...tags];
}

/** Parse one hall's day. Headers are dropped; the same dish across meals becomes one item. */
export function parseUscDay(day: UscDay, hall: HallId): ParsedItem[] {
  const byKey = new Map<string, ParsedItem>();
  for (const meal of day.meals ?? []) {
    const periods = mealsFor(meal.name);
    if (!periods.length) continue;
    for (const station of meal.stations ?? []) {
      for (const row of station.menu ?? []) {
        const name = tidy(row.item ?? "");
        if (!name || isHeader(name)) continue;
        const key = itemKey(name);
        if (!key) continue;
        const existing = byKey.get(key);
        if (existing) {
          for (const p of periods) if (!existing.meals.includes(p)) existing.meals.push(p);
          continue;
        }
        const slugs = row.allergens ?? [];
        const allergensUnknown = slugs.includes("not-analyzed");
        const allergens = [
          ...new Set(slugs.map((s) => ALLERGEN_MAP[s]).filter((a): a is Allergen => !!a)),
        ];
        byKey.set(key, {
          key,
          name,
          matchName: matchName(name),
          hall,
          station: tidy(station.station),
          meals: [...periods],
          kind: itemKind(name),
          tags: tagsFor(row, allergens, !allergensUnknown),
          allergens,
          allergensUnknown,
        });
      }
    }
  }
  return [...byKey.values()];
}
