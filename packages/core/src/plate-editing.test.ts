import { describe, expect, it } from "vitest";
import { MAX_QTY, alternatives, removeRow, replaceRow, setQty } from "./plate";
import { withoutSkipped } from "./preferences";
import { item, menu } from "./fixtures";

const grillChicken = item({
  id: "chicken",
  station: "Grill",
  role: "protein",
  kcal: 140,
  protein: 26,
});
const grillBurger = item({
  id: "burger",
  station: "Grill",
  role: "protein",
  kcal: 280,
  protein: 20,
});
const grillSteak = item({ id: "steak", station: "Grill", role: "protein", kcal: 210, protein: 28 });
const wokTofu = item({ id: "tofu", station: "Wok", role: "protein", kcal: 90, protein: 10 });
const grillFries = item({ id: "fries", station: "Grill", role: "carb", kcal: 300, protein: 3 });
const stationMenu = [grillChicken, grillBurger, grillSteak, wokTofu, grillFries];

const plate = [
  { id: "a", item: grillChicken, qty: 2 },
  { id: "b", item: grillSteak, qty: 1 },
];

describe("alternatives", () => {
  it("offers only the same station and role, minus what's on the plate, by name", () => {
    const alts = alternatives(stationMenu, plate, "a", "village", "Lunch", []);
    expect(alts.map((i) => i.id)).toEqual(["burger"]);
  });

  it("is empty for an unknown row", () => {
    expect(alternatives(stationMenu, plate, "zzz", "village", "Lunch", [])).toEqual([]);
  });
});

describe("replaceRow", () => {
  it("puts the chosen item in the row, keeping its id", () => {
    const next = replaceRow(plate, "a", grillBurger);
    expect(next[0]).toMatchObject({ id: "a", item: grillBurger });
    expect(next[1]).toBe(plate[1]);
  });

  it("portions the new item to roughly match the old row", () => {
    // 2 chicken = 280 kcal / 52 g protein; 1 burger (280 / 20) beats 2 (560 / 40)
    expect(replaceRow(plate, "a", grillBurger)[0]!.qty).toBe(1);
  });
});

describe("setQty", () => {
  it("sets the portions on one row", () => {
    expect(setQty(plate, "b", 3)[1]!.qty).toBe(3);
  });

  it(`clamps to 1–${MAX_QTY}`, () => {
    expect(setQty(plate, "b", 0)[1]!.qty).toBe(1);
    expect(setQty(plate, "b", 99)[1]!.qty).toBe(MAX_QTY);
  });
});

describe("removeRow", () => {
  it("removes only that row", () => {
    expect(removeRow(plate, "a").map((r) => r.id)).toEqual(["b"]);
  });
});

describe("withoutSkipped", () => {
  it("drops skipped foods from the menu", () => {
    const ids = withoutSkipped(menu, ["rice", "tofu"]).map((i) => i.id);
    expect(ids).not.toContain("rice");
    expect(ids).not.toContain("tofu");
    expect(ids).not.toContain("evk-rice");
    expect(ids).toContain("chicken");
  });

  it("keeps everything when nothing is skipped", () => {
    expect(withoutSkipped(menu, undefined)).toHaveLength(menu.length);
  });
});
