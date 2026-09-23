import type { HallId, MealPeriod, MenuFile, MenuItem } from "../core/types";
import { getMenu, rotationWeek } from "../core/menu";
import sampleMenuJson from "./menu.sample.json";

export const sampleMenu = sampleMenuJson as unknown as MenuFile;

export { getMenu, rotationWeek };

/**
 * The interface a future real USC menu source will implement. Only the sample
 * implementation ships in this prototype; see docs/DATA_SPEC.md for what a live
 * source would need from USC Dining before this can be built.
 */
export interface MenuSource {
  getMenu(hall: HallId, period: MealPeriod, date: string): Promise<MenuItem[]>;
}

export class SampleMenuSource implements MenuSource {
  constructor(private readonly menu: MenuFile = sampleMenu) {}

  async getMenu(hall: HallId, period: MealPeriod, date: string): Promise<MenuItem[]> {
    return getMenu(this.menu, hall, period, date);
  }
}
