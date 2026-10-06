import { describe, expect, it } from "vitest";
import { foodKind, isCountable } from "./food-kind";

// Every item on the current menu (apps/web/src/lib/palate/menu.ts).
const MENU_NAMES = [
  "Grilled Chicken Breast",
  "Carne Asada",
  "Roasted Salmon Fillet",
  "Sesame Baked Tofu",
  "Cilantro Lime Rice",
  "Roasted Sweet Potato",
  "Whole Wheat Penne",
  "Roasted Broccoli",
  "Spring Mix Salad",
  "Marinated Chickpeas",
  "Scrambled Eggs",
  "Steel Cut Oatmeal",
  "Turkey Sausage Links",
  "Mixed Berries",
  "Nonfat Greek Yogurt",
  "Mongolian Wok Chicken",
  "Wok Tofu & Peppers",
  "Steamed Brown Rice",
  "Veggie Lo Mein",
  "Rotisserie Turkey",
  "Beef Meatballs",
  "Garlic Mashed Potatoes",
  "Garlic Green Beans",
  "Lemon Kale Salad",
  "Shelled Edamame",
  "Egg White Scramble",
  "Breakfast Potatoes",
  "Buttermilk Pancake",
  "Whole Banana",
  "Lemon Herb Chicken",
  "Garlic Shrimp",
  "Baked Falafel",
  "Herbed Quinoa",
  "Jasmine Rice",
  "Margherita Pizza Slice",
  "Grilled Zucchini",
  "Honey Roasted Carrots",
  "Romaine Caesar Base",
  "Cumin Black Beans",
  "Cottage Cheese",
  "Avocado Toast",
  "Hard Boiled Egg",
  "Cut Honeydew",
];

describe("foodKind", () => {
  it("gives every menu item a specific drawing", () => {
    const generic = MENU_NAMES.filter((n) => foodKind(n) === "food");
    expect(generic).toEqual([]);
  });

  it.each([
    ["Egg White Scramble", "scrambled"],
    ["Hard Boiled Egg", "boiled-egg"],
    ["Beef Meatballs", "round"],
    ["Turkey Sausage Links", "sausage"],
    ["Rotisserie Turkey", "chicken"],
    ["Garlic Mashed Potatoes", "mash"],
    ["Breakfast Potatoes", "potato"],
    ["Wok Tofu & Peppers", "tofu"],
    ["Garlic Green Beans", "sticks"],
    ["Cumin Black Beans", "round"],
  ] as const)("%s → %s", (name, kind) => {
    expect(foodKind(name)).toBe(kind);
  });

  it("falls back to a generic food", () => {
    expect(foodKind("Mystery Casserole")).toBe("food");
  });
});

describe("isCountable", () => {
  it("draws pieces for countable units and mounds for scoops", () => {
    expect(isCountable("fillet")).toBe(true);
    expect(isCountable("meatball")).toBe(true);
    expect(isCountable("spoonful")).toBe(false);
    expect(isCountable("rounded ladle")).toBe(false);
  });
});
