import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import type { PlateItem } from "@palate/core";
import { Wordmark } from "@/components/palate/AppShell";
import { Olive } from "@/components/palate/Olive";
import { PlateIllustration } from "@/components/palate/PlateIllustration";
import { MENU } from "@/lib/palate/menu";

export const Route = createFileRoute("/welcome")({
  head: () => ({
    meta: [
      { title: "Welcome to Palate — balanced plates at USC dining halls" },
      {
        name: "description",
        content:
          "Palate builds a balanced plate from today's USC dining hall menus. Made for USC's dining hall warriors.",
      },
    ],
  }),
  component: Welcome,
});

const POINTS = [
  "One tap gives you a balanced plate from today's menu",
  "Real hall portions: tongs, ladles and spoonfuls",
  "Plates leave out foods you skip and items labeled with your allergies",
];

// A sample Village dinner for the hero: salmon, rice, greens and sweet potato.
const HERO_PLATE: PlateItem[] = ["v-salmon", "v-cilantro-rice", "v-green-salad", "v-sweet-potato"]
  .map((id) => MENU.find((m) => m.id === id))
  .filter((item) => item !== undefined)
  .map((item) => ({ id: item.id, item, qty: 1 }));

function Welcome() {
  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-8 pb-10">
      <PlateIllustration items={HERO_PLATE} />

      <div className="relative">
        <Olive className="absolute -top-6 right-0 size-24" />
        <Wordmark className="text-5xl" />
      </div>

      <div className="mt-4">
        <p className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-bold text-olive">
          <Check className="size-3.5" aria-hidden /> For USC's dining hall warriors
        </p>
        <h1 className="mt-4 text-4xl leading-[1.05] font-extrabold tracking-tight">
          Know what to put on your plate.
        </h1>
        <p className="mt-3 text-base text-muted-foreground">
          Palate turns Village, EVK and Parkside menus into one plate sized to your goals, every
          meal.
        </p>

        <ul className="mt-6 space-y-2.5">
          {POINTS.map((point) => (
            <li key={point} className="flex items-start gap-2.5 text-sm">
              <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-olive text-primary-foreground">
                <Check className="size-3" aria-hidden />
              </span>
              {point}
            </li>
          ))}
        </ul>
      </div>

      <Link
        to="/onboarding"
        className="mt-10 flex h-12 items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px"
      >
        Get started <ArrowRight className="size-5" aria-hidden />
      </Link>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Takes about a minute.{" "}
        <Link to="/sign-in" className="font-bold text-olive underline">
          I already have an account
        </Link>
      </p>
    </div>
  );
}
