import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { HallId, Profile } from "../core/types";
import { loadJson, removeJson, saveJson } from "../lib/storage";
import { setHapticsEnabled } from "../lib/haptics";

export type UnitSystem = "imperial" | "metric";

const ALL_HALLS: HallId[] = ["evk", "parkside", "village"];

interface ProfileContextValue {
  profile: Profile | null;
  units: UnitSystem;
  /** Which halls the student said they use. Today shows these first. */
  halls: HallId[];
  haptics: boolean;
  isOnboarded: boolean;
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setUnits: (units: UnitSystem) => void;
  setHalls: (halls: HallId[]) => void;
  setHaptics: (on: boolean) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(() => loadJson<Profile>("profile"));
  const [units, setUnitsState] = useState<UnitSystem>(() => loadJson<UnitSystem>("units") ?? "imperial");
  const [halls, setHallsState] = useState<HallId[]>(() => loadJson<HallId[]>("halls") ?? ALL_HALLS);
  const [haptics, setHapticsState] = useState<boolean>(() => loadJson<boolean>("haptics") ?? true);

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

  const resetProfile = () => {
    setProfileState(null);
    setHallsState(ALL_HALLS);
    removeJson("profile");
    removeJson("halls");
  };

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      units,
      halls,
      haptics,
      isOnboarded: profile !== null,
      setProfile,
      updateProfile,
      setUnits,
      setHalls,
      setHaptics,
      resetProfile,
    }),
    [profile, units, halls, haptics]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
