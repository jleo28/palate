import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useHideNumbers } from "@/lib/palate/hide-numbers";
import { AllergenNotice } from "@/components/palate/AllergenNotice";
import { useCallback, useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { HallMenuList } from "@/components/palate/HallMenuList";
import { SeedlingHint } from "@/components/palate/SeedlingHint";
import { HALLS, MEALS } from "@/lib/palate/halls";
import { useHallMenu } from "@/lib/palate/use-menu";
import { menuPeriod, type MenuItem } from "@palate/core";
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
  const [filters, setFilters] = useState<FilterId[]>([]);
  const matchesFilters = useCallback(
    (i: MenuItem) => filters.every((f) => FILTERS.find((x) => x.id === f)?.test(i) ?? true),
    [filters],
  );

  const { items: hallItems, loading, sample, date } = useHallMenu(hall);
  const dayLabel = new Date(`${date}T12:00:00`).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

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

      <HallMenuList
        items={hallItems}
        hall={hall}
        period={period}
        loading={loading}
        filter={matchesFilters}
        emptyText={
          filters.length
            ? "Nothing on this line matches those filters. Try loosening one."
            : undefined
        }
        onAdd={(i) => {
          addToPlate(i);
          toast.success(`${i.name} added to your plate`, {
            action: { label: "View", onClick: () => void navigate({ to: "/" }) },
          });
        }}
      />
    </AppShell>
  );
}
