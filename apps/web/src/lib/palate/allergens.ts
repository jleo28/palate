import type { Allergen, MenuItem } from "./types";

export const ALLERGENS: { id: Allergen; label: string }[] = [
  { id: "milk", label: "Milk" },
  { id: "egg", label: "Eggs" },
  { id: "peanut", label: "Peanuts" },
  { id: "tree-nut", label: "Tree nuts" },
  { id: "soy", label: "Soy" },
  { id: "wheat", label: "Wheat / Gluten" },
  { id: "fish", label: "Fish" },
  { id: "shellfish", label: "Shellfish" },
  { id: "sesame", label: "Sesame" },
];

export function allergenLabel(id: Allergen) {
  return ALLERGENS.find((a) => a.id === id)?.label ?? id;
}

/** Known allergens per menu item id. Unlisted items are allergen-free. */
const ITEM_ALLERGENS: Record<string, Allergen[]> = {
  // Village
  "v-salmon": ["fish"],
  "v-tofu": ["soy", "sesame"],
  "v-whole-wheat-pasta": ["wheat"],
  "v-eggs": ["egg"],
  "v-greek-yogurt": ["milk"],
  // EVK
  "e-mongolian-chicken": ["soy", "wheat", "sesame"],
  "e-wok-tofu": ["soy", "sesame"],
  "e-lo-mein": ["wheat", "soy"],
  "e-meatballs": ["wheat", "egg"],
  "e-mashed": ["milk"],
  "e-edamame": ["soy"],
  "e-egg-whites": ["egg"],
  "e-pancake": ["wheat", "egg", "milk"],
  // Parkside
  "p-shrimp": ["shellfish"],
  "p-falafel": ["sesame"],
  "p-pizza": ["wheat", "milk"],
  "p-caesar": ["egg", "fish"],
  "p-cottage": ["milk"],
  "p-avocado-toast": ["wheat"],
  "p-hard-egg": ["egg"],
};

export function itemAllergens(item: MenuItem): Allergen[] {
  return ITEM_ALLERGENS[item.id] ?? [];
}

/** Allergens on this item that the user is allergic to. Empty = safe. */
export function allergenConflicts(item: MenuItem, allergies: Allergen[] | undefined): Allergen[] {
  if (!allergies?.length) return [];
  return itemAllergens(item).filter((a) => allergies.includes(a));
}
