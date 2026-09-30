import { describe, expect, it } from "vitest";
import { dailyTargets, mealTargets } from "./macros";
import { profile } from "./fixtures";
import type { GoalId } from "./types";

describe("dailyTargets", () => {
  it("applies Mifflin-St Jeor with a 1.5 activity factor", () => {
    // BMR = 10(58.968) + 6.25(165.1) - 5(19) - 161 = 1365.6; × 1.5 = 2048 → 2050
    expect(dailyTargets(profile())).toEqual({ kcal: 2050, protein: 104, carbs: 280, fat: 57 });
  });

  it("uses the male constant and an 18% deficit on a cut", () => {
    const p = profile({ gender: "male", age: 20, heightIn: 70, weightLb: 170, goal: "cut" });
    // BMR 1787.4 × 1.5 × 0.82 = 2198 → 2200; protein 1.0 g/lb
    expect(dailyTargets(p)).toEqual({ kcal: 2200, protein: 170, carbs: 243, fat: 61 });
  });

  it("uses the midpoint constant for other genders", () => {
    const female = dailyTargets(profile({ gender: "female" })).kcal;
    const male = dailyTargets(profile({ gender: "male" })).kcal;
    const other = dailyTargets(profile({ gender: "other" })).kcal;
    expect(other).toBeGreaterThan(female);
    expect(other).toBeLessThan(male);
  });

  it("rounds calories to the nearest 10", () => {
    for (const weightLb of [101, 133, 177, 222]) {
      expect(dailyTargets(profile({ weightLb })).kcal % 10).toBe(0);
    }
  });

  it("ranks goals by calories: cut < high-protein < maintain < lean-bulk", () => {
    const kcal = (goal: GoalId) => dailyTargets(profile({ goal })).kcal;
    expect(kcal("cut")).toBeLessThan(kcal("high-protein"));
    expect(kcal("high-protein")).toBeLessThan(kcal("maintain"));
    expect(kcal("maintain")).toBeLessThan(kcal("lean-bulk"));
  });

  it("scales protein per pound by goal", () => {
    expect(dailyTargets(profile({ goal: "high-protein", weightLb: 150 })).protein).toBe(180);
    expect(dailyTargets(profile({ goal: "lean-bulk", weightLb: 150 })).protein).toBe(135);
  });

  it("never drops carbs below 60 g", () => {
    // Only reachable at extremes: protein and fat alone use up almost all the calories.
    const p = profile({ goal: "high-protein", weightLb: 200, heightIn: 48, age: 99 });
    expect(dailyTargets(p).carbs).toBe(60);
  });
});

describe("mealTargets", () => {
  const daily = { kcal: 2000, protein: 100, carbs: 250, fat: 60 };

  it("gives breakfast 28% and lunch and dinner 36% each", () => {
    expect(mealTargets(daily, "Breakfast")).toEqual({ kcal: 560, protein: 28, carbs: 70, fat: 17 });
    expect(mealTargets(daily, "Lunch")).toEqual({ kcal: 720, protein: 36, carbs: 90, fat: 22 });
    expect(mealTargets(daily, "Dinner")).toEqual(mealTargets(daily, "Lunch"));
  });
});
