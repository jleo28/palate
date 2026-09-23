import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { useDemo } from "../../context/DemoContext";
import { sampleMenu } from "../../data/menu";
import { planDay, planMeal } from "../../core/plan";
import { dailyTargets } from "../../core/targets";
import type { HallId } from "../../core/types";
import { Wordmark } from "../../components/Wordmark";
import { BottomNav } from "../../components/BottomNav";
import { MealSwitcher } from "../../components/MealSwitcher";
import { OliveSays } from "../../components/OliveSays";
import { BobButton } from "../../components/BobButton";
import { MacroBar } from "../../components/MacroBar";
import { DemoPanel } from "../demo/DemoPanel";
import { HallCard } from "./HallCard";
import { formatDateHeading } from "../../lib/time";
import { useLongPress } from "../../lib/useLongPress";
import { labelFor } from "../../config/mealPeriods";

const HALLS: { id: HallId; name: string; blurb: string }[] = [
  { id: "evk", name: "EVK", blurb: "Grill and bowls" },
  { id: "parkside", name: "Parkside", blurb: "Global kitchen" },
  { id: "village", name: "Village", blurb: "Plant forward" },
];

export function Dashboard() {
  const {
    profile,
    effectiveProfile,
    isOnboarded,
    halls,
    personalizeDismissedOn,
    dismissPersonalize,
    dashboardTipSeen,
    markDashboardTipSeen,
  } = useProfile();
  const demo = useDemo();
  const navigate = useNavigate();
  const [demoOpen, setDemoOpen] = useState(false);
  const longPress = useLongPress(() => setDemoOpen(true));

  const itemsById = useMemo(() => new Map(sampleMenu.items.map((i) => [i.id, i])), []);

  // The halls they use come first, then the rest, so everything stays browsable.
  const orderedHalls = useMemo(() => {
    const home = profile?.homeHall;
    return [...HALLS].sort((a, b) => {
      if (a.id === home) return -1;
      if (b.id === home) return 1;
      const aPref = halls.includes(a.id) ? 0 : 1;
      const bPref = halls.includes(b.id) ? 0 : 1;
      return aPref - bPref;
    });
  }, [halls, profile?.homeHall]);

  const solved = useMemo(
    () =>
      orderedHalls.map((hall) => ({
        hall,
        result: planMeal(effectiveProfile, sampleMenu, hall.id, demo.meal, demo.date),
      })),
    [orderedHalls, effectiveProfile, demo.meal, demo.date]
  );

  const targets = dailyTargets(effectiveProfile);
  const mealTarget = targets.meals[demo.meal];

  // The day summary follows the hall they would actually eat at.
  const homeHall = orderedHalls[0];
  const homeHallName = homeHall.name;
  const day = useMemo(
    () => planDay(effectiveProfile, sampleMenu, demo.date, homeHall.id),
    [effectiveProfile, demo.date, homeHall.id]
  );

  const everyHallEmpty = solved.every((s) => s.result.plate.lines.length === 0);

  // Dismissed today: gone. Dismissed earlier: back as a smaller prompt.
  const dismissedToday = personalizeDismissedOn === demo.date;
  const showPersonalizeCard = !isOnboarded && !dismissedToday;
  const personalizeIsCompact = showPersonalizeCard && personalizeDismissedOn !== null;

  const showTip = isOnboarded && !dashboardTipSeen;

  return (
    <div className="app-shell bg-tray pb-28">
      <header className="flex flex-col gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center justify-between gap-3">
          <span {...longPress} className="flex items-center gap-2.5">
            <Wordmark />
            <span className="font-display text-lg text-ink">8teSC</span>
          </span>
          <span className="text-sm text-ink-soft">{formatDateHeading(demo.date)}</span>
        </div>

        <MealSwitcher
          id="meal-switcher"
          value={demo.meal}
          clockMeal={demo.clockMeal}
          onChange={demo.setMeal}
        />
      </header>

      <main className="flex flex-col gap-5 pt-5">
        {showPersonalizeCard && (
          <div className="px-4">
            {personalizeIsCompact ? (
              <div className="flex items-center justify-between gap-3 rounded-row border border-line bg-plate px-3 py-2">
                <p className="text-sm text-ink-soft">These are general plates.</p>
                <button
                  type="button"
                  onClick={() => navigate("/onboarding")}
                  className="tap-target shrink-0 font-display text-sm text-accent"
                >
                  Personalize
                </button>
              </div>
            ) : (
              <OliveSays
                variant="card"
                onDismiss={() => dismissPersonalize(demo.date)}
                dismissLabel="Not now"
                action={
                  <BobButton onClick={() => navigate("/onboarding")} className="px-5">
                    Personalize
                  </BobButton>
                }
              >
                Make these plates yours. Tell me a few things and I will size every portion to you.
              </OliveSays>
            )}
          </div>
        )}

        {showTip && (
          <div className="px-4">
            <OliveSays variant="card" onDismiss={markDashboardTipSeen}>
              You are seeing {labelFor(demo.meal).toLowerCase()} because that is what time it is. Tap the switcher
              up there to look at another meal.
            </OliveSays>
          </div>
        )}

        <section aria-label="Recommended plates by hall">
          <h2 className="px-4 pb-2 font-display text-lg text-ink">
            {labelFor(demo.meal)} today
          </h2>

          {everyHallEmpty ? (
            <div className="px-4">
              <OliveSays variant="card">
                Your filters leave nothing to build a {labelFor(demo.meal).toLowerCase()} plate from at any hall
                today. Loosening one filter in Profile, or trying another meal, will give me something to work
                with.
              </OliveSays>
            </div>
          ) : (
            <div className="snap-x flex gap-3 overflow-x-auto px-4 pb-2">
              {solved.map(({ hall, result }) => (
                <HallCard
                  key={hall.id}
                  hallId={hall.id}
                  hallName={hall.name}
                  hallBlurb={hall.blurb}
                  plate={result.plate}
                  itemsById={itemsById}
                  isHome={profile?.homeHall === hall.id}
                  onOpen={() => navigate(`/plate/${hall.id}`)}
                />
              ))}
              {/* lets the last card settle centred rather than jammed against the edge */}
              <span aria-hidden="true" className="w-1 shrink-0" />
            </div>
          )}
        </section>

        <section className="mx-4 flex flex-col gap-3 rounded-sheet border border-line bg-plate p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="font-display text-lg text-ink">Your day</h2>
            <span className="text-sm tabular-nums text-ink-soft">
              {day.daySummary.totals.kcal.toLocaleString()} of {targets.daily.kcal.toLocaleString()} cal
            </span>
          </div>

          <p className="text-sm text-ink-soft">
            {isOnboarded
              ? `Eating these plates for your ${day.daySummary.mealsPlanned} hall meals at ${homeHallName}. ${labelFor(demo.meal)} is about ${mealTarget.kcal} of it.`
              : `A general balanced target, planned at ${homeHallName}. ${labelFor(demo.meal)} is about ${mealTarget.kcal} of it.`}
          </p>

          <div>
            <MacroBar
              label="Protein"
              current={day.daySummary.totals.protein}
              target={targets.daily.protein}
              colorVar="protein"
            />
            <MacroBar
              label="Carbs"
              current={day.daySummary.totals.carbs}
              target={targets.daily.carbs}
              colorVar="carb"
            />
            <MacroBar label="Fat" current={day.daySummary.totals.fat} target={targets.daily.fat} colorVar="fat" />
          </div>
        </section>
      </main>

      <BottomNav />
      <DemoPanel open={demoOpen} onClose={() => setDemoOpen(false)} />
    </div>
  );
}
