import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronUp, UtensilsCrossed, X } from "lucide-react";
import { currentPlate, editCurrent, removeRow, setQty, totals } from "@palate/core";
import { Sheet, SheetContent, SheetDescription, SheetTitle } from "@/components/ui/sheet";
import { useHideNumbers } from "@/lib/palate/hide-numbers";
import { plateFor, useStore } from "@/lib/palate/store";
import { PortionStepper } from "./PortionStepper";

/** Hall Menus' "My Plate" bar: what you're building, always one tap away. */
export function PlateTray() {
  const hidden = useHideNumbers();
  const { plateHistory, setPlateHistory, plateBuiltFor, hall, meal } = useStore();
  const [open, setOpen] = useState(false);
  const current = plateBuiltFor?.startsWith(plateFor(hall, meal)) ?? false;
  const plate = current ? currentPlate(plateHistory) : [];
  const rows = plate.filter((r) => r.qty > 0);
  if (!rows.length) return null;

  const t = totals(plate);
  const edit = (fn: Parameters<typeof editCurrent>[1]) =>
    setPlateHistory((h) => editCurrent(h, fn));
  const summary = hidden
    ? `${rows.length} ${rows.length === 1 ? "item" : "items"}`
    : `${rows.length} ${rows.length === 1 ? "item" : "items"} · ${Math.round(t.kcal)} cal · ${Math.round(t.protein)}g protein`;

  return (
    <>
      {/* Keeps the last menu items clear of the bar. */}
      <div className="h-16" aria-hidden />
      <div className="fixed inset-x-0 bottom-[4.6rem] z-30 px-4" data-tour="plate-tray">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mx-auto flex h-14 w-full max-w-md items-center gap-3 rounded-full bg-foreground px-4 text-left text-primary-foreground shadow-lg active:translate-y-px"
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-olive">
            <UtensilsCrossed className="size-4" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-[0.68rem] font-semibold opacity-75">My Plate</span>
            <span className="block truncate text-sm font-bold">{summary}</span>
          </span>
          <ChevronUp className="size-5 shrink-0" aria-hidden />
        </button>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="mx-auto max-h-[85vh] max-w-md overflow-y-auto rounded-t-3xl p-5"
        >
          <SheetTitle className="text-xl font-extrabold">My Plate</SheetTitle>
          <SheetDescription className="text-sm text-muted-foreground">{summary}</SheetDescription>
          <ul className="mt-3 divide-y divide-foreground/10 rounded-2xl border border-foreground/15">
            {rows.map((row) => (
              <li key={row.id} className="px-3 py-2.5">
                <div className="flex items-start gap-2">
                  <p className="min-w-0 flex-1 font-display text-[0.95rem] font-bold">
                    {row.item.name}
                  </p>
                  <button
                    type="button"
                    onClick={() => edit((p) => removeRow(p, row.id))}
                    aria-label={`Remove ${row.item.name}`}
                    className="grid size-10 shrink-0 place-items-center rounded-full border border-foreground/25"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="mt-1.5">
                  <PortionStepper
                    item={row.item}
                    qty={row.qty}
                    min={0.5}
                    onQty={(qty) => edit((p) => setQty(p, row.id, qty))}
                  />
                </div>
              </li>
            ))}
          </ul>
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px"
          >
            Review and log on The Plate
          </Link>
        </SheetContent>
      </Sheet>
    </>
  );
}
