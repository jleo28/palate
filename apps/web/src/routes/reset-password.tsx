import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Wordmark } from "@/components/palate/AppShell";
import { Field } from "@/components/palate/AuthFields";
import { authMessage, primaryButton } from "@/lib/auth";
import { useStore } from "@/lib/palate/store";
import { supabase } from "@/lib/supabase";

export const Route = createFileRoute("/reset-password")({
  head: () => ({ meta: [{ title: "Choose a new password — Palate" }] }),
  component: ResetPassword,
});

/** Landing page for the reset email: the link signs the user in, then they set a new password. */
function ResetPassword() {
  const navigate = useNavigate();
  const { ready, session } = useStore();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mx-auto flex min-h-screen max-w-md flex-col px-5 pt-8 pb-10">
      <Wordmark />
      <section className="mt-12 space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight">Choose a new password</h1>
        {ready && !session ? (
          <p className="text-sm text-muted-foreground">
            This reset link has expired or was already used. Request a new one from the sign-in
            page.
          </p>
        ) : (
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              const { error: err } = await supabase.auth.updateUser({ password });
              setBusy(false);
              if (err) return setError(authMessage(err));
              void navigate({ to: "/" });
            }}
          >
            <Field
              label="New password (8+ characters)"
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
            <button type="submit" disabled={busy || !ready} className={primaryButton}>
              {busy ? "Saving…" : "Save new password"}
            </button>
          </form>
        )}
      </section>
    </div>
  );
}
