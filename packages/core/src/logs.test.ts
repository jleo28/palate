import { describe, expect, it } from "vitest";
import {
  logItems,
  portionsEditable,
  removeLoggedItem,
  setLoggedQty,
  setLoggedTotals,
} from "./logs";
import { item } from "./fixtures";
import type { LoggedMeal } from "./types";

const chicken = item({ id: "c", name: "Chicken", kcal: 140, protein: 26, carbs: 0, fat: 3 });
const rice = item({
  id: "r",
  name: "Rice",
  unit: "spoonful",
  unitPlural: "spoonfuls",
  kcal: 110,
  protein: 2,
  carbs: 23,
  fat: 1,
});

const base = (
  items: LoggedMeal["items"],
  totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 },
): LoggedMeal => ({
  id: "m",
  date: "2026-10-05",
  hall: "village",
  meal: "Lunch",
  ...totals,
  items,
});

describe("logItems", () => {
  it("keeps portions and per-portion macros", () => {
    const [first] = logItems([{ id: "a", item: chicken, qty: 2 }]);
    expect(first).toEqual({
      name: "Chicken",
      portion: "2 tongs",
      qty: 2,
      unit: "tong",
      unitPlural: "tongs",
      per: { kcal: 140, protein: 26, carbs: 0, fat: 3 },
    });
  });
});

describe("editing a logged meal", () => {
  const meal = base(
    logItems([
      { id: "a", item: chicken, qty: 2 },
      { id: "b", item: rice, qty: 1 },
    ]),
    { kcal: 390, protein: 54, carbs: 23, fat: 7 },
  );

  it("changes portions and recomputes totals", () => {
    const next = setLoggedQty(meal, 0, 1);
    expect(next.items[0]).toMatchObject({ qty: 1, portion: "1 tong" });
    expect(next).toMatchObject({ kcal: 250, protein: 28, carbs: 23, fat: 4 });
  });

  it("clamps portions", () => {
    expect(setLoggedQty(meal, 1, 0).items[1]!.qty).toBe(1);
    expect(setLoggedQty(meal, 1, 99).items[1]!.qty).toBe(6);
  });

  it("removes an item and recomputes totals, keeping at least one", () => {
    const next = removeLoggedItem(meal, 1);
    expect(next.items.map((i) => i.name)).toEqual(["Chicken"]);
    expect(next.kcal).toBe(280);
    expect(removeLoggedItem(next, 0)).toBe(next);
  });
});

describe("meals without per-portion macros", () => {
  const outside = base([{ name: "Chipotle bowl", portion: "Estimated" }], {
    kcal: 750,
    protein: 40,
    carbs: 80,
    fat: 25,
  });

  it("can't have portions edited", () => {
    expect(portionsEditable(outside)).toBe(false);
    expect(setLoggedQty(outside, 0, 2)).toBe(outside);
  });

  it("can have totals set directly, rounded and never negative", () => {
    expect(
      setLoggedTotals(outside, { kcal: 640.4, protein: 38, carbs: -5, fat: 20 }),
    ).toMatchObject({
      kcal: 640,
      protein: 38,
      carbs: 0,
      fat: 20,
    });
  });
});
