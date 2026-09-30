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

/** Known allergens on an item. Items with none listed are treated as allergen-free. */
export function itemAllergens(item: MenuItem): Allergen[] {
  return item.allergens ?? [];
}

/** Allergens on this item that the user is allergic to. Empty = safe. */
export function allergenConflicts(item: MenuItem, allergies: Allergen[] | undefined): Allergen[] {
  if (!allergies?.length) return [];
  return itemAllergens(item).filter((a) => allergies.includes(a));
}
