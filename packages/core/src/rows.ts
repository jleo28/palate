/** Mapping between app types and the Supabase tables (see supabase/migrations). */
import type { Seedling } from "./seedling";
import type {
  Allergen,
  DietTag,
  DislikeId,
  GoalId,
  HallId,
  LoggedMeal,
  Profile,
  Slot,
  SnackSlot,
} from "./types";

export interface ProfileRow {
  id: string;
  name: string;
  age: number;
  gender: Profile["gender"];
  height_in: number;
  weight_lb: number;
  goal: GoalId;
  high_protein: boolean;
  snacks: SnackSlot[];
  diets: DietTag[];
  allergies: Allergen[];
  custom_allergies: string[];
  dislikes: DislikeId[];
  hall: HallId;
  seedling: Seedling | null;
}

export interface MealLogRow {
  id: string;
  user_id?: string;
  date: string;
  hall: HallId;
  meal: Slot;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  items: LoggedMeal["items"];
  source: NonNullable<LoggedMeal["source"]>;
}

export function profileToRow(userId: string, p: Profile): ProfileRow {
  return {
    id: userId,
    name: p.name,
    age: p.age,
    gender: p.gender,
    height_in: p.heightIn,
    weight_lb: p.weightLb,
    goal: p.goal,
    high_protein: p.highProtein ?? false,
    snacks: p.snacks ?? [],
    diets: p.diets,
    allergies: p.allergies,
    custom_allergies: p.customAllergies ?? [],
    dislikes: p.dislikes,
    hall: p.hall,
    seedling: p.seedling ?? null,
  };
}

export function profileFromRow(r: ProfileRow): Profile {
  return {
    name: r.name,
    age: r.age,
    gender: r.gender,
    heightIn: r.height_in,
    weightLb: Number(r.weight_lb),
    goal: r.goal,
    highProtein: r.high_protein,
    snacks: r.snacks ?? [],
    diets: r.diets,
    allergies: r.allergies,
    customAllergies: r.custom_allergies,
    dislikes: r.dislikes,
    hall: r.hall,
    ...(r.seedling ? { seedling: r.seedling } : {}),
  };
}

// Postgres numeric comes back as a string from PostgREST; normalise to numbers.
const num = (v: number | string) => Number(v);

export function logToRow(m: LoggedMeal): MealLogRow {
  return {
    id: m.id,
    date: m.date,
    hall: m.hall,
    meal: m.meal,
    kcal: m.kcal,
    protein: m.protein,
    carbs: m.carbs,
    fat: m.fat,
    items: m.items,
    source: m.source ?? "dining-hall",
  };
}

export function logFromRow(r: MealLogRow): LoggedMeal {
  return {
    id: r.id,
    date: r.date,
    hall: r.hall,
    meal: r.meal,
    kcal: num(r.kcal),
    protein: num(r.protein),
    carbs: num(r.carbs),
    fat: num(r.fat),
    items: r.items,
    source: r.source,
  };
}
