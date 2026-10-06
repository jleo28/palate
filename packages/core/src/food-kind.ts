/** Which drawing (or, later, image) represents a food. Matched on the item name. */
export type FoodKind =
  | "chicken"
  | "steak"
  | "fish"
  | "shrimp"
  | "tofu"
  | "round"
  | "scrambled"
  | "boiled-egg"
  | "grain"
  | "mash"
  | "potato"
  | "noodle"
  | "salad"
  | "broccoli"
  | "sticks"
  | "pizza"
  | "toast"
  | "pancake"
  | "sausage"
  | "banana"
  | "melon"
  | "dairy"
  | "food";

// Order matters: the first match wins (e.g. "Egg White Scramble" before "egg").
const RULES: [RegExp, FoodKind][] = [
  [/shrimp/i, "shrimp"],
  [/salmon|fish|tilapia|cod/i, "fish"],
  [/tofu/i, "tofu"],
  [/pizza/i, "pizza"],
  [/toast/i, "toast"],
  [/pancake|waffle/i, "pancake"],
  [/sausage|link/i, "sausage"],
  [/scramble|scrambled/i, "scrambled"],
  [/egg/i, "boiled-egg"],
  [/meatball|falafel|chickpea|edamame|berr|black bean/i, "round"],
  [/chicken|turkey/i, "chicken"],
  [/steak|beef|carne|asada|pork|brisket/i, "steak"],
  [/mashed/i, "mash"],
  [/potato|fries/i, "potato"],
  [/rice|quinoa|oatmeal|couscous/i, "grain"],
  [/penne|pasta|mein|noodle|spaghetti/i, "noodle"],
  [/broccoli|cauliflower/i, "broccoli"],
  [/salad|kale|spring mix|romaine|caesar|greens/i, "salad"],
  [/green bean|carrot|zucchini|asparagus|pepper/i, "sticks"],
  [/banana/i, "banana"],
  [/melon|honeydew|cantaloupe|watermelon/i, "melon"],
  [/yogurt|cottage/i, "dairy"],
];

export function foodKind(name: string): FoodKind {
  return RULES.find(([pattern]) => pattern.test(name))?.[1] ?? "food";
}

/** Units served as separate pieces: drawn one per portion. Others are scooped and grow a mound. */
const COUNTABLE = /^(slice|fillet|link|meatball|pancake|banana|falafel|egg|piece)s?$/i;
export const isCountable = (unit: string) => COUNTABLE.test(unit);
