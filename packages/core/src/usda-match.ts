/**
 * Matching a menu dish to a USDA FoodData Central (FNDDS) food, and turning that food into a
 * per-portion estimate. Pure functions: the server does the fetching.
 */
import type { ItemRole } from "./types";

/** A food from the FDC search API (only the fields we use). */
export interface FdcFood {
  fdcId: number;
  description: string;
  foodCategory?: string;
  foodNutrients?: { nutrientNumber?: string; value?: number }[];
  foodMeasures?: { disseminationText?: string; gramWeight?: number }[];
}

/** Per-portion nutrition for one menu item, from USDA, AI, or a team override. */
export interface NutritionEstimate {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  unit: string;
  unitPlural: string;
  role: ItemRole;
  source: "usda" | "ai" | "override";
  fdcId?: number;
  fdcDescription?: string;
}

const STOP = new Set([
  "and",
  "with",
  "of",
  "the",
  "a",
  "in",
  "on",
  "style",
  "fresh",
  "made",
  "nfs",
  "ns",
  "from",
  "or",
  "to",
  "as",
  "type",
  "restaurant",
  "fast",
  "food",
  "school",
  "lunch",
]);

const singular = (w: string) =>
  w.length > 4 && w.endsWith("ies")
    ? `${w.slice(0, -3)}y`
    : w.length > 4 && /(ches|shes|oes|sses)$/.test(w)
      ? w.slice(0, -2)
      : w.length > 3 && w.endsWith("s") && !w.endsWith("ss")
        ? w.slice(0, -1)
        : w;

/** Significant words, lower-cased and singular: "Garlic Mashed Potatoes" → garlic, mashed, potato. */
export function words(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, " ")
    .split(/[\s-]+/)
    .map((w) => w.replace(/'s?$/, ""))
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map(singular);
}

const PLANT_BASED =
  /\b(veggie|vegetarian|vegan|plant|tofu|gardein|chik'?n|impossible|beyond|meatless|seitan|tempeh|jackfruit)\b/i;
const MEAT =
  /\b(beef|pork|chicken|turkey|sausage|chorizo|ham|bacon|lamb|veal|fish|shrimp|salmon|tuna|meat|pepperoni|salami)\b/i;
const MEAT_FREE = /\b(meatless|vegetarian|vegan|tofu|soy|veggie|plant)\b/i;

/**
 * Whether a USDA food is a confident match for a dish: it shares the dish's main noun (its last
 * significant word) and at least half of its significant words, and a plant-based dish never
 * matches a meat food.
 */
export function isConfidentMatch(dish: string, usdaDescription: string) {
  const d = words(dish);
  const u = new Set(words(usdaDescription));
  if (!d.length) return false;
  const head = d[d.length - 1]!;
  if (!u.has(head)) return false;
  const shared = d.filter((w) => u.has(w)).length;
  if (shared < Math.ceil(d.length / 2)) return false;
  if (PLANT_BASED.test(dish) && MEAT.test(usdaDescription) && !MEAT_FREE.test(usdaDescription)) {
    return false;
  }
  return true;
}

const nutrient = (food: FdcFood, number: string) =>
  food.foodNutrients?.find((n) => n.nutrientNumber === number)?.value ?? 0;

/** USDA's own "typical serving" weight, else the first listed measure, else 100 g. */
function servingGrams(food: FdcFood) {
  const measures = food.foodMeasures ?? [];
  const typical = measures.find((m) => /quantity not specified/i.test(m.disseminationText ?? ""));
  return typical?.gramWeight ?? measures.find((m) => m.gramWeight)?.gramWeight ?? 100;
}

/** Plate role from USDA's food category, falling back to which macro dominates. */
export function roleFor(
  category: string | undefined,
  kcal: number,
  protein: number,
  carbs: number,
): ItemRole {
  const c = (category ?? "").toLowerCase();
  if (/fruit/.test(c) && !/juice/.test(c)) return "extra";
  if (/vegetable|salad|greens/.test(c) && !/potato/.test(c)) return "veg";
  if (
    /(beef|pork|lamb|poultry|chicken|turkey|fish|shellfish|seafood|egg|sausage|meat|tofu|soy|beans, peas|legume)/.test(
      c,
    )
  )
    return "protein";
  if (
    /(potato|rice|pasta|noodle|bread|roll|tortilla|cereal|grain|oatmeal|pancake|waffle|bagel|muffin|pizza)/.test(
      c,
    )
  )
    return "carb";
  if (kcal > 0 && (protein * 4) / kcal >= 0.3) return "protein";
  if (kcal > 0 && (carbs * 4) / kcal >= 0.5) return "carb";
  return "protein";
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** One serving of a USDA food as a menu estimate. */
export function estimateFromFdc(food: FdcFood): NutritionEstimate {
  const factor = servingGrams(food) / 100;
  const kcal = Math.round(nutrient(food, "208") * factor);
  const protein = r1(nutrient(food, "203") * factor);
  const carbs = r1(nutrient(food, "205") * factor);
  const fat = r1(nutrient(food, "204") * factor);
  return {
    kcal,
    protein,
    carbs,
    fat,
    unit: "serving",
    unitPlural: "servings",
    role: roleFor(food.foodCategory, kcal, protein, carbs),
    source: "usda",
    fdcId: food.fdcId,
    fdcDescription: food.description,
  };
}

/** The first confident match among USDA's search results (they come best-first). */
export function bestMatch(dish: string, foods: readonly FdcFood[]) {
  return foods.find((f) => isConfidentMatch(dish, f.description)) ?? null;
}
