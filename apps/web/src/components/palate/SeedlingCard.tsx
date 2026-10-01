import { useEffect, useRef, useState } from "react";
import { Pencil } from "lucide-react";
import { SPECIES, growthStage, renameSeedling, type Seedling } from "@palate/core";
import { SeedlingAvatar } from "./SeedlingAvatar";

interface Props {
  seedling: Seedling;
  daysShowedUp: number;
  checkedInToday: boolean;
  onChange: (next: Seedling) => void;
}

/** Seedling grows from showing up: any logged meal counts, and missed days never undo it. */
export function SeedlingCard({ seedling, daysShowedUp, checkedInToday, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(seedling.name);
  const input = useRef<HTMLInputElement>(null);

  // Select the current name so typing replaces it.
  useEffect(() => {
    if (editing) input.current?.select();
  }, [editing]);
  const stage = growthStage(daysShowedUp);
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
              : `${seedling.name} grows a little each day you log a meal, any meal.`}
          </p>
          <p className="mt-2 text-xs font-bold text-olive">
            {daysShowedUp} {daysShowedUp === 1 ? "day" : "days"} together
            {stage.toNext > 0 ? ` · ${stage.toNext} more to grow` : ""}
          </p>
        </div>
        <SeedlingAvatar
          seedling={seedling}
          stage={stage.index}
          celebrate={checkedInToday}
          className="h-28 w-28 justify-self-center"
        />
      </div>
    </section>
  );
}
