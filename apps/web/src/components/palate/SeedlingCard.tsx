import { useEffect, useRef, useState } from "react";
import { Flame, Pause, Snowflake, Pencil } from "lucide-react";
import {
  CARDS_PER_MONTH,
  SPECIES,
  growthStage,
  renameSeedling,
  type Seedling,
  type Streak,
} from "@palate/core";
import { cn } from "@/lib/utils";
import { SeedlingAvatar } from "./SeedlingAvatar";
import { Switch } from "./Switch";

interface Props {
  seedling: Seedling;
  /** Days with a logged meal: drives growth. */
  daysShowedUp: number;
  /** Calendar days since sign-up, day one included. */
  daysTogether: number;
  checkedInToday: boolean;
  streak: Streak;
  /** A couple of days without logging: Seedling dozes until the next log. */
  sleepy: boolean;
  /** Tracking is paused: the streak holds still and nothing nudges. */
  paused: boolean;
  onPausedChange: (paused: boolean) => void;
  onChange: (next: Seedling) => void;
}

const formatDays = (dates: string[]) =>
  dates
    .map((d) =>
      new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        timeZone: "UTC",
      }),
    )
    .join(" and ");

/** Seedling grows from showing up: any logged meal counts, and missed days never undo it. */
export function SeedlingCard({
  seedling,
  daysShowedUp,
  daysTogether,
  checkedInToday,
  sleepy,
  streak,
  paused,
  onPausedChange,
  onChange,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(seedling.name);
  const input = useRef<HTMLInputElement>(null);

  // Select the current name so typing replaces it.
  useEffect(() => {
    if (editing) input.current?.select();
  }, [editing]);
  const stage = growthStage(daysShowedUp);
  // Tapping Seedling makes it hop; the key restarts the animation on every tap.
  const [hops, setHops] = useState(0);
  const species = SPECIES.find((s) => s.id === seedling.species)?.label;

  const save = () => {
    onChange(renameSeedling(seedling, draft));
    setEditing(false);
  };

  return (
    <section className="mt-5 rounded-2xl border border-foreground/15 bg-card p-4">
      <div className="grid grid-cols-[1fr_7.5rem] items-center gap-3">
        <div className="min-w-0">
          <p className="label-caps text-olive">
            Your companion · {species} · {stage.name}
          </p>
          {editing ? (
            <form
              className="mt-1 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
            >
              <label htmlFor="seedling-name" className="sr-only">
                Seedling's name
              </label>
              <input
                id="seedling-name"
                ref={input}
                value={draft}
                maxLength={24}
                onChange={(e) => setDraft(e.target.value)}
                className="h-9 min-w-0 flex-1 rounded-full border border-foreground/20 bg-background px-3 text-sm"
              />
              <button
                type="submit"
                className="rounded-full bg-foreground px-3 text-xs font-bold text-primary-foreground"
              >
                Save
              </button>
            </form>
          ) : (
            <h2 className="mt-1 flex items-center gap-2 font-display text-lg font-bold">
              {seedling.name}
              <button
                type="button"
                onClick={() => {
                  setDraft(seedling.name);
                  setEditing(true);
                }}
                aria-label={`Rename ${seedling.name}`}
                className="grid size-7 place-items-center rounded-full border border-foreground/20"
              >
                <Pencil className="size-3.5" />
              </button>
            </h2>
          )}
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {checkedInToday
              ? `Thanks for checking in today. ${seedling.name} is soaking it up.`
              : sleepy
                ? `Missed you! Log anything and ${seedling.name} will perk right up.`
                : `${seedling.name} grows a little each day you log a meal, any meal.`}
          </p>
          <p className="mt-2 text-xs font-bold text-olive">
            {daysTogether} {daysTogether === 1 ? "day" : "days"} together
          </p>
        </div>
        <button
          type="button"
          onClick={() => setHops((n) => n + 1)}
          aria-label={`Give ${seedling.name} a tap`}
          className="justify-self-center rounded-full"
        >
          <SeedlingAvatar
            key={hops}
            seedling={seedling}
            stage={stage.index}
            celebrate={checkedInToday && hops === 0}
            sleepy={sleepy}
            className={cn("h-28 w-28", hops > 0 && "pet-hop")}
          />
        </button>
      </div>

      <div className="mt-3">
        <div className="mb-1 flex justify-between text-[0.7rem] font-semibold text-muted-foreground">
          <span>{stage.name}</span>
          <span>
            {stage.nextName
              ? `${stage.toNext} more ${stage.toNext === 1 ? "day" : "days"} to ${stage.nextName}`
              : "Fully grown"}
          </span>
        </div>
        <div
          className="h-2.5 overflow-hidden rounded-full bg-foreground/10"
          role="progressbar"
          aria-label={`Growth toward ${stage.nextName ?? "full bloom"}`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(stage.progress * 100)}
        >
          <div
            className="h-full rounded-full bg-olive transition-[width] duration-500"
            style={{ width: `${Math.max(4, stage.progress * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-foreground/10 pt-3 text-xs">
        <p className="flex items-center gap-1.5 font-bold">
          {paused ? (
            <Pause className="size-4 text-muted-foreground" aria-hidden />
          ) : (
            <Flame className="size-4 text-olive" aria-hidden />
          )}
          {paused
            ? `Streak paused${streak.days > 0 ? ` at ${streak.days} days` : ""}`
            : streak.days > 0
              ? `${streak.days}-day streak`
              : "Log a meal to start a streak"}
          {!paused && streak.days > 0 && !streak.loggedToday && !streak.restingToday && (
            <span className="font-medium text-muted-foreground">· log today to keep it going</span>
          )}
        </p>
        <p className="flex items-center gap-1 text-muted-foreground">
          <Snowflake className="size-3.5" aria-hidden />
          {streak.cardsLeft} of {CARDS_PER_MONTH} cards left this month
        </p>
        {streak.frozen.length > 0 && (
          <p className="basis-full text-muted-foreground">
            {streak.frozen.length === 1 ? "A card" : "Cards"} covered {formatDays(streak.frozen)},
            so your streak kept going.
          </p>
        )}
      </div>

      <Switch
        label="Pause tracking"
        hint={
          paused
            ? `Your streak is on hold and ${seedling.name} keeps every bit of growth.`
            : "Take a break. Your streak holds and nothing resets."
        }
        checked={paused}
        onChange={onPausedChange}
        className="mt-3 border-t border-foreground/10 pt-3"
      />
    </section>
  );
}
