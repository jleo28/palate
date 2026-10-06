import { Link } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import type { LoggedMeal } from "@palate/core";

/** Shown instead of a plate when a hall meal is already logged today. */
export function LoggedSlot({ entry }: { entry: LoggedMeal }) {
  return (
    <section className="card-edge rounded-3xl bg-card p-4">
      <p className="label-caps flex items-center gap-1.5 text-olive">
        <CheckCircle2 className="size-4" aria-hidden /> Logged
      </p>
      <h2 className="mt-1 text-xl leading-tight font-extrabold">{entry.meal} is done for today</h2>
      <ul className="mt-3 space-y-1 text-sm">
        {entry.items.map((i, n) => (
          <li key={n}>
            <span className="font-semibold">{i.portion}</span> {i.name}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs font-semibold text-olive">
        {Math.round(entry.kcal)} cal · {Math.round(entry.protein)}P · {Math.round(entry.carbs)}C ·{" "}
        {Math.round(entry.fat)}F
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Need to change something?{" "}
        <Link to="/card" className="font-bold text-olive underline">
          Edit it in your macro bank
        </Link>
      </p>
    </section>
  );
}
