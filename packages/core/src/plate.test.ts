import { describe, expect, it } from "vitest";
import {
  MAX_SIDE_SERVINGS,
  PLATE_FAT_TOLERANCE,
  PLATE_KCAL_TOLERANCE,
  availableItems,
  buildPlate,
  canSwap,
  swapItem,
  totals,
} from "./plate";
import type { MenuItem } from "./types";
import { item, menu } from "./fixtures";

const target = { kcal: 700, protein: 40, carbs: 80, fat: 20 };

describe("availableItems", () => {
  it("filters by hall and meal", () => {
    const ids = availableItems(menu, "village", "Lunch", []).map((i) => i.id);
    expect(ids).not.toContain("evk-rice");
    expect(ids).not.toContain("pancake");
    expect(ids).toContain("chicken");
  });

  it("requires every selected diet tag", () => {
    const ids = availableItems(menu, "village", "Lunch", ["vegan"]).map((i) => i.id);
    expect(ids).toEqual(["tofu", "rice", "broccoli"]);
  });
});

describe("totals", () => {
  it("multiplies macros by quantity", () => {
    const [chicken, rice] = [menu[0]!, menu[2]!];
    expect(
      totals([
        { id: "a", item: chicken, qty: 2 },
        { id: "b", item: rice, qty: 1 },
      ]),
    ).toEqual({
      kcal: 390,
      protein: 54,
      carbs: 23,
      fat: 7,
    });
  });

  it("is zero for an empty plate", () => {
    expect(totals([])).toEqual({ kcal: 0, protein: 0, carbs: 0, fat: 0 });
  });
});

describe("buildPlate", () => {
  it("builds a protein, a carb and a veg", () => {
    const roles = buildPlate(menu, "village", "Lunch", [], target).map((p) => p.item.role);
    expect(roles).toEqual(expect.arrayContaining(["protein", "carb", "veg"]));
  });

  it("keeps mains between 1 and 4 and sides at most 1.5", () => {
    const huge = { kcal: 5000, protein: 400, carbs: 600, fat: 150 };
    for (const p of buildPlate(menu, "village", "Lunch", [], huge)) {
      expect(p.qty).toBeGreaterThanOrEqual(1);
      const isSide = p.item.role === "veg" || p.item.role === "extra";
      expect(p.qty).toBeLessThanOrEqual(isSide ? MAX_SIDE_SERVINGS : 4);
    }
  });

  it("respects diet filters", () => {
    const plate = buildPlate(menu, "village", "Lunch", ["vegan"], target);
    expect(plate.every((p) => p.item.tags.includes("vegan"))).toBe(true);
  });

  it("rotates between near-best plates with the seed", () => {
    const more = [
      ...menu,
      item({ id: "quinoa", role: "carb", kcal: 120, protein: 4, carbs: 22, fat: 2 }),
      item({ id: "turkey", role: "protein", kcal: 110, protein: 22, carbs: 0, fat: 2 }),
    ];
    const ids = (seed: number) =>
      buildPlate(more, "village", "Lunch", [], target, seed)
        .map((p) => p.item.id)
        .sort()
        .join();
    expect(new Set([0, 1, 2].map(ids)).size).toBeGreaterThan(1);
  });

  it("returns an empty plate when nothing is served", () => {
    expect(buildPlate(menu, "parkside", "Lunch", [], target)).toEqual([]);
  });

  // Regression: a lean-bulk dinner came out at 820/1,100 cal and 10/43 g fat, padded with
  // 4 scoops of honeydew. Village's real dinner menu (10/21 fixture numbers).
  it("balances calories and fat on a bulking dinner, without filler", () => {
    const v = (
      id: string,
      role: MenuItem["role"],
      kcal: number,
      protein: number,
      carbs: number,
      fat: number,
    ) => item({ id, role, kcal, protein, carbs, fat, meals: ["Dinner"] });
    const villageDinner = [
      v("chicken", "protein", 120, 24, 0, 3),
      v("carne-asada", "protein", 165, 20, 1, 9),
      v("salmon", "protein", 230, 26, 0, 14),
      v("tofu", "protein", 95, 11, 4, 5),
      v("chickpeas", "protein", 105, 6, 16, 3),
      v("rice", "carb", 180, 4, 38, 2),
      v("sweet-potato", "carb", 110, 2, 24, 2),
      v("penne", "carb", 200, 8, 41, 2),
      v("broccoli", "veg", 45, 3, 6, 2),
      v("spring-mix", "veg", 25, 2, 4, 0),
      v("berries", "extra", 40, 1, 9, 0),
    ];
    const bulkDinner = { kcal: 1100, protein: 60, carbs: 140, fat: 43 };
    const plate = buildPlate(villageDinner, "village", "Dinner", [], bulkDinner);
    const t = totals(plate);

    expect(Math.abs(t.kcal - 1100) / 1100).toBeLessThanOrEqual(PLATE_KCAL_TOLERANCE);
    expect(Math.abs(t.fat - 43) / 43).toBeLessThanOrEqual(PLATE_FAT_TOLERANCE);
    for (const p of plate.filter((p) => p.item.role === "veg" || p.item.role === "extra")) {
      expect(p.qty).toBeLessThanOrEqual(MAX_SIDE_SERVINGS);
    }
  });
});

