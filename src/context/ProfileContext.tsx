import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { HallId, Profile } from "../core/types";
import { loadJson, removeJson, saveJson } from "../lib/storage";
import { setHapticsEnabled } from "../lib/haptics";
import { GUEST_PROFILE } from "../lib/guestProfile";

export type UnitSystem = "imperial" | "metric";

const ALL_HALLS: HallId[] = ["evk", "parkside", "village"];

interface ProfileContextValue {
  /** Null until onboarding is finished. */
  profile: Profile | null;
  /** What to actually plan against: the real profile, or the general target. */
  effectiveProfile: Profile;
  isOnboarded: boolean;
  units: UnitSystem;
  /** Which halls the student said they use. The dashboard orders by this. */
  halls: HallId[];
  haptics: boolean;
  /** The ISO date the "Make these plates yours" card was last dismissed on. */
  personalizeDismissedOn: string | null;
  /** True once the dashboard tip from Olive has been seen. */
  dashboardTipSeen: boolean;
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setUnits: (units: UnitSystem) => void;
  setHalls: (halls: HallId[]) => void;
  setHaptics: (on: boolean) => void;
  dismissPersonalize: (today: string) => void;
  markDashboardTipSeen: () => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(() => loadJson<Profile>("profile"));
  const [units, setUnitsState] = useState<UnitSystem>(() => loadJson<UnitSystem>("units") ?? "imperial");
  const [halls, setHallsState] = useState<HallId[]>(() => loadJson<HallId[]>("halls") ?? ALL_HALLS);
  const [haptics, setHapticsState] = useState<boolean>(() => loadJson<boolean>("haptics") ?? true);
  const [personalizeDismissedOn, setPersonalizeDismissedOn] = useState<string | null>(
    () => loadJson<string>("personalizeDismissedOn")
  );
  const [dashboardTipSeen, setDashboardTipSeen] = useState<boolean>(
    () => loadJson<boolean>("dashboardTipSeen") ?? false
  );

  useEffect(() => {
    setHapticsEnabled(haptics);
  }, [haptics]);

  const setProfile = (next: Profile) => {
    setProfileState(next);
    saveJson("profile", next);
  };

  const updateProfile = (patch: Partial<Profile>) => {
    setProfileState((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      saveJson("profile", next);
      return next;
    });
  };

  const setUnits = (next: UnitSystem) => {
    setUnitsState(next);
    saveJson("units", next);
  };

  const setHalls = (next: HallId[]) => {
    const value = next.length > 0 ? next : ALL_HALLS;
    setHallsState(value);
    saveJson("halls", value);
  };

  const setHaptics = (on: boolean) => {
    setHapticsState(on);
    saveJson("haptics", on);
  };

  const dismissPersonalize = (today: string) => {
    setPersonalizeDismissedOn(today);
    saveJson("personalizeDismissedOn", today);
  };

  const markDashboardTipSeen = () => {
    setDashboardTipSeen(true);
    saveJson("dashboardTipSeen", true);
  };

  const resetProfile = () => {
    setProfileState(null);
    setHallsState(ALL_HALLS);
    setPersonalizeDismissedOn(null);
    setDashboardTipSeen(false);
    removeJson("profile");
    removeJson("halls");
    removeJson("personalizeDismissedOn");
    removeJson("dashboardTipSeen");
    removeJson("onboardingProgress");
  };

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      effectiveProfile: profile ?? GUEST_PROFILE,
      isOnboarded: profile !== null,
      units,
      halls,
      haptics,
      personalizeDismissedOn,
      dashboardTipSeen,
      setProfile,
      updateProfile,
      setUnits,
      setHalls,
      setHaptics,
      dismissPersonalize,
      markDashboardTipSeen,
      resetProfile,
    }),
    [profile, units, halls, haptics, personalizeDismissedOn, dashboardTipSeen]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
