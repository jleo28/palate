import { describe, expect, it } from "vitest";
import { FREEZES_PER_MONTH, streak } from "./streak";

const today = "2026-10-15";

describe("streak", () => {
  it("is zero with no logs", () => {
    expect(streak([], today)).toEqual({
      days: 0,
      loggedToday: false,
      frozen: [],
      freezesLeft: FREEZES_PER_MONTH,
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
    expect(s).toMatchObject({ days: 3, frozen: ["2026-10-14"], freezesLeft: 1 });
  });

  it("can freeze yesterday when today isn't logged yet", () => {
    const s = streak(["2026-10-12", "2026-10-13"], today);
    expect(s).toMatchObject({ days: 2, frozen: ["2026-10-14"] });
  });

  it(`allows only ${FREEZES_PER_MONTH} freezes per calendar month`, () => {
    // Gaps on the 14th, 12th and 10th: two freezes bridge back to the 11th, the third ends it.
    const s = streak(["2026-10-09", "2026-10-11", "2026-10-13", "2026-10-15"], today);
    expect(s).toMatchObject({ days: 3, frozen: ["2026-10-14", "2026-10-12"], freezesLeft: 0 });
  });

  it("counts freezes against the month of the missed day", () => {
    // 30 Sep is frozen with September's allowance, so October still has both.
    const s = streak(["2026-09-29", "2026-10-01"], "2026-10-01");
    expect(s).toMatchObject({ days: 2, frozen: ["2026-09-30"], freezesLeft: 2 });
  });

  it("doesn't spend freezes on a gap the streak doesn't survive", () => {
    // Last log a week ago: the streak is over and no freezes are used up.
    const s = streak(["2026-10-08"], today);
    expect(s).toMatchObject({ days: 0, frozen: [], freezesLeft: FREEZES_PER_MONTH });
  });

  it("handles month and year boundaries", () => {
    const s = streak(["2026-12-31", "2027-01-01"], "2027-01-01");
    expect(s.days).toBe(2);
  });
});
