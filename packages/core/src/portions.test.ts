import { describe, expect, it } from "vitest";
import { item } from "./fixtures";
import { formatQty, portionLabel, portionWeight, utensilFor, withUtensil } from "./portions";

describe("utensilFor", () => {
  it.each([
    ["Chana Masala", "Indian", "ladle"],
    ["Chicken Tortilla Soup", "Soup", "ladle"],
    ["Steamed White Rice", "Hot Line", "scoop"],
    ["Mac & Cheese", "Comfort", "scoop"],
    ["Mashed Potatoes", "Hot Line", "scoop"],
    ["Tandoori Chicken", "Indian", "piece"],
    ["Roasted Vegetables", "Hot Line", "piece"],
    ["Pepperoni Pizza", "Pizza", "slice"],
    ["Black Beans", "Hot Line", "spoonful"],
    ["Greek Yogurt", "Breakfast", "cup"],
    ["Hard Boiled Egg", "Breakfast", "each"],
    ["Chocolate Chip Cookie", "Dessert", "each"],
  ])("%s → %s", (name, station, unit) => {
    expect(utensilFor(name, station)).toBe(unit);
  });
  it("falls back to the station, then null", () => {
    expect(utensilFor("Chef's Special", "Soup Bar")).toBe("ladle");
    expect(utensilFor("Chef's Special", "Action Station")).toBeNull();
  });
});

describe("withUtensil", () => {
  it("relabels the unit and keeps macros per unit", () => {
    const out = withUtensil(
      item({ id: "c", name: "Chana Masala", unit: "serving", unitPlural: "servings", kcal: 200 }),
    );
    expect(out).toMatchObject({ unit: "ladle", unitPlural: "ladles", grams: 170, kcal: 200 });
  });
  it("keeps a known weight", () => {
    expect(withUtensil(item({ id: "r", name: "Rice", grams: 158 })).grams).toBe(158);
  });
  it("keeps a countable noun", () => {
    expect(
      withUtensil(item({ id: "e", name: "Hard Boiled Egg", unit: "egg", unitPlural: "eggs" })).unit,
    ).toBe("egg");
  });
  it("falls back to serving", () => {
    expect(withUtensil(item({ id: "x", name: "Chef's Special", station: "Action" })).unit).toBe(
      "serving",
    );
  });
});

describe("labels", () => {
  it("steps in halves", () => {
    expect(formatQty(0.5)).toBe("½");
    expect(formatQty(1.5)).toBe("1½");
    expect(portionLabel({ unit: "ladle", unitPlural: "ladles" }, 1)).toBe("1 ladle");
    expect(portionLabel({ unit: "ladle", unitPlural: "ladles" }, 1.5)).toBe("1½ ladles");
    expect(portionLabel({ unit: "piece", unitPlural: "pieces" }, 2)).toBe("2 pieces");
  });
  it("shows weight when known", () => {
    expect(portionWeight({ grams: 170 }, 1)).toBe("~170g");
    expect(portionWeight({}, 1)).toBeNull();
  });
});
