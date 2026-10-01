import { describe, expect, it } from "vitest";
import {
  HISTORY_LIMIT,
  back,
  canGoBack,
  currentPlate,
  editCurrent,
  forward,
  startHistory,
} from "./history";
import { item } from "./fixtures";
import type { PlateItem } from "./types";

const plateOf = (n: number): PlateItem[] => [{ id: "row-0", item: item({ id: `i${n}` }), qty: 1 }];
const idOf = (p: PlateItem[]) => p[0]?.item.id;

describe("plate history", () => {
  it("starts with one plate and nothing to go back to", () => {
    const h = startHistory(plateOf(0));
    expect(idOf(currentPlate(h))).toBe("i0");
    expect(canGoBack(h)).toBe(false);
  });

  it("adds a fresh variation when swiping forward at the end", () => {
    let n = 0;
    const h = forward(startHistory(plateOf(0)), () => plateOf(++n));
    expect(idOf(currentPlate(h))).toBe("i1");
    expect(h.plates).toHaveLength(2);
  });

  it("goes back to the previous variation and forward again without making a new one", () => {
    let made = 0;
    const fresh = () => plateOf(++made);
    let h = forward(forward(startHistory(plateOf(0)), fresh), fresh); // i0 i1 [i2]
    h = back(back(h)); // [i0]
    expect(idOf(currentPlate(h))).toBe("i0");
    h = forward(h, fresh); // [i1]
    expect(idOf(currentPlate(h))).toBe("i1");
    expect(made).toBe(2);
  });

  it(`keeps only the last ${HISTORY_LIMIT} variations`, () => {
    let n = 0;
    let h = startHistory(plateOf(0));
    for (let i = 0; i < 14; i++) h = forward(h, () => plateOf(++n));
    expect(h.plates).toHaveLength(HISTORY_LIMIT);
    expect(idOf(h.plates[0]!)).toBe("i5");
    expect(idOf(currentPlate(h))).toBe("i14");
  });

  it("does nothing when going back from the first plate", () => {
    const h = startHistory(plateOf(0));
    expect(back(h)).toBe(h);
  });

  it("edits only the current variation and keeps edits when swiping away and back", () => {
    let h = forward(startHistory(plateOf(0)), () => plateOf(1));
    h = editCurrent(h, (p) => p.map((r) => ({ ...r, qty: 3 })));
    h = back(h);
    expect(currentPlate(h)[0]!.qty).toBe(1);
    h = forward(h, () => plateOf(99));
    expect(currentPlate(h)[0]!.qty).toBe(3);
  });
});
