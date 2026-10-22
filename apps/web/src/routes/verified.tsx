import { createFileRoute } from "@tanstack/react-router";
import { assignSeedling } from "@palate/core";
import { Wordmark } from "@/components/palate/AppShell";
import { SeedlingAvatar } from "@/components/palate/SeedlingAvatar";

export const Route = createFileRoute("/verified")({
  head: () => ({ meta: [{ title: "Email verified | Palate" }] }),
  component: Verified,
});

/**
 * Where the confirmation link lands. It's a dead end on purpose: the tab that signed up notices
 * the confirmation and finishes setup, so only one tab ever creates the account.
 */
// A fixed little crowd of happy Seedlings (random ones would differ between server and browser).
const crowd = [0.15, 0.55, 0.85].map((n) => {
  let x = n;
  return assignSeedling(() => (x = (x * 9301 + 0.49297) % 1));
});

function Verified() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-md flex-col px-4 pt-6 pb-16">
      <Wordmark />
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex items-end justify-center -space-x-4">
          {crowd.map((s, i) => (
            <SeedlingAvatar
              key={i}
              seedling={s}
              celebrate
              className={i === 1 ? "size-32" : "size-24"}
            />
          ))}
        </div>
        <h1 className="mt-6 text-3xl font-extrabold">Thanks for verifying!</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your email is confirmed. Head back to the tab where you signed up and it will pick up
          right where you left off.
        </p>
        <p className="mt-6 text-xs text-muted-foreground">You can close this tab.</p>
      </div>
    </div>
  );
}
