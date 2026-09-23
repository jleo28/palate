import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { MealPeriod } from "../core/types";
import { currentOrNextMeal, toHHMM, toIsoDate } from "../lib/time";
import { loadJson, removeJson, saveJson } from "../lib/storage";

interface DemoOverrides {
  date: string | null;
  time: string | null;
}

interface DemoContextValue {
  date: string;
  time: string;
  currentMeal: MealPeriod;
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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);

  const date = overrides.date ?? toIsoDate(now);
  const time = overrides.time ?? toHHMM(now);

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
    removeJson("demo");
  };

  const value = useMemo<DemoContextValue>(
    () => ({
      date,
      time,
      currentMeal: currentOrNextMeal(time),
      isOverridden: overrides.date !== null || overrides.time !== null,
      setDate,
      setTime,
      clear,
    }),
    [date, time, overrides]
  );

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

export function useDemo(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) throw new Error("useDemo must be used within a DemoProvider");
  return ctx;
}
