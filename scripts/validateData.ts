import { readFileSync } from "node:fs";
import { getMenu } from "../src/core/menu";
import type { HallId, MealPeriod, MenuFile } from "../src/core/types";

const HALLS: HallId[] = ["evk", "parkside", "village"];
const PERIODS: MealPeriod[] = ["breakfast", "lunch", "dinner"];
const DOWS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

const raw = readFileSync(new URL("../src/data/menu.sample.json", import.meta.url), "utf-8");
const menu: MenuFile = JSON.parse(raw);

const errors: string[] = [];
const itemsById = new Map(menu.items.map((i) => [i.id, i]));

for (const item of menu.items) {
  const macroKcal = item.protein * 4 + item.carbs * 4 + item.fat * 9;
  const diff = Math.abs(macroKcal - item.kcal) / item.kcal;
  if (diff > 0.1) {
    errors.push(`${item.id}: macro calories (${Math.round(macroKcal)}) differ from kcal (${item.kcal}) by more than 10%`);
  }
  if (item.tags.includes("vegan") && !item.tags.includes("vegetarian")) {
    errors.push(`${item.id}: tagged vegan without also being tagged vegetarian`);
  }
}

function checkReferences(ids: string[], where: string) {
  for (const id of ids) {
    if (!itemsById.has(id)) errors.push(`${where}: references unknown item id "${id}"`);
  }
}

for (const hall of HALLS) {
  for (const period of PERIODS) {
    checkReferences(menu.everyday[hall]?.[period] ?? [], `everyday.${hall}.${period}`);
  }
  for (const week of [1, 2]) {
    for (const dow of DOWS) {
      const dayKey = `w${week}-${dow}`;
      for (const period of PERIODS) {
        checkReferences(menu.rotation[hall]?.[dayKey]?.[period] ?? [], `rotation.${hall}.${dayKey}.${period}`);
      }
    }
  }
}

for (let week = 1; week <= menu.rotationWeeks; week++) {
  for (const dow of DOWS) {
    const dateForDow = isoDateFor(week, dow);
    for (const hall of HALLS) {
      for (const period of PERIODS) {
        const dayItems = getMenu(menu, hall, period, dateForDow);
        const proteins = dayItems.filter((i) => i.role === "protein");
        const carbs = dayItems.filter((i) => i.role === "carb");
        const vegs = dayItems.filter((i) => i.role === "veg");
        const label = `${hall} ${period} week ${week} ${dow}`;

        if (proteins.length < 2) errors.push(`${label}: fewer than 2 proteins`);
        if (!proteins.some((i) => i.tags.includes("vegetarian"))) errors.push(`${label}: no vegetarian protein`);
        if (!proteins.some((i) => i.tags.includes("vegan"))) errors.push(`${label}: no vegan protein`);
        if (carbs.length < 2) errors.push(`${label}: fewer than 2 carbs`);
        if (vegs.length < 2) errors.push(`${label}: fewer than 2 veg`);
      }
    }
  }
}

function isoDateFor(week: number, dow: string): string {
  const [ay, am, ad] = menu.rotationAnchor.split("-").map(Number);
  const anchorUtc = Date.UTC(ay, am - 1, ad);
  const anchorDow = new Date(anchorUtc).getUTCDay();
  const anchorMon = anchorDow === 0 ? 6 : anchorDow - 1;
  const targetIndex = DOWS.indexOf(dow);
  const dayOffset = (week - 1) * 7 + (targetIndex - anchorMon);
  const d = new Date(anchorUtc + dayOffset * 86400000);
  const yyyy = d.getUTCFullYear();
  const mm = String(d.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(d.getUTCDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

if (errors.length > 0) {
  console.error(`Menu validation failed with ${errors.length} error(s):`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
} else {
  console.log(`Menu validation passed: ${menu.items.length} items, ${HALLS.length} halls x ${PERIODS.length} periods x ${DOWS.length * menu.rotationWeeks} days all satisfy the minimums.`);
}
