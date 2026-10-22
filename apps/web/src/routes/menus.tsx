import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useHideNumbers } from "@/lib/palate/hide-numbers";
import { MacroText } from "@/components/palate/MacroText";
import { AllergenNotice } from "@/components/palate/AllergenNotice";
import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { Button } from "@/components/ui/button";
import { SeedlingHint } from "@/components/palate/SeedlingHint";
import { HALLS, MEALS } from "@/lib/palate/halls";
import { useHallMenu } from "@/lib/palate/use-menu";
import {
  CONFIRM_WITH_STAFF,
  logItems,
  menuPeriod,
  allergenConflicts,
  allergenLabel,
  customAllergyMatches,
  dislikedMatches,
  type MenuItem,
} from "@palate/core";
import { useStore } from "@/lib/palate/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menus")({
  head: () => ({
    meta: [
      { title: "Hall Menus — Village, EVK & Parkside macros | Palate" },
      {
        name: "description",
        content:
          "Browse every station at USC Village, EVK and Parkside with calories and macros, filtered for high protein, vegan, vegetarian or low carb.",
      },
      { property: "og:title", content: "Hall Menus — Village, EVK & Parkside macros" },
      {
        property: "og:description",
        content: "Station-by-station USC dining menus with calorie and macro labels.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Menus,
});

type FilterId = "high-protein" | "vegan" | "vegetarian" | "low-carb";

const FILTERS: { id: FilterId; label: string; test: (i: MenuItem) => boolean }[] = [
  { id: "high-protein", label: "High Protein", test: (i) => i.protein >= 10 },
  { id: "vegan", label: "Vegan", test: (i) => i.tags.includes("vegan") },
  { id: "vegetarian", label: "Vegetarian", test: (i) => i.tags.includes("vegetarian") },
  { id: "low-carb", label: "Low Carb", test: (i) => i.carbs <= 10 },
];

function Menus() {
  const hidden = useHideNumbers();
  const { hall, setHall, meal, setMeal, addToPlate, profile } = useStore();
  const navigate = useNavigate();
  // Menus are per hall meal; a selected snack shows the meal it's planned from.
  const period = menuPeriod(meal);
  const allergies = profile?.allergies ?? [];
  const [filters, setFilters] = useState<FilterId[]>([]);

  const { items: hallItems, loading, sample, date } = useHallMenu(hall);
  const dayLabel = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  const stations = useMemo(() => {
    const items = hallItems.filter(
      (i) =>
        i.hall === hall &&
        i.meals.includes(period) &&
        filters.every((f) => FILTERS.find((x) => x.id === f)?.test(i) ?? true),
    );
    const map = new Map<string, MenuItem[]>();
    for (const i of items) {
      const list = map.get(i.station) ?? [];
      list.push(i);
      map.set(i.station, list);
    }
    return [...map.entries()];
  }, [hallItems, hall, period, filters]);

  return (
    <AppShell>
      <ScreenHeader title="Hall Menus" sub={`${dayLabel} · ${period}`} />
      {sample && (
        <p className="mb-2 inline-block rounded-full bg-foreground/5 px-2.5 py-1 text-xs font-semibold text-muted-foreground">
          Sample menu · today's menu couldn't load
        </p>
      )}
      {profile?.seedling && <SeedlingHint screen="menus" seedling={profile.seedling} />}
      <p className="mb-3 text-sm text-muted-foreground">
        Want something else? Tap <Plus className="inline size-3.5 align-[-2px]" aria-label="plus" />{" "}
        on anything to add it to your plate, then log it from The Plate.
      </p>
      <AllergenNotice className="mb-3" />

      <div className="mb-3 grid grid-cols-3 gap-1.5 rounded-full border border-foreground/15 bg-card p-1">
        {HALLS.map((h) => (
          <button
            key={h.id}
            onClick={() => setHall(h.id)}
            className={cn(
              "rounded-full py-2 text-sm font-bold transition-colors",
              hall === h.id ? "bg-foreground text-primary-foreground" : "text-muted-foreground",
            )}
          >
            {h.short}
          </button>
        ))}
      </div>

      <div className="mb-3 flex gap-2">
        {MEALS.map((m) => (
          <button
            key={m}
            onClick={() => setMeal(m)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-bold transition-colors",
              period === m
                ? "border-olive bg-olive text-primary-foreground"
                : "border-foreground/20 text-muted-foreground",
            )}
          >
            {m}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() =>
              setFilters((prev) =>
                prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id],
              )
            }
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              filters.includes(f.id)
                ? "border-olive bg-olive-soft text-olive"
                : "border-foreground/20 text-muted-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-5">
        {stations.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">
            {loading
              ? "Loading today's menu…"
              : filters.length
                ? "Nothing on this line matches those filters. Try loosening one."
                : `${period} isn't on today's menu here.`}
          </p>
        )}
        {stations.map(([station, items]) => (
          <section key={station}>
            <h2 className="label-caps mb-2 text-olive">{station}</h2>
            <div className="space-y-2">
              {items.map((i) => {
                const hits = allergenConflicts(i, allergies);
                const possible = customAllergyMatches(i, profile?.customAllergies);
                const dislikes = dislikedMatches(i, profile?.dislikes);
                return (
                  <div
                    key={i.id}
                    className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-foreground/15 bg-card px-3.5 py-3"
                  >
                    <div className="min-w-0">
                      <p className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold">
                        {(hits.length > 0 || possible.length > 0) && (
                          <span
                            className="size-2 shrink-0 rounded-full bg-destructive"
                            title={`Contains ${hits.map(allergenLabel).join(", ")}`}
                            aria-label={`Allergen warning: contains ${hits.map(allergenLabel).join(", ")}`}
                          />
                        )}
                        {dislikes.length > 0 && (
                          <span
                            className="shrink-0 text-base leading-none text-muted-foreground"
                            aria-label={`Not preferred: ${dislikes.map((item) => item.label).join(", ")}`}
                            title="Not preferred"
                          >
                            ~
                          </span>
                        )}
                        <span className="truncate">{i.name}</span>
                      </p>
                      <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                        per {i.unit}
                        <MacroText m={i} prefix=" · " />
                      </p>
                      {hits.length > 0 && (
                        <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
                          Contains {hits.map(allergenLabel).join(", ")}
                        </p>
                      )}
                      {possible.length > 0 && (
                        <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
                          May contain {possible.join(", ")} · {CONFIRM_WITH_STAFF}
                        </p>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        addToPlate(i);
                        toast.success(`${i.name} added to your plate`, {
                          action: { label: "View", onClick: () => void navigate({ to: "/" }) },
                        });
                      }}
                      className="size-10 shrink-0 rounded-full"
                      aria-label={`Add ${i.name} to your plate`}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </AppShell>
  );
}
