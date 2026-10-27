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
  canLogSlot,
  daySlots,
  firstOpenSlot,
  nextOpenSlot,
  mealGuide,
  normalizeProfile,
  profileFromRow,
  profileToRow,
  type HallId,
  type LoggedMeal,
  type MacroTargets,
  type MealLogRow,
  type MenuItem,
  type Slot,
  type Profile,
  type ProfileRow,
} from "@palate/core";
import { supabase } from "@/lib/supabase";
import { today } from "./dates";
import { VERIFIED_PATH } from "./paths";
import { currentMeal } from "./halls";

// Browser-only data: a signed-out onboarding draft, plus anything saved before accounts existed.
// Imported into Supabase once, on the first sign-in, then removed.
const KEY_PROFILE = "palate.profile.v1";
const PHOTO_BUCKET = "meal-photos";
const KEY_LOG = "palate.log.v1";
const DEVICE_KEYS = ["palate.hints.v1", "palate.cardPeek.v1", "palate.portionTip.v1"];

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

  // The email-confirmation tab only says thanks. The tab that signed up imports its own draft,
  // so two tabs never both create the account.
  if (window.location.pathname.startsWith(VERIFIED_PATH)) return { profile, log };

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
  /** The signed-in user's data couldn't be loaded, so a missing profile means nothing. */
  loadFailed: boolean;
  session: Session | null;
  profile: Profile | null;
  /** Signed in: saves to Supabase. Signed out: keeps an onboarding draft in this browser. */
  saveProfile: (p: Profile) => Promise<void>;
  log: LoggedMeal[];
  /** Returns false when the slot can't be logged again today. */
  /** Log a meal for today, or for `date` (an earlier day, via a card). The new entry, or null. */
  addLog: (m: Omit<LoggedMeal, "id" | "date">, date?: string) => LoggedMeal | null;
  /** Queue a Hall Menus item for The Plate, which adds it to the plate you're on. */
  addToPlate: (item: MenuItem) => void;
  /** Items waiting to be added to the plate; The Plate adds them, then clears the queue. */
  plateAdds: MenuItem[];
  clearPlateAdds: () => void;
  /** The meal just logged, for the "logged" pop-up. Null once it's dismissed. */
  justLogged: LoggedMeal | null;
  dismissLogged: () => void;
  /** Thumbs up (1) or down (-1) on one item of a logged meal; null clears it. */
  rateItem: (mealId: string, itemName: string, rating: 1 | -1 | null) => void;
  /** Upload a photo and attach it to a logged meal. True on success. */
  attachPhoto: (mealId: string, file: File) => Promise<boolean>;
  /** Slots logged today, in log order. */
  loggedToday: Slot[];
  removeLog: (id: string) => void;
  /** Undo a removal: puts the same entry (same id) back. */
  restoreLog: (m: LoggedMeal) => void;
  /** Save an edited logged meal (portions, items or totals). */
  updateLog: (m: LoggedMeal) => void;
  /** Delete the profile and log (the account stays) and per-device state. */
  resetAll: () => Promise<void>;
  signOut: () => Promise<void>;
  /** Permanently deletes the account and everything in it, then signs out. True on success. */
  deleteAccount: () => Promise<boolean>;
  daily: MacroTargets | null;
  /** The slot being planned: a hall meal or a snack. */
  meal: Slot;
  setMeal: (m: Slot) => void;
  /** Today's slots in order, including the user's snacks. */
  slots: Slot[];
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
  const [meal, setMeal] = useState<Slot>("Lunch");
  const [hall, setHall] = useState<HallId>("village");
  const [loadFailed, setLoadFailed] = useState(false);
  const loadedFor = useRef<string | null>(null);
  // True while a user's data is loading. Supabase reports the restored session more than once
  // (getSession, INITIAL_SESSION, TOKEN_REFRESHED); a repeat must not mark the store ready
  // before the profile arrives, or screens see "signed in, no profile" and send people to
  // onboarding.
  const loading = useRef(false);
  const userId = session?.user.id ?? null;

  useEffect(() => {
    setMeal(currentMeal());

    const apply = (next: Session | null) => {
      setSession(next);
      const id = next?.user.id ?? null;
      if (id === loadedFor.current) {
        if (!loading.current) setReady(true);
        return;
      }
      loadedFor.current = id;
      setLoadFailed(false);
      if (!id) {
        loading.current = false;
        setProfile(null);
        setLog([]);
        setReady(true);
        return;
      }
      setReady(false);
      loading.current = true;
      loadUser(id)
        .then(({ profile: p, log: l }) => {
          if (loadedFor.current !== id) return;
          setProfile(p);
          if (p) setHall(p.hall);
          setLog(l);
        })
        .catch((error: unknown) => {
          if (loadedFor.current !== id) return;
          console.error(error);
          setLoadFailed(true);
          toast.error("Couldn't load your data. Check your connection and refresh.");
        })
        .finally(() => {
          if (loadedFor.current !== id) return;
          loading.current = false;
          setReady(true);
        });
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

  const snackKey = (profile?.snacks ?? []).join(",");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const slots = useMemo(() => daySlots(profile?.snacks), [snackKey]);
  const loggedToday = useMemo(() => {
    const d = today();
    return log.filter((l) => l.date === d).map((l) => l.meal);
  }, [log]);

  const addLog = useCallback(
    (m: Omit<LoggedMeal, "id" | "date">, date = today()) => {
      // Breakfast, lunch and dinner once a day; change a logged meal from the macro bank.
      const loggedThatDay = log.filter((l) => l.date === date).map((l) => l.meal);
      if (!canLogSlot(m.meal, loggedThatDay)) {
        toast.error(`${m.meal} is already logged that day. Edit it in your macro bank.`);
        return null;
      }
      const entry: LoggedMeal = { ...m, id: crypto.randomUUID(), date };
      setLog((prev) => [entry, ...prev]);
      // Move on to the next slot that can still be logged.
      setMeal((current) =>
        current === m.meal
          ? date === today()
            ? (nextOpenSlot(slots, m.meal, [...loggedToday, m.meal]) ?? current)
            : current
          : current,
      );
      void supabase
        .from("meal_logs")
        .insert(logToRow(entry))
        .then(({ error }) => {
          if (!error) return;
          console.error(error);
          setLog((prev) => prev.filter((l) => l.id !== entry.id));
          setJustLogged((j) => (j?.id === entry.id ? null : j));
          toast.error("Couldn't log that meal. Try again.");
        });
      setJustLogged(entry);
      return entry;
    },
    [log, loggedToday, slots],
  );

  const [justLogged, setJustLogged] = useState<LoggedMeal | null>(null);
  const [plateAdds, setPlateAdds] = useState<MenuItem[]>([]);
  const addToPlate = useCallback((item: MenuItem) => setPlateAdds((q) => [...q, item]), []);
  const clearPlateAdds = useCallback(() => setPlateAdds([]), []);
  const dismissLogged = useCallback(() => setJustLogged(null), []);

  const rateItem = useCallback((mealId: string, itemName: string, rating: 1 | -1 | null) => {
    const done = ({ error }: { error: unknown }) => {
      if (!error) return;
      console.error(error);
      toast.error("Couldn't save that rating. Try again.");
    };
    if (rating === null) {
      void supabase
        .from("taste_ratings")
        .delete()
        .eq("meal_log_id", mealId)
        .eq("item_name", itemName)
        .then(done);
      return;
    }
    void supabase
      .from("taste_ratings")
      .upsert(
        { meal_log_id: mealId, item_name: itemName, rating },
        { onConflict: "meal_log_id,item_name" },
      )
      .then(done);
  }, []);

  const attachPhoto = useCallback(
    async (mealId: string, file: File) => {
      if (!userId) return false;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
      const path = `${userId}/${mealId}-${Date.now()}.${ext || "jpg"}`;
      const upload = await supabase.storage
        .from(PHOTO_BUCKET)
        .upload(path, file, { contentType: file.type || "image/jpeg" });
      if (upload.error) {
        console.error(upload.error);
        toast.error("Couldn't upload that photo. Try a smaller one.");
        return false;
      }
      const { error } = await supabase
        .from("meal_logs")
        .update({ photo_path: path })
        .eq("id", mealId);
      if (error) {
        console.error(error);
        void supabase.storage.from(PHOTO_BUCKET).remove([path]);
        toast.error("Couldn't attach that photo. Try again.");
        return false;
      }
      setLog((prev) => prev.map((l) => (l.id === mealId ? { ...l, photoPath: path } : l)));
      return true;
    },
    [userId],
  );

  const restoreLog = useCallback((m: LoggedMeal) => {
    setLog((prev) => (prev.some((l) => l.id === m.id) ? prev : [m, ...prev]));
    void supabase
      .from("meal_logs")
      .insert(logToRow(m))
      .then(({ error }) => {
        if (!error) return;
        console.error(error);
        setLog((prev) => prev.filter((l) => l.id !== m.id));
        toast.error("Couldn't bring that meal back. Try again.");
      });
  }, []);

  const updateLog = useCallback(
    (next: LoggedMeal) => {
      const before = log.find((l) => l.id === next.id);
      setLog((prev) => prev.map((l) => (l.id === next.id ? next : l)));
      const { id, ...row } = logToRow(next);
      void supabase
        .from("meal_logs")
        .update(row)
        .eq("id", id)
        .then(({ error }) => {
          if (!error || !before) return;
          console.error(error);
          setLog((prev) => prev.map((l) => (l.id === before.id ? before : l)));
          toast.error("Couldn't save that change. Try again.");
        });
    },
    [log],
  );

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

  const deleteAccount = useCallback(async () => {
    // Photos first: storage files can only be removed through the Storage API, not by the
    // database function.
    if (userId) {
      const { data: files } = await supabase.storage
        .from(PHOTO_BUCKET)
        .list(userId, { limit: 1000 });
      const paths = (files ?? []).map((f) => `${userId}/${f.name}`);
      if (paths.length) {
        const { error: photoError } = await supabase.storage.from(PHOTO_BUCKET).remove(paths);
        if (photoError) {
          console.error(photoError);
          toast.error("Couldn't delete your photos. Try again.");
          return false;
        }
      }
    }
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      console.error(error);
      toast.error("Couldn't delete your account. Try again.");
      return false;
    }
    for (const key of [KEY_PROFILE, KEY_LOG, ...DEVICE_KEYS]) localStorage.removeItem(key);
    setProfile(null);
    setLog([]);
    // The session belongs to a user that no longer exists, so only clear it locally.
    await supabase.auth.signOut({ scope: "local" });
    return true;
  }, [userId]);

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
  // A snack that was turned off can't stay selected.
  useEffect(() => {
    if (!slots.includes(meal)) setMeal(currentMeal());
  }, [slots, meal]);

  // Once data has loaded, start on the first slot from now that can still be logged.
  const startedOn = useRef<string | null>(null);
  useEffect(() => {
    if (!ready || !userId || startedOn.current === userId) return;
    startedOn.current = userId;
    setMeal(firstOpenSlot(slots, currentMeal(), loggedToday) ?? currentMeal());
  }, [ready, userId, slots, loggedToday]);

  const mealTarget = useMemo(() => {
    if (!daily) return null;
    return mealGuide(daily, consumedToday, meal, loggedToday, slots);
  }, [daily, consumedToday, loggedToday, meal, slots]);

  const value: Ctx = {
    ready,
    loadFailed,
    session,
    profile,
    saveProfile,
    log,
    addLog,
    loggedToday,
    removeLog,
    justLogged,
    dismissLogged,
    addToPlate,
    plateAdds,
    clearPlateAdds,
    rateItem,
    attachPhoto,
    restoreLog,
    updateLog,
    resetAll,
    signOut,
    deleteAccount,
    daily,
    meal,
    setMeal,
    slots,
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
