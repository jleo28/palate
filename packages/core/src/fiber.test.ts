import { describe, expect, it } from "vitest";
import { FIBER_PER_1000_KCAL, mealTargets } from "./macros";
import { logItems, setLoggedQty } from "./logs";
import { logFromRow, logToRow } from "./rows";
import { estimateFromFdc } from "./usda-match";
import { menu } from "./fixtures";
import type { LoggedMeal } from "./types";

describe("fiber", () => {
  it("follows the Dietary Guidelines ratio and splits by meal", () => {
    expect(FIBER_PER_1000_KCAL).toBe(14);
    const daily = { kcal: 2000, protein: 100, carbs: 250, fat: 60, fiber: 28 };
    expect(mealTargets(daily, "Lunch").fiber).toBe(10);
    const { fiber: _unused, ...noFiber } = daily;
    expect(mealTargets(noFiber, "Lunch")).not.toHaveProperty("fiber");
  });

  it("keeps per-portion fiber on logged items and retotals it", () => {
    const items = logItems([{ id: "a", item: { ...menu[0]!, fiber: 4 }, qty: 1 }]);
    expect(items[0]!.per?.fiber).toBe(4);
    const meal: LoggedMeal = {
      id: "m",
      date: "2026-11-10",
      hall: "evk",
      meal: "Lunch",
      kcal: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      items,
    };
    expect(setLoggedQty(meal, 0, 2).fiber).toBe(8);
  });

  it("stores fiber on meal logs, and older logs stay unknown", () => {
    const meal: LoggedMeal = {
      id: "m",
      date: "2026-11-10",
      hall: "evk",
      meal: "Lunch",
      kcal: 500,
      protein: 30,
      carbs: 50,
      fat: 15,
      fiber: 7.5,
      items: [],
    };
    const row = logToRow(meal);
    expect(row.fiber).toBe(7.5);
    expect(logFromRow({ ...row, fiber: "7.5" }).fiber).toBe(7.5);
    expect(logFromRow({ ...row, fiber: null })).not.toHaveProperty("fiber");
  });

  it("reads fiber from USDA (nutrient 291)", () => {
    const est = estimateFromFdc({
      fdcId: 1,
      description: "Beans, black, cooked",
      foodCategory: "Legumes",
      foodNutrients: [
        { nutrientNumber: "208", value: 130 },
        { nutrientNumber: "203", value: 9 },
        { nutrientNumber: "205", value: 24 },
        { nutrientNumber: "204", value: 0.5 },
        { nutrientNumber: "291", value: 8.7 },
      ],
    });
    expect(est.fiber).toBeGreaterThan(0);
  });
});
