import { describe, expect, it } from "vitest";
import { portionLabel } from "../portion";

// Test 11: portionLabel formats 1/2, 1, 1 1/2, 2 correctly and pluralises the unit
describe("portionLabel", () => {
  it("formats a half serving as singular", () => {
    expect(portionLabel(0.5, "cup")).toBe("½ cup");
  });

  it("formats one serving as singular", () => {
    expect(portionLabel(1, "scoop")).toBe("1 scoop");
  });

  it("formats one and a half servings with the fraction glyph, pluralised", () => {
    expect(portionLabel(1.5, "scoop")).toBe("1½ scoops");
  });

  it("formats two servings pluralised", () => {
    expect(portionLabel(2, "piece")).toBe("2 pieces");
  });

  it("does not double-pluralise a unit that already ends in s", () => {
    expect(portionLabel(2, "chips")).toBe("2 chips");
  });

  it("pluralises a consonant-y unit correctly", () => {
    expect(portionLabel(2, "patty")).toBe("2 patties");
    expect(portionLabel(1, "patty")).toBe("1 patty");
  });

  it("keeps a vowel-y unit as a plain s", () => {
    expect(portionLabel(2, "tray")).toBe("2 trays");
  });

  it("pluralises a sibilant unit with es", () => {
    expect(portionLabel(2, "sandwich")).toBe("2 sandwiches");
  });
});
