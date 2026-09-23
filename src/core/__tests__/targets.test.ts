import { describe, expect, it } from "vitest";
import { bmr, dailyMacros, mealSplit } from "../targets";
import type { Profile } from "../types";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    age: 19,
    sex: "male",
    heightCm: 178,
    weightKg: 72,
    activity: "moderate",
    goal: "steady",
    diet: [],
    avoidAllergens: [],
    meals: ["breakfast", "lunch", "dinner"],
    homeHall: "evk",
    ...overrides,
  };
}

// Test 1: BMR matches hand-calculated values for each sex option
describe("bmr", () => {
  it("matches the Mifflin-St Jeor formula for male", () => {
    const p = profile({ sex: "male", weightKg: 72, heightCm: 178, age: 19 });
    expect(bmr(p)).toBeCloseTo(10 * 72 + 6.25 * 178 - 5 * 19 + 5, 5);
  });

  it("matches the Mifflin-St Jeor formula for female", () => {
    const p = profile({ sex: "female", weightKg: 60, heightCm: 165, age: 20 });
    expect(bmr(p)).toBeCloseTo(10 * 60 + 6.25 * 165 - 5 * 20 - 161, 5);
  });

  it("matches the Mifflin-St Jeor formula for unspecified", () => {
    const p = profile({ sex: "unspecified", weightKg: 68, heightCm: 170, age: 22 });
    expect(bmr(p)).toBeCloseTo(10 * 68 + 6.25 * 170 - 5 * 22 - 78, 5);
  });
});

// Test 2: Lean goal never goes below BMR (small, sedentary profile)
describe("dailyMacros: lean floor", () => {
  it("never drops calories below BMR for a small, sedentary profile", () => {
    const p = profile({ sex: "female", weightKg: 48, heightCm: 155, age: 18, activity: "sedentary", goal: "lean" });
    const macros = dailyMacros(p);
    expect(macros.kcal).toBeGreaterThanOrEqual(Math.round(bmr(p) / 10) * 10);
  });
});

// Test 3: Lean deficit capped at 500 kcal for a large, very active profile
describe("dailyMacros: lean cap", () => {
  it("caps the lean deficit at 500 kcal for a large, very active profile", () => {
    const p = profile({ sex: "male", weightKg: 110, heightCm: 195, age: 24, activity: "very", goal: "lean" });
    const maintenanceKcal = 10 * 110 + 6.25 * 195 - 5 * 24 + 5;
    const maint = maintenanceKcal * 1.725;
    const macros = dailyMacros(p);
    expect(maint - macros.kcal).toBeLessThanOrEqual(500 + 5); // rounding tolerance
  });
});

// Test 4: Protein cap at 2.2 g/kg applies
describe("dailyMacros: protein cap", () => {
  it("caps protein at 2.2 g/kg even for a build goal (1.8 g/kg base)", () => {
    const p = profile({ weightKg: 100, goal: "build" });
    const macros = dailyMacros(p);
    expect(macros.protein).toBeLessThanOrEqual(2.2 * 100 + 0.5);
  });

  it("caps protein at 35% of calories when that is the tighter limit", () => {
    const p = profile({ weightKg: 40, heightCm: 150, age: 30, activity: "sedentary", goal: "build" });
    const macros = dailyMacros(p);
    expect(macros.protein * 4).toBeLessThanOrEqual(0.35 * macros.kcal + 5);
  });
});

// Test 5: Meal split renormalises when breakfast is skipped
describe("mealSplit", () => {
  it("renormalises weights across the meals eaten in hall", () => {
    const weights = mealSplit(["lunch", "dinner"]);
    expect(weights.breakfast).toBe(0);
    expect(weights.lunch + weights.dinner).toBeCloseTo(1, 5);
    expect(weights.lunch / weights.dinner).toBeCloseTo(0.35 / 0.4, 5);
  });

  it("uses the default split across all three meals", () => {
    const weights = mealSplit(["breakfast", "lunch", "dinner"]);
    expect(weights.breakfast + weights.lunch + weights.dinner).toBeCloseTo(1, 5);
    expect(weights.breakfast).toBeCloseTo(0.25, 5);
  });
});

describe("dailyMacros: energy goal shifts fat toward carbs", () => {
  it("reduces fat relative to steady for the same profile", () => {
    const steady = dailyMacros(profile({ goal: "steady" }));
    const energy = dailyMacros(profile({ goal: "energy" }));
    expect(energy.fat).toBeLessThan(steady.fat);
    expect(energy.carbs).toBeGreaterThan(steady.carbs);
  });
});
