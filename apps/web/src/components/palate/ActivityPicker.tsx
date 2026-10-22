import { ACTIVITY, DEFAULT_ACTIVITY, type ActivityId } from "@palate/core";
import { cn } from "@/lib/utils";

/** How active you are. Feeds the activity multiplier in the calorie maths. */
export function ActivityPicker({
  value,
  onChange,
}: {
  value: ActivityId | undefined;
  onChange: (next: ActivityId) => void;
}) {
  const current = value ?? DEFAULT_ACTIVITY;
  return (
    <div>
      <p className="label-caps mb-2 text-muted-foreground">Activity level</p>
      <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Activity level">
        {ACTIVITY.map((a) => {
          const active = a.id === current;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(a.id)}
              className={cn(
                "min-h-12 rounded-2xl border px-3 py-2 text-left text-sm font-semibold",
                active
                  ? "border-olive bg-olive text-primary-foreground"
                  : "border-foreground/20 text-foreground",
              )}
            >
              {a.label}
              {a.note && (
                <span
                  className={cn(
                    "block text-[0.7rem] font-medium",
                    active ? "text-primary-foreground/80" : "text-muted-foreground",
                  )}
                >
                  {a.note}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
