import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { Profile } from "../core/types";
import { loadJson, removeJson, saveJson } from "../lib/storage";

export type UnitSystem = "imperial" | "metric";

interface ProfileContextValue {
  profile: Profile | null;
  units: UnitSystem;
  isOnboarded: boolean;
  setProfile: (profile: Profile) => void;
  updateProfile: (patch: Partial<Profile>) => void;
  setUnits: (units: UnitSystem) => void;
  resetProfile: () => void;
}

const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<Profile | null>(() => loadJson<Profile>("profile"));
  const [units, setUnitsState] = useState<UnitSystem>(() => loadJson<UnitSystem>("units") ?? "imperial");

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

  const resetProfile = () => {
    setProfileState(null);
    removeJson("profile");
  };

  const value = useMemo<ProfileContextValue>(
    () => ({
      profile,
      units,
      isOnboarded: profile !== null,
      setProfile,
      updateProfile,
      setUnits,
      resetProfile,
    }),
    [profile, units]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error("useProfile must be used within a ProfileProvider");
  return ctx;
}
