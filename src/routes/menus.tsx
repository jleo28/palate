import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Minus, Plus, ShoppingBasket, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/8te/AppShell";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { HALLS, MEALS } from "@/lib/8te/halls";
import { MENU } from "@/lib/8te/menu";
import { allergenConflicts, allergenLabel } from "@/lib/8te/allergens";
import { dislikedMatches } from "@/lib/8te/preferences";
import { useStore } from "@/lib/8te/store";
import type { MenuItem } from "@/lib/8te/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/menus")({
  head: () => ({
    meta: [
      { title: "Hall Menus — Village, EVK & Parkside macros | 8te" },
      {
        name: "description",
        content:
          "Browse every station at USC Village, EVK and Parkside with calories and macros, filtered for high protein, vegan or under 500 calories.",
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

type FilterId = "high-protein" | "vegan" | "vegetarian" | "under-500" | "low-carb";

const FILTERS: { id: FilterId; label: string; test: (i: MenuItem) => boolean }[] = [
  { id: "high-protein", label: "High Protein", test: (i) => i.protein >= 10 },
  { id: "vegan", label: "Vegan", test: (i) => i.tags.includes("vegan") },
  { id: "vegetarian", label: "Vegetarian", test: (i) => i.tags.includes("vegetarian") },
  { id: "under-500", label: "Under 500 kcal", test: (i) => i.kcal < 500 },
  { id: "low-carb", label: "Low Carb", test: (i) => i.carbs <= 10 },
];

function Menus() {
  const { hall, setHall, meal, setMeal, addLog, profile } = useStore();
  const allergies = profile?.allergies ?? [];
  const [filters, setFilters] = useState<FilterId[]>([]);
  const [custom, setCustom] = useState<MenuItem[]>([]);
  const [plateOpen, setPlateOpen] = useState(false);

  const stations = useMemo(() => {
    const items = MENU.filter(
      (i) =>
        i.hall === hall &&
        i.meals.includes(meal) &&
        filters.every((f) => FILTERS.find((x) => x.id === f)?.test(i) ?? true),
    );
    const map = new Map<string, MenuItem[]>();
    for (const i of items) {
      const list = map.get(i.station) ?? [];
      list.push(i);
      map.set(i.station, list);
    }
    return [...map.entries()];
  }, [hall, meal, filters]);

  const t = custom.reduce(
    (a, i) => ({
      kcal: a.kcal + i.kcal,
      protein: a.protein + i.protein,
      carbs: a.carbs + i.carbs,
      fat: a.fat + i.fat,
    }),
    { kcal: 0, protein: 0, carbs: 0, fat: 0 },
  );

  const customRows = useMemo(() => {
    const rows = new Map<string, { item: MenuItem; quantity: number }>();
    for (const item of custom) {
      const existing = rows.get(item.id);
      rows.set(item.id, { item, quantity: (existing?.quantity ?? 0) + 1 });
    }
    return [...rows.values()];
  }, [custom]);

  const subtractOne = (id: string) => {
    setCustom((prev) => {
      const index = prev.findIndex((item) => item.id === id);
      return index < 0 ? prev : [...prev.slice(0, index), ...prev.slice(index + 1)];
    });
  };

  const clearItem = (id: string) => setCustom((prev) => prev.filter((item) => item.id !== id));

  const logCustomPlate = () => {
    addLog({
      hall,
      meal,
      ...t,
      items: customRows.map(({ item, quantity }) => ({
        name: item.name,
        portion: `${quantity} ${quantity === 1 ? item.unit : item.unitPlural}`,
      })),
    });
    setCustom([]);
    setPlateOpen(false);
    toast.success("Custom plate logged");
  };

  return (
    <AppShell>
      <ScreenHeader title="Hall Menus" sub="Explore every station" />

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
              meal === m
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
              setFilters((prev) => (prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id]))
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
            Nothing on this line matches those filters. Try loosening one.
          </p>
        )}
        {stations.map(([station, items]) => (
          <section key={station}>
            <h2 className="label-caps mb-2 text-olive">{station}</h2>
            <div className="space-y-2">
              {items.map((i) => {
                const hits = allergenConflicts(i, allergies);
                const dislikes = dislikedMatches(i, profile?.dislikes);
                return (
                <div
                  key={i.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-foreground/15 bg-card px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold">
                      {hits.length > 0 && (
                        <span
                          className="size-2 shrink-0 rounded-full bg-destructive"
                          title={`Contains ${hits.map(allergenLabel).join(", ")}`}
                          aria-label={`Allergen warning: contains ${hits.map(allergenLabel).join(", ")}`}
                        />
                      )}
                      {dislikes.length > 0 && (
                        <span className="shrink-0 text-base leading-none text-muted-foreground" aria-label={`Not preferred: ${dislikes.map((item) => item.label).join(", ")}`} title="Not preferred">~</span>
                      )}
                      <span className="truncate">{i.name}</span>
                    </p>
                    <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                      per {i.unit} · {i.kcal} cal · {i.protein}P · {i.carbs}C · {i.fat}F
                    </p>
                    {hits.length > 0 && (
                      <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
                        Contains {hits.map(allergenLabel).join(", ")}
                      </p>
                    )}
                  </div>
                   <Button
                     type="button"
                     variant="outline"
                     size="icon"
                    onClick={() => {
                      setCustom((prev) => [...prev, i]);
                      toast.success(`${i.name} added to custom plate`);
                    }}
                     className="shrink-0 rounded-full"
                    aria-label={`Add ${i.name} to custom plate`}
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

      {custom.length > 0 && (
        <div className="fixed inset-x-0 bottom-[76px] z-30 px-4">
          <div className="card-edge mx-auto flex max-w-md items-center gap-2 rounded-2xl bg-card p-2 pl-4">
            <button type="button" onClick={() => setPlateOpen(true)} className="min-w-0 flex-1 text-left" aria-label="Open custom plate">
              <p className="label-caps text-muted-foreground">Custom plate · {custom.length} items</p>
              <p className="truncate font-display text-sm font-bold">
                {t.kcal} cal · {t.protein}P · {t.carbs}C · {t.fat}F
              </p>
            </button>
            <Button type="button" onClick={() => setPlateOpen(true)} className="h-11 shrink-0 rounded-full px-4">
              <ShoppingBasket /> View
            </Button>
          </div>
        </div>
      )}

      <Sheet open={plateOpen} onOpenChange={setPlateOpen}>
        <SheetContent side="right" className="flex w-[min(92vw,26rem)] flex-col border-foreground/20 bg-background p-0 sm:max-w-md">
          <SheetHeader className="border-b border-foreground/15 px-5 py-5 text-left">
            <SheetTitle className="font-display text-2xl font-extrabold">Custom plate</SheetTitle>
            <SheetDescription>
              {custom.length} {custom.length === 1 ? "portion" : "portions"} · {t.kcal} cal · {t.protein}g protein
            </SheetDescription>
          </SheetHeader>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            {customRows.length === 0 ? (
              <div className="grid h-full place-content-center text-center text-sm text-muted-foreground">
                <ShoppingBasket className="mx-auto mb-2 size-7" />
                Your custom plate is empty.
              </div>
            ) : (
              <div className="space-y-2">
                {customRows.map(({ item, quantity }) => {
                  const hits = allergenConflicts(item, allergies);
                  const dislikes = dislikedMatches(item, profile?.dislikes);
                  return (
                  <div key={item.id} className="rounded-2xl border border-foreground/15 bg-card p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-display text-sm font-bold">
                          {hits.length > 0 && (
                            <span
                              className="size-2 shrink-0 rounded-full bg-destructive"
                              aria-label={`Allergen warning: contains ${hits.map(allergenLabel).join(", ")}`}
                            />
                          )}
                           {dislikes.length > 0 && (
                             <span className="shrink-0 text-base leading-none text-muted-foreground" aria-label={`Not preferred: ${dislikes.map((entry) => entry.label).join(", ")}`} title="Not preferred">~</span>
                           )}
                          <span className="truncate">{item.name}</span>
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {quantity} {quantity === 1 ? item.unit : item.unitPlural} · {item.kcal * quantity} cal
                        </p>
                        {hits.length > 0 && (
                          <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
                            Contains {hits.map(allergenLabel).join(", ")}
                          </p>
                        )}
                      </div>
                      <Button type="button" variant="ghost" size="icon" onClick={() => clearItem(item.id)} aria-label={`Remove all ${item.name}`} className="size-8 shrink-0 rounded-full text-muted-foreground">
                        <Trash2 />
                      </Button>
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t border-foreground/10 pt-2.5">
                      <span className="text-xs font-semibold text-olive">{item.protein * quantity}P · {item.carbs * quantity}C · {item.fat * quantity}F</span>
                      <div className="flex items-center gap-1.5">
                        <Button type="button" variant="outline" size="icon" onClick={() => subtractOne(item.id)} aria-label={`Subtract one ${item.name}`} className="size-8 rounded-full">
                          <Minus />
                        </Button>
                        <span className="w-6 text-center text-sm font-bold" aria-label={`${quantity} portions`}>{quantity}</span>
                        <Button type="button" variant="outline" size="icon" onClick={() => setCustom((prev) => [...prev, item])} aria-label={`Add one ${item.name}`} className="size-8 rounded-full">
                          <Plus />
                        </Button>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-foreground/15 bg-card p-4">
            <div className="mb-3 grid grid-cols-4 gap-2 text-center">
              {[["Cal", t.kcal], ["P", t.protein], ["C", t.carbs], ["F", t.fat]].map(([label, value]) => (
                <div key={label}>
                  <p className="font-display text-sm font-bold">{value}</p>
                  <p className="label-caps text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <Button type="button" onClick={logCustomPlate} disabled={custom.length === 0} className="h-12 w-full rounded-full text-base font-bold">
              Log custom plate
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </AppShell>
  );
}
