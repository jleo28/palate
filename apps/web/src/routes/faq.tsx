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

// TODO: swap in the team's FAQs from the class assignment.
const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Palate?",
    a: "Palate builds a balanced plate from today's menus at USC Village, EVK and Parkside, portioned in real hall servings like tongs and ladles.",
  },
  {
    q: "Where do the menus come from?",
    a: "From USC Hospitality's published menus, refreshed through the day. Stations sometimes change last minute, so what's on the line wins.",
  },
  {
    q: "How accurate are the calories and macros?",
    a: "They're estimates. USC doesn't publish nutrition, so we match items to a curated table and USDA data. Treat them as a guide, not a measurement.",
  },
  {
    q: "Can I trust the allergen info?",
    a: "Use it as a first filter only. It comes from USC's labels, which can be incomplete, and kitchens share equipment. Always confirm with dining staff before you eat.",
  },
  {
    q: "What happens if I miss a day?",
    a: "Nothing bad. Your Seedling never shrinks, and streaks get two automatic freezes a month. Eating is what matters, not the log.",
  },
  {
    q: "Do I have to log every meal?",
    a: "No. Log what's useful to you. Palate is a helper for eating well in the halls, not a scorecard.",
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
