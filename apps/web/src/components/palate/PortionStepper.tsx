import { Minus, Plus } from "lucide-react";
import { haptic } from "@/lib/palate/haptics";
import { MAX_QTY, PORTION_STEP, portionLabel, portionWeight, type MenuItem } from "@palate/core";
import { cn } from "@/lib/utils";

const iconButton =
  "grid size-10 shrink-0 place-items-center rounded-full border border-foreground/25 disabled:opacity-35";

/** The one portion control: half-unit steps in the item's utensil ("1½ ladles · ~255g"). */
export function PortionStepper({
  item,
  qty,
  onQty,
  min = 0,
}: {
  item: MenuItem;
  qty: number;
  onQty: (qty: number) => void;
  min?: number;
}) {
  const off = qty === 0;
  const weight = portionWeight(item, qty);
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={`${item.name} portions`}>
      <button
        type="button"
        onClick={() => {
          haptic();
          onQty(Math.max(min, qty - PORTION_STEP));
        }}
        disabled={qty <= min}
        aria-label={`Half a ${item.unit} less`}
        className={iconButton}
      >
        <Minus className="size-3.5" />
      </button>
      <span
        className={cn(
          "min-w-24 rounded-full px-3 py-1 text-center whitespace-nowrap tabular-nums",
          off ? "bg-foreground/5 text-muted-foreground" : "bg-olive-soft text-olive",
        )}
      >
        <span className="block text-[0.75rem] font-bold">{portionLabel(item, qty)}</span>
        {weight && !off && <span className="block text-[0.62rem] font-medium">{weight}</span>}
      </span>
      <button
        type="button"
        onClick={() => {
          haptic();
          onQty(Math.min(MAX_QTY, qty + PORTION_STEP));
        }}
        disabled={qty >= MAX_QTY}
        aria-label={`Half a ${item.unit} more`}
        className={iconButton}
      >
        <Plus className="size-3.5" />
      </button>
    </div>
  );
}
