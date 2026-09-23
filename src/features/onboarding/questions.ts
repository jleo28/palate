import type { Activity, Allergen, DietFilter, Goal, HallId, MealPeriod, Sex } from "../../core/types";
import type { Draft } from "./onboardingDraft";

export const LETTERS = "ABCDEFGHIJ".split("");

interface OptionDef<T> {
  value: T;
  label: string;
  description?: string;
}

interface BaseQuestion {
  id: string;
  /** Olive asks this. One short, friendly line; she is the voice of the survey. */
  prompt: string;
  helper?: string;
}

export interface SingleQuestion<K extends keyof Draft = keyof Draft> extends BaseQuestion {
  kind: "single";
  field: K;
  options: OptionDef<Draft[K]>[];
}

export interface MultiQuestion<K extends keyof Draft = keyof Draft> extends BaseQuestion {
  kind: "multi";
  field: K;
  options: OptionDef<unknown>[];
  /** At least one answer is required to continue. */
  required?: boolean;
}

export interface NumberQuestion extends BaseQuestion {
  kind: "number";
  field: "age" | "heightCm" | "weightKg";
}

export type Question = SingleQuestion | MultiQuestion | NumberQuestion;

const SEX_OPTIONS: OptionDef<Sex>[] = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "unspecified", label: "Prefer not to say" },
];

const ACTIVITY_OPTIONS: OptionDef<Activity>[] = [
  { value: "sedentary", label: "Not very active", description: "Little to no exercise most weeks" },
  { value: "light", label: "Lightly active", description: "1 to 3 workouts a week" },
  { value: "moderate", label: "Active", description: "3 to 5 workouts a week" },
  { value: "very", label: "Very active", description: "6 to 7 hard workouts a week" },
];

const GOAL_OPTIONS: OptionDef<Goal>[] = [
  { value: "steady", label: "Stay steady", description: "Eat to match what you burn, day to day." },
  { value: "energy", label: "More energy", description: "Same calories, a bit more carbs for steadier energy." },
  { value: "build", label: "Build muscle", description: "A modest surplus and more protein to support training." },
  {
    value: "lean",
    label: "Lean out gently",
    description: "A small, capped calorie dip. Never below what your body needs to function.",
  },
];

const DIET_OPTIONS: OptionDef<DietFilter>[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "halal", label: "Halal" },
  { value: "no_pork", label: "No pork" },
  { value: "no_beef", label: "No beef" },
];

const ALLERGEN_OPTIONS: OptionDef<Allergen>[] = [
  { value: "milk", label: "Milk" },
  { value: "egg", label: "Egg" },
  { value: "fish", label: "Fish" },
  { value: "shellfish", label: "Shellfish" },
  { value: "tree_nuts", label: "Tree nuts" },
  { value: "peanuts", label: "Peanuts" },
  { value: "wheat", label: "Wheat" },
  { value: "soy", label: "Soy" },
  { value: "sesame", label: "Sesame" },
];

const HALL_OPTIONS: OptionDef<HallId>[] = [
  { value: "evk", label: "EVK", description: "Everybody's Kitchen" },
  { value: "parkside", label: "Parkside", description: "Parkside Restaurant & Grill" },
  { value: "village", label: "Village", description: "USC Village Dining Hall" },
];

const MEAL_OPTIONS: OptionDef<MealPeriod>[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

export const QUESTIONS: Question[] = [
  {
    id: "age",
    kind: "number",
    field: "age",
    prompt: "First up, how old are you?",
    helper: "Just for the calorie estimate.",
  },
  { id: "height", kind: "number", field: "heightCm", prompt: "And how tall are you?" },
  { id: "weight", kind: "number", field: "weightKg", prompt: "Roughly what do you weigh?" },
  {
    id: "sex",
    kind: "single",
    field: "sex",
    prompt: "Which estimate should I use?",
    helper: "This only changes the calorie maths, nothing else.",
    options: SEX_OPTIONS,
  } as SingleQuestion,
  {
    id: "activity",
    kind: "single",
    field: "activity",
    prompt: "How much do you move in a normal week?",
    options: ACTIVITY_OPTIONS,
  } as SingleQuestion,
  {
    id: "goal",
    kind: "single",
    field: "goal",
    prompt: "What would you like your meals to give you?",
    options: GOAL_OPTIONS,
  } as SingleQuestion,
  {
    id: "diet",
    kind: "multi",
    field: "diet",
    prompt: "Anything you do not eat?",
    helper: "Pick as many as you like, or none. I will keep these off your plate, swaps included.",
    options: DIET_OPTIONS,
  } as MultiQuestion,
  {
    id: "allergens",
    kind: "multi",
    field: "avoidAllergens",
    prompt: "Anything you need me to leave out?",
    helper: "Allergens are excluded outright, never just flagged.",
    options: ALLERGEN_OPTIONS,
  } as MultiQuestion,
  {
    id: "halls",
    kind: "multi",
    field: "halls",
    prompt: "Which halls do you actually go to?",
    helper: "I will show these first. The others are still one tap away.",
    options: HALL_OPTIONS,
    required: true,
  } as MultiQuestion,
  {
    id: "meals",
    kind: "multi",
    field: "meals",
    prompt: "And which meals do you eat in hall?",
    helper: "I will split your day's targets across these.",
    options: MEAL_OPTIONS,
    required: true,
  } as MultiQuestion,
];

/** The subset shown as editable sections in Profile, in display order. */
export const PROFILE_SECTIONS = QUESTIONS;
