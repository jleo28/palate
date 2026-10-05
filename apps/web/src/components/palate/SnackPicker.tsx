import { SNACKS, SNACK_SHARE, type SnackSlot } from "@palate/core";
import { cn } from "@/lib/utils";

const OPTIONS = Object.keys(SNACKS) as SnackSlot[];

/** "Do you snack?" Each snack chosen saves a slice of the day and shrinks meals to fit. */
export function SnackPicker({
  value,
  onChange,
}: {
  value: SnackSlot[];
  onChange: (next: SnackSlot[]) => void;
}) {
  return (
    <div>
      <p className="label-caps mb-1 text-muted-foreground">Do you snack?</p>
      <p className="mb-2 text-xs text-muted-foreground">
        Pick any that sound like you. We'll save about {Math.round(SNACK_SHARE * 100)}% of your day
        for each, and size meals to match.
      </p>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Snacks">
        {OPTIONS.map((slot) => {
          const active = value.includes(slot);
          return (
            <button
              key={slot}
              type="button"
              aria-pressed={active}
              onClick={() => onChange(active ? value.filter((s) => s !== slot) : [...value, slot])}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                active
                  ? "border-olive bg-olive text-primary-foreground"
                  : "border-foreground/20 text-muted-foreground",
              )}
            >
              {SNACKS[slot].question}
            </button>
          );
        })}
      </div>
    </div>
  );
}
