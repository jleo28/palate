import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MealPeriod } from "../core/types";
import { toHHMM, toIsoDate } from "../lib/time";
import { loadJson, removeJson, saveJson } from "../lib/storage";
import { mealPeriodAt, minutesFromHHMM, periodBoundaryAfter } from "../config/mealPeriods";

interface DemoOverrides {
  date: string | null;
  time: string | null;
}

interface ManualMeal {
  period: MealPeriod;
  /** The period boundary this choice was made before; past it, the clock takes over again. */
  heldUntilMinutes: number;
  /** The date the choice was made on, so it does not leak into another day. */
  date: string;
}

interface DemoContextValue {
  /** The effective date, either the device's or the demo override. */
  date: string;
  /** The effective local time as HH:mm. */
  time: string;
  /** The period the clock says it is right now. */
  clockMeal: MealPeriod;
  /** The period actually being shown, which may be a manual choice. */
  meal: MealPeriod;
  /** True while a manual choice is still holding. */
  isManualMeal: boolean;
  setMeal: (period: MealPeriod) => void;
  isOverridden: boolean;
  setDate: (iso: string) => void;
  setTime: (hhmm: string) => void;
  clear: () => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<DemoOverrides>(
    () => loadJson<DemoOverrides>("demo") ?? { date: null, time: null }
  );
  const [now, setNow] = useState(() => new Date());
  const [manual, setManual] = useState<ManualMeal | null>(null);

  const refreshClock = useCallback(() => setNow(new Date()), []);

  // Follow the clock while open, and re-read it whenever the app comes back to
  // the foreground, which is the common case on a phone.
  useEffect(() => {
    const id = setInterval(refreshClock, 30_000);
    const onVisible = () => {
      if (document.visibilityState === "visible") refreshClock();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", refreshClock);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", refreshClock);
    };
  }, [refreshClock]);

  const date = overrides.date ?? toIsoDate(now);
  const time = overrides.time ?? toHHMM(now);
  const clockMeal = mealPeriodAt(time);

  // A manual choice expires once the clock crosses the boundary it was made in,
  // or if the date changes underneath it.
  const manualStillHolds =
    manual !== null && manual.date === date && minutesFromHHMM(time) <= manual.heldUntilMinutes;

  const meal = manualStillHolds ? manual.period : clockMeal;

  useEffect(() => {
    if (manual !== null && !manualStillHolds) setManual(null);
  }, [manual, manualStillHolds]);

  const setMeal = (period: MealPeriod) => {
    if (period === clockMeal) {
      setManual(null);
      return;
    }
    setManual({ period, heldUntilMinutes: periodBoundaryAfter(time), date });
  };

  const setDate = (iso: string) => {
    const next = { ...overrides, date: iso };
    setOverrides(next);
    saveJson("demo", next);
  };

  const setTime = (hhmm: string) => {
    const next = { ...overrides, time: hhmm };
    setOverrides(next);
    saveJson("demo", next);
  };

  const clear = () => {
    setOverrides({ date: null, time: null });
    setManual(null);
    removeJson("demo");
    refreshClock();
  };

  const value = useMemo<DemoContextValue>(
    () => ({
      date,
      time,
      clockMeal,
      meal,
      isManualMeal: manualStillHolds,
      setMeal,
      isOverridden: overrides.date !== null || overrides.time !== null,
      setDate,
      setTime,
      clear,
    }),
    [date, time, clockMeal, meal, manualStillHolds, overrides]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within a DemoProvider");
  return ctx;
}
