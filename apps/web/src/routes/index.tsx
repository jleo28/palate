import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, RefreshCw, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { MacroRow } from "@/components/palate/MacroBits";
import { PlateIllustration } from "@/components/palate/PlateIllustration";
import { HALLS, MEALS } from "@/lib/palate/halls";
import {
  GOALS,
  buildPlate,
  capPlate,
  effectiveGoal,
  fitCheck,
  fitSummary,
  remainingToday,
  swapItem,
  totals,
  allergenConflicts,
  allergenLabel,
  dislikedMatches,
  type PlateItem,
} from "@palate/core";
import { MENU, portionLabel } from "@/lib/palate/menu";
import { useStore } from "@/lib/palate/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Palate — What to eat at USC dining halls, portioned" },
      {
        name: "description",
        content:
          "Palate builds one balanced plate from today's USC dining hall menus, with real cafeteria portions like 2 tongs of grilled chicken.",
      },
      { property: "og:title", content: "Palate — What to eat at USC dining halls, portioned" },
      {
        property: "og:description",
        content:
          "One tap, one balanced plate, sized to your daily macros at Village, EVK and Parkside.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Plate,
});

function Plate() {
  const navigate = useNavigate();
  const { ready, profile, hall, setHall, meal, setMeal, mealTarget, daily, consumedToday, addLog } =
    useStore();
  const [seed, setSeed] = useState(0);
  const [plate, setPlate] = useState<PlateItem[]>([]);

  useEffect(() => {
    if (ready && !profile) void navigate({ to: "/onboarding" });
  }, [ready, profile, navigate]);

  const diets = profile?.diets ?? [];
  const dietKey = diets.join(",");

  useEffect(() => {
    if (!mealTarget || !daily) return;
    // The day's calorie target is a hard cap: the plate never plans past what's left of it.
    const left = remainingToday(daily, consumedToday).kcal;
    setPlate(capPlate(buildPlate(MENU, hall, meal, diets, mealTarget, seed), left));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hall, meal, dietKey, seed, mealTarget?.kcal, daily?.kcal, consumedToday.kcal]);

  const t = useMemo(() => totals(plate), [plate]);
  const fit = useMemo(
    () => (mealTarget && daily ? fitCheck(t, mealTarget, consumedToday, daily) : null),
    [t, mealTarget, consumedToday, daily],
  );
  const stations = useMemo(() => {
    const map = new Map<string, PlateItem[]>();
    for (const p of plate) {
      const list = map.get(p.item.station) ?? [];
      list.push(p);
      map.set(p.item.station, list);
    }
    return [...map.entries()];
  }, [plate]);

  if (!ready || !profile || !mealTarget || !fit) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-muted-foreground">Loading your plate…</div>
      </AppShell>
    );
  }

  const logMeal = () => {
    addLog({
      hall,
      meal,
      kcal: t.kcal,
      protein: t.protein,
      carbs: t.carbs,
      fat: t.fat,
      items: plate.map((p) => ({ name: p.item.name, portion: portionLabel(p.item, p.qty) })),
    });
    toast.success("Logged to your macro bank", {
      description: `${Math.round(t.kcal)} cal · ${t.protein}g protein`,
    });
  };

  return (
    <AppShell>
      <ScreenHeader title="The Plate" sub={`Hey ${profile.name.split(" ")[0]} · USC`} />

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

      <div className="mb-4 flex gap-2">
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

      <section className="mb-4 rounded-2xl border border-foreground/15 bg-card p-3">
        <div className="mb-2 flex items-baseline justify-between">
          <p className="label-caps text-muted-foreground">{meal} guide</p>
          <p className="text-[0.7rem] font-semibold text-olive">
            {GOALS.find((g) => g.id === effectiveGoal(profile))?.label} ·{" "}
            {profile.highProtein ? "high protein · " : ""}what's left of today
          </p>
        </div>
        <MacroRow t={mealTarget} />
        {fit.capReached && (
          <p className="mt-2 rounded-xl bg-clay-soft px-3 py-2 text-[0.78rem] font-semibold">
            Today's calorie target is reached.
          </p>
        )}
      </section>

      <section className="card-edge rounded-3xl bg-card p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label-caps text-olive">The 1-Tap Plate</p>
            <h2 className="text-xl font-extrabold leading-tight">
              Built for this {meal.toLowerCase()}
            </h2>
          </div>
          <button
            onClick={() => setSeed((s) => s + 1)}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/25 px-3 py-1.5 text-xs font-bold"
          >
            <Shuffle className="size-3.5" /> Shuffle
          </button>
        </div>

        <PlateIllustration items={plate} />

        <div className="space-y-4">
          {stations.map(([station, items]) => (
            <div key={station}>
              <p className="label-caps mb-1.5 text-muted-foreground">{station}</p>
              <div className="space-y-2">
                {items.map((p) => {
                  const hits = allergenConflicts(p.item, profile.allergies);
                  const dislikes = dislikedMatches(p.item, profile.dislikes);
                  return (
                    <div
                      key={p.id}
                      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-foreground/12 bg-background px-3 py-2.5"
                    >
                      <div className="min-w-0">
                        <p className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold">
                          {hits.length > 0 && (
                            <span
                              className="size-2 shrink-0 rounded-full bg-destructive"
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
                          <span className="truncate">{p.item.name}</span>
                        </p>
                        <p className="mt-0.5 inline-block rounded-full bg-olive-soft px-2 py-0.5 text-[0.7rem] font-bold text-olive">
                          {portionLabel(p.item, p.qty)}
                        </p>
                        <p className="mt-1 text-[0.7rem] text-muted-foreground">
                          {p.item.kcal * p.qty} cal · {p.item.protein * p.qty}P ·{" "}
                          {p.item.carbs * p.qty}C · {p.item.fat * p.qty}F
                        </p>
                        {hits.length > 0 && (
                          <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
                            Contains {hits.map(allergenLabel).join(", ")}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          setPlate((prev) => swapItem(MENU, prev, p.id, hall, meal, diets))
                        }
                        className="flex shrink-0 items-center gap-1 rounded-full border border-foreground/25 px-2.5 py-1.5 text-[0.7rem] font-bold"
                      >
                        <RefreshCw className="size-3" /> Swap
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-2xl bg-foreground/5 p-2.5">
          <MacroRow t={t} target={mealTarget} over={fit.over.map((o) => o.macro)} />
        </div>

        <p
          className={cn(
            "mt-3 rounded-2xl px-3 py-2.5 text-sm",
            fit.dayOverCap ? "bg-clay-soft" : fit.over.length ? "bg-amber-soft" : "bg-olive-soft",
          )}
        >
          <span className="font-bold">Seedling: </span>
          {fitSummary(fit, meal)}
        </p>

        <button
          onClick={logMeal}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px"
        >
          <Check className="size-5" /> Ate This Meal
        </button>
      </section>
    </AppShell>
  );
}
