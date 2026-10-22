import { useMemo, useState } from "react";
import { Minus, Plus, Search } from "lucide-react";
import {
  MAX_QTY,
  SNACKS,
  availableItems,
  canLogSlot,
  firstOpenSlot,
  isSnack,
  logItems,
  menuPeriod,
  totals,
  type HallId,
  type LoggedMeal,
  type MenuItem,
  type PlateItem,
  type Slot,
} from "@palate/core";
import { currentMeal, hallName } from "@/lib/palate/halls";
import { MENU, portionLabel } from "@/lib/palate/menu";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type NewLog = Omit<LoggedMeal, "id" | "date">;

const FIELDS = [
  ["kcal", "Calories"],
  ["protein", "Protein (g)"],
  ["carbs", "Carbs (g, optional)"],
  ["fat", "Fat (g, optional)"],
] as const;

const EMPTY = { kcal: "", protein: "", carbs: "", fat: "" };
const field =
  "mt-1 w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Gets a meal ready to log: hall items, or something from outside the halls. */
  onLog: (entry: NewLog) => void;
  hall: HallId;
  /** Today's slots, including the user's snacks. */
  slots: Slot[];
  /** Meals logged today can't be logged again. */
  loggedToday: Slot[];
  /** Which tab opens first. */
  start?: "menu" | "manual";
}

/**
 * "I ate something else": pick what you actually had from today's hall menu, or enter a meal
 * from outside the halls by hand. Hall picks log as a dining-hall meal; manual ones as outside.
 */
