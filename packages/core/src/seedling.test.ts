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
  it("grows with days showed up", () => {
    expect(growthStage(0)).toMatchObject({ name: "Seed", toNext: 1 });
    expect(growthStage(1)).toMatchObject({ name: "Sprout", toNext: 2 });
    expect(growthStage(3).name).toBe("Leafy");
    expect(growthStage(30)).toMatchObject({ name: "In bloom", toNext: 0 });
  });

  it("counts distinct days with any log, and gaps don't undo it", () => {
    const log = [{ date: "2026-09-01" }, { date: "2026-09-01" }, { date: "2026-09-20" }];
    expect(daysShowedUp(log)).toBe(2);
  });
});
