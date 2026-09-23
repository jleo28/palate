import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useDemo } from "../../context/DemoContext";
import { sampleMenu } from "../../data/menu";
import { planDay, planMeal } from "../../core/plan";
import { swapItem, type SwapOption } from "../../core/swap";
import type { HallId, MenuItem, Plate as PlateModel } from "../../core/types";
import { Plate } from "../../components/Plate";
import { MacroBar } from "../../components/MacroBar";
import { BottomNav } from "../../components/BottomNav";
import { MealSwitcher } from "../../components/MealSwitcher";
import { OliveSays } from "../../components/OliveSays";
import { StationIcon } from "../../components/icons/StationIcon";
import { stationRank } from "../../lib/stations";
import { select, tap } from "../../lib/haptics";
import { labelFor } from "../../config/mealPeriods";
import { SwapSheet } from "./SwapSheet";

const HALL_NAMES: Record<HallId, string> = {
  evk: "Everybody's Kitchen",
  parkside: "Parkside",
  village: "USC Village",
};

const HALL_SHORT: Record<HallId, string> = {
  evk: "EVK",
  parkside: "Parkside",
  village: "Village",
};

function isHallId(value: string | undefined): value is HallId {
  return value === "evk" || value === "parkside" || value === "village";
}

export function PlateView() {
  const { hallId } = useParams();
  const navigate = useNavigate();
  const { effectiveProfile, isOnboarded } = useProfile();
  const demo = useDemo();

  const hall: HallId = isHallId(hallId) ? hallId : "evk";

  const [swapTarget, setSwapTarget] = useState<string | null>(null);
  const [manualPlates, setManualPlates] = useState<Partial<Record<string, PlateModel>>>({});

  const itemsById = useMemo(() => new Map(sampleMenu.items.map((i) => [i.id, i])), []);

  const day = useMemo(
    () => planDay(effectiveProfile, sampleMenu, demo.date, hall),
    [effectiveProfile, demo.date, hall]
  );

  const solvedMeal = useMemo(
    () => planMeal(effectiveProfile, sampleMenu, hall, demo.meal, demo.date),
    [effectiveProfile, hall, demo.meal, demo.date]
  );

  const plateKey = `${hall}:${demo.meal}`;
  const activePlate = manualPlates[plateKey] ?? day.meals[demo.meal] ?? solvedMeal.plate;

  useEffect(() => {
    setManualPlates({});
  }, [demo.date, effectiveProfile]);

  const linesByStation = useMemo(() => {
    const groups = new Map<string, typeof activePlate.lines>();
    for (const line of activePlate.lines) {
      const station = itemsById.get(line.itemId)?.station ?? "Other";
      const group = groups.get(station) ?? [];
      group.push(line);
      groups.set(station, group);
    }
    return [...groups.entries()].sort((a, b) => stationRank(a[0]) - stationRank(b[0]));
  }, [activePlate, itemsById]);

  const swapOptions: SwapOption[] = swapTarget
    ? swapItem(activePlate, swapTarget, solvedMeal.eligibleItems)
    : [];
  const swapCurrentItem: MenuItem | null = swapTarget ? (itemsById.get(swapTarget) ?? null) : null;

  const applySwap = (option: SwapOption) => {
    select();
    setManualPlates((prev) => ({ ...prev, [plateKey]: option.plate }));
    setSwapTarget(null);
  };

  const dayKcal =
    day.daySummary.totals.kcal +
    (activePlate.totals.kcal - (day.meals[demo.meal]?.totals.kcal ?? activePlate.totals.kcal));

  const otherHalls = (Object.keys(HALL_SHORT) as HallId[]).filter((h) => h !== hall);

  return (
    <div className="app-shell bg-tray pb-28">
      <header className="flex flex-col gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              tap();
              navigate("/");
            }}
            className="tap-target -ml-2 flex items-center gap-1 px-2 text-sm text-ink-soft"
            aria-label="Back to home"
          >
            <span aria-hidden="true">&larr;</span> Home
          </button>
          <span className="ml-auto text-sm text-ink-soft">
            {isOnboarded ? "Your plate" : "General plate"}
          </span>
        </div>

        <h1 className="font-display text-xl text-ink">{HALL_NAMES[hall]}</h1>

        <MealSwitcher value={demo.meal} clockMeal={demo.clockMeal} onChange={demo.setMeal} />
      </header>

      <main className="px-4">
        <div className="py-3">
          <Plate plate={activePlate} itemsById={itemsById} onWedgeClick={scrollToRow} size={272} />
        </div>

        {activePlate.lines.length > 0 && (
          <p className="mb-4 text-center text-base text-ink-soft">{activePlate.why}</p>
        )}

        {activePlate.notes.length > 0 && activePlate.lines.length > 0 && (
          <div className="mb-4">
            <OliveSays>{activePlate.notes[0]}</OliveSays>
          </div>
        )}

        {linesByStation.length === 0 ? (
          <div className="py-2">
            <OliveSays
              variant="card"
              action={
                <div className="flex gap-2">
                  {otherHalls.map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => navigate(`/plate/${h}`)}
                      className="tap-target rounded-chip bg-accent px-4 text-sm text-plate"
                    >
                      Try {HALL_SHORT[h]}
                    </button>
                  ))}
                </div>
              }
            >
              Nothing at {HALL_SHORT[hall]} fits your filters for {labelFor(demo.meal).toLowerCase()} today. The
              other halls might have something.
            </OliveSays>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {linesByStation.map(([station, lines]) => (
              <section key={station}>
                <h2 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink-soft">
                  <StationIcon station={station} size={18} />
                  {station}
                </h2>
                <ul className="divide-y divide-line overflow-hidden rounded-row border border-line bg-plate">
                  {lines.map((line) => {
                    const item = itemsById.get(line.itemId);
                    return (
                      <li
                        key={line.itemId}
                        id={`row-${line.itemId}`}
                        className="flex items-center justify-between gap-3 p-3"
                      >
                        <div className="min-w-0">
                          <div className="font-display text-base text-ink">{item?.name}</div>
                          <div className="text-sm text-ink-soft">{line.portionLabel}</div>
                          <div className="text-sm tabular-nums text-ink-soft">
                            {line.kcal} cal &middot; {line.protein} g protein
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            tap();
                            setSwapTarget(line.itemId);
                          }}
                          className="tap-target shrink-0 rounded-chip border-2 border-line-strong px-4 text-sm text-ink"
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

        <div className="mt-6 rounded-sheet border border-line bg-plate p-4">
          <MacroBar
            label="Protein"
            current={activePlate.totals.protein}
            target={activePlate.target.protein}
            colorVar="protein"
          />
          <MacroBar
            label="Carbs"
            current={activePlate.totals.carbs}
            target={activePlate.target.carbs}
            colorVar="carb"
          />
          <MacroBar label="Fat" current={activePlate.totals.fat} target={activePlate.target.fat} colorVar="fat" />
        </div>

        <p className="mt-4 text-center text-sm text-ink-soft">
          Today: {day.daySummary.mealsPlanned} meal{day.daySummary.mealsPlanned === 1 ? "" : "s"} here,{" "}
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
    </div>
  );
}

function scrollToRow(itemId: string) {
  document.getElementById(`row-${itemId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
}