export function AteSomethingElseDialog({
  open,
  onOpenChange,
  onLog,
  hall,
  slots,
  loggedToday,
  start = "menu",
}: Props) {
  const openSlot = () => firstOpenSlot(slots, currentMeal(), loggedToday) ?? currentMeal();
  const [tab, setTab] = useState(start);
  const [meal, setMeal] = useState<Slot>(openSlot);
  const [query, setQuery] = useState("");
  const [picked, setPicked] = useState<PlateItem[]>([]);
  const [name, setName] = useState("");
  const [macros, setMacros] = useState(EMPTY);

  const menu = useMemo(
    () =>
      availableItems(MENU, hall, menuPeriod(meal), []).sort((a, b) => a.name.localeCompare(b.name)),
    [hall, meal],
  );
  const q = query.trim().toLowerCase();
  const matches = q ? menu.filter((i) => `${i.name} ${i.station}`.toLowerCase().includes(q)) : menu;

  const reset = () => {
    setQuery("");
    setPicked([]);
    setName("");
    setMacros(EMPTY);
  };

  const qtyOf = (item: MenuItem) => picked.find((p) => p.item.id === item.id)?.qty ?? 0;
  const setPick = (item: MenuItem, qty: number) =>
    setPicked((rows) => {
      const rest = rows.filter((r) => r.item.id !== item.id);
      const next = Math.min(MAX_QTY, Math.max(0, qty));
      return next > 0 ? [...rest, { id: item.id, item, qty: next }] : rest;
    });

  const canLog = canLogSlot(meal, loggedToday);
  const n = (v: string) => Math.max(0, Number(v) || 0);
  const manualReady = n(macros.kcal) > 0;

  const logPicked = () => {
    onLog({ hall, meal, ...totals(picked), items: logItems(picked), source: "dining-hall" });
    reset();
  };
  const logManual = () => {
    const label = name.trim() || "Outside dining hall";
    onLog({
      hall,
      meal,
      kcal: n(macros.kcal),
      protein: n(macros.protein),
      carbs: n(macros.carbs),
      fat: n(macros.fat),
      items: [{ name: label, portion: "Estimated" }],
      source: "outside",
    });
    reset();
  };

  const tabButton = (id: typeof tab, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => setTab(id)}
      className={cn(
        "h-10 flex-1 rounded-full text-sm font-bold",
        tab === id ? "bg-foreground text-primary-foreground" : "text-muted-foreground",
      )}
    >
      {label}
    </button>
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setMeal(openSlot());
          setTab(start);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="flex max-h-[90dvh] w-[calc(100%-2rem)] max-w-sm flex-col gap-3 rounded-2xl p-5">
        <DialogHeader className="text-left">
          <DialogTitle className="font-display text-xl">Ate something else?</DialogTitle>
          <DialogDescription>
            Log what you actually had. It counts toward today like any other meal.
          </DialogDescription>
        </DialogHeader>

        <div role="radiogroup" aria-label="Which meal" className="flex flex-wrap gap-1.5">
          {slots.map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={meal === m}
              disabled={!canLogSlot(m, loggedToday)}
              onClick={() => {
                setMeal(m);
                setPicked([]);
              }}
              className={cn(
                "h-9 rounded-full border px-3 text-xs font-bold disabled:opacity-35",
                meal === m
                  ? "border-olive bg-olive text-primary-foreground"
                  : "border-foreground/20 text-muted-foreground",
              )}
            >
              {isSnack(m) ? SNACKS[m].label : m}
            </button>
          ))}
        </div>

        <div role="tablist" className="flex gap-1 rounded-full border border-foreground/15 p-1">
          {tabButton("menu", `From ${hallName(hall)}`)}
          {tabButton("manual", "Somewhere else")}
        </div>

        {tab === "menu" ? (
          <>
            <label className="relative block">
              <span className="sr-only">Search today's menu</span>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search today's menu"
                className={cn(field, "mt-0 pl-9")}
              />
            </label>
            <ul className="-mx-1 min-h-40 flex-1 divide-y divide-foreground/10 overflow-y-auto px-1">
              {matches.map((item) => {
                const qty = qtyOf(item);
                return (
                  <li key={item.id} className="flex items-center gap-2 py-2">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold">{item.name}</p>
                      <p className="text-[0.7rem] text-muted-foreground">
                        {item.station} · {qty > 0 ? portionLabel(item, qty) : `per ${item.unit}`}
                      </p>
                    </div>
                    {qty > 0 && (
                      <button
                        type="button"
                        onClick={() => setPick(item, qty - 1)}
                        aria-label={`One ${item.unit} less of ${item.name}`}
                        className="grid size-10 place-items-center rounded-full border border-foreground/25"
                      >
                        <Minus className="size-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setPick(item, qty + 1)}
                      aria-label={`Add a ${item.unit} of ${item.name}`}
                      className="grid size-10 place-items-center rounded-full border border-foreground/25"
                    >
                      <Plus className="size-3.5" />
                    </button>
                  </li>
                );
              })}
              {matches.length === 0 && (
                <li className="py-6 text-center text-sm text-muted-foreground">
                  Nothing matches. Try "Somewhere else" to enter it by hand.
                </li>
              )}
            </ul>
            <button
              type="button"
              onClick={logPicked}
              disabled={!picked.length || !canLog}
              className="h-12 w-full shrink-0 rounded-full bg-foreground font-bold text-primary-foreground disabled:opacity-40"
            >
              {picked.length
                ? `Log ${picked.length} ${picked.length === 1 ? "item" : "items"}`
                : "Tap + on what you had"}
            </button>
          </>
        ) : (
          <>
            <label className="block">
              <span className="label-caps text-muted-foreground">What was it?</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chipotle bowl"
                maxLength={60}
                className={field}
              />
            </label>
            <div className="grid grid-cols-2 gap-3">
              {FIELDS.map(([key, label]) => (
                <label key={key} className="block">
                  <span className="label-caps text-muted-foreground">{label}</span>
                  <input
                    type="number"
                    min="0"
                    inputMode="decimal"
                    value={macros[key]}
                    onChange={(e) => setMacros((m) => ({ ...m, [key]: e.target.value }))}
                    className={field}
                    placeholder="0"
                  />
                </label>
              ))}
            </div>
            <button
              type="button"
              onClick={logManual}
              disabled={!manualReady || !canLog}
              className="h-12 w-full rounded-full bg-foreground font-bold text-primary-foreground disabled:opacity-40"
            >
              Add to today
            </button>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
