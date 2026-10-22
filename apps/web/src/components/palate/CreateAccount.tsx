import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { VERIFIED_PATH } from "@/lib/palate/paths";
import { authMessage, primaryButton } from "@/lib/auth";
import { Field } from "./AuthFields";

// Supabase's default confirmation email. Update both if the template or sender changes.
const EMAIL_SUBJECT = "Confirm Your Signup";
const EMAIL_SENDER = "Supabase Auth";
// 20 sign-in checks per 5 minutes, under Supabase's 30 per 5 minutes per IP.
const CHECK_EVERY_MS = 15_000;

/**
 * Last onboarding step for new users. The setup is already saved in this browser, and it's
 * moved into the account on first sign-in (straight away if no email confirmation is needed).
 */
export function CreateAccount() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  // Guards against a double tap firing two sign-ups before the disabled state renders.
  const sending = useRef(false);

  // Waiting for the confirmation link. In this browser the session syncs across tabs by itself;
  // if the link was opened elsewhere (say, on a phone), sign in again every so often, and when
  // the tab comes back into view, until the email counts as confirmed. Onboarding then moves on.
  useEffect(() => {
    if (!sentTo) return;
    let stopped = false;
    const check = async () => {
      if (stopped || document.visibilityState === "hidden") return;
      const { data } = await supabase.auth.getSession();
      if (data.session || stopped) return;
      await supabase.auth.signInWithPassword({ email: sentTo, password });
    };
    const timer = setInterval(() => void check(), CHECK_EVERY_MS);
    document.addEventListener("visibilitychange", check);
    window.addEventListener("focus", check);
    return () => {
      stopped = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", check);
      window.removeEventListener("focus", check);
    };
  }, [sentTo, password]);

  if (sentTo) {
    return (
      <section className="space-y-4 text-center">
        <MailCheck className="mx-auto size-10 text-olive" aria-hidden />
        <h1 className="text-2xl font-extrabold">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          We sent a link to <span className="font-semibold text-foreground">{sentTo}</span>. Tap it
          to confirm. Keep this tab open: it carries on by itself once you've confirmed.
        </p>
        <div className="rounded-xl bg-muted px-3 py-2 text-left text-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Look for
          </p>
          <p className="font-semibold">“{EMAIL_SUBJECT}”</p>
          <p className="text-muted-foreground">
            from {EMAIL_SENDER}. Check spam if it's not there.
          </p>
        </div>
        <Link to="/sign-in" className="inline-block text-sm font-bold text-olive underline">
          I've confirmed, sign me in
        </Link>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold">Save your card</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create an account so your plates, log and Seedling follow you to any device.
        </p>
      </div>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          if (sending.current) return;
          sending.current = true;
          setBusy(true);
          setError(null);
          const { data, error: err } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: `${window.location.origin}${VERIFIED_PATH}` },
          });
          sending.current = false;
          setBusy(false);
          if (err) return setError(authMessage(err));
          // With confirmations off, the session arrives now and onboarding moves on by itself.
          if (!data.session) setSentTo(email.trim());
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
          label="Password (8+ characters)"
          type="password"
          autoComplete="new-password"
          minLength={8}
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <p role="alert" className="text-sm font-semibold">
            {error}
          </p>
        )}
        <button type="submit" disabled={busy} className={primaryButton}>
          {busy ? "Creating your account…" : "Create account"}
        </button>
      </form>
      <p className="text-center text-xs text-muted-foreground">
        Already have one?{" "}
        <Link to="/sign-in" className="font-bold text-olive underline">
          Sign in
        </Link>
      </p>
    </section>
  );
}
