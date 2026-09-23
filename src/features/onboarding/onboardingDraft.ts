import type { Allergen, DietFilter, HallId, MealPeriod, Profile, Sex } from "../../core/types";

export interface Draft {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: Profile["activity"];
  goal: Profile["goal"];
  diet: DietFilter[];
  avoidAllergens: Allergen[];
  homeHall: HallId;
  meals: MealPeriod[];
}

export const DEFAULT_DRAFT: Draft = {
  age: 19,
  sex: "unspecified",
  heightCm: 170,
  weightKg: 65,
  activity: "moderate",
  goal: "steady",
  diet: [],
  avoidAllergens: [],
  homeHall: "evk",
  meals: ["breakfast", "lunch", "dinner"],
};

export function draftToProfile(draft: Draft): Profile {
  return { ...draft };
}
