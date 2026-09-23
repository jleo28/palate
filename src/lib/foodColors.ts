import type { MenuItem, Role } from "../core/types";

/**
 * Wedge colours are the colour of the food, not a chart key. A roast chicken
 * wedge is golden, broccoli is green, berries are deep red. Colour is never
 * the only signal: every item is also listed by name, station and portion
 * under the plate, and the plate carries a text description for screen
 * readers.
 *
 * Matching is by keyword on the item name, longest first, with a warm
 * role-based fallback so a new item always gets something appetising.
 */
const FOOD_COLORS: [string, string][] = [
  // proteins
  ["grilled chicken", "#C98A4B"],
  ["chicken", "#CE9350"],
  ["turkey", "#C08A5C"],
  ["steak", "#8C4A38"],
  ["beef", "#8C4A38"],
  ["roast beef", "#8C4A38"],
  ["burger", "#96543C"],
  ["meatloaf", "#93553F"],
  ["chili", "#9C4E33"],
  ["pork", "#C07A64"],
  ["ham", "#CE8A80"],
  ["sausage", "#A55C43"],
  ["bacon", "#B5624C"],
  ["salmon", "#DB8A63"],
  ["cod", "#E0CDAA"],
  ["tuna", "#B08463"],
  ["shawarma", "#BE804A"],
  ["tikka", "#C26A3C"],
  ["fajita", "#B4663F"],
  ["kung pao", "#A96A3E"],
  ["tofu", "#E2D5A8"],
  ["tempeh", "#C8A86A"],
  ["seitan", "#B08A5C"],
  ["falafel", "#9C8442"],
  ["halloumi", "#E8DBB0"],
  ["egg", "#E8C86A"],
  ["yogurt", "#F0E7D4"],
  ["cottage cheese", "#F2EADA"],
  ["lentil", "#9A6A45"],
  ["dal", "#C08C42"],
  ["chickpea", "#CBA968"],
  ["chana", "#C09657"],
  ["black bean", "#5A4436"],
  ["bean", "#7A5A44"],
  ["jackfruit", "#C99A5E"],
  ["cashew", "#D6BC86"],
  ["plant crumble", "#8E6448"],

  // carbs
  ["brown rice", "#C7A878"],
  ["white rice", "#EFE8D6"],
  ["jasmine rice", "#EDE6D4"],
  ["rice", "#DCCDA8"],
  ["quinoa", "#D3BC8C"],
  ["pasta", "#E3CE96"],
  ["noodle", "#E0C88E"],
  ["potato", "#DCC183"],
  ["tater", "#D4AE63"],
  ["fries", "#D9A24E"],
  ["mac and cheese", "#E0A84E"],
  ["bread", "#D2B183"],
  ["toast", "#D6B584"],
  ["bagel", "#D8B98A"],
  ["roll", "#DCBB8C"],
  ["naan", "#E2C79A"],
  ["pita", "#E0C596"],
  ["cornbread", "#E6C173"],
  ["pancake", "#DCAE68"],
  ["waffle", "#D9A960"],
  ["french toast", "#D7A45E"],
  ["oat", "#DCCBA6"],
  ["farro", "#C2A470"],
  ["biryani", "#D9B36A"],

  // veg
  ["broccoli", "#5E8347"],
  ["spinach", "#4C7340"],
  ["kale", "#4F7742"],
  ["green bean", "#6B9150"],
  ["bok choy", "#7CA05A"],
  ["edamame", "#82A855"],
  ["pea", "#7BA254"],
  ["cauliflower", "#E4DCC2"],
  ["carrot", "#D08240"],
  ["tomato", "#B24B3C"],
  ["beet", "#8E4258"],
  ["cucumber", "#93B074"],
  ["greens", "#5F8848"],
  ["salad", "#6B9052"],
  ["corn", "#DFB74A"],
  ["coleslaw", "#DFD6B2"],
  ["hash brown", "#D2A45E"],
  ["roasted vegetable", "#A97A4A"],
  ["coconut curry", "#D9B268"],

  // extras
  ["berries", "#8E4058"],
  ["apple", "#B04A43"],
  ["orange", "#DD8C3C"],
  ["banana", "#E3C55E"],
  ["fruit", "#C8654C"],
  ["hummus", "#D6C08A"],
  ["tzatziki", "#EDE8D6"],
  ["milk", "#F2EDE0"],
  ["cheese", "#E6C97A"],
  ["granola", "#B98B52"],
  ["peanut butter", "#B57A42"],
  ["seed", "#B99A62"],
  ["dressing", "#E0D4AC"],
  ["vinaigrette", "#8E7040"],
  ["soup", "#C79A5A"],
  ["juice", "#E0A040"],
  ["crouton", "#D2AC72"],
];

const ROLE_FALLBACK: Record<Role, string> = {
  protein: "#B57A50",
  carb: "#DCC08A",
  veg: "#6E9150",
  extra: "#C9A870",
  dessert: "#A9763F",
};

const sorted = [...FOOD_COLORS].sort((a, b) => b[0].length - a[0].length);

export function foodColor(item: MenuItem | undefined): string {
  if (!item) return ROLE_FALLBACK.extra;
  const name = item.name.toLowerCase();
  for (const [keyword, color] of sorted) {
    if (name.includes(keyword)) return color;
  }
  return ROLE_FALLBACK[item.role];
}
