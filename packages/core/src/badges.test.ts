import { describe, expect, it } from "vitest";
import { earnedBadges, longestRun, newBadges, weekStart, weeklyRecap } from "./badges";

const log = (
  date: string,
  hall: "village" | "evk" | "parkside" = "village",
  source?: "outside",
) => ({
  date,
  hall,
  ...(source ? { source } : {}),
});

describe("badges", () => {
  it("awards a first plate for a hall meal", () => {
    expect(earnedBadges([log("2026-10-01")])).toEqual(["first-plate"]);
    expect(earnedBadges([log("2026-10-01", "village", "outside")])).toEqual([]);
  });

  it("awards a 7-day streak for seven days in a row", () => {
    const week = Array.from({ length: 7 }, (_, i) => log(`2026-10-0${i + 1}`));
    expect(earnedBadges(week)).toContain("week-streak");
    expect(earnedBadges(week.slice(0, 6))).not.toContain("week-streak");
  });

  it("awards all three halls only for hall meals", () => {
    expect(
      earnedBadges([
        log("2026-10-01", "village"),
        log("2026-10-02", "evk"),
        log("2026-10-03", "parkside"),
      ]),
    ).toContain("all-halls");
    expect(
      earnedBadges([
        log("2026-10-01", "village"),
        log("2026-10-02", "evk"),
        log("2026-10-03", "parkside", "outside"),
      ]),
    ).not.toContain("all-halls");
  });

  it("reports only badges the latest log earned", () => {
    const before = [log("2026-10-01", "village"), log("2026-10-02", "evk")];
    expect(newBadges(before, [...before, log("2026-10-03", "parkside")])).toEqual(["all-halls"]);
    expect(newBadges(before, [...before, log("2026-10-03", "evk")])).toEqual([]);
  });

  it("finds the longest run of days", () => {
    expect(longestRun(["2026-10-01", "2026-10-02", "2026-10-04", "2026-10-05", "2026-10-06"])).toBe(
      3,
    );
  });
});

describe("weeklyRecap", () => {
  const today = "2026-10-22"; // a Thursday
  it("starts the week on Monday", () => {
    expect(weekStart(today)).toBe("2026-10-19");
  });

  it("counts this week's meals and halls, and the most-liked dish", () => {
    const recap = weeklyRecap(
      [
        log("2026-10-18"),
        log("2026-10-19", "evk"),
        log("2026-10-20", "evk"),
        log("2026-10-21", "parkside", "outside"),
      ],
      [
        { itemName: "Pho", rating: 1, date: "2026-10-19" },
        { itemName: "Pho", rating: 1, date: "2026-10-20" },
        { itemName: "Tacos", rating: 1, date: "2026-10-20" },
        { itemName: "Old Favorite", rating: 1, date: "2026-10-12" },
      ],
      today,
    );
    expect(recap).toEqual({ meals: 3, halls: 1, favorite: "Pho" });
  });

  it("has no favorite without a thumbs up", () => {
    expect(
      weeklyRecap([log(today)], [{ itemName: "Soup", rating: -1, date: today }], today).favorite,
    ).toBeNull();
  });
});
