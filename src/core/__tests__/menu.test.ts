import { describe, expect, it } from "vitest";
import { getMenu, rotationWeek } from "../menu";
import { sampleMenu } from "../../data/menu";

describe("rotationWeek", () => {
  it("is week 1 on the anchor date", () => {
    expect(rotationWeek(sampleMenu, "2026-08-24")).toBe(1);
  });

  it("is week 2 seven days after the anchor", () => {
    expect(rotationWeek(sampleMenu, "2026-08-31")).toBe(2);
  });

  it("wraps back to week 1 after rotationWeeks weeks", () => {
    expect(rotationWeek(sampleMenu, "2026-09-07")).toBe(1);
  });
});

describe("getMenu", () => {
  it("makes week 1 and week 2 Tuesday dinner at the same hall look different", () => {
    const week1 = getMenu(sampleMenu, "parkside", "dinner", "2026-08-25");
    const week2 = getMenu(sampleMenu, "parkside", "dinner", "2026-09-01");
    const ids1 = new Set(week1.map((i) => i.id));
    const ids2 = new Set(week2.map((i) => i.id));
    const overlap = [...ids1].filter((id) => ids2.has(id)).length;
    expect(overlap).toBeLessThan(Math.max(ids1.size, ids2.size));
  });

  it("de-duplicates items that appear in both everyday and rotation", () => {
    const items = getMenu(sampleMenu, "evk", "lunch", "2026-09-22");
    const ids = items.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
