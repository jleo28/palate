import { describe, expect, it } from "vitest";
import { daySlots, fitSummary, isSnack, mealGuide, menuPeriod, slotShare } from "./budget";
import { buildSnack, totals } from "./plate";
import { item } from "./fixtures";

const daily = { kcal: 2000, protein: 100, carbs: 250, fat: 60 };
const none = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

describe("day slots", () => {
  it("is just the three meals without snacks", () => {
    expect(daySlots()).toEqual(["Breakfast", "Lunch", "Dinner"]);
  });

  it("puts snacks in time order", () => {
    expect(daySlots(["Late-night snack", "Afternoon snack"])).toEqual([
      "Breakfast",
      "Lunch",
      "Afternoon snack",
      "Dinner",
      "Late-night snack",
    ]);
  });

  it("draws snacks from the nearest hall meal", () => {
    expect(menuPeriod("Afternoon snack")).toBe("Lunch");
    expect(menuPeriod("Late-night snack")).toBe("Dinner");
    expect(menuPeriod("Breakfast")).toBe("Breakfast");
    expect(isSnack("Dinner")).toBe(false);
  });

  it("keeps shares adding up to 1 with any snacks", () => {
    for (const snacks of [
      [],
      ["Afternoon snack"],
      ["Afternoon snack", "Late-night snack"],
    ] as const) {
      const slots = daySlots(snacks);
      const total = slots.reduce((sum, s) => sum + slotShare(s, slots), 0);
      expect(total).toBeCloseTo(1, 10);
    }
  });
});

describe("guides with snacks", () => {
  const slots = daySlots(["Afternoon snack", "Late-night snack"]);

  it("saves 10% of the day for each snack and shrinks meals to fit", () => {
    expect(mealGuide(daily, none, "Afternoon snack", [], slots).kcal).toBe(200);
    // Lunch's 36% of the 80% left for meals
    expect(mealGuide(daily, none, "Lunch", [], slots).kcal).toBe(576);
  });

  it("leaves meals unchanged without snacks", () => {
    expect(mealGuide(daily, none, "Lunch", [], daySlots()).kcal).toBe(720);
  });

  it("lets a logged snack move the rest of the day like a meal", () => {
    const afterBigSnack = mealGuide(
      daily,
      { ...none, kcal: 1500 },
      "Late-night snack",
      ["Breakfast", "Lunch", "Afternoon snack", "Dinner"],
      slots,
    );
    expect(afterBigSnack.kcal).toBe(500);
  });

  it("names the next slot, snack or meal, in the fit summary", () => {
    const fit = {
      over: [{ macro: "carbs" as const, by: 20 }],
      dayOverCap: false,
      capReached: false,
      lowProtein: false,
    };
    expect(fitSummary(fit, "Lunch", slots)).toMatch(/Afternoon snack can balance it out/);
  });
});

describe("buildSnack", () => {
  const menu = [
    item({
      id: "yogurt",
      station: "Fruit Bar",
      role: "extra",
      kcal: 120,
      protein: 12,
      meals: ["Lunch"],
    }),
    item({
      id: "banana",
      station: "Fruit Bar",
      role: "extra",
      kcal: 105,
      protein: 1,
      meals: ["Lunch"],
    }),
    item({
      id: "egg",
      station: "Breakfast Line",
      role: "protein",
      kcal: 72,
      protein: 6,
      meals: ["Lunch"],
    }),
    item({
      id: "broccoli",
      station: "Hot Line",
      role: "veg",
      kcal: 45,
      protein: 3,
      meals: ["Lunch"],
    }),
    item({
      id: "meatballs",
      station: "Hot Line",
      role: "protein",
      kcal: 75,
      protein: 6,
      meals: ["Lunch"],
    }),
    item({ id: "rice", role: "carb", kcal: 200, meals: ["Lunch"] }),
    item({ id: "steak", role: "protein", kcal: 450, protein: 40, meals: ["Lunch"] }),
  ];
  const target = { kcal: 200, protein: 10, carbs: 25, fat: 7 };

  it("builds a light snack that stays near the guide", () => {
    const snack = buildSnack(menu, "village", "Lunch", [], target);
    expect(snack.length).toBeGreaterThanOrEqual(1);
    expect(snack.length).toBeLessThanOrEqual(2);
    expect(totals(snack).kcal).toBeLessThanOrEqual(target.kcal * 1.15);
  });

  it("prefers grab-and-go items over hot sides", () => {
    for (let seed = 0; seed < 5; seed++) {
      const ids = buildSnack(menu, "village", "Lunch", [], target, seed).map((r) => r.item.id);
      expect(ids).not.toContain("broccoli");
      expect(ids).not.toContain("meatballs");
    }
  });

  it("falls back to hot sides when there's nothing grab-and-go", () => {
    const sides = [item({ id: "greens", role: "veg", kcal: 60, meals: ["Lunch"] })];
    expect(buildSnack(sides, "village", "Lunch", [], target).map((r) => r.item.id)).toEqual([
      "greens",
    ]);
  });

  it("skips meal-sized items and carb sides", () => {
    const ids = buildSnack(menu, "village", "Lunch", [], target).map((r) => r.item.id);
    expect(ids).not.toContain("steak");
    expect(ids).not.toContain("rice");
  });

  it("gives every row a unique id", () => {
    const snack = buildSnack(menu, "village", "Lunch", [], { ...target, kcal: 300 });
    expect(new Set(snack.map((r) => r.id)).size).toBe(snack.length);
  });

  it("is empty when there's nothing to snack on or no room left", () => {
    expect(buildSnack(menu, "evk", "Lunch", [], target)).toEqual([]);
    expect(buildSnack(menu, "village", "Lunch", [], { ...target, kcal: 0 })).toEqual([]);
  });
});
