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

/** Words that turn a food into a different dish: "bacon" vs "bacon bits", "fruit" vs "fruit smoothie". */
const FORM_WORDS = new Set(
  "bit smoothie juice soup sandwich casserole pie dip stuffed salad cake cookie bar chip baby frozen dried canned powder sauce gravy dressing".split(
    " ",
  ),
);

/**
 * Whether a USDA food is a confident match for a dish: it shares the dish's main noun (its last
 * significant word) and at least half of its significant words, it doesn't add a word that makes
 * it a different dish, and a plant-based dish never matches a meat food.
 */
export function isConfidentMatch(dish: string, usdaDescription: string) {
  const d = words(dish);
  const u = new Set(words(usdaDescription));
  if (!d.length) return false;
  const head = d[d.length - 1]!;
  if (!u.has(head)) return false;
  const shared = d.filter((w) => u.has(w)).length;
  if (shared < Math.ceil(d.length / 2)) return false;
  const dishWords = new Set(d);
  if ([...u].some((w) => FORM_WORDS.has(w) && !dishWords.has(w))) return false;
  if (PLANT_BASED.test(dish) && MEAT.test(usdaDescription) && !MEAT_FREE.test(usdaDescription)) {
    return false;
  }
  return true;
}

const nutrient = (food: FdcFood, number: string) =>
  food.foodNutrients?.find((n) => n.nutrientNumber === number)?.value ?? 0;

/** Countable single portions, as USDA words them: "1 slice", "1 piece, NFS", "1 link". */
const PIECE =
  /^1 (slice|piece|link|patty|strip|nugget|egg|pancake|waffle|muffin|bagel|roll|biscuit|taco|burrito|sandwich|wrap|fillet|drumstick|thigh|breast|wing|sausage)\b/i;
const PLURALS: Record<string, string> = { patty: "patties", sandwich: "sandwiches" };
/** A "typical serving" heavier than this is a whole dish (a whole pizza), not one plateful. */
const MAX_SERVING_GRAMS = 350;
const MIN_PIECE_GRAMS = 25;

/** One hall-sized portion: a single piece when USDA lists one, else its typical serving. */
export function servingFor(food: FdcFood): { grams: number; unit: string; unitPlural: string } {
  const measures = (food.foodMeasures ?? []).filter((m) => (m.gramWeight ?? 0) > 0);
  // A single fry or carrot strip isn't a portion: tiny pieces only count for slices, links and eggs.
  const piece = measures.find((m) => {
    const text = m.disseminationText ?? "";
    const match = PIECE.exec(text);
    if (!match || /medium|large|small|whole/i.test(text)) return false;
    return m.gramWeight! >= MIN_PIECE_GRAMS || /^(slice|link|egg)$/i.test(match[1]!);
  });
  if (piece) {
    const unit = PIECE.exec(piece.disseminationText!)![1]!.toLowerCase();
    return { grams: piece.gramWeight!, unit, unitPlural: PLURALS[unit] ?? `${unit}s` };
  }
  const typical = measures.find((m) => /quantity not specified/i.test(m.disseminationText ?? ""));
  const cup = measures.find((m) => /^1 cup\b/i.test(m.disseminationText ?? ""));
  let grams = typical?.gramWeight ?? cup?.gramWeight ?? measures[0]?.gramWeight ?? 100;
  if (grams > MAX_SERVING_GRAMS)
    grams = cup?.gramWeight && cup.gramWeight <= MAX_SERVING_GRAMS ? cup.gramWeight : 250;
  return { grams, unit: "serving", unitPlural: "servings" };
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
  const serving = servingFor(food);
  const factor = serving.grams / 100;
  const kcal = Math.round(nutrient(food, "208") * factor);
  const protein = r1(nutrient(food, "203") * factor);
  const carbs = r1(nutrient(food, "205") * factor);
  const fat = r1(nutrient(food, "204") * factor);
  return {
    kcal,
    protein,
    carbs,
    fat,
    unit: serving.unit,
    unitPlural: serving.unitPlural,
    role: roleFor(food.foodCategory, kcal, protein, carbs),
    source: "usda",
    fdcId: food.fdcId,
    fdcDescription: food.description,
  };
}

/** Among USDA's confident matches, the one adding the fewest words the dish doesn't have. */
export function bestMatch(dish: string, foods: readonly FdcFood[]) {
  const d = new Set(words(dish));
  const extra = (f: FdcFood) => words(f.description).filter((w) => !d.has(w)).length;
  const confident = foods.filter((f) => isConfidentMatch(dish, f.description));
  // Stable: USDA's own ranking breaks ties.
  return confident.sort((a, b) => extra(a) - extra(b))[0] ?? null;
}
