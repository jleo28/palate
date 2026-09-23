import { describe, expect, it } from "vitest";
import { planDay } from "../plan";
import { sampleMenu } from "../../data/menu";
import type { HallId, Profile } from "../types";

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    age: 19,
    sex: "female",
    heightCm: 165,
    weightKg: 62,
    activity: "moderate",
    goal: "steady",
    diet: [],
    avoidAllergens: [],
    meals: ["breakfast", "lunch", "dinner"],
    homeHall: "evk",
    ...overrides,
  };
}

const HALLS: HallId[] = ["evk", "parkside", "village"];

function allDatesInRotation(): string[] {
  const dates: string[] = [];
  const start = new Date(Date.UTC(2026, 7, 24)); // rotation anchor, week 1 Monday
  for (let i = 0; i < 14; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

// Test 9: Typical profile on the sample menu is onTarget for at least 80% of
// hall x meal x day combinations. Reports the observed rate.
describe("planDay: on-target rate", () => {
  it("hits the target on at least 80% of hall x meal x day combinations for a typical profile", () => {
    const p = profile();
    const dates = allDatesInRotation();

    let total = 0;
    let onTarget = 0;

    for (const hall of HALLS) {
      for (const date of dates) {
        const day = planDay(p, sampleMenu, date, hall);
        for (const meal of Object.values(day.meals)) {
          total += 1;
          if (meal.onTarget) onTarget += 1;
        }
      }
    }

    const rate = onTarget / total;
    console.log(`on-target rate: ${(rate * 100).toFixed(1)}% (${onTarget}/${total})`);
    expect(rate).toBeGreaterThanOrEqual(0.8);
  });
});

// Test 12: Repeat penalty: lunch and dinner on the same day do not share a
// protein item when an alternative exists.
describe("planDay: repeat penalty", () => {
  it("avoids repeating the same protein item across lunch and dinner when alternatives exist", () => {
    const p = profile({ meals: ["lunch", "dinner"] });
    let repeats = 0;
    let checked = 0;

    for (const hall of HALLS) {
      for (const date of allDatesInRotation()) {
        const day = planDay(p, sampleMenu, date, hall);
        const lunch = day.meals.lunch;
        const dinner = day.meals.dinner;
        if (!lunch || !dinner) continue;

        const proteinItemsAvailable =
          new Set([...lunch.lines, ...dinner.lines].map((l) => l.itemId)).size >= 2;
        if (!proteinItemsAvailable) continue;

        checked += 1;
        const lunchProtein = lunch.lines.reduce((a, b) => (a.protein > b.protein ? a : b), lunch.lines[0]);
        const dinnerProtein = dinner.lines.reduce((a, b) => (a.protein > b.protein ? a : b), dinner.lines[0]);
        if (lunchProtein && dinnerProtein && lunchProtein.itemId === dinnerProtein.itemId) {
          repeats += 1;
        }
      }
    }

    expect(checked).toBeGreaterThan(0);
    expect(repeats / checked).toBeLessThan(0.2);
  });
});
