/** Seedling: the user's companion. Assigned once at sign-up; the name is theirs to change. */

export const SPECIES = [
  { id: "sprout", label: "Sprout" },
  { id: "clover", label: "Clover" },
  { id: "fern", label: "Fern" },
  { id: "cactus", label: "Cactus" },
  { id: "tulip", label: "Tulip" },
  { id: "sunflower", label: "Sunflower" },
  { id: "mushroom", label: "Mushroom" },
  { id: "basil", label: "Basil" },
  { id: "mint", label: "Mint" },
  { id: "bamboo", label: "Bamboo" },
  { id: "succulent", label: "Succulent" },
  { id: "daisy", label: "Daisy" },
] as const;
export type SpeciesId = (typeof SPECIES)[number]["id"];

// 24 tones: six brand hues (olive, veg, protein, carb, fruit, yolk) at four lightness steps.
const BRAND_HUES = [
  { hue: 129, chroma: 0.056 },
  { hue: 133, chroma: 0.08 },
  { hue: 48, chroma: 0.075 },
  { hue: 88, chroma: 0.1 },
  { hue: 18, chroma: 0.1 },
  { hue: 83, chroma: 0.12 },
];
const LIGHTNESS = [0.62, 0.7, 0.78, 0.86];
export const TONES: string[] = BRAND_HUES.flatMap(({ hue, chroma }) =>
  LIGHTNESS.map((l) => `oklch(${l} ${chroma} ${hue})`),
);

export const DEFAULT_SEEDLING_NAME = "Seedling";

export interface Seedling {
  species: SpeciesId;
  /** Index into TONES. */
  tone: number;
  /** Varies small details (eyes, cheeks, tilt) so no two look quite alike. */
  seed: number;
  name: string;
}

/** Randomly assign a Seedling. Pass a random source for tests. */
export function assignSeedling(random: () => number = Math.random): Seedling {
  const pick = (n: number) => Math.min(n - 1, Math.floor(random() * n));
  return {
    species: SPECIES[pick(SPECIES.length)]!.id,
    tone: pick(TONES.length),
    seed: pick(2 ** 31),
    name: DEFAULT_SEEDLING_NAME,
  };
}

export function renameSeedling(s: Seedling, name: string): Seedling {
  const trimmed = name.trim().slice(0, 24);
  return { ...s, name: trimmed || DEFAULT_SEEDLING_NAME };
}

/** Deterministic small details from the seed (mulberry32). */
export function seedlingDetails(seed: number) {
  let t = seed >>> 0;
  const next = () => {
    t = (t + 0x6d2b79f5) >>> 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  return {
    eyes: (["dot", "happy", "wide"] as const)[Math.floor(next() * 3)]!,
    cheeks: next() > 0.35,
    tilt: Math.round((next() - 0.5) * 10),
    freckle: next() > 0.6,
  };
}

/** Growth comes from showing up (days with any meal logged), never from eating less. */
export const STAGES = [
  { name: "Seed", days: 0 },
  { name: "Sprout", days: 1 },
  { name: "Leafy", days: 3 },
  { name: "In bloom", days: 7 },
] as const;

export function growthStage(daysShowedUp: number) {
  let index = 0;
  STAGES.forEach((stage, i) => {
    if (daysShowedUp >= stage.days) index = i;
  });
  const next = STAGES[index + 1];
  return { index, name: STAGES[index]!.name, toNext: next ? next.days - daysShowedUp : 0 };
}

/** Distinct days with at least one logged meal. Gaps never undo growth. */
export function daysShowedUp(log: readonly { date: string }[]) {
  return new Set(log.map((entry) => entry.date)).size;
}

export type HintScreen = "plate" | "menus" | "card";

/** One-time hints, in Seedling's voice, the first time each screen opens. */
export const HINTS: Record<HintScreen, string> = {
  plate:
    "Here's a plate for this meal. Swipe it for another idea, or tweak any row. I'll tell you how it fits.",
  menus: "Every station's here. Tap + on anything to build your own plate.",
  card: "This is your card. Your day lives here, and I grow a little each day you check in.",
};
