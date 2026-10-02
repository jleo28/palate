import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { MailCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { authMessage, primaryButton } from "@/lib/auth";
import { Field } from "./AuthFields";

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

  if (sentTo) {
    return (
      <section className="space-y-4 text-center">
        <MailCheck className="mx-auto size-10 text-olive" aria-hidden />
        <h1 className="text-2xl font-extrabold">Check your inbox</h1>
        <p className="text-sm text-muted-foreground">
          We sent a link to <span className="font-semibold text-foreground">{sentTo}</span>. Tap it
          to confirm, then sign in. Your setup is saved on this device and moves into your account
          when you do.
        </p>
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
          setBusy(true);
          setError(null);
          const { data, error: err } = await supabase.auth.signUp({
            email: email.trim(),
            password,
            options: { emailRedirectTo: `${window.location.origin}/` },
          });
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
