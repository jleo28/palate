import type { MenuItem } from "./types";

/** How a hall serves a food. "each" foods keep their own noun (egg, cookie, banana). */
export type Utensil = "ladle" | "scoop" | "piece" | "slice" | "spoonful" | "bowl" | "cup" | "each";

/** Typical grams for one of each utensil. Estimates: real sizes vary by hall and server. */
export const UTENSIL_GRAMS: Record<Exclude<Utensil, "each">, number> = {
  ladle: 170,
  scoop: 130,
  piece: 85,
  slice: 100,
  spoonful: 40,
  bowl: 240,
  cup: 170,
};

const EACH_GRAMS: [RegExp, number][] = [
  [/egg/i, 50],
  [/cookie|brownie/i, 35],
  [/banana|apple|orange|pear|fruit/i, 140],
  [/pancake|waffle/i, 75],
  [/link|sausage/i, 45],
  [/meatball/i, 30],
  [/falafel/i, 20],
  [/wrap|burrito|sandwich|burger/i, 220],
];

const PLURAL: Record<Exclude<Utensil, "each">, string> = {
  ladle: "ladles",
  scoop: "scoops",
  piece: "pieces",
  slice: "slices",
  spoonful: "spoonfuls",
  bowl: "bowls",
  cup: "cups",
};

// Order matters: the first match wins ("chicken curry" is ladled, "mashed potatoes" scooped).
const NAME_RULES: [RegExp, Utensil][] = [
  // The dish names that win over any ingredient in them.
  [/pizza/i, "slice"],
  [/salad|mashed/i, "scoop"],
  [/on the cob/i, "each"],
  [
    /soup|curr(y|ied)|masala|chili|stew|lentil|goulash|sauce|gravy|marinara|\bdal\b|chowder|bisque|\bpho\b|ramen|broth|korma|congee|pozole/i,
    "ladle",
  ],
  // Toppings and condiments, before the mains they'd otherwise match ("Chopped Bacon").
  [
    /^(spicy )?salsa|\bdip\b|ghanoush|topping|guac|hummus|dressing|sour cream|cream cheese|shredded|crouton|relish|syrup|butter balls|seed butter|\bpico\b|bacon bits|chopped|pickle|jalape|pepperoncini|lettuce|raisin|chips\b|powdered sugar|crema|aioli|mayo|chutney|vinaigrette|kimchi|kachumber|jelly|lime wedges|\boil\b/i,
    "spoonful",
  ],
  [/pizza|bread|toast|\bcakes?\b|\bpie\b|flatbread|focaccia|sliced|loaf/i, "slice"],
  [/cereal|oatmeal|porridge|granola|overnight oats/i, "bowl"],
  [/yogurt|parfait|smoothie|cottage|fruit cup|pudding|jell?o/i, "cup"],
  [
    /scramble|mac\b|mac &|mac and|mash|rice|quinoa|couscous|pilaf|stuffing|slaw|salad|greens|spring mix|melon|honeydew|cantaloupe|grits|hash|risotto|polenta|orzo|farro|barley|arroz|cobbler|bake\b|casserole|moussaka|picadillo/i,
    "scoop",
  ],
  [
    /\begg|cookie|brownie|muffin|bagel|banana|apple|orange|hand fruit|wrap|burrito|taco|tortilla|sandwich|burger|melt\b|pancake|waffle|sausage|\blinks?\b|meatball|falafel|donut|croissant|biscuit|patty|tamale|empanada|egg roll|spring roll|dumpling|quesadilla|crepe|rolls?\b|pastr|fruits|\bcob\b/i,
    "each",
  ],
  [
    /chicken|beef|pork|steak|turkey|fish|salmon|tilapia|\bcod\b|swai|mahi|barramundi|shrimp|tofu|carne|asada|carnitas|meat|brisket|ribs|bacon|\bham\b|salami|calamari|jackfruit|cochinita|mushroom|chard|kale|spinach|cabbage|bok choy|ratatouille|celery|tots|papas|wings|tender|roast|grilled|vegetable|veggie|broccoli|carrot|zucchini|squash|asparagus|green bean|snap peas|sprouts|beet|cauliflower|brussels|pasta|penne|noodle|mein|spaghetti|ziti|fries|potato|wedges|plantain/i,
    "piece",
  ],
  [
    /beans?\b|cheese|nuts|seeds|olive|edamame|corn\b|peas\b|chickpea|\bjam\b|onion|tomato|cilantro|pesto|sugar|whipped|chips/i,
    "spoonful",
  ],
];

