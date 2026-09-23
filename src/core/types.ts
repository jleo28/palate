export type Sex = "female" | "male" | "unspecified";
export type Activity = "sedentary" | "light" | "moderate" | "very";
export type Goal = "steady" | "energy" | "build" | "lean";

export type HallId = "evk" | "parkside" | "village";
export type MealPeriod = "breakfast" | "lunch" | "dinner";
export type Role = "protein" | "carb" | "veg" | "extra" | "dessert";

export type DietTag = "vegetarian" | "vegan" | "halal" | "contains_pork" | "contains_beef";
export type DietFilter = "vegetarian" | "vegan" | "halal" | "no_pork" | "no_beef";
export type Allergen =
  | "milk"
  | "egg"
  | "fish"
  | "shellfish"
  | "tree_nuts"
  | "peanuts"
  | "wheat"
  | "soy"
  | "sesame";

export interface MenuItem {
  id: string;
  name: string;
  station: string;
  role: Role;
  servingUnit: string;
  servingGrams: number;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  tags: DietTag[];
  allergens: Allergen[];
  source: "sample";
}

export interface MenuFile {
  rotationWeeks: number;
  rotationAnchor: string;
  items: MenuItem[];
  everyday: Record<HallId, Record<MealPeriod, string[]>>;
  rotation: Record<HallId, Record<string, Record<MealPeriod, string[]>>>;
}

export interface Profile {
  age: number;
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  diet: DietFilter[];
  avoidAllergens: Allergen[];
  meals: MealPeriod[];
  homeHall: HallId;
}

export interface Macros {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface DailyTargets {
  daily: Macros;
  meals: Record<MealPeriod, Macros>;
}

export interface PlateLine {
  itemId: string;
  servings: number;
  portionLabel: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

export interface Plate {
  lines: PlateLine[];
  totals: Macros;
  target: Macros;
  score: number;
  onTarget: boolean;
  notes: string[];
  why: string;
}

export interface DayPlan {
  date: string;
  hall: HallId;
  meals: Partial<Record<MealPeriod, Plate>>;
  daySummary: {
    mealsPlanned: number;
    totals: Macros;
    target: Macros;
  };
}
