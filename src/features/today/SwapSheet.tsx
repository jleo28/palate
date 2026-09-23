import type { MenuItem } from "../../core/types";
import type { SwapOption } from "../../core/swap";
import { Sheet } from "../../components/Sheet";

interface SwapSheetProps {
  open: boolean;
  onClose: () => void;
  currentItem: MenuItem | null;
  options: SwapOption[];
  onPick: (option: SwapOption) => void;
}

function formatDelta(value: number, unit: string): string {
  const rounded = Math.round(value);
  if (rounded === 0) return `+0 ${unit}`;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${rounded} ${unit}`;
}

export function SwapSheet({ open, onClose, currentItem, options, onPick }: SwapSheetProps) {
  return (
    <Sheet title={`Swap ${currentItem?.name.toLowerCase() ?? ""}`} open={open} onClose={onClose}>
      {options.length === 0 ? (
        <p className="py-4 text-sm text-ink-soft">No other options fit your filters at this station right now.</p>
      ) : (
        <ul className="flex flex-col divide-y divide-line">
          {options.map((opt) => (
            <li key={opt.item.id}>
              <button
                type="button"
                onClick={() => onPick(opt)}
                className="tap-target flex w-full items-center justify-between gap-3 py-3 text-left"
              >
                <div>
                  <div className="font-display text-base text-ink">{opt.item.name}</div>
                  <div className="text-sm text-ink-soft">
                    {opt.item.station} &middot; {opt.portionLabel}
                  </div>
                </div>
                <div className="shrink-0 text-right text-sm tabular-nums text-ink-soft">
                  <div>{formatDelta(opt.deltaKcal, "cal")}</div>
                  <div>{formatDelta(opt.deltaProtein, "g protein")}</div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Sheet>
  );
}
