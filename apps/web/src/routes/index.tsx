import { createFileRoute } from "@tanstack/react-router";
import { useHideNumbers } from "@/lib/palate/hide-numbers";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Camera,
  Check,
  ChevronLeft,
  ChevronRight,
  Plus,
  Shuffle,
  UtensilsCrossed,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { AteSomethingElseDialog } from "@/components/palate/AteSomethingElseDialog";
import { HallMenuList } from "@/components/palate/HallMenuList";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { AllergenNotice } from "@/components/palate/AllergenNotice";
import { MacroRow } from "@/components/palate/MacroBits";
import { PlateIllustration } from "@/components/palate/PlateIllustration";
import { SwipeArea } from "@/components/palate/SwipeArea";
import { SeedlingAvatar } from "@/components/palate/SeedlingAvatar";
import { SeedlingHint } from "@/components/palate/SeedlingHint";
import { PlateRow } from "@/components/palate/PlateRow";
import { LoggedSlot } from "@/components/palate/LoggedSlot";
import { HALLS } from "@/lib/palate/halls";
import {
  GOALS,
  SNACKS,
  buildPlate,
  buildSnack,
  isSnack,
  logItems,
  menuPeriod,
  capPlate,
  effectiveGoal,
  fitCheck,
  fitSummary,
  remainingToday,
  alternatives,
  canSwap,
  back,
  canGoBack,
  currentPlate,
  editCurrent,
  distinctPlates,
  nextOption,
  optionsHistory,
  startHistory,
  type PlateHistory,
  addItem,
  removeRow,
  restoreRow,
  replaceRow,
  setQty,
  swapItem,
  totals,
  withoutSkipped,
  withoutAllergyConflicts,
  type PlateItem,
} from "@palate/core";
import { portionLabel } from "@/lib/palate/menu";
import { useHallMenu } from "@/lib/palate/use-menu";
import { today as localToday } from "@/lib/palate/dates";
import { useStore } from "@/lib/palate/store";
import { useRequireProfile } from "@/lib/palate/useRequireProfile";
import { cn } from "@/lib/utils";

