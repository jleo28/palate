import type { Allergen, DietFilter, MenuItem } from "./types";

function passesDiet(item: MenuItem, diet: DietFilter[]): boolean {
  for (const filter of diet) {
    switch (filter) {
      case "vegetarian":
        if (!item.tags.includes("vegetarian")) return false;
        break;
      case "vegan":
        if (!item.tags.includes("vegan")) return false;
        break;
      case "halal":
        if (!item.tags.includes("halal")) return false;
        break;
      case "no_pork":
        if (item.tags.includes("contains_pork")) return false;
        break;
      case "no_beef":
        if (item.tags.includes("contains_beef")) return false;
        break;
    }
  }
  return true;
}

function passesAllergens(item: MenuItem, avoid: Allergen[]): boolean {
  if (avoid.length === 0) return true;
  return !item.allergens.some((a) => avoid.includes(a));
}

export function filterItems(
  items: MenuItem[],
  diet: DietFilter[],
  avoidAllergens: Allergen[]
): MenuItem[] {
  return items.filter((item) => passesDiet(item, diet) && passesAllergens(item, avoidAllergens));
}
