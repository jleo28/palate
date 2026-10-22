import { describe, expect, it } from "vitest";
import {
  bestMatch,
  estimateFromFdc,
  isConfidentMatch,
  servingFor,
  type FdcFood,
} from "./usda-match";

import searchJson from "./fixtures-usc/fdc-garlic-mashed-potatoes.json";

const search = searchJson as { foods: FdcFood[] };

describe("isConfidentMatch", () => {
  it("matches when the main noun and most words line up", () => {
    expect(isConfidentMatch("Garlic Mashed Potatoes", "Potato, mashed, NFS")).toBe(true);
    expect(
      isConfidentMatch("Steamed Long Grain White Rice", "Rice, white, cooked, long grain"),
    ).toBe(true);
  });

  it("rejects a different main food", () => {
    expect(isConfidentMatch("Jackfruit, Mushroom, and Lentil Pot Roast", "Beef, pot roast")).toBe(
      false,
    );
    // "casserole" makes it a different dish.
    expect(isConfidentMatch("Garlic Mashed Potatoes", "Sweet potato, casserole or mashed")).toBe(
      false,
    );
    expect(isConfidentMatch("Oyster Mushroom Etouffee", "Shrimp etouffee")).toBe(false);
  });

  it("never matches a plant-based dish to meat", () => {
    expect(isConfidentMatch("Veggie Chorizo", "Chorizo, pork")).toBe(false);
    expect(isConfidentMatch("Veggie Meatballs", "Meatballs, beef")).toBe(false);
    expect(isConfidentMatch("Veggie Meatballs", "Meatballs, meatless")).toBe(true);
  });
});

describe("estimateFromFdc", () => {
  it("scales USDA's per-100 g values to its typical serving", () => {
    const food = bestMatch("Garlic Mashed Potatoes", search.foods)!;
    expect(food.description).toBe("Potato, mashed, NFS");
    // 114 kcal / 100 g × 125 g typical serving
    expect(estimateFromFdc(food)).toMatchObject({
      kcal: 143,
      protein: 2.7,
      carbs: 22,
      fat: 5.1,
      role: "carb",
      source: "usda",
      fdcId: 2709492,
    });
  });
});

describe("different-dish words", () => {
  it("rejects matches that turn the food into another dish", () => {
    expect(isConfidentMatch("Bacon", "Bacon bits")).toBe(false);
    expect(isConfidentMatch("Assorted Fruits", "Fruit smoothie, with whole fruit and dairy")).toBe(
      false,
    );
    expect(isConfidentMatch("Pepperoni Pizza", "Pizza with pepperoni, stuffed crust")).toBe(false);
    expect(
      isConfidentMatch(
        "Pepperoni Pizza",
        "Pizza with pepperoni, from restaurant or fast food, medium crust",
      ),
    ).toBe(true);
  });
});

describe("servingFor", () => {
  it("uses one piece when USDA lists one, not a whole pizza", () => {
    const pizza: FdcFood = {
      fdcId: 1,
      description: "Pizza with pepperoni",
      foodMeasures: [
        { disseminationText: '1 medium pizza (11-12" diameter)', gramWeight: 883 },
        { disseminationText: "1 piece, NFS", gramWeight: 164 },
        { disseminationText: "Quantity not specified", gramWeight: 328 },
      ],
    };
    expect(servingFor(pizza)).toEqual({ grams: 164, unit: "piece", unitPlural: "pieces" });
  });

  it("ignores tiny pieces like a single fry", () => {
    const fries: FdcFood = {
      fdcId: 3,
      description: "French fries",
      foodMeasures: [
        { disseminationText: "1 piece", gramWeight: 5 },
        { disseminationText: "Quantity not specified", gramWeight: 117 },
      ],
    };
    expect(servingFor(fries)).toEqual({ grams: 117, unit: "serving", unitPlural: "servings" });
  });

  it("caps an oversized typical serving at a cup", () => {
    const stew: FdcFood = {
      fdcId: 2,
      description: "Stew",
      foodMeasures: [
        { disseminationText: "Quantity not specified", gramWeight: 600 },
        { disseminationText: "1 cup", gramWeight: 245 },
      ],
    };
    expect(servingFor(stew).grams).toBe(245);
  });
});