const PORTION_TIP_KEY = "palate.portionTip.v1";

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
  const hidden = useHideNumbers();
  const {
    ready,
    profile,
    hall,
    setHall,
    meal,
    setMeal,
    slots,
    mealTarget,
    daily,
    consumedToday,
    addLog,
    addToPlate,
    plateAdds,
    clearPlateAdds,
    attachPhoto,
    loggedToday,
    log,
  } = useStore();
  // Snacks draw on a nearby hall meal's menu.
  const period = menuPeriod(meal);
  // A hall meal logged today shows what was eaten instead of a new plate.
  const loggedEntry = !isSnack(meal)
    ? log.find((l) => l.date === localToday() && l.meal === meal)
    : undefined;
  const [history, setHistory] = useState<PlateHistory>(() => startHistory([]));
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [elseOpen, setElseOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [pendingPhoto, setPendingPhoto] = useState<File | null>(null);
  const photoInput = useRef<HTMLInputElement>(null);
  // One-time tip on the first plate someone sees. Marked seen as soon as it shows.
  const [showPortionTip, setShowPortionTip] = useState(false);
  useEffect(() => {
    try {
      if (localStorage.getItem(PORTION_TIP_KEY)) return;
      localStorage.setItem(PORTION_TIP_KEY, "1");
      setShowPortionTip(true);
    } catch {
      // Storage blocked: skip the tip.
    }
  }, []);
  const plate = currentPlate(history);
  const hasOptions = history.plates.length > 1;
  const edit = (fn: (p: PlateItem[]) => PlateItem[]) => setHistory((h) => editCurrent(h, fn));

  const removeWithUndo = (row: PlateItem) => {
    const index = plate.findIndex((r) => r.id === row.id);
    edit((prev) => removeRow(prev, row.id));
    toast(`Removed ${row.item.name}`, {
      duration: 5000,
      action: { label: "Undo", onClick: () => edit((prev) => restoreRow(prev, row, index)) },
    });
  };

  useRequireProfile();

  const diets = profile?.diets ?? [];
  const dietKey = diets.join(",");
  const skipKey = (profile?.dislikes ?? []).join(",");
  const allergyKey = [...(profile?.allergies ?? []), ...(profile?.customAllergies ?? [])].join(",");
  const { items: hallItems, loading: menuLoading } = useHallMenu(hall);
  // Skipped foods and anything flagged for the user's allergies never go on a generated plate.
  const menu = useMemo(
    () =>
      withoutAllergyConflicts(
        withoutSkipped(hallItems, profile?.dislikes),
        profile?.allergies,
        profile?.customAllergies,
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hallItems, skipKey, allergyKey],
  );

  const freshPlate = (seed: number) => {
    if (!mealTarget || !daily) return [];
    // The day's calorie target is a hard cap: the plate never plans past what's left of it.
    const left = remainingToday(daily, consumedToday).kcal;
    const build = isSnack(meal) ? buildSnack : buildPlate;
    return capPlate(build(menu, hall, period, diets, mealTarget, seed), left);
  };

  // A new hall, meal or budget builds a fresh set of up to 3 different plates.
  useEffect(() => {
    setHistory(optionsHistory(distinctPlates(freshPlate)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu, hall, meal, dietKey, mealTarget?.kcal, daily?.kcal, consumedToday.kcal]);

  // Items tapped on Hall Menus join the plate you're on, once today's menu has loaded (a menu
  // change rebuilds the plates). Declared after the rebuild so they're added on top of it.
  useEffect(() => {
    if (!plateAdds.length || !menu.length) return;
    edit((prev) => plateAdds.reduce((p, item) => addItem(p, item), prev));
    clearPlateAdds();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plateAdds, menu.length]);

  const nextPlate = () => {
    setDirection("next");
    setHistory(nextOption);
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
    const logged = addLog({
      hall,
      meal,
      kcal: t.kcal,
      protein: t.protein,
      carbs: t.carbs,
      fat: t.fat,
      items: logItems(plate),
    });
    if (!logged) return;
    // A photo taken before logging goes onto this meal.
    if (pendingPhoto) {
      void attachPhoto(logged.id, pendingPhoto);
      setPendingPhoto(null);
    }
  };

  return (
    <AppShell>
      <ScreenHeader title="The Plate" sub={`Hey ${profile.name.split(" ")[0]} · USC`} />
      {profile.seedling && <SeedlingHint screen="plate" seedling={profile.seedling} />}

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

      <div className="mb-4 flex flex-wrap gap-2">
        {slots.map((m) => (
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
            {isSnack(m) ? SNACKS[m].label : m}
            {!isSnack(m) && loggedToday.includes(m) && <span aria-label=" (logged)"> ✓</span>}
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

      {loggedEntry ? (
        <LoggedSlot entry={loggedEntry} />
      ) : (
        <section className="card-edge rounded-3xl bg-card p-4">
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="label-caps text-olive">The 1-Tap Plate</p>
              <h2 className="text-xl font-extrabold leading-tight">
                {isSnack(meal)
                  ? `A light ${meal.toLowerCase()}`
                  : `Built for this ${meal.toLowerCase()}`}
              </h2>
              {isSnack(meal) && (
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Grab it on your way out of {SNACKS[meal].from.toLowerCase()}.
                </p>
              )}
            </div>
            {hasOptions && (
              <button
                onClick={nextPlate}
                className="flex h-10 shrink-0 items-center gap-1.5 rounded-full border border-foreground/25 px-3 text-xs font-bold"
              >
                <Shuffle className="size-3.5" /> Shuffle
              </button>
            )}
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

          {/* Only one plate possible: no arrows or "1 of 1". */}
          <div
            className={cn(
              "mb-3 flex items-center justify-center gap-3 text-[0.7rem] text-muted-foreground",
              !hasOptions && "hidden",
            )}
          >
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

          {showPortionTip && plate.length > 0 && (
            <p className="mb-2 rounded-xl bg-olive-soft px-3 py-2 text-xs font-semibold text-olive">
              This is your portion. Tap + for more anytime.
            </p>
          )}
          {plate.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-foreground/25 px-3 py-6 text-center text-sm text-muted-foreground">
              {hasOptions
                ? "Your plate is empty. Swipe for another idea."
                : "Your plate is empty. Try another hall or meal."}
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
                  customAllergies={profile.customAllergies ?? []}
                  alternatives={alternatives(menu, plate, row.id, hall, period, diets)}
                  canSwap={canSwap(menu, plate, row.id, hall, period, diets)}
                  onSwap={() => edit((prev) => swapItem(menu, prev, row.id, hall, period, diets))}
                  onQty={(qty) => edit((prev) => setQty(prev, row.id, qty))}
                  onRemove={() => removeWithUndo(row)}
                  onReplace={(item) => edit((prev) => replaceRow(prev, row.id, item))}
                />
              ))}
            </ul>
          )}

          {/* Same flow as Hall Menus' + buttons: items join the plate you're on. */}
          <button
            type="button"
            onClick={() => setAddOpen(true)}
            className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-foreground/25 text-sm font-bold"
          >
            <UtensilsCrossed className="size-4" aria-hidden /> Add items from the menu
          </button>
          <Sheet open={addOpen} onOpenChange={setAddOpen}>
            <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-3xl">
              <SheetHeader className="text-left">
                <SheetTitle>Add to your plate</SheetTitle>
                <SheetDescription>
                  {HALLS.find((h) => h.id === hall)?.short} · {period}. Tap + on anything you want.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 pb-6">
                <HallMenuList
                  items={hallItems}
                  hall={hall}
                  period={period}
                  loading={menuLoading}
                  onAdd={(item) => {
                    addToPlate(item);
                    toast.success(`${item.name} added to your plate`);
                  }}
                />
              </div>
            </SheetContent>
          </Sheet>

          <button
            type="button"
            onClick={() => setElseOpen(true)}
            className="mt-2 flex h-11 w-full items-center justify-center gap-1.5 rounded-full border border-dashed border-foreground/30 text-sm font-bold text-muted-foreground"
          >
            <Plus className="size-4" aria-hidden /> I ate something else
          </button>
          <AteSomethingElseDialog
            open={elseOpen}
            onOpenChange={setElseOpen}
            hall={hall}
            slots={slots}
            loggedToday={loggedToday}
            onLog={(entry) => {
              if (!addLog(entry)) return;
              setElseOpen(false);
            }}
          />

          <AllergenNotice
            className="mt-2"
            filtered={!!(profile.allergies.length || profile.customAllergies?.length)}
          />

          <div className="mt-4 rounded-2xl bg-foreground/5 p-2.5">
            <MacroRow t={t} target={mealTarget} over={fit.over.map((o) => o.macro)} />
          </div>

          <div
            className={cn(
              "mt-3 flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-sm",
              fit.dayOverCap ? "bg-clay-soft" : fit.over.length ? "bg-amber-soft" : "bg-olive-soft",
            )}
          >
            {profile.seedling && (
              <SeedlingAvatar seedling={profile.seedling} className="size-9 shrink-0" />
            )}
            <p>
              <span className="font-bold">{profile.seedling?.name ?? "Seedling"}: </span>
              {fitSummary(fit, meal)}
            </p>
          </div>

          <div className="mt-4 flex gap-2">
            <button
              onClick={logMeal}
              disabled={!plate.some((r) => r.qty > 0)}
              className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px disabled:opacity-40"
            >
              <Check className="size-5" /> Ate This Meal
            </button>
            <input
              ref={photoInput}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                setPendingPhoto(e.target.files?.[0] ?? null);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => photoInput.current?.click()}
              aria-label={pendingPhoto ? "Photo ready. Tap to retake" : "Take a photo of this meal"}
              className={cn(
                "grid size-12 shrink-0 place-items-center rounded-full border",
                pendingPhoto
                  ? "border-olive bg-olive text-primary-foreground"
                  : "border-foreground/25",
              )}
            >
              {pendingPhoto ? <Check className="size-5" /> : <Camera className="size-5" />}
            </button>
          </div>
        </section>
      )}
    </AppShell>
  );
}
