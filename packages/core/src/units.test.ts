import { describe, expect, it } from "vitest";
import { feetAndInches, heightIn, parseNumber } from "./units";

describe("heightIn", () => {
  // Regression: `Number("0") || 6` turned 6'0" into 6'6".
  it("keeps 0 inches as 0", () => {
    expect(heightIn("6", "0")).toBe(72);
  });

  it("combines feet and inches", () => {
    expect(heightIn("5", "11")).toBe(71);
  });

  it("uses the fallback only for blank fields", () => {
    expect(heightIn("", "")).toBe(66);
    expect(heightIn("6", "")).toBe(78);
  });

  it("clamps inches to 0–11", () => {
    expect(heightIn("5", "14")).toBe(71);
    expect(heightIn("5", "-3")).toBe(60);
  });
});

describe("parseNumber", () => {
  it("returns 0 for '0' and the fallback for blank or junk", () => {
    expect(parseNumber("0", 20)).toBe(0);
    expect(parseNumber("  ", 20)).toBe(20);
    expect(parseNumber("abc", 20)).toBe(20);
  });
});

describe("feetAndInches", () => {
  it("splits total inches", () => {
    expect(feetAndInches(72)).toEqual({ feet: 6, inches: 0 });
    expect(feetAndInches(65)).toEqual({ feet: 5, inches: 5 });
  });
});
