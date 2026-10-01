import { Minus, Plus, RefreshCw, X } from "lucide-react";
import {
  MAX_QTY,
  allergenConflicts,
  allergenLabel,
  type Allergen,
  type MenuItem,
  type PlateItem,
} from "@palate/core";
import { portionLabel } from "@/lib/palate/menu";

interface Props {
  row: PlateItem;
  allergies: Allergen[];
  alternatives: MenuItem[];
  onSwap: () => void;
  onQty: (qty: number) => void;
  onRemove: () => void;
  onReplace: (item: MenuItem) => void;
}

const iconButton =
  "grid size-8 shrink-0 place-items-center rounded-full border border-foreground/25 disabled:opacity-35";

export function PlateRow({
  row,
  allergies,
  alternatives,
  onSwap,
  onQty,
  onRemove,
  onReplace,
}: Props) {
  const { item, qty } = row;
  const hits = allergenConflicts(item, allergies);

  return (
    <li className="px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {item.station}
          </p>
          <p className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold">
            {hits.length > 0 && (
              <span
                className="size-2 shrink-0 rounded-full bg-destructive"
                aria-label={`Allergen warning: contains ${hits.map(allergenLabel).join(", ")}`}
              />
            )}
            <span className="truncate">{item.name}</span>
          </p>
          <p className="mt-0.5 text-[0.7rem] text-muted-foreground">
            {item.kcal * qty} cal · {item.protein * qty}P · {item.carbs * qty}C · {item.fat * qty}F
          </p>
          {hits.length > 0 && (
            <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
              Contains {hits.map(allergenLabel).join(", ")}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label={`Remove ${item.name}`}
          className={iconButton}
        >
          <X className="size-3.5" />
        </button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label={`${item.name} portions`}
        >
          <button
            type="button"
            onClick={() => onQty(qty - 1)}
            disabled={qty <= 1}
            aria-label="One portion less"
            className={iconButton}
          >
            <Minus className="size-3.5" />
          </button>
          <span className="min-w-20 rounded-full bg-olive-soft px-2 py-1 text-center text-[0.7rem] font-bold text-olive">
            {portionLabel(item, qty)}
          </span>
          <button
            type="button"
            onClick={() => onQty(qty + 1)}
            disabled={qty >= MAX_QTY}
            aria-label="One portion more"
            className={iconButton}
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onSwap}
          className="ml-auto flex h-8 shrink-0 items-center gap-1 rounded-full border border-foreground/25 px-2.5 text-[0.7rem] font-bold"
        >
          <RefreshCw className="size-3" /> Swap
        </button>
        {alternatives.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              const next = alternatives.find((a) => a.id === e.target.value);
              if (next) onReplace(next);
            }}
            aria-label={`Choose something else from ${item.station}`}
            className="h-8 basis-full rounded-full border border-foreground/25 bg-background px-3 text-[0.75rem] font-semibold"
          >
            <option value="" disabled>
              Something else from {item.station.toLowerCase()}…
            </option>
            {alternatives.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </li>
  );
}
