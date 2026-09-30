import { describe, expect, it } from "vitest";
import { allergenConflicts, allergenLabel, itemAllergens } from "./allergens";
import { dislikedMatches } from "./preferences";
import { item, menu } from "./fixtures";

describe("allergens", () => {
  it("reads allergens from the item and treats unlisted items as allergen-free", () => {
    expect(itemAllergens(menu[4]!)).toEqual(["wheat", "milk"]);
    expect(itemAllergens(menu[0]!)).toEqual([]);
  });

  it("returns only the allergens the user reacts to", () => {
    expect(allergenConflicts(menu[4]!, ["milk", "peanut"])).toEqual(["milk"]);
    expect(allergenConflicts(menu[4]!, [])).toEqual([]);
    expect(allergenConflicts(menu[4]!, undefined)).toEqual([]);
  });

  it("labels allergens for display", () => {
    expect(allergenLabel("tree-nut")).toBe("Tree nuts");
  });
});

describe("dislikedMatches", () => {
  it("matches dislikes against the item name", () => {
    const meatballs = item({ id: "m", name: "Turkey Meatballs" });
    expect(dislikedMatches(meatballs, ["beef", "turkey", "rice"]).map((d) => d.id)).toEqual([
      "beef",
      "turkey",
    ]);
  });

  it("returns nothing when the user has no dislikes", () => {
    expect(dislikedMatches(menu[0]!, undefined)).toEqual([]);
  });
});