const STATION_RULES: [RegExp, Utensil][] = [
  [/soup/i, "ladle"],
  [/pizza/i, "slice"],
  [/salad/i, "scoop"],
  [/dessert|bakery|pastry/i, "each"],
  [/grill|rotisserie|carvery/i, "piece"],
];

/** Units already given as their own noun ("2 eggs"), kept for "each" foods. */
const NOUN_UNIT =
  /^(egg|cookie|banana|pancake|waffle|link|meatball|falafel|wrap|bagel|muffin|piece)s?$/i;

/** The utensil a food is served with, from its name, then its station. Null when nothing fits. */
export function utensilFor(name: string, station: string): Utensil | null {
  // "Mahi Mahi with Mango Salsa" is served as the mahi mahi: try the dish before " with ".
  const dish = name.split(/ with | on (?!the cob)| over /i)[0]!;
  return (
    NAME_RULES.find(([re]) => re.test(dish))?.[1] ??
    NAME_RULES.find(([re]) => re.test(name))?.[1] ??
    STATION_RULES.find(([re]) => re.test(station))?.[1] ??
    null
  );
}

/**
 * Give a menu item a utensil unit and a gram estimate for one of it. The item's macros stay
 * per one unit exactly as before, so all nutrition math is unchanged; `grams` keeps the weight
 * already known for that portion (USDA's serving), else the utensil's typical weight.
 * Falls back to "serving" only when no utensil fits.
 */
export function withUtensil<T extends MenuItem>(item: T): T {
  const utensil = utensilFor(item.name, item.station);
  if (!utensil) return { ...item, unit: "serving", unitPlural: "servings" };
  if (utensil === "each") {
    const keep = NOUN_UNIT.test(item.unit);
    const grams = item.grams ?? EACH_GRAMS.find(([re]) => re.test(item.name))?.[1];
    return {
      ...item,
      unit: keep ? item.unit : "piece",
      unitPlural: keep ? item.unitPlural : "pieces",
      ...(grams ? { grams } : {}),
    };
  }
  return {
    ...item,
    unit: utensil,
    unitPlural: PLURAL[utensil],
    grams: item.grams ?? UTENSIL_GRAMS[utensil],
  };
}

/** Half steps for portion controls. */
export const PORTION_STEP = 0.5;

/** "1", "1½", "½". */
export function formatQty(qty: number) {
  const whole = Math.floor(qty);
  const half = qty - whole >= 0.25 && qty - whole < 0.75;
  const w = half ? whole : Math.round(qty);
  if (half) return whole === 0 ? "½" : `${whole}½`;
  return String(w);
}

/** "1 ladle", "1½ ladles", "2 pieces". */
export function portionText(qty: number, unit: string, unitPlural: string) {
  return `${formatQty(qty)} ${qty > 1 ? unitPlural : unit}`;
}

export const portionLabel = (item: Pick<MenuItem, "unit" | "unitPlural">, qty: number) =>
  portionText(qty, item.unit, item.unitPlural);

/** "~170g" for a portion, or null when the weight isn't known. */
export function portionWeight(item: Pick<MenuItem, "grams">, qty: number) {
  return item.grams ? `~${Math.round((item.grams * qty) / 5) * 5}g` : null;
}
