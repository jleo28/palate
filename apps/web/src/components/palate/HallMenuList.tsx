import { useMemo } from "react";
import { Plus } from "lucide-react";
import {
  CONFIRM_WITH_STAFF,
  allergenConflicts,
  allergenLabel,
  customAllergyMatches,
  dislikedMatches,
  type HallId,
  type MenuItem,
  type MealPeriod,
} from "@palate/core";
import { MacroText } from "@/components/palate/MacroText";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/palate/store";

interface Props {
  /** The hall's menu for today. */
  items: MenuItem[];
  hall: HallId;
  period: MealPeriod;
  loading: boolean;
  /** Extra filter on top of hall and meal (Hall Menus' chips). */
  filter?: (item: MenuItem) => boolean;
  /** Shown when nothing matches and the menu has loaded. Defaults to "not on the menu". */
  emptyText?: string | undefined;
  onAdd: (item: MenuItem) => void;
}

/** A hall's menu by station, each item with a + to add it to the plate. Used by Hall Menus
 * and The Plate's "Add items" sheet. */
export function HallMenuList({ items, hall, period, loading, filter, emptyText, onAdd }: Props) {
  const { profile } = useStore();
  const allergies = profile?.allergies ?? [];

  const stations = useMemo(() => {
    const map = new Map<string, MenuItem[]>();
    for (const i of items) {
      if (i.hall !== hall || !i.meals.includes(period) || (filter && !filter(i))) continue;
      const list = map.get(i.station) ?? [];
      list.push(i);
      map.set(i.station, list);
    }
    return [...map.entries()];
  }, [items, hall, period, filter]);

  return (
    <div className="space-y-5">
      {stations.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">
          {loading
            ? "Loading today's menu…"
            : (emptyText ?? `${period} isn't on today's menu here.`)}
        </p>
      )}
      {stations.map(([station, list]) => (
        <section key={station}>
          <h2 className="label-caps mb-2 text-olive">{station}</h2>
          <div className="space-y-2">
            {list.map((i) => {
              const hits = allergenConflicts(i, allergies);
              const possible = customAllergyMatches(i, profile?.customAllergies);
              const dislikes = dislikedMatches(i, profile?.dislikes);
              return (
                <div
                  key={i.id}
                  className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-foreground/15 bg-card px-3.5 py-3"
                >
                  <div className="min-w-0">
                    <p className="flex items-center gap-1.5 font-display text-[0.95rem] font-bold">
                      {(hits.length > 0 || possible.length > 0) && (
                        <span
                          className="size-2 shrink-0 rounded-full bg-destructive"
                          title={`Contains ${hits.map(allergenLabel).join(", ")}`}
                          aria-label={`Allergen warning: contains ${hits.map(allergenLabel).join(", ")}`}
                        />
                      )}
                      {dislikes.length > 0 && (
                        <span
                          className="shrink-0 text-base leading-none text-muted-foreground"
                          aria-label={`Not preferred: ${dislikes.map((item) => item.label).join(", ")}`}
                          title="Not preferred"
                        >
                          ~
                        </span>
                      )}
                      <span className="truncate">{i.name}</span>
                    </p>
                    <p className="mt-0.5 text-[0.72rem] text-muted-foreground">
                      per {i.unit}
                      <MacroText m={i} prefix=" · " />
                    </p>
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
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => onAdd(i)}
                    className="size-10 shrink-0 rounded-full"
                    aria-label={`Add ${i.name} to your plate`}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
