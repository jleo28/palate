import { describe, expect, it } from "vitest";
import { availableItems, buildPlate, swapItem, totals } from "./plate";
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
  it("anchors on the highest-protein item, then adds a carb and a veg", () => {
    const plate = buildPlate(menu, "village", "Lunch", [], target);
    expect(plate.map((p) => p.item.role).slice(0, 3)).toEqual(["protein", "carb", "veg"]);
    expect(plate[0]!.item.id).toBe("chicken");
  });

  it("portions the anchor to about 65% of the protein target", () => {
    const [anchor] = buildPlate(menu, "village", "Lunch", [], target);
    // 40 g × 0.65 = 26 g → one 26 g tong of chicken
    expect(anchor).toEqual({ id: "row-0", item: menu[0], qty: 1 });
  });

  it("keeps every quantity between 1 and 4", () => {
    const huge = { kcal: 5000, protein: 400, carbs: 600, fat: 150 };
    for (const p of buildPlate(menu, "village", "Lunch", [], huge)) {
      expect(p.qty).toBeGreaterThanOrEqual(1);
      expect(p.qty).toBeLessThanOrEqual(4);
    }
  });

  it("tops up protein with a second, different protein when short", () => {
    const plate = buildPlate(menu, "village", "Lunch", [], { ...target, protein: 120 });
    const proteins = plate.filter((p) => p.item.role === "protein").map((p) => p.item.id);
    expect(proteins).toEqual(["chicken", "tofu"]);
  });

  it("adds an extra when calories fall short", () => {
    const plate = buildPlate(menu, "village", "Lunch", [], { ...target, kcal: 1500 });
    expect(plate.some((p) => p.item.role === "extra")).toBe(true);
  });

  it("respects diet filters", () => {
    const plate = buildPlate(menu, "village", "Lunch", ["vegan"], target);
    expect(plate.every((p) => p.item.tags.includes("vegan"))).toBe(true);
  });

  it("rotates choices with the seed", () => {
    const two = [...menu, item({ id: "quinoa", role: "carb", carbs: 20 })];
    const a = buildPlate(two, "village", "Lunch", [], target, 0);
    const b = buildPlate(two, "village", "Lunch", [], target, 1);
    expect(a.find((p) => p.item.role === "carb")!.item.id).not.toBe(
      b.find((p) => p.item.role === "carb")!.item.id,
    );
  });

  it("returns an empty plate when nothing is served", () => {
    expect(buildPlate(menu, "parkside", "Lunch", [], target)).toEqual([]);
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
