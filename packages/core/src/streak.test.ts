import { describe, expect, it } from "vitest";
import { BACKFILL_DAYS, CARDS_PER_MONTH, backfillDays, streak } from "./streak";

const today = "2026-10-15";

describe("streak", () => {
  it("is zero with no logs", () => {
    expect(streak([], today)).toEqual({
      days: 0,
      loggedToday: false,
      restingToday: false,
      frozen: [],
      cardsLeft: CARDS_PER_MONTH,
    });
  });

  it("counts consecutive logged days ending today", () => {
    const s = streak(["2026-10-13", "2026-10-14", "2026-10-15"], today);
    expect(s).toMatchObject({ days: 3, loggedToday: true, frozen: [] });
  });

  it("doesn't break before today is over", () => {
    expect(streak(["2026-10-13", "2026-10-14"], today)).toMatchObject({
      days: 2,
      loggedToday: false,
    });
  });

  it("counts several logs on one day once", () => {
    expect(streak(["2026-10-15", "2026-10-15"], today).days).toBe(1);
  });

  it("freezes a missed day automatically", () => {
    const s = streak(["2026-10-12", "2026-10-13", "2026-10-15"], today);
    expect(s).toMatchObject({ days: 3, frozen: ["2026-10-14"], cardsLeft: 1 });
  });

  it("can freeze yesterday when today isn't logged yet", () => {
    const s = streak(["2026-10-12", "2026-10-13"], today);
    expect(s).toMatchObject({ days: 2, frozen: ["2026-10-14"] });
  });

  it(`allows only ${CARDS_PER_MONTH} cards per calendar month`, () => {
    // Gaps on the 14th, 12th and 10th: two freezes bridge back to the 11th, the third ends it.
    const s = streak(["2026-10-09", "2026-10-11", "2026-10-13", "2026-10-15"], today);
    expect(s).toMatchObject({ days: 3, frozen: ["2026-10-14", "2026-10-12"], cardsLeft: 0 });
  });

  it("counts freezes against the month of the missed day", () => {
    // 30 Sep is frozen with September's allowance, so October still has both.
    const s = streak(["2026-09-29", "2026-10-01"], "2026-10-01");
    expect(s).toMatchObject({ days: 2, frozen: ["2026-09-30"], cardsLeft: 2 });
  });

  it("doesn't spend freezes on a gap the streak doesn't survive", () => {
    // Last log a week ago: the streak is over and no freezes are used up.
    const s = streak(["2026-10-08"], today);
    expect(s).toMatchObject({ days: 0, frozen: [], cardsLeft: CARDS_PER_MONTH });
  });

  it("handles month and year boundaries", () => {
    const s = streak(["2026-12-31", "2027-01-01"], "2027-01-01");
    expect(s.days).toBe(2);
  });
});

describe("streak with rest days", () => {
  const rest = (days: string[]) => (d: string) => days.includes(d);

  it("bridges rest days without counting them or spending a freeze", () => {
    // 10-11..10-14 resting, so no freezes needed even though that's four missed days.
    const s = streak(
      ["2026-10-10", "2026-10-15"],
      today,
      rest(["2026-10-11", "2026-10-12", "2026-10-13", "2026-10-14"]),
    );
    expect(s).toMatchObject({ days: 2, frozen: [], cardsLeft: CARDS_PER_MONTH });
  });

  it("marks today as resting when it's a rest day with no log", () => {
    const s = streak(["2026-10-14"], today, rest([today]));
    expect(s).toMatchObject({ days: 1, loggedToday: false, restingToday: true });
  });
});

describe("card pool", () => {
  it("shares the pool between missed days and earlier meals", () => {
    // One card spent on an earlier meal this month leaves one for a missed day.
    const spends = [{ spentOn: "2026-10-05", forDate: "2026-10-04" }];
    const s = streak(["2026-10-13", "2026-10-15"], today, undefined, spends);
    expect(s).toMatchObject({ days: 2, frozen: ["2026-10-14"], cardsLeft: 0 });
  });

  it("can't cover a missed day once the pool is spent", () => {
    const spends = [
      { spentOn: "2026-10-05", forDate: "2026-10-04" },
      { spentOn: "2026-10-06", forDate: "2026-10-05" },
    ];
    const s = streak(["2026-10-13", "2026-10-15"], today, undefined, spends);
    expect(s).toMatchObject({ days: 1, frozen: [], cardsLeft: 0 });
  });

  it("refills each calendar month", () => {
    const spends = [
      { spentOn: "2026-09-29", forDate: "2026-09-28" },
      { spentOn: "2026-09-30", forDate: "2026-09-29" },
    ];
    expect(streak(["2026-10-15"], today, undefined, spends).cardsLeft).toBe(CARDS_PER_MONTH);
  });

  it(`reaches back ${BACKFILL_DAYS} days for earlier meals`, () => {
    expect(backfillDays("2026-11-01")).toEqual(["2026-10-31", "2026-10-30", "2026-10-29"]);
  });
});
