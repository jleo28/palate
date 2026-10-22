import { describe, expect, it } from "vitest";
import { bestMatch, estimateFromFdc, isConfidentMatch, type FdcFood } from "./usda-match";

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
    expect(isConfidentMatch("Garlic Mashed Potatoes", "Sweet potato, casserole or mashed")).toBe(
      true,
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
