import { useState } from "react";
import { Minus, Plus, Trash2, X } from "lucide-react";
import {
  MAX_QTY,
  portionsEditable,
  removeLoggedItem,
  setLoggedQty,
  setLoggedTotals,
  type LoggedMeal,
} from "@palate/core";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const iconButton =
  "grid size-8 shrink-0 place-items-center rounded-full border border-foreground/25 disabled:opacity-35";
const field =
  "mt-1 w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive";

interface Props {
  entry: LoggedMeal | null;
  onClose: () => void;
  onSave: (next: LoggedMeal) => void;
  onDelete: (id: string) => void;
}

/** The only place a logged meal changes: portions and items, or totals for outside meals. */
export function EditLogDialog({ entry, onClose, onSave, onDelete }: Props) {
  return (
    <Dialog open={entry !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5">
        {entry && <EditForm key={entry.id} entry={entry} onSave={onSave} onDelete={onDelete} />}
      </DialogContent>
    </Dialog>
  );
}

function EditForm({
  entry,
  onSave,
  onDelete,
}: Omit<Props, "entry" | "onClose"> & { entry: LoggedMeal }) {
  const [draft, setDraft] = useState(entry);
  const [totals, setTotals] = useState({
    kcal: String(Math.round(entry.kcal)),
    protein: String(Math.round(entry.protein)),
    carbs: String(Math.round(entry.carbs)),
    fat: String(Math.round(entry.fat)),
  });
  const byPortion = portionsEditable(entry);

  const save = () => {
    const n = (v: string) => Number(v) || 0;
    onSave(
      byPortion
        ? draft
        : setLoggedTotals(draft, {
            kcal: n(totals.kcal),
            protein: n(totals.protein),
            carbs: n(totals.carbs),
            fat: n(totals.fat),
          }),
    );
  };

  return (
    <>
      <DialogHeader className="text-left">
        <DialogTitle className="font-display text-xl">Edit {entry.meal.toLowerCase()}</DialogTitle>
        <DialogDescription>
          {byPortion
            ? "Change portions or remove anything you didn't eat."
            : "Update what you know. Blank counts as zero."}
        </DialogDescription>
      </DialogHeader>

      {byPortion ? (
        <ul className="divide-y divide-foreground/10 rounded-2xl border border-foreground/15">
          {draft.items.map((i, n) => (
            <li key={n} className="flex items-center gap-2 px-3 py-2">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{i.name}</span>
                <span className="text-xs text-muted-foreground">{i.portion}</span>
              </span>
              <button
                type="button"
                aria-label={`One portion less of ${i.name}`}
                disabled={(i.qty ?? 1) <= 1}
                onClick={() => setDraft((d) => setLoggedQty(d, n, (i.qty ?? 1) - 1))}
                className={iconButton}
              >
                <Minus className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={`One portion more of ${i.name}`}
                disabled={(i.qty ?? 1) >= MAX_QTY}
                onClick={() => setDraft((d) => setLoggedQty(d, n, (i.qty ?? 1) + 1))}
                className={iconButton}
              >
                <Plus className="size-3.5" />
              </button>
              <button
                type="button"
                aria-label={`Remove ${i.name}`}
                disabled={draft.items.length <= 1}
                onClick={() => setDraft((d) => removeLoggedItem(d, n))}
                className={iconButton}
              >
                <X className="size-3.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {(
            [
              ["kcal", "Calories"],
              ["protein", "Protein (g)"],
              ["carbs", "Carbs (g)"],
              ["fat", "Fat (g)"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block">
              <span className="label-caps text-muted-foreground">{label}</span>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={totals[key]}
                onChange={(e) => setTotals((t) => ({ ...t, [key]: e.target.value }))}
                className={field}
              />
            </label>
          ))}
        </div>
      )}

      {byPortion && (
        <p className="text-xs font-semibold text-olive">
          {Math.round(draft.kcal)} cal · {Math.round(draft.protein)}P · {Math.round(draft.carbs)}C ·{" "}
          {Math.round(draft.fat)}F
        </p>
      )}

      <div className="grid grid-cols-[auto_1fr] gap-2">
        <button
          type="button"
          onClick={() => onDelete(entry.id)}
          className="flex h-11 items-center gap-1.5 rounded-full border border-foreground/25 px-4 text-sm font-bold"
        >
          <Trash2 className="size-4" /> Delete
        </button>
        <button
          type="button"
          onClick={save}
          className="h-11 rounded-full bg-foreground text-sm font-bold text-primary-foreground"
        >
          Save changes
        </button>
      </div>
    </>
  );
}
