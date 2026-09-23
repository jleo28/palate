import { describe, expect, it } from "vitest";
import { filterItems } from "../filters";
import { solvePlate } from "../solver";
import { swapItem } from "../swap";
import { getMenu } from "../menu";
import { dailyTargets } from "../targets";
import { sampleMenu } from "../../data/menu";
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

// Test 6: Solver is deterministic (same input twice, deep-equal output)
describe("solvePlate: determinism", () => {
  it("returns the exact same plate for the same inputs on repeated calls", () => {
    const p = profile();
    const targets = dailyTargets(p);
    const eligible = filterItems(getMenu(sampleMenu, "evk", "lunch", "2026-09-22"), p.diet, p.avoidAllergens);

    const a = solvePlate(eligible, targets.meals.lunch);
    const b = solvePlate(eligible, targets.meals.lunch);

    expect(a).toEqual(b);
  });
});

// Test 7: Vegan filter never returns an animal product, including in swaps and alternatives
describe("solvePlate: vegan filter", () => {
  it("only ever selects vegan-tagged items across the primary plate and alternatives", () => {
    const p = profile({ diet: ["vegan"] });
    const targets = dailyTargets(p);
    const eligible = filterItems(getMenu(sampleMenu, "village", "dinner", "2026-09-22"), p.diet, p.avoidAllergens);

    const { plate, alternatives } = solvePlate(eligible, targets.meals.dinner);
    const itemsById = new Map(eligible.map((i) => [i.id, i]));

    for (const candidatePlate of [plate, ...alternatives]) {
      for (const line of candidatePlate.lines) {
        const item = itemsById.get(line.itemId);
        expect(item?.tags.includes("vegan")).toBe(true);
      }
    }
  });

  it("only offers vegan swap options", () => {
    const p = profile({ diet: ["vegan"] });
    const targets = dailyTargets(p);
    const eligible = filterItems(getMenu(sampleMenu, "village", "dinner", "2026-09-22"), p.diet, p.avoidAllergens);
    const { plate } = solvePlate(eligible, targets.meals.dinner);

    const proteinLine = plate.lines.find((l) => eligible.find((i) => i.id === l.itemId)?.role === "protein");
    expect(proteinLine).toBeDefined();

    const options = swapItem(plate, proteinLine!.itemId, eligible);
    for (const option of options) {
      expect(option.item.tags.includes("vegan")).toBe(true);
    }
  });
});

// Test 8: Allergen exclusion never returns a matching item
describe("solvePlate: allergen exclusion", () => {
  it("never selects an item carrying an avoided allergen", () => {
    const p = profile({ avoidAllergens: ["milk", "egg"] });
    const targets = dailyTargets(p);
    const eligible = filterItems(getMenu(sampleMenu, "evk", "breakfast", "2026-09-22"), p.diet, p.avoidAllergens);

    const { plate, alternatives } = solvePlate(eligible, targets.meals.breakfast);
    const itemsById = new Map(sampleMenu.items.map((i) => [i.id, i]));

    for (const candidatePlate of [plate, ...alternatives]) {
      for (const line of candidatePlate.lines) {
        const item = itemsById.get(line.itemId);
        expect(item?.allergens.some((a) => p.avoidAllergens.includes(a))).toBe(false);
      }
    }
  });
});

// Test 10: Empty protein slot produces a note, not a crash
describe("solvePlate: empty slots", () => {
  it("adds a note instead of crashing when no items are eligible at all", () => {
    const targets = dailyTargets(profile());
    const { plate } = solvePlate([], targets.meals.lunch);
    expect(plate.lines).toHaveLength(0);
    expect(plate.notes.length).toBeGreaterThan(0);
  });

  it("adds a note when the protein slot alone has no eligible items", () => {
    const p = profile();
    const targets = dailyTargets(p);
    const eligible = filterItems(getMenu(sampleMenu, "evk", "lunch", "2026-09-22"), p.diet, p.avoidAllergens).filter(
      (i) => i.role !== "protein"
    );

    const { plate } = solvePlate(eligible, targets.meals.lunch);
    expect(plate.notes.some((n) => n.toLowerCase().includes("protein"))).toBe(true);
    expect(plate.lines.find((l) => eligible.find((i) => i.id === l.itemId)?.role === "protein")).toBeUndefined();
  });
});
