import { useState } from "react";
import { MEALS, type MealPeriod } from "@palate/core";
import { currentMeal } from "@/lib/palate/halls";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface OutsideMeal {
  name: string;
  meal: MealPeriod;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

const FIELDS = [
  ["kcal", "Calories"],
  ["protein", "Protein (g)"],
  ["carbs", "Carbs (g)"],
  ["fat", "Fat (g)"],
] as const;

const EMPTY = { kcal: "", protein: "", carbs: "", fat: "" };

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLog: (meal: OutsideMeal) => void;
}

/** Log a meal eaten outside the halls. It counts toward the day's budget like any other. */
export function OutsideMealDialog({ open, onOpenChange, onLog }: Props) {
  const [name, setName] = useState("");
  const [meal, setMeal] = useState<MealPeriod>(currentMeal);
  const [macros, setMacros] = useState(EMPTY);
  const hasValue = Object.values(macros).some((v) => Number(v) > 0);

  const submit = () => {
    const n = (v: string) => Math.max(0, Number(v) || 0);
    onLog({
      name: name.trim() || "Outside dining hall",
      meal,
      kcal: n(macros.kcal),
      protein: n(macros.protein),
      carbs: n(macros.carbs),
      fat: n(macros.fat),
    });
    setName("");
    setMacros(EMPTY);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setMeal(currentMeal());
        onOpenChange(next);
      }}
    >
      <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl">Ate outside the halls?</DialogTitle>
          <DialogDescription>
            Add what you know. Blank values count as zero, and it all counts toward today.
          </DialogDescription>
        </DialogHeader>

        <label className="block">
          <span className="label-caps text-muted-foreground">What was it? (optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Chipotle bowl"
            maxLength={60}
            className="mt-1 w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive"
          />
        </label>

        <div role="radiogroup" aria-label="Which meal" className="grid grid-cols-3 gap-1.5">
          {MEALS.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={meal === m}
              onClick={() => setMeal(m)}
              className={cn(
                "rounded-full border py-1.5 text-xs font-bold",
                meal === m
                  ? "border-olive bg-olive text-primary-foreground"
                  : "border-foreground/20 text-muted-foreground",
              )}
            >
              {m}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {FIELDS.map(([key, label]) => (
            <label key={key} className="block">
              <span className="label-caps text-muted-foreground">{label}</span>
              <input
                type="number"
                min="0"
                inputMode="decimal"
                value={macros[key]}
                onChange={(e) => setMacros((current) => ({ ...current, [key]: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive"
                placeholder="0"
              />
            </label>
          ))}
        </div>

        <button
          type="button"
          onClick={submit}
          disabled={!hasValue}
          className="h-11 w-full rounded-full bg-foreground font-bold text-primary-foreground disabled:opacity-40"
        >
          Add to today
        </button>
      </DialogContent>
    </Dialog>
  );
}
