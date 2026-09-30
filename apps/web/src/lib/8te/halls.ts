import type { HallId, MealPeriod } from "./types";

export const HALLS: { id: HallId; name: string; short: string; blurb: string }[] = [
  {
    id: "village",
    name: "USC Village Dining Hall",
    short: "Village",
    blurb: "Hogwarts hall energy, big grill + global stations",
  },
  {
    id: "evk",
    name: "Everybody's Kitchen",
    short: "EVK",
    blurb: "Comfort food, Mongolian wok, deep salad bar",
  },
  {
    id: "parkside",
    name: "Parkside Restaurant",
    short: "Parkside",
    blurb: "Lighter fare, fresh bowls, pizza oven",
  },
];

export function hallName(id: HallId) {
  return HALLS.find((h) => h.id === id)?.short ?? "Village";
}

export function currentMeal(d: Date = new Date()): MealPeriod {
  const h = d.getHours();
  if (h < 10) return "Breakfast";
  if (h < 16) return "Lunch";
  return "Dinner";
}

export const MEALS: MealPeriod[] = ["Breakfast", "Lunch", "Dinner"];
