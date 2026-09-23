import type { Allergen, DietFilter, HallId, MealPeriod, Profile, Sex } from "../../core/types";

/**
 * The answers collected during onboarding. This is everything in the core
 * `Profile` plus `halls`, which is a UI preference (which hall chips Today
 * shows first) and deliberately not part of the portable planner types.
 */
export interface Draft {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: Profile["activity"];
  goal: Profile["goal"];
  diet: DietFilter[];
  avoidAllergens: Allergen[];
  halls: HallId[];
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
  halls: ["evk", "parkside", "village"],
  homeHall: "evk",
  meals: ["breakfast", "lunch", "dinner"],
};

export function draftToProfile(draft: Draft): Profile {
  return {
    age: draft.age,
    sex: draft.sex,
    heightCm: draft.heightCm,
    weightKg: draft.weightKg,
    activity: draft.activity,
    goal: draft.goal,
    diet: draft.diet,
    avoidAllergens: draft.avoidAllergens,
    meals: draft.meals,
    // The first hall they picked is where Today opens until they switch.
    homeHall: draft.halls[0] ?? draft.homeHall,
  };
}

export function profileToDraft(profile: Profile, halls: HallId[]): Draft {
  return {
    age: profile.age,
    sex: profile.sex,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    activity: profile.activity,
    goal: profile.goal,
    diet: profile.diet,
    avoidAllergens: profile.avoidAllergens,
    halls: halls.length > 0 ? halls : [profile.homeHall],
    homeHall: profile.homeHall,
    meals: profile.meals,
  };
}
