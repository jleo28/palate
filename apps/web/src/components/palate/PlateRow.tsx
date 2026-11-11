import { RefreshCw, X } from "lucide-react";
import { DishName } from "@/components/palate/DishName";
import { useHideNumbers } from "@/lib/palate/hide-numbers";
import { macroLine } from "@/lib/palate/macro-text";
import {
  allergenConflicts,
  allergenLabel,
  customAllergyMatches,
  CONFIRM_WITH_STAFF,
  type Allergen,
  type MenuItem,
  type PlateItem,
} from "@palate/core";
import { portionLabel } from "@/lib/palate/menu";
import { PortionStepper } from "./PortionStepper";
import { cn } from "@/lib/utils";

interface Props {
  row: PlateItem;
  allergies: Allergen[];
  customAllergies: string[];
  alternatives: MenuItem[];
  canSwap: boolean;
  onSwap: () => void;
  onQty: (qty: number) => void;
  onRemove: () => void;
  onReplace: (item: MenuItem) => void;
}

const iconButton =
  "grid size-10 shrink-0 place-items-center rounded-full border border-foreground/25 disabled:opacity-35";

export function PlateRow({
  row,
  allergies,
  customAllergies,
  alternatives,
  canSwap,
  onSwap,
  onQty,
  onRemove,
  onReplace,
}: Props) {
  const hidden = useHideNumbers();
  const { item, qty, suggested } = row;
  const off = qty === 0;
  const hits = allergenConflicts(item, allergies);
  const possible = customAllergyMatches(item, customAllergies);

  return (
    <li className="px-3 py-2.5">
      <div className="flex items-start gap-2">
        <div className={cn("min-w-0 flex-1 transition-opacity", off && "opacity-45")}>
          <p className="text-[0.65rem] font-semibold tracking-wide text-muted-foreground uppercase">
            {item.station}
          </p>
          <p className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold">
            {(hits.length > 0 || possible.length > 0) && (
              <span
                className="size-2 shrink-0 rounded-full bg-destructive"
                aria-label={`Allergen warning: ${[...hits.map(allergenLabel), ...possible].join(", ")}`}
              />
            )}
            <DishName name={item.name} className="min-w-0 flex-1" />
          </p>
          {!hidden && (
            <p className="mt-0.5 min-h-4 text-[0.7rem] text-muted-foreground tabular-nums">
              {off
                ? "Not on this plate. Tap + to add it back."
                : macroLine({
                    kcal: item.kcal * qty,
                    protein: item.protein * qty,
                    carbs: item.carbs * qty,
                    fat: item.fat * qty,
                  })}
            </p>
          )}
          {hits.length > 0 && (
            <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
              Contains {hits.map(allergenLabel).join(", ")}
            </p>
          )}
          {possible.length > 0 && (
            <p className="mt-0.5 text-[0.7rem] font-semibold text-destructive">
              May contain {possible.join(", ")} · {CONFIRM_WITH_STAFF}
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
        <PortionStepper item={item} qty={qty} onQty={onQty} />

        {/* Always takes its space, so rows don't shift when Swap isn't available. */}
        <button
          type="button"
          onClick={onSwap}
          disabled={!canSwap}
          aria-hidden={!canSwap}
          tabIndex={canSwap ? 0 : -1}
          className={cn(
            "ml-auto flex h-10 shrink-0 items-center gap-1 rounded-full border border-foreground/25 px-3 text-[0.75rem] font-bold",
            !canSwap && "invisible",
          )}
        >
          <RefreshCw className="size-3.5" /> Swap
        </button>
        {suggested !== undefined && (
          <p className="basis-full text-[0.7rem] text-muted-foreground">
            {`Your portion: ${portionLabel(item, suggested)}`}
          </p>
        )}
        {alternatives.length > 0 && (
          <select
            value=""
            onChange={(e) => {
              const next = alternatives.find((a) => a.id === e.target.value);
              if (next) onReplace(next);
            }}
            aria-label={`Choose something else from ${item.station}`}
            className="h-10 basis-full rounded-full border border-foreground/25 bg-background px-3 text-[0.75rem] font-semibold"
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
