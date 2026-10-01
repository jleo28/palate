import { describe, expect, it } from "vitest";
import {
  canCut,
  dailyTargets,
  effectiveGoal,
  maintenanceKcal,
  mealTargets,
  normalizeProfile,
  proteinWeightLb,
} from "./macros";
import { profile } from "./fixtures";
import type { GoalId, Profile } from "./types";

describe("dailyTargets", () => {
  it("applies Mifflin-St Jeor with a 1.5 activity factor", () => {
    // BMR = 10(58.968) + 6.25(165.1) - 5(19) - 161 = 1365.6; × 1.5 = 2048 → 2050
    expect(dailyTargets(profile())).toEqual({ kcal: 2050, protein: 104, carbs: 280, fat: 57 });
  });

  it("uses the male constant and an 18% deficit on a cut", () => {
    const p = profile({ gender: "male", age: 20, heightIn: 70, weightLb: 170, goal: "cut" });
    // BMR 1787.4 × 1.5 × 0.82 = 2198 → 2200 (deficit 482, under the 500 cap)
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

  it("ranks goals by calories: cut < maintain < lean-bulk", () => {
    const kcal = (goal: GoalId) => dailyTargets(profile({ goal })).kcal;
    expect(kcal("cut")).toBeLessThan(kcal("maintain"));
    expect(kcal("maintain")).toBeLessThan(kcal("lean-bulk"));
  });

  it("scales protein per pound by goal", () => {
    expect(dailyTargets(profile({ goal: "lean-bulk", weightLb: 150 })).protein).toBe(135);
    expect(dailyTargets(profile({ goal: "cut", weightLb: 150 })).protein).toBe(150);
  });

  it("keeps carbs at 60 g or more across a wide range of bodies and goals", () => {
    for (const gender of ["female", "male", "other"] as const)
      for (const heightIn of [54, 62, 70, 78])
        for (const weightLb of [90, 140, 200, 300])
          for (const goal of ["cut", "maintain", "lean-bulk"] as const)
            for (const highProtein of [false, true]) {
              const p = profile({ gender, heightIn, weightLb, goal, highProtein, age: 22 });
              expect(dailyTargets(p).carbs).toBeGreaterThanOrEqual(60);
            }
  });
});

describe("high protein toggle", () => {
  it("raises protein to 1.2 g/lb on any goal without changing calories", () => {
    const base = dailyTargets(profile({ weightLb: 150 }));
    const high = dailyTargets(profile({ weightLb: 150, highProtein: true }));
    expect(high.protein).toBe(180);
    expect(high.kcal).toBe(base.kcal);
  });
});

describe("guardrails", () => {
  const underweight = profile({ heightIn: 66, weightLb: 105 }); // BMI ≈ 17

  it("disables Cut under BMI 18.5 and plans it as Maintain", () => {
    expect(canCut(underweight)).toBe(false);
    expect(effectiveGoal({ ...underweight, goal: "cut" })).toBe("maintain");
    expect(dailyTargets({ ...underweight, goal: "cut" })).toEqual(dailyTargets(underweight));
  });

  it("allows Cut from BMI 18.5", () => {
    expect(canCut(profile({ heightIn: 66, weightLb: 115 }))).toBe(true); // BMI ≈ 18.6
  });

  it("caps the deficit at 500 kcal below maintenance", () => {
    const big = profile({ gender: "male", age: 20, heightIn: 74, weightLb: 250, goal: "cut" });
    // Maintenance 3320.6; 18% would be a 598 kcal cut, so it caps at 2820.6 → 2820
    expect(maintenanceKcal(big)).toBeCloseTo(3320.6, 0);
    expect(dailyTargets(big).kcal).toBe(2820);
  });

  it("never goes below 1,200 kcal for women and other genders", () => {
    // Maintenance 1445; Cut would be 1190
    const p = profile({ age: 30, heightIn: 56, weightLb: 85, goal: "cut" });
    expect(dailyTargets(p).kcal).toBe(1200);
    expect(dailyTargets({ ...p, gender: "other" }).kcal).toBeGreaterThanOrEqual(1200);
  });

  it("never goes below 1,500 kcal for men", () => {
    // Maintenance 1735; Cut would be 1420
    const p = profile({ gender: "male", age: 40, heightIn: 58, weightLb: 95, goal: "cut" });
    expect(dailyTargets(p).kcal).toBe(1500);
  });

  it("bases protein on the weight at BMI 25 when BMI is over 30", () => {
    const p = profile({ gender: "male", heightIn: 74, weightLb: 250, goal: "cut" }); // BMI ≈ 32
    expect(proteinWeightLb(p)).toBeCloseTo(194.7, 0);
    expect(dailyTargets(p).protein).toBe(195);
  });

  it("uses actual weight for protein at BMI 30 and under", () => {
    expect(proteinWeightLb(profile({ weightLb: 150 }))).toBe(150);
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

describe("normalizeProfile", () => {
  it("turns the old High Protein goal into Maintain plus the toggle", () => {
    const legacy = { ...profile(), goal: "high-protein" } as unknown as Profile;
    expect(normalizeProfile(legacy)).toMatchObject({ goal: "maintain", highProtein: true });
  });

  it("leaves current profiles untouched", () => {
    const p = profile({ goal: "cut" });
    expect(normalizeProfile(p)).toBe(p);
  });
});
