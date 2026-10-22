import { useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Camera, Check, Flame, ThumbsDown, ThumbsUp, Undo2 } from "lucide-react";
import { isRestDay, nextOpenSlot, streak, SNACKS, isSnack } from "@palate/core";
import { useStore } from "@/lib/palate/store";
import { today as localToday } from "@/lib/palate/dates";
import { cn } from "@/lib/utils";
import { SeedlingAvatar } from "./SeedlingAvatar";

/**
 * The "logged" pop-up, shown after any meal is logged. Seedling hops, the streak ticks up, and
 * there's room to rate the food, add a photo, undo, or jump to the next meal. Tap outside to close.
 */
export function MealLoggedSheet() {
  const { justLogged, profile } = useStore();
  if (!justLogged || !profile) return null;
  // Keyed by meal, so ratings and upload state start fresh for each one.
  return <Sheet key={justLogged.id} />;
}

function Sheet() {
  const {
    justLogged,
    dismissLogged,
    log,
    profile,
    slots,
    removeLog,
    rateItem,
    attachPhoto,
    setMeal,
  } = useStore();
  const navigate = useNavigate();
  const [ratings, setRatings] = useState<Record<string, 1 | -1>>({});
  const [uploading, setUploading] = useState(false);
  const photoInput = useRef<HTMLInputElement>(null);

  if (!justLogged || !profile) return null;

  const entry = log.find((l) => l.id === justLogged.id) ?? justLogged;
  const today = localToday();
  const hidden = !!profile.wellbeing?.hideNumbers;
  const s = streak(
    log.map((l) => l.date),
    today,
    (d) => isRestDay(profile.wellbeing, d),
    profile.cardSpends,
  );
  const firstThatDay = log.filter((l) => l.date === entry.date).length === 1;
  const loggedToday = log.filter((l) => l.date === today).map((l) => l.meal);
  const next = entry.date === today ? nextOpenSlot(slots, entry.meal, loggedToday) : null;
  const rateable = entry.source === "outside" ? [] : entry.items;

  const rate = (name: string, value: 1 | -1) => {
    const nextValue = ratings[name] === value ? null : value;
    setRatings((r) => {
      const copy = { ...r };
      if (nextValue === null) delete copy[name];
      else copy[name] = nextValue;
      return copy;
    });
    rateItem(entry.id, name, nextValue);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 backdrop-blur-[2px]"
      onClick={dismissLogged}
      role="dialog"
      aria-modal="true"
      aria-label={`${entry.meal} logged`}
    >
      <div
        className="animate-in slide-in-from-bottom-8 fade-in w-full max-w-md rounded-t-3xl bg-card px-5 pt-5 pb-8 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          {profile.seedling && (
            <SeedlingAvatar seedling={profile.seedling} className="pet-hop size-20 shrink-0" />
          )}
          <div className="min-w-0">
            <p className="font-display text-xl font-extrabold">
              {isSnack(entry.meal) ? SNACKS[entry.meal].label : entry.meal} logged
            </p>
            {!hidden && (
              <p className="text-sm text-muted-foreground tabular-nums">
                {Math.round(entry.kcal).toLocaleString()} cal · {Math.round(entry.protein)}g protein
              </p>
            )}
            <p className="mt-1 flex items-center gap-1 text-sm font-bold text-olive">
              <Flame className="size-4" aria-hidden />
              {s.days}-day streak
              {firstThatDay && s.days > 0 && (
                <span className="rounded-full bg-olive-soft px-1.5 text-xs">+1</span>
              )}
            </p>
          </div>
        </div>

        {rateable.length > 0 && (
          <div className="mt-4">
            <p className="label-caps mb-2 text-muted-foreground">How did it taste?</p>
            <ul className="space-y-1.5">
              {rateable.map((item) => (
                <li key={item.name} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 truncate text-sm font-semibold">{item.name}</span>
                  {([1, -1] as const).map((value) => {
                    const Icon = value === 1 ? ThumbsUp : ThumbsDown;
                    const on = ratings[item.name] === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        aria-pressed={on}
                        aria-label={`${value === 1 ? "Liked" : "Didn't like"} ${item.name}`}
                        onClick={() => rate(item.name, value)}
                        className={cn(
                          "grid size-10 place-items-center rounded-full border",
                          on
                            ? "border-olive bg-olive text-primary-foreground"
                            : "border-foreground/20 text-muted-foreground",
                        )}
                      >
                        <Icon className="size-4" />
                      </button>
                    );
                  })}
                </li>
              ))}
            </ul>
          </div>
        )}

        <input
          ref={photoInput}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (!file) return;
            setUploading(true);
            await attachPhoto(entry.id, file);
            setUploading(false);
          }}
        />
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            disabled={uploading || !!entry.photoPath}
            className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-foreground/25 text-sm font-bold disabled:opacity-60"
          >
            {entry.photoPath ? (
              <>
                <Check className="size-4" /> Photo added
              </>
            ) : (
              <>
                <Camera className="size-4" /> {uploading ? "Uploading…" : "Add photo"}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() => {
              removeLog(entry.id);
              dismissLogged();
            }}
            className="flex h-12 items-center justify-center gap-1.5 rounded-full border border-foreground/25 text-sm font-bold"
          >
            <Undo2 className="size-4" /> Undo
          </button>
          <button
            type="button"
            onClick={() => {
              if (next) {
                setMeal(next);
                void navigate({ to: "/" });
              }
              dismissLogged();
            }}
            className="col-span-2 h-12 rounded-full bg-foreground text-base font-bold text-primary-foreground"
          >
            {next ? `Next up: ${isSnack(next) ? SNACKS[next].label : next}` : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
