import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { shouldShowTour, type TourStep } from "@palate/core";
import { OliveTour } from "@/components/palate/OliveTour";
import { useStore } from "./store";

interface TourCtx {
  active: boolean;
  start: () => void;
  stop: () => void;
}

const Ctx = createContext<TourCtx>({ active: false, start: () => {}, stop: () => {} });

/** Olive's tour runs above the routes so it can walk between tabs. */
export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const start = useCallback(() => setActive(true), []);
  const stop = useCallback(() => setActive(false), []);
  return <Ctx.Provider value={{ active, start, stop }}>{children}</Ctx.Provider>;
}

export function useTour() {
  return useContext(Ctx);
}

/**
 * Starts the tour once for a profile that hasn't finished it, landing on The Plate (or on demand
 * with /?tour=1), and saves completion to the profile so it never replays on another device.
 */
export function TourHost() {
  const { ready, profile, hall, saveProfile } = useStore();
  const { active, start, stop } = useTour();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  // Decided once per page load, so finishing never re-triggers it before the save lands.
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (checked || pathname !== "/" || !ready || !profile?.seedling) return;
    setChecked(true);
    const forced = new URLSearchParams(window.location.search).get("tour") === "1";
    if (forced) {
      const url = new URL(window.location.href);
      url.searchParams.delete("tour");
      window.history.replaceState(window.history.state, "", url);
    }
    if (shouldShowTour({ ready, profile, forced })) start();
  }, [checked, pathname, ready, profile, start]);

  if (!active || !profile?.seedling) return null;

  const goTo = (step: TourStep) => {
    if (step.route !== pathname) void navigate({ to: step.route });
  };
  const done = () => {
    stop();
    void saveProfile({ ...profile, tourCompletedAt: new Date().toISOString() });
    if (pathname !== "/") void navigate({ to: "/" });
  };

  return (
    <OliveTour
      firstName={profile.name.split(" ")[0] || profile.name}
      hall={hall}
      seedling={profile.seedling}
      onStep={goTo}
      onName={(seedling) => void saveProfile({ ...profile, seedling })}
      onDone={done}
    />
  );
}
