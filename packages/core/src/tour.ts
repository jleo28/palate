/** Olive's first-run tour of The Plate. Pure logic; the UI lives in the web app. */
import { DEFAULT_SEEDLING_NAME, SPECIES, type Seedling } from "./seedling";
import type { HallId, Profile } from "./types";

export type TourStepId =
  | "arrive"
  | "seedling"
  | "plate"
  | "halls"
  | "swipe"
  | "log"
  | "menus"
  | "filters"
  | "tray"
  | "sprout"
  | "recap"
  | "card"
  | "bank"
  | "handoff";
/** Matches a `data-tour` attribute on the step's page. */
export type TourTarget =
  | "plate"
  | "halls"
  | "swipe"
  | "log"
  | "menu-list"
  | "filters"
  | "plate-tray"
  | "seedling-card"
  | "recap"
  | "palate-card"
  | "macro-bank";
export type TourRoute = "/" | "/menus" | "/sprout" | "/card";
export type Speaker = "olive" | "seedling";

export interface TourLine {
  speaker: Speaker;
  text: string;
  /** Small aside shown after the line. */
  aside?: string;
}

export interface TourStep {
  id: TourStepId;
  /** The tab the tour walks to for this step. */
  route: TourRoute;
  target?: TourTarget;
  /** One speaker per step; only the naming moment is a back-and-forth. */
  lines: TourLine[];
  /** Primary button label. */
  cta: string;
  /**
   * The step asks the user to try something on the spotlit target. Until they do, the button
   * reads "Show me" and the tour demos it; either way the same speaker reacts with `done`.
   */
  action?: { done: string; aside?: string };
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

const olive = (text: string, aside?: string): TourLine => ({
  speaker: "olive",
  text,
  ...(aside ? { aside } : {}),
});
const seedling = (text: string): TourLine => ({ speaker: "seedling", text });

export function tourSteps({ firstName, seedlingName, hallName }: TourContext): TourStep[] {
  return [
    {
      id: "arrive",
      route: "/",
      cta: "Let's go",
      lines: [
        olive(
          `Hey ${firstName}! I'm Olive. Technically a fruit, emotionally a vegetable, professionally your guide to the dining halls. Got a minute?`,
        ),
      ],
    },
    {
      id: "seedling",
      route: "/",
      cta: "That's my name",
      lines: [
        olive("I brought a friend. This little one is yours, and it has opinions about broccoli."),
        seedling("Hi!! I've never had a name before."),
      ],
    },
    {
      id: "plate",
      route: "/",
      target: "plate",
      cta: "Next",
      lines: [
        olive(
          `This is your plate, built from what ${hallName} is actually serving right now and sized to your goals. I did the math, you're welcome.`,
        ),
      ],
    },
    {
      id: "halls",
      route: "/",
      target: "halls",
      cta: "Next",
      lines: [olive("Village, EVK, Parkside. Pick your battlefield. Go on, tap one.")],
      action: { done: "See? Whole new plate, straight from that hall's menu." },
    },
    {
      id: "swipe",
      route: "/",
      target: "swipe",
      cta: "Next",
      lines: [olive("Plate not speaking to you? Swipe it. I won't take it personally.")],
      action: { done: "Fresh idea, coming right up.", aside: "I took it personally." },
    },
    {
      id: "log",
      route: "/",
      target: "log",
      cta: "Next",
      lines: [seedling("Ooh, tap this after you eat! It's how I grow.")],
    },
    {
      id: "menus",
      route: "/menus",
      target: "menu-list",
      cta: "Next",
      lines: [
        olive(
          "Hall Menus: every station, everything it's serving today. Tap + on anything to add it to your plate.",
        ),
      ],
    },
    {
      id: "filters",
      route: "/menus",
      target: "filters",
      cta: "Next",
      lines: [
        seedling("These narrow it down. High protein, vegan, whatever you're feeling! Tap one!"),
      ],
      action: { done: "Ooh, fancy. Tap it again to clear it." },
    },
    {
      id: "tray",
      route: "/menus",
      target: "plate-tray",
      cta: "Next",
      lines: [olive("Your plate follows you down here. Tap it to check it over or log it.")],
    },
    {
      id: "sprout",
      route: "/sprout",
      target: "seedling-card",
      cta: "Next",
      lines: [
        seedling("This is my spot! I grow a little every day you log a meal. Tap me, I like it."),
      ],
    },
    {
      id: "recap",
      route: "/sprout",
      target: "recap",
      cta: "Next",
      lines: [
        olive("Your week at a glance, plus badges for showing up. Shiny things, no homework."),
      ],
    },
    {
      id: "card",
      route: "/card",
      target: "palate-card",
      cta: "Next",
      lines: [
        olive(
          "My Palate is your card. Tap Edit to flip it: goals, allergies, anything you told me.",
        ),
      ],
      action: { done: "Change anything, anytime. Tap Done to flip it back." },
    },
    {
      id: "bank",
      route: "/card",
      target: "macro-bank",
      cta: "Next",
      lines: [
        seedling("Everything you eat today lands here. Logged the wrong thing? Tap it to fix it!"),
      ],
    },
    {
      id: "handoff",
      route: "/card",
      cta: "Let's eat!",
      lines: [
        olive(
          `That's the tour. ${seedlingName} will take it from here. Replay me anytime from this page. I'll be around being correct about things.`,
        ),
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
