import { Link } from "@tanstack/react-router";
import { useHideNumbers } from "@/lib/palate/hide-numbers";
import { macroLine } from "@/lib/palate/macro-text";
import { CheckCircle2, Plus } from "lucide-react";
import type { LoggedMeal } from "@palate/core";

/** Shown instead of a plate when a hall meal is already logged today. */
export function LoggedSlot({
  entries,
  onLogAnother,
}: {
  /** Today's logs for this meal, newest first. */
  entries: LoggedMeal[];
  onLogAnother: () => void;
}) {
  const hidden = useHideNumbers();
  const entry = entries[0]!;
  return (
    <section className="card-edge rounded-3xl bg-card p-4">
      <p className="label-caps flex items-center gap-1.5 text-olive">
        <CheckCircle2 className="size-4" aria-hidden /> Logged
      </p>
      <h2 className="mt-1 text-xl leading-tight font-extrabold">
        {entry.meal} is logged{entries.length > 1 ? ` · ${entries.length} plates` : ""}
      </h2>
      {entries.map((e) => (
        <div key={e.id} className="mt-3">
          <ul className="space-y-1 text-sm">
            {e.items.map((i, n) => (
              <li key={n}>
                <span className="font-semibold">{i.portion}</span> {i.name}
              </li>
            ))}
          </ul>
          {!hidden && <p className="mt-1 text-xs font-semibold text-olive">{macroLine(e)}</p>}
        </div>
      ))}
      <button
        type="button"
        onClick={onLogAnother}
        className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px"
      >
        <Plus className="size-5" aria-hidden /> Log another meal
      </button>
      <p className="mt-4 text-sm text-muted-foreground">
        Need to change something?{" "}
        <Link to="/card" className="font-bold text-olive underline">
          Edit it in your macro bank
        </Link>
      </p>
    </section>
  );
}