describe("buildPlate row ids", () => {
  it("gives every row a unique id", () => {
    const plate = buildPlate(menu, "village", "Lunch", [], { ...target, protein: 120, kcal: 1500 });
    expect(new Set(plate.map((p) => p.id)).size).toBe(plate.length);
  });
});

describe("swapItem", () => {
  const row = (id: string, i: number, qty = 1) => ({ id, item: menu[i]!, qty });

  it("swaps the row to a different item with the same role", () => {
    const [swapped] = swapItem(menu, [row("a", 0)], "a", "village", "Lunch", []);
    expect(swapped!.item.id).toBe("tofu");
    expect(swapped!.id).toBe("a");
  });

  it("picks the quantity that best matches the original calories and protein", () => {
    // 1 chicken = 140 kcal / 26 g protein. 2 tofu (180 / 20) scores closer than 1 (90 / 10) or 3 (270 / 30).
    const [swapped] = swapItem(menu, [row("a", 0)], "a", "village", "Lunch", []);
    expect(swapped!.qty).toBe(2);
  });

  // Regression: swap used to exclude only the swapped item, so it could pick an item already
  // on the plate. The duplicate rows shared an item id and then swapped together.
  it("never picks an item that is already on the plate", () => {
    const plate = [row("a", 0), row("b", 1)]; // chicken + tofu, the only two proteins
    expect(swapItem(menu, plate, "a", "village", "Lunch", [])).toEqual(plate);
  });

  it("only changes the targeted row", () => {
    const seitan = item({ id: "seitan", role: "protein", protein: 20 });
    const plate = [row("a", 0), row("b", 1)];
    const next = swapItem([...menu, seitan], plate, "a", "village", "Lunch", []);
    expect(next.map((p) => p.item.id)).toEqual(["seitan", "tofu"]);
    expect(next[1]).toBe(plate[1]);
  });

  it("leaves the plate alone when there's no alternative or no such row", () => {
    const plate = [row("a", 3, 2)];
    expect(swapItem(menu, plate, "a", "village", "Lunch", [])).toEqual(plate);
    expect(swapItem(menu, plate, "nope", "village", "Lunch", [])).toEqual(plate);
  });
});

describe("canSwap", () => {
  const row = (id: string, i: number) => ({ id, item: menu[i]!, qty: 1 });

  it("is true when another item with the same role is free", () => {
    expect(canSwap(menu, [row("a", 0)], "a", "village", "Lunch", [])).toBe(true);
  });

  // Regression: Swap showed on rows like the fruit bar with nothing to swap to, and did nothing.
  it("is false when every same-role item is already on the plate", () => {
    const plate = [row("a", 0), row("b", 1)]; // chicken + tofu, the only two proteins
    expect(canSwap(menu, plate, "a", "village", "Lunch", [])).toBe(false);
  });
});
