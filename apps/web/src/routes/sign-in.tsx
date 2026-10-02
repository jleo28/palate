import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Wordmark } from "@/components/palate/AppShell";
import { Field } from "@/components/palate/AuthFields";
import { authMessage, primaryButton } from "@/lib/auth";
import { useStore } from "@/lib/palate/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/sign-in")({
  head: () => ({ meta: [{ title: "Sign in — Palate" }] }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const { ready, session, profile } = useStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Returning users go straight to their plate; anyone without a profile finishes setup first.
  useEffect(() => {
    if (ready && session) void navigate({ to: profile ? "/" : "/onboarding" });
  }, [ready, session, profile, navigate]);

  const resetPassword = async () => {
    if (!email.trim()) return setMessage("Enter your email above first.");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setBusy(false);
    setMessage(
      error
        ? authMessage(error)
        : `If there's an account for ${email.trim()}, a reset link is on its way.`,
    );
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-8 pb-10">
      <Wordmark />
      <section className="mt-12 space-y-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Welcome back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to pick up where you left off.
          </p>
        </div>
        <form
          className="space-y-3"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setMessage(null);
            const { error } = await supabase.auth.signInWithPassword({
              email: email.trim(),
              password,
            });
            setBusy(false);
            if (error) setMessage(authMessage(error));
          }}
        >
          <Field
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Field
            label="Password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {message && (
            <p role="alert" className="text-sm font-semibold">
              {message}
            </p>
          )}
          <button type="submit" disabled={busy} className={primaryButton}>
            {busy ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <button
          type="button"
          onClick={() => void resetPassword()}
          disabled={busy}
          className="w-full text-center text-xs font-bold text-olive underline"
        >
          Forgot your password?
        </button>
      </section>
      <p className="mt-auto pt-10 text-center text-xs text-muted-foreground">
        New here?{" "}
        <Link to="/onboarding" className="font-bold text-olive underline">
          Set up your card
        </Link>
      </p>
    </div>
  );
}
