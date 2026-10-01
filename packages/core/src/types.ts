import type { Seedling } from "./seedling";

export type HallId = "village" | "evk" | "parkside";

export type MealPeriod = "Breakfast" | "Lunch" | "Dinner";

export type DietTag = "vegetarian" | "vegan" | "halal" | "gluten-free" | "dairy-free";

export type GoalId = "cut" | "maintain" | "lean-bulk";

export type ItemRole = "protein" | "carb" | "veg" | "extra";

export type DislikeId =
  | "chicken"
  | "beef"
  | "turkey"
  | "seafood"
  | "tofu"
  | "eggs"
  | "beans"
  | "rice"
  | "pasta"
  | "potatoes"
  | "greens"
  | "vegetables"
  | "fruit"
  | "dairy";

/** FDA "big 9" food allergens */
export type Allergen =
  "milk" | "egg" | "peanut" | "tree-nut" | "soy" | "wheat" | "fish" | "shellfish" | "sesame";

export interface MenuItem {
  id: string;
  name: string;
  hall: HallId;
  station: string;
  role: ItemRole;
  meals: MealPeriod[];
  /** macros for one serving unit */
  unit: string; // e.g. "tong", "ladle", "spoonful", "piece", "cup"
  unitPlural: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: DietTag[];
  /** Known allergens. Absent means none listed. */
  allergens?: Allergen[];
}

export interface PlateItem {
  /** Stable row id within a plate. Survives swaps, so two rows never share an identity. */
  id: string;
  item: MenuItem;
  qty: number;
}

export interface Profile {
  age: number;
  gender: "female" | "male" | "other";
  heightIn: number;
  weightLb: number;
  goal: GoalId;
  /** Raises protein to 1.2 g/lb on top of any goal. */
  highProtein?: boolean;
  diets: DietTag[];
  allergies: Allergen[];
  /** Free-text "Other" allergies, matched against item names. */
  customAllergies?: string[];
  dislikes: DislikeId[];
  hall: HallId;
  name: string;
  /** Assigned at sign-up. Older profiles get one on first load. */
  seedling?: Seedling;
}

export interface LoggedMeal {
  id: string;
  date: string;
  hall: HallId;
  meal: MealPeriod;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  items: { name: string; portion: string }[];
  source?: "dining-hall" | "outside";
}
