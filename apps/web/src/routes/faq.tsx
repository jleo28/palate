import { createFileRoute } from "@tanstack/react-router";
import { ChevronDown, HeartHandshake } from "lucide-react";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";

export const Route = createFileRoute("/faq")({
  head: () => ({
    meta: [
      { title: "FAQs | Palate" },
      { name: "description", content: "Common questions about Palate, and where to find support." },
    ],
  }),
  component: Faq,
});

// From the team's class assignment.
const FAQS: { q: string; a: string }[] = [
  {
    q: "Where do Palate’s numbers come from, and how accurate are they?",
    a: "Menus come straight from USC Hospitality each day. USC doesn’t publish nutrition, so we estimate it. Most dishes are matched to the USDA’s FoodData Central database at a typical serving. When a dish is too unusual for a reliable USDA match, its calories and macros are estimated with AI (Claude), using the closest USDA foods as a reference. Allergen and diet labels always come from USC, never from an estimate. Portions and recipes vary, so every number is an estimate.",
  },
  {
    q: "Why doesn’t USC publish this information itself?",
    a: "USC Hospitality’s menus list allergens and dietary tags but no calories or macros, and general nutrition apps like MyFitnessPal don’t include dining hall menus. Palate fills that gap with its own estimates and is designed with eating-disorder safety in mind.",
  },
  {
    q: "Is Palate safe for students who struggle with food or tracking?",
    a: "Palate is built to avoid the patterns that make tracking harmful. Recommendations never go below 1,500 calories a day, nothing turns red, BMI is never shown, and there are no badges for eating less. Streaks count days you log a plate, not days you hit a target, and two freezes are applied automatically each month.",
  },
  {
    q: "How does Palate handle allergies and dietary restrictions?",
    a: "Allergies and restrictions entered at sign-up are hard filters: excluded items never appear in a recommended plate. Palate relies on USC’s own allergen tags, so students with serious allergies should still confirm with dining staff.",
  },
  {
    q: "What if I don’t care about macros?",
    a: "Palate still works as a filtered menu for every hall, and students can give each plate a thumbs-up or thumbs-down on taste. In our survey, 90% named taste as a factor in what they eat, so dish-level ratings are next on the roadmap.",
  },
];

const RESOURCES = [
  {
    name: "USC Counseling and Mental Health",
    detail: "24/7 support for students, including eating concerns",
    href: "tel:+12137409355",
    label: "(213) 740-9355",
  },
  {
    name: "USC Student Health",
    detail: "Nutrition and medical care on campus",
    href: "https://studenthealth.usc.edu",
    label: "studenthealth.usc.edu",
  },
  {
    name: "National Alliance for Eating Disorders",
    detail: "Free helpline staffed by therapists",
    href: "tel:+18666621235",
    label: "(866) 662-1235",
  },
];

function Faq() {
  return (
    <AppShell>
      <ScreenHeader title="FAQs" sub="Questions & support" />

      <div className="space-y-2">
        {FAQS.map(({ q, a }) => (
          <details
            key={q}
            className="group rounded-2xl border border-foreground/15 bg-card px-4 py-3"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold [&::-webkit-details-marker]:hidden">
              {q}
              <ChevronDown
                className="size-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180"
                aria-hidden
              />
            </summary>
            <p className="mt-2 text-sm text-muted-foreground">{a}</p>
          </details>
        ))}
      </div>

      <section className="mt-6 rounded-2xl border border-foreground/15 bg-card p-4">
        <h2 className="flex items-center gap-2 font-display text-lg font-bold">
          <HeartHandshake className="size-5 text-olive" aria-hidden /> Need someone to talk to?
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          If food, eating or your body is weighing on you, you don't have to handle it alone.
        </p>
        <ul className="mt-3 space-y-3">
          {RESOURCES.map((r) => (
            <li key={r.name} className="text-sm">
              <p className="font-bold">{r.name}</p>
              <p className="text-muted-foreground">{r.detail}</p>
              <a
                href={r.href}
                className="font-semibold text-olive underline"
                {...(r.href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {r.label}
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">In an emergency, call 911.</p>
      </section>
    </AppShell>
  );
}
