import { useEffect, useState } from "react";
import { HINTS, type HintScreen, type Seedling } from "@palate/core";
import { SeedlingAvatar } from "./SeedlingAvatar";

const KEY = "palate.hints.v1";

function seen(): HintScreen[] {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as HintScreen[];
  } catch {
    return [];
  }
}

/** A one-time hint from Seedling the first time a screen opens. */
export function SeedlingHint({ screen, seedling }: { screen: HintScreen; seedling: Seedling }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const already = seen();
    if (already.includes(screen)) return;
    setOpen(true);
    try {
      localStorage.setItem(KEY, JSON.stringify([...already, screen]));
    } catch {
      /* hints are a nicety; ignore storage errors */
    }
  }, [screen]);

  if (!open) return null;

  return (
    <aside
      aria-label={`Tip from ${seedling.name}`}
      className="mb-4 flex items-start gap-3 rounded-2xl border border-olive/30 bg-olive-soft p-3"
    >
      <SeedlingAvatar seedling={seedling} className="size-12 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-sm">
          <span className="font-bold">{seedling.name}: </span>
          {HINTS[screen]}
        </p>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mt-2 rounded-full border border-foreground/25 px-3 py-1 text-xs font-bold"
        >
          Got it
        </button>
      </div>
    </aside>
  );
}
