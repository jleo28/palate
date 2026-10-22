import { describe, expect, it } from "vitest";
import { isHeader, itemKind, matchName, parseUscDay, type UscDay } from "./usc-menu";
import evkDay from "./fixtures-usc/evk-2026-10-21.json";

describe("cleanup rules", () => {
  it("drops section headers", () => {
    for (const h of [
      "SALAD BAR",
      "HIBACHI POP UP",
      "MADE TO ORDER OMELETES",
      "Make Your Own Waffle Bar",
      "Daily Grill Specials (including Veggie Burgers and Halal Beef Burgers)",
      "Little Northern Bakehouse Allergen Free Bread Available Upon Request",
    ]) {
      expect(isHeader(h), h).toBe(true);
    }
    expect(isHeader("Cheese Pizza")).toBe(false);
  });

  it("strips USC prefixes and brand words for matching", () => {
    expect(matchName("AAZ  Roasted Asparagus")).toBe("Roasted Asparagus");
    expect(matchName("Molly's Moroccan Lentil Soup")).toBe("Moroccan Lentil Soup");
    expect(matchName("Gardein Veggie Meatballs")).toBe("Veggie Meatballs");
  });

  it("tags toppings and condiments as components", () => {
    for (const c of [
      "Ranch Dressing",
      "Brown Gravy",
      "Chopped Onion",
      "Sliced Black Olives",
      "Powdered Sugar",
      "Olive/Canola Oil Blend",
    ]) {
      expect(itemKind(c), c).toBe("component");
    }
    for (const c of ["Harissa Aioli", "Lime Wedges"]) expect(itemKind(c), c).toBe("component");
    for (const d of [
      "Roasted Sweet Potato Wedges",
      "Garlic Mashed Potatoes",
      "Jamaican Jerk Grilled Chicken",
      "Cheese Pizza",
      "Oatmeal",
    ]) {
      expect(itemKind(d), d).toBe("dish");
    }
  });
});

describe("parseUscDay", () => {
  const evk = parseUscDay(evkDay as UscDay, "evk");

  it("keeps one item per dish, with every meal it's served at", () => {
    const keys = evk.map((i) => i.key);
    expect(new Set(keys).size).toBe(keys.length);
    expect(evk.some((i) => i.meals.length > 1)).toBe(true);
  });

  it("never includes headers", () => {
    expect(evk.some((i) => /OMELETES/i.test(i.name))).toBe(false);
  });

  it("maps USC allergen slugs to ours", () => {
    const toast = evk.find((i) => i.name === "Country Style French Toast")!;
    expect(toast.allergens.sort()).toEqual(["egg", "milk", "soy", "wheat"]);
    expect(toast.tags).toContain("vegetarian");
    expect(toast.tags).not.toContain("gluten-free");
  });

  it("treats not-analyzed allergens as unknown, never as free-from", () => {
    const [item] = parseUscDay(
      {
        meals: [
          {
            name: "Dinner",
            stations: [
              { station: "Grill", menu: [{ item: "Mystery Stew", allergens: ["not-analyzed"] }] },
            ],
          },
        ],
      },
      "evk",
    );
    expect(item!.allergensUnknown).toBe(true);
    expect(item!.tags).not.toContain("gluten-free");
    expect(item!.tags).not.toContain("dairy-free");
  });

  it("serves weekend brunch at breakfast and lunch", () => {
    const brunch = parseUscDay(
      { meals: [{ name: "Brunch", stations: [{ station: "Grill", menu: [{ item: "Bacon" }] }] }] },
      "evk",
    );
    expect(brunch[0]!.meals).toEqual(["Breakfast", "Lunch"]);
  });
});
