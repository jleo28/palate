import { describe, expect, it } from "vitest";
import {
  DEFAULT_SEEDLING_NAME,
  SPECIES,
  TONES,
  assignSeedling,
  daysShowedUp,
  growthStage,
  renameSeedling,
  seedlingDetails,
  daysTogether,
  isSleepy,
} from "./seedling";

describe("Seedling assignment", () => {
  it("offers 12 species and 24 tones", () => {
    expect(SPECIES).toHaveLength(12);
    expect(TONES).toHaveLength(24);
    expect(new Set(TONES).size).toBe(24);
  });

  it("assigns a species, tone and seed, named Seedling by default", () => {
    const s = assignSeedling(() => 0.5);
    expect(s).toEqual({
      species: "mushroom",
      tone: 12,
      seed: 2 ** 30,
      name: DEFAULT_SEEDLING_NAME,
    });
  });

  it("stays in range at the edges of the random source", () => {
    const low = assignSeedling(() => 0);
    const high = assignSeedling(() => 0.999999);
    expect(low.species).toBe("sprout");
    expect(high.species).toBe("daisy");
    expect(high.tone).toBe(23);
  });
});

describe("renameSeedling", () => {
  const s = assignSeedling(() => 0.1);

  it("trims and keeps names short", () => {
    expect(renameSeedling(s, "  Basil Bean  ").name).toBe("Basil Bean");
    expect(renameSeedling(s, "x".repeat(40)).name).toHaveLength(24);
  });

  it("falls back to Seedling for a blank name", () => {
    expect(renameSeedling(s, "   ").name).toBe(DEFAULT_SEEDLING_NAME);
  });
});

describe("seedlingDetails", () => {
  it("is deterministic per seed", () => {
    expect(seedlingDetails(42)).toEqual(seedlingDetails(42));
  });

  it("varies across seeds", () => {
    const looks = new Set(
      Array.from({ length: 40 }, (_, i) => JSON.stringify(seedlingDetails(i * 7919))),
    );
    expect(looks.size).toBeGreaterThan(5);
  });

  it("keeps the tilt small", () => {
    for (let i = 0; i < 100; i++) expect(Math.abs(seedlingDetails(i).tilt)).toBeLessThanOrEqual(5);
  });
});

describe("growth", () => {
  it("grows through five stages with days showed up", () => {
    expect(growthStage(0)).toMatchObject({ name: "Seed", toNext: 1, nextName: "Sprout" });
    expect(growthStage(1)).toMatchObject({ name: "Sprout", toNext: 2 });
    expect(growthStage(3).name).toBe("Sapling");
    expect(growthStage(7).name).toBe("Plant");
    expect(growthStage(30)).toMatchObject({
      name: "Bloom",
      toNext: 0,
      progress: 1,
      nextName: null,
    });
  });

  it("reports progress toward the next stage", () => {
    // Sapling at 3 days, Plant at 7: 5 days is halfway.
    expect(growthStage(5).progress).toBe(0.5);
  });

  it("counts distinct days with any log, and gaps don't undo it", () => {
    const log = [{ date: "2026-09-01" }, { date: "2026-09-01" }, { date: "2026-09-20" }];
    expect(daysShowedUp(log)).toBe(2);
  });
});

describe("daysTogether", () => {
  it("reads 1 on sign-up day", () => {
    expect(daysTogether("2026-10-22", "2026-10-22")).toBe(1);
  });
  it("counts calendar days, including the first", () => {
    expect(daysTogether("2026-10-20", "2026-10-22")).toBe(3);
    expect(daysTogether("2026-09-30", "2026-10-01")).toBe(2);
  });
  it("treats a missing date as day one", () => {
    expect(daysTogether(undefined, "2026-10-22")).toBe(1);
  });
});

describe("isSleepy", () => {
  const today = "2026-10-22";
  it("is sleepy after two full days without a log", () => {
    expect(isSleepy(["2026-10-19"], today)).toBe(true);
  });
  it("isn't sleepy after one missed day, or once something's logged today", () => {
    expect(isSleepy(["2026-10-20"], today)).toBe(false);
    expect(isSleepy(["2026-10-19", today], today)).toBe(false);
  });
  it("doesn't count rest days, and new users aren't sleepy", () => {
    expect(isSleepy(["2026-10-19"], today, (d) => d === "2026-10-21")).toBe(false);
    expect(isSleepy([], today)).toBe(false);
  });
});
