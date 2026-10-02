import { describe, expect, it } from "vitest";
import { logFromRow, logToRow, profileFromRow, profileToRow, type MealLogRow } from "./rows";
import { profile } from "./fixtures";
import type { LoggedMeal } from "./types";

describe("profile rows", () => {
  it("round-trips a full profile", () => {
    const p = profile({
      highProtein: true,
      customAllergies: ["coconut"],
      seedling: { species: "fern", tone: 4, seed: 99, name: "Fernie" },
    });
    expect(profileFromRow(profileToRow("user-1", p))).toEqual(p);
  });

  it("fills defaults for optional fields", () => {
    const row = profileToRow("user-1", profile());
    expect(row).toMatchObject({
      id: "user-1",
      high_protein: false,
      custom_allergies: [],
      seedling: null,
    });
  });
});

describe("meal log rows", () => {
  const meal: LoggedMeal = {
    id: "3f9b2a5e-0000-4000-8000-000000000000",
    date: "2026-10-01",
    hall: "evk",
    meal: "Dinner",
    kcal: 640,
    protein: 42,
    carbs: 70,
    fat: 18,
    items: [{ name: "Grilled Chicken", portion: "2 tongs" }],
  };

  it("round-trips a log, defaulting the source", () => {
    expect(logFromRow(logToRow(meal))).toEqual({ ...meal, source: "dining-hall" });
  });

  it("turns numeric strings from Postgres into numbers", () => {
    const row = { ...logToRow(meal), kcal: "640.0", protein: "42.0" } as unknown as MealLogRow;
    expect(logFromRow(row)).toMatchObject({ kcal: 640, protein: 42 });
  });
});
