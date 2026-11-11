import { describe, expect, it } from "vitest";
import { logFromRow, logToRow, profileFromRow, profileToRow, type MealLogRow } from "./rows";
import { profile } from "./fixtures";
import type { LoggedMeal } from "./types";

describe("profile rows", () => {
  it("round-trips a full profile", () => {
    const p = profile({
      highProtein: true,
      activity: "light",
      snacks: ["Late-night snack"],
      customAllergies: ["coconut"],
      seedling: { species: "fern", tone: 4, seed: 99, name: "Fernie" },
      cardSpends: [{ spentOn: "2026-10-16", forDate: "2026-10-15" }],
      tourCompletedAt: "2026-11-07T18:00:00.000Z",
      wellbeing: { hideNumbers: true, skipped: ["2026-10-15"], pauses: [{ from: "2026-10-01" }] },
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
      wellbeing: {},
      card_spends: [],
    });
    expect(row).not.toHaveProperty("tour_completed_at");
  });

  it("maps tour completion both ways", () => {
    const row = profileToRow("user-1", profile({ tourCompletedAt: "2026-11-07T18:00:00Z" }));
    expect(row.tour_completed_at).toBe("2026-11-07T18:00:00Z");
    expect(profileFromRow({ ...row, tour_completed_at: null }).tourCompletedAt).toBeUndefined();
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
