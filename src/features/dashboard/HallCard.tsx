import type { HallId, MenuItem, Plate as PlateModel } from "../../core/types";
import { Plate } from "../../components/Plate";
import { StationIcon } from "../../components/icons/StationIcon";

const MAX_LINES = 4;

interface HallCardProps {
  hallId: HallId;
  hallName: string;
  hallBlurb: string;
  plate: PlateModel;
  itemsById: Map<string, MenuItem>;
  onOpen: () => void;
  isHome: boolean;
}

export function HallCard({ hallName, hallBlurb, plate, itemsById, onOpen, isHome }: HallCardProps) {
  const empty = plate.lines.length === 0;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="option-button snap-item flex w-[86%] shrink-0 flex-col gap-3 rounded-sheet border border-line bg-plate p-4 text-left shadow-card"
      style={{ boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-display text-lg text-ink">{hallName}</span>
        {isHome && (
          <span className="rounded-chip bg-accent-tint px-2 py-0.5 text-xs text-ink">Your hall</span>
        )}
      </div>
      <p className="-mt-2 text-sm text-ink-soft">{hallBlurb}</p>

      <div className="self-center">
        <Plate plate={plate} itemsById={itemsById} size={148} showCenter={false} />
      </div>

      {empty ? (
        <p className="text-sm text-ink-soft">Nothing here fits your filters today.</p>
      ) : (
        <>
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-display text-lg text-ink">{plate.totals.kcal} cal</span>
            <span className="text-sm text-ink-soft">{plate.totals.protein} g protein</span>
          </div>

          <span
            className={`inline-flex w-fit items-center gap-1.5 rounded-chip px-2.5 py-1 text-xs ${
              plate.onTarget ? "bg-accent-tint text-ink" : "border border-line-strong text-ink-soft"
            }`}
          >
            <span aria-hidden="true">{plate.onTarget ? "✓" : "•"}</span>
            {plate.onTarget ? "On target" : "Close to target"}
          </span>

          <ul className="flex flex-col gap-1.5">
            {plate.lines.slice(0, MAX_LINES).map((line) => {
              const item = itemsById.get(line.itemId);
              return (
                <li key={line.itemId} className="flex items-start gap-2 text-sm">
                  <span aria-hidden="true" className="mt-0.5 shrink-0 text-ink-soft">
                    <StationIcon station={item?.station ?? ""} size={16} />
                  </span>
                  <span className="min-w-0 flex-1 text-ink">
                    {item?.name}
                    <span className="text-ink-soft"> &middot; {line.portionLabel}</span>
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-soft">{line.kcal} cal</span>
                </li>
              );
            })}
            {plate.lines.length > MAX_LINES && (
              <li className="text-sm text-ink-soft">
                and {plate.lines.length - MAX_LINES} more
              </li>
            )}
          </ul>
        </>
      )}

      <span className="mt-1 font-display text-sm text-accent">See the full plate</span>
    </button>
  );
}
