import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useStore } from "./store";

/** Screens that need a set-up account: signed out → Welcome, signed in without a profile → onboarding. */
export function useRequireProfile() {
  const navigate = useNavigate();
  const { ready, session, profile } = useStore();
  useEffect(() => {
    if (!ready) return;
    if (!session) void navigate({ to: "/welcome" });
    else if (!profile) void navigate({ to: "/onboarding" });
  }, [ready, session, profile, navigate]);
}
