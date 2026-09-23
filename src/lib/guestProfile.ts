import type { Profile } from "../core/types";

/**
 * What the dashboard plans against before anyone has told us anything. A
 * general balanced target, not a guess about the person looking at it: the
 * UI always says so plainly and offers to make it theirs.
 */
export const GUEST_PROFILE: Profile = {
  age: 19,
  sex: "unspecified",
  heightCm: 170,
  weightKg: 68,
  activity: "moderate",
  goal: "steady",
  diet: [],
  avoidAllergens: [],
  meals: ["breakfast", "lunch", "dinner"],
  homeHall: "evk",
};
