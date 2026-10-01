import { describe, expect, it } from "vitest";
import { customAllergyMatches, hasAllergyConflict, withoutAllergyConflicts } from "./allergens";
import { item } from "./fixtures";

const named = (name: string) => item({ id: name, name });

describe("customAllergyMatches", () => {
  it("matches a term in the item name, ignoring case", () => {
    expect(customAllergyMatches(named("Coconut Curry Chicken"), ["coconut"])).toEqual(["coconut"]);
  });

  it("matches singular and plural forms both ways", () => {
    expect(customAllergyMatches(named("Strawberry Yogurt"), ["Strawberries"])).toHaveLength(1);
    expect(customAllergyMatches(named("Assorted Strawberries"), ["strawberry"])).toHaveLength(1);
    expect(customAllergyMatches(named("Roasted Tomato Soup"), ["tomatoes"])).toHaveLength(1);
    expect(customAllergyMatches(named("Sautéed Mushrooms"), ["mushroom"])).toHaveLength(1);
  });

  it("matches whole words only", () => {
    expect(customAllergyMatches(named("Pineapple Salsa"), ["apple"])).toEqual([]);
    expect(customAllergyMatches(named("Corned Beef"), ["corn"])).toEqual([]);
  });

  it("treats regex characters in a term literally", () => {
    expect(customAllergyMatches(named("Mac (and) Cheese"), ["(and)"])).toEqual([]);
    expect(() => customAllergyMatches(named("Anything"), ["[*"])).not.toThrow();
  });

  it("ignores blank terms and empty lists", () => {
    expect(customAllergyMatches(named("Rice"), ["  "])).toEqual([]);
    expect(customAllergyMatches(named("Rice"), undefined)).toEqual([]);
  });
});

describe("allergy conflicts", () => {
  const curry = item({ id: "curry", name: "Coconut Curry" });
  const pasta = item({ id: "pasta", name: "Penne Pasta", allergens: ["wheat"] });
  const rice = item({ id: "rice", name: "Brown Rice" });

  it("counts both listed allergens and custom matches", () => {
    expect(hasAllergyConflict(pasta, ["wheat"], [])).toBe(true);
    expect(hasAllergyConflict(curry, [], ["coconut"])).toBe(true);
    expect(hasAllergyConflict(rice, ["wheat"], ["coconut"])).toBe(false);
  });

  it("keeps flagged items out of the menu used for plates", () => {
    const ids = withoutAllergyConflicts([curry, pasta, rice], ["wheat"], ["coconut"]).map(
      (i) => i.id,
    );
    expect(ids).toEqual(["rice"]);
  });
});
