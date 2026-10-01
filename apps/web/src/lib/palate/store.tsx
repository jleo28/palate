import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  dailyTargets,
  normalizeProfile,
  mealGuide,
  type MacroTargets,
  type HallId,
  type LoggedMeal,
  type MealPeriod,
  type Profile,
} from "@palate/core";
import { currentMeal } from "./halls";

const KEY_PROFILE = "palate.profile.v1";
const KEY_LOG = "palate.log.v1";

// Keys used before the rename to Palate. Copied forward once, then removed.
const LEGACY_KEYS: [legacy: string, current: string][] = [
  ["8te.profile.v1", KEY_PROFILE],
  ["8te.log.v1", KEY_LOG],
];

export function migrateLegacyKeys(storage: Pick<Storage, "getItem" | "setItem" | "removeItem">) {
  for (const [legacy, current] of LEGACY_KEYS) {
    const value = storage.getItem(legacy);
    if (value === null) continue;
    if (storage.getItem(current) === null) storage.setItem(current, value);
    storage.removeItem(legacy);
  }
}

interface Ctx {
  ready: boolean;
  profile: Profile | null;
  saveProfile: (p: Profile) => void;
  log: LoggedMeal[];
  addLog: (m: Omit<LoggedMeal, "id" | "date">) => void;
  removeLog: (id: string) => void;
  daily: MacroTargets | null;
  meal: MealPeriod;
  setMeal: (m: MealPeriod) => void;
  hall: HallId;
  setHall: (h: HallId) => void;
  mealTarget: MacroTargets | null;
  consumedToday: MacroTargets;
}

const StoreContext = createContext<Ctx | null>(null);

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<LoggedMeal[]>([]);
  const [meal, setMeal] = useState<MealPeriod>("Lunch");
  const [hall, setHall] = useState<HallId>("village");

  useEffect(() => {
    try {
      migrateLegacyKeys(localStorage);
      const p = localStorage.getItem(KEY_PROFILE);
      if (p) {
        const parsed = normalizeProfile(JSON.parse(p) as Profile);
        setProfile(parsed);
        setHall(parsed.hall);
      }
      const l = localStorage.getItem(KEY_LOG);
      if (l) setLog(JSON.parse(l) as LoggedMeal[]);
    } catch {
      /* ignore */
    }
    setMeal(currentMeal());
    setReady(true);
  }, []);

  const saveProfile = useCallback((p: Profile) => {
    setProfile(p);
    setHall(p.hall);
    localStorage.setItem(KEY_PROFILE, JSON.stringify(p));
  }, []);

  const addLog = useCallback((m: Omit<LoggedMeal, "id" | "date">) => {
    setLog((prev) => {
      const next = [{ ...m, id: crypto.randomUUID(), date: today() }, ...prev];
      localStorage.setItem(KEY_LOG, JSON.stringify(next));
      return next;
    });
  }, []);

  const removeLog = useCallback((id: string) => {
    setLog((prev) => {
      const next = prev.filter((l) => l.id !== id);
      localStorage.setItem(KEY_LOG, JSON.stringify(next));
      return next;
    });
  }, []);

  const daily = useMemo(() => (profile ? dailyTargets(profile) : null), [profile]);

  const consumedToday = useMemo(() => {
    const d = today();
    return log
      .filter((l) => l.date === d)
      .reduce(
        (a, l) => ({
          kcal: a.kcal + l.kcal,
          protein: a.protein + l.protein,
          carbs: a.carbs + l.carbs,
          fat: a.fat + l.fat,
        }),
        { kcal: 0, protein: 0, carbs: 0, fat: 0 },
      );
  }, [log]);

  // Rolling guide: what's left of today, split over this meal and the unlogged meals after it.
  const mealTarget = useMemo(() => {
    if (!daily) return null;
    const d = today();
    const logged = log.filter((l) => l.date === d).map((l) => l.meal);
    return mealGuide(daily, consumedToday, meal, logged);
  }, [daily, consumedToday, log, meal]);

  const value: Ctx = {
    ready,
    profile,
    saveProfile,
    log,
    addLog,
    removeLog,
    daily,
    meal,
    setMeal,
    hall,
    setHall,
    mealTarget,
    consumedToday,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}
