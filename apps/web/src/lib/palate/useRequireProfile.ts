import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "./store";

/** Screens that need a set-up account: signed out → Welcome, signed in without a profile → onboarding. */
export function useRequireProfile() {
  const navigate = useNavigate();
  const { ready, loadFailed, session, profile } = useStore();
  useEffect(() => {
    if (!ready) return;
    if (!session) void navigate({ to: "/welcome" });
    // Only a profile that's really missing (not one that failed to load) means onboarding.
    else if (!profile && !loadFailed) void navigate({ to: "/onboarding" });
  }, [ready, loadFailed, session, profile, navigate]);
}
