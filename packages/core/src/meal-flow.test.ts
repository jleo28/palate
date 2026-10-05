import { describe, expect, it } from "vitest";
import { canLogSlot, daySlots, firstOpenSlot, nextOpenSlot } from "./budget";

const meals = daySlots();
const withSnacks = daySlots(["Afternoon snack", "Late-night snack"]);

describe("canLogSlot", () => {
  it("allows each hall meal once a day", () => {
    expect(canLogSlot("Breakfast", [])).toBe(true);
    expect(canLogSlot("Breakfast", ["Breakfast"])).toBe(false);
  });

  it("allows snacks any number of times", () => {
    expect(canLogSlot("Afternoon snack", ["Afternoon snack", "Afternoon snack"])).toBe(true);
  });
});

describe("nextOpenSlot", () => {
  it("moves from breakfast to lunch", () => {
    expect(nextOpenSlot(meals, "Breakfast", ["Breakfast"])).toBe("Lunch");
  });

  it("skips meals already logged", () => {
    expect(nextOpenSlot(meals, "Breakfast", ["Breakfast", "Lunch"])).toBe("Dinner");
  });

  it("goes to a snack next when one is planned", () => {
    expect(nextOpenSlot(withSnacks, "Lunch", ["Lunch"])).toBe("Afternoon snack");
  });

  it("is null when the day is done", () => {
    expect(nextOpenSlot(meals, "Dinner", ["Breakfast", "Lunch", "Dinner"])).toBeNull();
  });
});

describe("firstOpenSlot", () => {
  it("keeps the current slot if it's still open", () => {
    expect(firstOpenSlot(meals, "Lunch", ["Breakfast"])).toBe("Lunch");
  });

  it("moves on from a meal that's already logged", () => {
    expect(firstOpenSlot(meals, "Lunch", ["Lunch"])).toBe("Dinner");
  });

  it("never lands on an earlier slot", () => {
    expect(firstOpenSlot(meals, "Dinner", ["Dinner"])).toBeNull();
  });
});
