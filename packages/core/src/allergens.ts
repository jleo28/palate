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

/** Allergens USC lists for an item. An empty list means none listed, never "allergen-free". */
export function itemAllergens(item: MenuItem): Allergen[] {
  return item.allergens ?? [];
}

/** Allergens on this item that the user is allergic to. Empty = safe. */
export function allergenConflicts(item: MenuItem, allergies: Allergen[] | undefined): Allergen[] {
  if (!allergies?.length) return [];
  return itemAllergens(item).filter((a) => allergies.includes(a));
}

/** Shown wherever allergies come up. Labels can be incomplete and recipes change. */
export const CONFIRM_WITH_STAFF = "Confirm with dining staff";

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Singular-or-plural pattern for a term, so "strawberries" matches "Strawberry" and vice versa. */
function termPattern(term: string) {
  const t = term.trim().toLowerCase();
  let base = t;
  if (t.endsWith("ies") && t.length > 4) base = `${t.slice(0, -3)}y`;
  else if (t.endsWith("oes")) base = t.slice(0, -2);
  else if (t.endsWith("s") && !t.endsWith("ss") && t.length > 3) base = t.slice(0, -1);
  if (base.endsWith("y")) return `${escape(base.slice(0, -1))}(?:y|ies)`;
  return `${escape(base)}(?:e?s)?`;
}

/** Custom allergy terms that appear in an item's name. A match is a possibility, not a fact. */
export function customAllergyMatches(item: MenuItem, custom: string[] | undefined): string[] {
  if (!custom?.length) return [];
  return custom.filter((term) => {
    if (!term.trim()) return false;
    return new RegExp(`\\b${termPattern(term)}\\b`, "i").test(item.name);
  });
}

/** Any known or possible conflict with the user's allergies. */
export function hasAllergyConflict(
  item: MenuItem,
  allergies: Allergen[] | undefined,
  custom: string[] | undefined,
) {
  return (
    allergenConflicts(item, allergies).length > 0 || customAllergyMatches(item, custom).length > 0
  );
}

/** The menu without items flagged for the user's allergies, used to build plates. */
export function withoutAllergyConflicts(
  menu: readonly MenuItem[],
  allergies: Allergen[] | undefined,
  custom: string[] | undefined,
) {
  return menu.filter((item) => !hasAllergyConflict(item, allergies, custom));
}
