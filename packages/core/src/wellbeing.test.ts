import { describe, expect, it } from "vitest";
import { isPaused, isRestDay, setPaused, setSkipped } from "./wellbeing";

describe("wellbeing", () => {
  it("skips and un-skips a day", () => {
    const w = setSkipped(undefined, "2026-10-15", true);
    expect(isRestDay(w, "2026-10-15")).toBe(true);
    expect(isRestDay(setSkipped(w, "2026-10-15", false), "2026-10-15")).toBe(false);
  });

  it("treats every day from the pause on as rest until it's resumed", () => {
    const w = setPaused(undefined, "2026-10-10", true);
    expect(isPaused(w)).toBe(true);
    expect(isRestDay(w, "2026-10-09")).toBe(false);
    expect(isRestDay(w, "2026-10-20")).toBe(true);

    const resumed = setPaused(w, "2026-10-15", false);
    expect(isPaused(resumed)).toBe(false);
    expect(isRestDay(resumed, "2026-10-14")).toBe(true);
    expect(isRestDay(resumed, "2026-10-15")).toBe(false);
  });

  it("drops a pause undone the same day", () => {
    const w = setPaused(setPaused(undefined, "2026-10-15", true), "2026-10-15", false);
    expect(w.pauses).toEqual([]);
  });
});
