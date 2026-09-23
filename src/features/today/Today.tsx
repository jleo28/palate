import { useEffect, useMemo, useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { useDemo } from "../../context/DemoContext";
import { sampleMenu } from "../../data/menu";
import { planDay, planMeal } from "../../core/plan";
import { swapItem, type SwapOption } from "../../core/swap";
import type { HallId, MealPeriod, MenuItem, Plate as PlateModel } from "../../core/types";
import { Wordmark } from "../../components/Wordmark";
import { Chip } from "../../components/Chip";
import { Plate } from "../../components/Plate";
import { MacroBar } from "../../components/MacroBar";
import { BottomNav } from "../../components/BottomNav";
import { formatDateHeading } from "../../lib/time";
import { stationRank } from "../../lib/stations";
import { useLongPress } from "../../lib/useLongPress";
import { SwapSheet } from "./SwapSheet";
import { DemoPanel } from "../demo/DemoPanel";

const HALLS: { value: HallId; label: string }[] = [
  { value: "evk", label: "EVK" },
  { value: "parkside", label: "Parkside" },
  { value: "village", label: "Village" },
];

const MEALS: { value: MealPeriod; label: string }[] = [
  { value: "breakfast", label: "Breakfast" },
  { value: "lunch", label: "Lunch" },
  { value: "dinner", label: "Dinner" },
];

export function Today() {
  const { profile, updateProfile } = useProfile();
  const demo = useDemo();
  const [hall, setHall] = useState<HallId>(profile!.homeHall);
  const [meal, setMeal] = useState<MealPeriod>(demo.currentMeal);
  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [demoOpen, setDemoOpen] = useState(false);
  const [manualPlates, setManualPlates] = useState<Partial<Record<MealPeriod, PlateModel>>>({});

  const longPress = useLongPress(() => setDemoOpen(true));

  const profileValue = profile!;

  const day = useMemo(
    () => planDay(profileValue, sampleMenu, demo.date, hall),
    [profileValue, demo.date, hall]
  );

  const solvedMeal = useMemo(
    () => planMeal(profileValue, sampleMenu, hall, meal, demo.date),
    [profileValue, hall, meal, demo.date]
  );

  const activePlate = manualPlates[meal] ?? day.meals[meal] ?? solvedMeal.plate;

  const itemsById = useMemo(() => new Map(sampleMenu.items.map((i) => [i.id, i])), []);

  const linesByStation = useMemo(() => {
    const groups = new Map<string, typeof activePlate.lines>();
    for (const line of activePlate.lines) {
      const item = itemsById.get(line.itemId);
      const station = item?.station ?? "Other";
      const group = groups.get(station) ?? [];
      group.push(line);
      groups.set(station, group);
    }
    return [...groups.entries()].sort((a, b) => stationRank(a[0]) - stationRank(b[0]));
  }, [activePlate, itemsById]);

  useEffect(() => {
    setManualPlates({});
  }, [demo.date, hall, profileValue.goal, profileValue.diet, profileValue.avoidAllergens, profileValue.activity]);

  const selectHall = (h: HallId) => {
    setHall(h);
    updateProfile({ homeHall: h });
  };

  const selectMeal = (m: MealPeriod) => {
    setMeal(m);
  };

  const swapOptions: SwapOption[] = swapTarget
    ? swapItem(activePlate, swapTarget, solvedMeal.eligibleItems)
    : [];

  const swapCurrentItem: MenuItem | null = swapTarget ? itemsById.get(swapTarget) ?? null : null;

  const applySwap = (option: SwapOption) => {
    setManualPlates((prev) => ({ ...prev, [meal]: option.plate }));
    setSwapTarget(null);
  };

  const dayKcal = day.daySummary.totals.kcal + (activePlate.totals.kcal - (day.meals[meal]?.totals.kcal ?? activePlate.totals.kcal));

  return (
    <div className="min-h-screen bg-tray pb-24">
      <header className="flex items-center justify-between px-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
        <span {...longPress} className="tap-target flex items-center">
          <Wordmark />
        </span>
        <span className="text-sm text-ink-soft">{formatDateHeading(demo.date)}</span>
      </header>

      <div className="mt-4 flex gap-2 overflow-x-auto px-5">
        {HALLS.map((h) => (
          <Chip key={h.value} active={hall === h.value} onClick={() => selectHall(h.value)}>
            {h.label}
          </Chip>
        ))}
      </div>

      <div className="mt-3 flex border-b border-line px-5">
        {MEALS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => selectMeal(m.value)}
            className={`tap-target flex-1 border-b-2 text-sm ${
              meal === m.value ? "border-cardinal font-bold text-ink" : "border-transparent text-ink-soft"
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <main className="px-5">
        <div className="py-6">
          <Plate plate={activePlate} itemsById={itemsById} onWedgeClick={(id) => scrollToRow(id)} />
        </div>

        {activePlate.lines.length > 0 && (
          <p className="mb-4 text-center text-sm text-ink-soft">{activePlate.why}</p>
        )}

        {activePlate.notes.map((note, i) => (
          <p key={i} className="mb-4 text-center text-sm text-ink-soft">
            {note}
          </p>
        ))}

        {linesByStation.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <p className="text-sm text-ink-soft">
              No items fit your filters at {HALLS.find((h) => h.value === hall)?.label} for this meal today.
            </p>
            <div className="flex gap-2">
              {HALLS.filter((h) => h.value !== hall).map((h) => (
                <Chip key={h.value} onClick={() => selectHall(h.value)}>
                  Try {h.label}
                </Chip>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {linesByStation.map(([station, lines]) => (
              <section key={station}>
                <h2 className="mb-1 text-sm font-bold text-ink-soft">{station}</h2>
                <ul className="divide-y divide-line rounded-row border border-line bg-plate">
                  {lines.map((line) => {
                    const item = itemsById.get(line.itemId);
                    return (
                      <li key={line.itemId} id={`row-${line.itemId}`} className="flex items-center justify-between gap-3 p-3">
                        <div>
                          <div className="font-display text-base text-ink">{item?.name}</div>
                          <div className="text-sm text-ink-soft">{line.portionLabel}</div>
                          <div className="text-sm tabular-nums text-ink-soft">
                            {line.kcal} cal &middot; {line.protein} g protein
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSwapTarget(line.itemId)}
                          className="tap-target rounded-chip border border-line px-3 text-sm text-ink"
                        >
                          Swap
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}

        <div className="mt-6 rounded-row border border-line bg-plate p-4">
          <MacroBar label="Protein" current={activePlate.totals.protein} target={activePlate.target.protein} colorVar="cardinal" />
          <MacroBar label="Carbs" current={activePlate.totals.carbs} target={activePlate.target.carbs} colorVar="butter" />
          <MacroBar label="Fat" current={activePlate.totals.fat} target={activePlate.target.fat} colorVar="slate" />
        </div>

        <p className="mt-4 mb-2 text-center text-sm text-ink-soft">
          Today so far: {day.daySummary.mealsPlanned} meal{day.daySummary.mealsPlanned === 1 ? "" : "s"},{" "}
          {Math.round(dayKcal).toLocaleString()} of {Math.round(day.daySummary.target.kcal).toLocaleString()} cal
        </p>
      </main>

      <BottomNav />

      <SwapSheet
        open={swapTarget !== null}
        onClose={() => setSwapTarget(null)}
        currentItem={swapCurrentItem}
        options={swapOptions}
        onPick={applySwap}
      />

      <DemoPanel open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}

function scrollToRow(itemId: string) {
  document.getElementById(`row-${itemId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}
