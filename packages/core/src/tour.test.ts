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
  const steps = tourSteps(ctx);

  it("fills in names", () => {
    expect(steps[0]!.lines[0]!.text).toContain("Hey Jo!");
    expect(steps.find((s) => s.id === "plate")!.lines[0]!.text).toContain("what EVK is");
    expect(steps.at(-1)!.lines[0]!.text).toContain("Pickles will take it from here");
  });

  it("walks every tab in order, without doubling back", () => {
    const routes = steps.map((s) => s.route).filter((r, i, all) => r !== all[i - 1]);
    expect(routes).toEqual(["/", "/menus", "/sprout", "/card"]);
  });

  it("gives each step one speaker, except the naming moment", () => {
    for (const step of steps) {
      const speakers = new Set(step.lines.map((l) => l.speaker));
      expect(speakers.size, step.id).toBe(step.id === "seedling" ? 2 : 1);
    }
  });

  it("lets both characters lead, unevenly", () => {
    const lead = steps.map((s) => s.lines[0]!.speaker);
    const olive = lead.filter((s) => s === "olive").length;
    const seedling = lead.filter((s) => s === "seedling").length;
    expect(seedling).toBeGreaterThan(0);
    expect(olive).not.toBe(seedling);
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
