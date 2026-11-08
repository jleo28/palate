/** Olive's first-run tour of The Plate. Pure logic; the UI lives in the web app. */
import { DEFAULT_SEEDLING_NAME, SPECIES, type Seedling } from "./seedling";
import type { HallId, Profile } from "./types";

export type TourStepId = "arrive" | "seedling" | "plate" | "halls" | "swipe" | "log" | "handoff";
/** Matches a `data-tour` attribute on The Plate. */
export type TourTarget = "plate" | "halls" | "swipe" | "log";
export type Speaker = "olive" | "seedling";

export interface TourLine {
  speaker: Speaker;
  text: string;
  /** Small aside shown after the line. */
  aside?: string;
}

export interface TourStep {
  id: TourStepId;
  target?: TourTarget;
  lines: TourLine[];
  /** Primary button label. */
  cta: string;
}

export interface TourContext {
  firstName: string;
  seedlingName: string;
  hallName: string;
}

export const TOUR_HALL_NAMES: Record<HallId, string> = {
  village: "Village",
  evk: "EVK",
  parkside: "Parkside",
};

export function tourSteps({ firstName, seedlingName, hallName }: TourContext): TourStep[] {
  return [
    {
      id: "arrive",
      cta: "Let's go",
      lines: [
        {
          speaker: "olive",
          text: `Hey ${firstName}! I'm Olive. Technically a fruit, emotionally a vegetable, professionally your guide to the dining halls. Got 30 seconds?`,
        },
      ],
    },
    {
      id: "seedling",
      cta: "That's my name",
      lines: [
        {
          speaker: "olive",
          text: "I brought a friend. This little one is yours. It grows when you eat well and it has opinions about broccoli.",
        },
        { speaker: "seedling", text: "Hi!! I've never had a name before." },
      ],
    },
    {
      id: "plate",
      target: "plate",
      cta: "Next",
      lines: [
        {
          speaker: "olive",
          text: `This is your plate, built from what ${hallName} is actually serving right now and sized to your goals. I did the math, you're welcome.`,
        },
      ],
    },
    {
      id: "halls",
      target: "halls",
      cta: "Next",
      lines: [{ speaker: "olive", text: "Village, EVK, Parkside. Pick your battlefield." }],
    },
    {
      id: "swipe",
      target: "swipe",
      cta: "Next",
      lines: [
        {
          speaker: "olive",
          text: "Plate not speaking to you? Swipe. I won't take it personally.",
          aside: "I will.",
        },
      ],
    },
    {
      id: "log",
      target: "log",
      cta: "Next",
      lines: [
        { speaker: "seedling", text: "Ooh, tap this after you eat! It's how I grow." },
        {
          speaker: "olive",
          text: "It's true. It's the only thing it eats. Besides compliments.",
        },
      ],
    },
    {
      id: "handoff",
      cta: "Let's eat!",
      lines: [
        {
          speaker: "olive",
          text: `That's the tour. ${seedlingName} will take it from here. I'll be around being correct about things.`,
        },
        { speaker: "seedling", text: "Let's eat!" },
      ],
    },
  ];
}

/** Show the tour once the store is ready, for a profile that hasn't finished it, or on request. */
export function shouldShowTour(opts: {
  ready: boolean;
  profile: Pick<Profile, "tourCompletedAt"> | null;
  forced?: boolean;
}) {
  if (!opts.ready || !opts.profile) return false;
  return !!opts.forced || !opts.profile.tourCompletedAt;
}

/** Name to prefill: the current name, or the species label if it was never named. */
export function suggestedSeedlingName(s: Seedling) {
  if (s.name && s.name !== DEFAULT_SEEDLING_NAME) return s.name;
  return SPECIES.find((sp) => sp.id === s.species)?.label ?? DEFAULT_SEEDLING_NAME;
}

export const SEEDLING_NAME_IDEAS = [
  "Sprout",
  "Pickles",
  "Kale Me Maybe",
  "Bean",
  "Sir Lettuce",
  "Radish",
  "Peanut",
  "Chive",
  "Biscuit",
  "Tater",
  "Pesto",
  "Leafy",
  "Nugget",
  "Clementine",
  "Basil",
  "Turnip",
] as const;

/** A different idea from the list each roll. Pass a random source for tests. */
export function nextNameIdea(current: string, random: () => number = Math.random) {
  const options = SEEDLING_NAME_IDEAS.filter(
    (n) => n.toLowerCase() !== current.trim().toLowerCase(),
  );
  return options[Math.min(options.length - 1, Math.floor(random() * options.length))]!;
}
