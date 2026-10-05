import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { toast } from "sonner";
import {
  assignSeedling,
  dailyTargets,
  logFromRow,
  logToRow,
  mealGuide,
  normalizeProfile,
  profileFromRow,
  profileToRow,
  type HallId,
  type LoggedMeal,
  type MacroTargets,
  type MealLogRow,
  type MealPeriod,
  type Profile,
  type ProfileRow,
} from "@palate/core";
import { supabase } from "@/lib/supabase";
import { today } from "./dates";
import { currentMeal } from "./halls";

// Browser-only data: a signed-out onboarding draft, plus anything saved before accounts existed.
// Imported into Supabase once, on the first sign-in, then removed.
const KEY_PROFILE = "palate.profile.v1";
const KEY_LOG = "palate.log.v1";
const DEVICE_KEYS = ["palate.hints.v1", "palate.cardPeek.v1"];

function readLocal<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const withSeedling = (p: Profile): Profile =>
  p.seedling ? p : { ...p, seedling: assignSeedling() };

/** Load a user's data, importing any browser-only profile and log the first time. */
async function loadUser(userId: string) {
  const [profileRes, logRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle<ProfileRow>(),
    supabase.from("meal_logs").select("*").order("date", { ascending: false }).limit(1000),
  ]);
  if (profileRes.error) throw profileRes.error;
  if (logRes.error) throw logRes.error;

  let profile = profileRes.data ? profileFromRow(profileRes.data) : null;
  let log = ((logRes.data ?? []) as MealLogRow[]).map(logFromRow);

  const localProfile = readLocal<Profile>(KEY_PROFILE);
  const localLog = readLocal<LoggedMeal[]>(KEY_LOG) ?? [];

  if (!profile && localProfile) profile = withSeedling(normalizeProfile(localProfile));
  if (profile && (!profileRes.data || !profile.seedling)) {
    profile = withSeedling(profile);
    const { error } = await supabase.from("profiles").upsert(profileToRow(userId, profile));
    if (error) throw error;
  }

  if (localLog.length) {
    const rows = localLog.map((m) =>
      logToRow(UUID.test(m.id) ? m : { ...m, id: crypto.randomUUID() }),
    );
    const { error } = await supabase
      .from("meal_logs")
      .upsert(rows, { onConflict: "id", ignoreDuplicates: true });
    if (error) throw error;
    const known = new Set(log.map((m) => m.id));
    log = [...rows.map(logFromRow).filter((m) => !known.has(m.id)), ...log];
  }

  localStorage.removeItem(KEY_PROFILE);
  localStorage.removeItem(KEY_LOG);
  return { profile, log };
}

interface Ctx {
  /** Auth and the user's data have loaded. */
  ready: boolean;
  session: Session | null;
  profile: Profile | null;
  /** Signed in: saves to Supabase. Signed out: keeps an onboarding draft in this browser. */
  saveProfile: (p: Profile) => Promise<void>;
  log: LoggedMeal[];
  addLog: (m: Omit<LoggedMeal, "id" | "date">) => void;
  removeLog: (id: string) => void;
  /** Delete the profile and log (the account stays) and per-device state. */
  resetAll: () => Promise<void>;
  signOut: () => Promise<void>;
  daily: MacroTargets | null;
  meal: MealPeriod;
  setMeal: (m: MealPeriod) => void;
  hall: HallId;
  setHall: (h: HallId) => void;
  mealTarget: MacroTargets | null;
  consumedToday: MacroTargets;
}

const StoreContext = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [log, setLog] = useState<LoggedMeal[]>([]);
  const [meal, setMeal] = useState<MealPeriod>("Lunch");
  const [hall, setHall] = useState<HallId>("village");
  const loadedFor = useRef<string | null>(null);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    setMeal(currentMeal());

    const apply = (next: Session | null) => {
      setSession(next);
      const id = next?.user.id ?? null;
      if (id === loadedFor.current) {
        setReady(true);
        return;
      }
      loadedFor.current = id;
      if (!id) {
        setProfile(null);
        setLog([]);
        setReady(true);
        return;
      }
      setReady(false);
      loadUser(id)
        .then(({ profile: p, log: l }) => {
          if (loadedFor.current !== id) return;
          setProfile(p);
          if (p) setHall(p.hall);
          setLog(l);
        })
        .catch((error: unknown) => {
          console.error(error);
          toast.error("Couldn't load your data. Check your connection and refresh.");
        })
        .finally(() => setReady(true));
    };

    void supabase.auth.getSession().then(({ data }) => apply(data.session));
    // Defer: Supabase warns against awaiting its own calls inside this callback.
    const { data } = supabase.auth.onAuthStateChange((_event, next) => {
      setTimeout(() => apply(next), 0);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const saveProfile = useCallback(
    async (next: Profile) => {
      // Seedling is assigned once, at sign-up, and kept from then on.
      const p = withSeedling(next);
      setProfile(p);
      setHall(p.hall);
      if (!userId) {
        localStorage.setItem(KEY_PROFILE, JSON.stringify(p));
        return;
      }
      const { error } = await supabase.from("profiles").upsert(profileToRow(userId, p));
      if (error) {
        console.error(error);
        toast.error("Couldn't save your profile. Try again.");
      }
    },
    [userId],
  );

  const addLog = useCallback((m: Omit<LoggedMeal, "id" | "date">) => {
    const entry: LoggedMeal = { ...m, id: crypto.randomUUID(), date: today() };
    setLog((prev) => [entry, ...prev]);
    void supabase
      .from("meal_logs")
      .insert(logToRow(entry))
      .then(({ error }) => {
        if (!error) return;
        console.error(error);
        setLog((prev) => prev.filter((l) => l.id !== entry.id));
        toast.error("Couldn't log that meal. Try again.");
      });
  }, []);

  const removeLog = useCallback(
    (id: string) => {
      const removed = log.find((l) => l.id === id);
      setLog((prev) => prev.filter((l) => l.id !== id));
      void supabase
        .from("meal_logs")
        .delete()
        .eq("id", id)
        .then(({ error }) => {
          if (!error || !removed) return;
          console.error(error);
          setLog((prev) => [removed, ...prev]);
          toast.error("Couldn't remove that meal. Try again.");
        });
    },
    [log],
  );

  const resetAll = useCallback(async () => {
    for (const key of [KEY_PROFILE, KEY_LOG, ...DEVICE_KEYS]) localStorage.removeItem(key);
    if (userId) {
      const logs = await supabase.from("meal_logs").delete().eq("user_id", userId);
      const prof = await supabase.from("profiles").delete().eq("id", userId);
      if (logs.error || prof.error) {
        console.error(logs.error ?? prof.error);
        toast.error("Couldn't clear everything. Try again.");
        return;
      }
    }
    setProfile(null);
    setLog([]);
  }, [userId]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
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
    session,
    profile,
    saveProfile,
    log,
    addLog,
    removeLog,
    resetAll,
    signOut,
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
