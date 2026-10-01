import { describe, expect, it } from "vitest";
import { capPlate, fitCheck, fitSummary, mealGuide, remainingToday } from "./budget";
import { totals } from "./plate";
import { item } from "./fixtures";

const daily = { kcal: 2000, protein: 100, carbs: 250, fat: 60 };
const none = { kcal: 0, protein: 0, carbs: 0, fat: 0 };

describe("remainingToday", () => {
  it("subtracts what's been eaten and never goes negative", () => {
    expect(remainingToday(daily, { kcal: 2300, protein: 40, carbs: 100, fat: 70 })).toEqual({
      kcal: 0,
      protein: 60,
      carbs: 150,
      fat: 0,
    });
  });
});

describe("mealGuide", () => {
  it("matches the classic 28/36/36 split at the start of the day", () => {
    expect(mealGuide(daily, none, "Breakfast", []).kcal).toBe(560);
  });

  it("gives a lighter dinner after a heavy lunch", () => {
    const afterBreakfast = { kcal: 560, protein: 28, carbs: 70, fat: 17 };
    const heavyLunch = { kcal: 560 + 1100, protein: 80, carbs: 200, fat: 50 };
    const usual = mealGuide(daily, { ...afterBreakfast, kcal: 560 + 720 }, "Dinner", [
      "Breakfast",
      "Lunch",
    ]);
    const lighter = mealGuide(daily, heavyLunch, "Dinner", ["Breakfast", "Lunch"]);
    expect(usual.kcal).toBe(720);
    expect(lighter.kcal).toBe(340);
  });

  it("splits what's left between this meal and later unlogged meals", () => {
    // Breakfast eaten (560). Lunch's share of the remaining 1440 is 36 / 72.
    const guide = mealGuide(daily, { ...none, kcal: 560 }, "Lunch", ["Breakfast"]);
    expect(guide.kcal).toBe(720);
  });

  it("keeps the classic split when nothing has been logged, whatever the meal", () => {
    expect(mealGuide(daily, none, "Lunch", []).kcal).toBe(720);
    expect(mealGuide(daily, none, "Dinner", []).kcal).toBe(720);
  });

  it("keeps an unlogged earlier meal's share instead of piling it onto dinner", () => {
    // Heavy lunch logged (1200), breakfast never logged: dinner gets 36 / 64 of the 800 left.
    expect(mealGuide(daily, { ...none, kcal: 1200 }, "Dinner", ["Lunch"]).kcal).toBe(450);
  });

  it("gives the last meal everything that's left", () => {
    expect(mealGuide(daily, { ...none, kcal: 1500 }, "Dinner", ["Breakfast", "Lunch"]).kcal).toBe(
      500,
    );
  });

  it("is zero once the day's cap is reached", () => {
    expect(mealGuide(daily, { ...none, kcal: 2100 }, "Dinner", ["Lunch"]).kcal).toBe(0);
  });
});

describe("capPlate", () => {
  const chicken = item({ id: "chicken", role: "protein", kcal: 150 });
  const rice = item({ id: "rice", role: "carb", kcal: 100 });
  const cookie = item({ id: "cookie", role: "extra", kcal: 200 });
  const plate = [
    { id: "a", item: chicken, qty: 3 },
    { id: "b", item: rice, qty: 2 },
    { id: "c", item: cookie, qty: 1 },
  ]; // 450 + 200 + 200 = 850

  it("leaves a plate that already fits alone", () => {
    expect(capPlate(plate, 900)).toEqual(plate);
  });

  it("trims the largest portions first", () => {
    const capped = capPlate(plate, 700);
    expect(totals(capped).kcal).toBeLessThanOrEqual(700);
    expect(capped.find((r) => r.id === "a")!.qty).toBe(2);
  });

  it("drops extras once every portion is down to one", () => {
    const capped = capPlate(plate, 250);
    expect(capped.map((r) => r.id)).toEqual(["a", "b"]);
    expect(capped.every((r) => r.qty === 1)).toBe(true);
  });

  it("never empties the plate", () => {
    expect(capPlate(plate, 0).length).toBeGreaterThan(0);
  });

  it("doesn't mutate the input", () => {
    capPlate(plate, 100);
    expect(plate[0]!.qty).toBe(3);
  });
});

describe("fitCheck and fitSummary", () => {
  const guide = { kcal: 700, protein: 35, carbs: 85, fat: 22 };

  it("says a balanced plate fits", () => {
    const fit = fitCheck({ kcal: 690, protein: 36, carbs: 80, fat: 20 }, guide, none, daily);
    expect(fit.over).toEqual([]);
    expect(fitSummary(fit, "Lunch")).toBe("This plate fits your lunch nicely.");
  });

  it("names the macro that's over and by how much", () => {
    const fit = fitCheck({ kcal: 740, protein: 36, carbs: 105, fat: 20 }, guide, none, daily);
    expect(fit.over).toEqual([{ macro: "carbs", by: 20 }]);
    expect(fitSummary(fit, "Lunch")).toBe(
      "A bit heavy on carbs (+20 g). Dinner can balance it out.",
    );
  });

  it("leads with calories before protein", () => {
    const fit = fitCheck({ kcal: 820, protein: 50, carbs: 85, fat: 22 }, guide, none, daily);
    expect(fitSummary(fit, "Dinner")).toBe("A bit heavy on calories (+120 cal).");
  });

  it("ignores small overshoots", () => {
    const fit = fitCheck({ kcal: 740, protein: 40, carbs: 90, fat: 25 }, guide, none, daily);
    expect(fit.over).toEqual([]);
  });

  it("flags when the plate would take the day over its cap", () => {
    const fit = fitCheck(guide, guide, { ...none, kcal: 1400 }, daily);
    expect(fit.dayOverCap).toBe(true);
    expect(fit.capReached).toBe(false);
  });

  it("flags when the cap is already reached, without scolding", () => {
    const fit = fitCheck(guide, guide, { ...none, kcal: 2000 }, daily);
    expect(fit.capReached).toBe(true);
    expect(fitSummary(fit, "Dinner")).toMatch(/still hungry/);
  });

  it("notices a plate that's light on protein", () => {
    const fit = fitCheck({ kcal: 650, protein: 20, carbs: 85, fat: 20 }, guide, none, daily);
    expect(fitSummary(fit, "Dinner")).toMatch(/Light on protein/);
  });
});
