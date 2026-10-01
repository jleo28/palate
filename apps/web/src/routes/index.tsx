import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Shuffle } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { MacroRow } from "@/components/palate/MacroBits";
import { PlateIllustration } from "@/components/palate/PlateIllustration";
import { SwipeArea } from "@/components/palate/SwipeArea";
import { PlateRow } from "@/components/palate/PlateRow";
import { HALLS, MEALS } from "@/lib/palate/halls";
import {
  GOALS,
  buildPlate,
  capPlate,
  effectiveGoal,
  fitCheck,
  fitSummary,
  remainingToday,
  alternatives,
  back,
  canGoBack,
  currentPlate,
  editCurrent,
  forward,
  startHistory,
  type PlateHistory,
  removeRow,
  replaceRow,
  setQty,
  swapItem,
  totals,
  withoutSkipped,
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
  // Each new variation uses the next seed; the stack keeps the last 10 to swipe back through.
  const seed = useRef(0);
  const [history, setHistory] = useState<PlateHistory>(() => startHistory([]));
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const plate = currentPlate(history);
  const edit = (fn: (p: PlateItem[]) => PlateItem[]) => setHistory((h) => editCurrent(h, fn));

  useEffect(() => {
    if (ready && !profile) void navigate({ to: "/onboarding" });
  }, [ready, profile, navigate]);

  const diets = profile?.diets ?? [];
  const dietKey = diets.join(",");
  const skipKey = (profile?.dislikes ?? []).join(",");
  // Skipped foods never appear on a plate.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const menu = useMemo(() => withoutSkipped(MENU, profile?.dislikes), [skipKey]);

  const freshPlate = () => {
    if (!mealTarget || !daily) return [];
    // The day's calorie target is a hard cap: the plate never plans past what's left of it.
    const left = remainingToday(daily, consumedToday).kcal;
    return capPlate(buildPlate(menu, hall, meal, diets, mealTarget, seed.current), left);
  };

  // A new hall, meal or budget starts a fresh stack.
  useEffect(() => {
    seed.current = 0;
    setHistory(startHistory(freshPlate()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, hall, meal, dietKey, mealTarget?.kcal, daily?.kcal, consumedToday.kcal]);

  const nextPlate = () => {
    setDirection("next");
    setHistory((h) =>
      forward(h, () => {
        seed.current += 1;
        return freshPlate();
      }),
    );
  };
  const previousPlate = () => {
    setDirection("prev");
    setHistory(back);
  };

  const t = useMemo(() => totals(plate), [plate]);
  const fit = useMemo(
    () => (mealTarget && daily ? fitCheck(t, mealTarget, consumedToday, daily) : null),
    [t, mealTarget, consumedToday, daily],
  );

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
            onClick={nextPlate}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/25 px-3 py-1.5 text-xs font-bold"
          >
            <Shuffle className="size-3.5" /> Shuffle
          </button>
        </div>

        <SwipeArea onNext={nextPlate} onPrevious={previousPlate} label="Plate variations">
          <div
            key={`${history.index}-${history.plates.length}`}
            className={cn(
              "animate-in fade-in duration-300",
              direction === "next" ? "slide-in-from-right-8" : "slide-in-from-left-8",
            )}
          >
            <PlateIllustration items={plate} />
          </div>
        </SwipeArea>

        <div className="mb-3 flex items-center justify-center gap-3 text-[0.7rem] text-muted-foreground">
          <button
            type="button"
            onClick={previousPlate}
            disabled={!canGoBack(history)}
            aria-label="Previous plate"
            className="grid size-8 place-items-center rounded-full border border-foreground/20 disabled:opacity-30"
          >
            <ChevronLeft className="size-4" />
          </button>
          <span aria-live="polite">
            Swipe for another idea · {history.index + 1} of {history.plates.length}
          </span>
          <button
            type="button"
            onClick={nextPlate}
            aria-label="Next plate"
            className="grid size-8 place-items-center rounded-full border border-foreground/20"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>

        {plate.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-foreground/25 px-3 py-6 text-center text-sm text-muted-foreground">
            Your plate is empty. Tap Shuffle for a fresh one.
          </p>
        ) : (
          <ul
            aria-label={`Your ${meal.toLowerCase()} plate`}
            className="divide-y divide-foreground/10 rounded-2xl border border-foreground/15 bg-background"
          >
            {plate.map((row) => (
              <PlateRow
                key={row.id}
                row={row}
                allergies={profile.allergies}
                alternatives={alternatives(menu, plate, row.id, hall, meal, diets)}
                onSwap={() => edit((prev) => swapItem(menu, prev, row.id, hall, meal, diets))}
                onQty={(qty) => edit((prev) => setQty(prev, row.id, qty))}
                onRemove={() => edit((prev) => removeRow(prev, row.id))}
                onReplace={(item) => edit((prev) => replaceRow(prev, row.id, item))}
              />
            ))}
          </ul>
        )}

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
          disabled={plate.length === 0}
          className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px disabled:opacity-40"
        >
          <Check className="size-5" /> Ate This Meal
        </button>
      </section>
    </AppShell>
  );
}
