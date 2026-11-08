import { describe, expect, it } from "vitest";
import {
  SEEDLING_NAME_IDEAS,
  nextNameIdea,
  shouldShowTour,
  suggestedSeedlingName,
  tourSteps,
} from "./tour";
import { DEFAULT_SEEDLING_NAME } from "./seedling";

const ctx = { firstName: "Jo", seedlingName: "Pickles", hallName: "EVK" };

describe("tour steps", () => {
  it("runs in order and fills in names", () => {
    const steps = tourSteps(ctx);
    expect(steps.map((s) => s.id)).toEqual([
      "arrive",
      "seedling",
      "plate",
      "halls",
      "swipe",
      "log",
      "tab-plate",
      "tab-menus",
      "tab-sprout",
      "tab-card",
      "handoff",
    ]);
    expect(steps[0]!.lines[0]!.text).toContain("Hey Jo!");
    expect(steps[2]!.lines[0]!.text).toContain("what EVK is actually serving");
    expect(steps.at(-1)!.lines[0]!.text).toContain("Pickles will take it from here");
  });

  it("spotlights the plate controls", () => {
    expect(tourSteps(ctx).flatMap((s) => (s.target ? [s.target] : []))).toEqual([
      "plate",
      "halls",
      "swipe",
      "log",
      "tab-plate",
      "tab-menus",
      "tab-sprout",
      "tab-card",
    ]);
  });
});

describe("shouldShowTour", () => {
  it("waits for the store and a profile", () => {
    expect(shouldShowTour({ ready: false, profile: {} })).toBe(false);
    expect(shouldShowTour({ ready: true, profile: null })).toBe(false);
    expect(shouldShowTour({ ready: true, profile: null, forced: true })).toBe(false);
  });
  it("shows once, until completed", () => {
    expect(shouldShowTour({ ready: true, profile: {} })).toBe(true);
    expect(shouldShowTour({ ready: true, profile: { tourCompletedAt: "2026-11-07" } })).toBe(false);
  });
  it("replays when forced", () => {
    expect(
      shouldShowTour({ ready: true, profile: { tourCompletedAt: "2026-11-07" }, forced: true }),
    ).toBe(true);
  });
});

describe("Seedling names", () => {
  const s = { species: "basil" as const, tone: 0, seed: 1, name: DEFAULT_SEEDLING_NAME };
  it("prefills the species label for an unnamed Seedling", () => {
    expect(suggestedSeedlingName(s)).toBe("Basil");
  });
  it("keeps a name they already chose", () => {
    expect(suggestedSeedlingName({ ...s, name: "Fernie" })).toBe("Fernie");
  });
  it("suggests something different from the current name", () => {
    for (let i = 0; i < 20; i++) {
      const r = i / 20;
      const idea = nextNameIdea("Pickles", () => r);
      expect(idea).not.toBe("Pickles");
      expect(SEEDLING_NAME_IDEAS).toContain(idea);
    }
    expect(nextNameIdea("x", () => 0.9999)).toBe(SEEDLING_NAME_IDEAS.at(-1));
  });
});
