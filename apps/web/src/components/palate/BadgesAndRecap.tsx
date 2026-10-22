import { useQuery } from "@tanstack/react-query";
import { Award, Compass, Flame, Lock, Utensils } from "lucide-react";
import {
  BADGES,
  earnedBadges,
  weeklyRecap,
  type BadgeId,
  type LoggedMeal,
  type TasteRating,
} from "@palate/core";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

const ICONS: Record<BadgeId, typeof Award> = {
  "first-plate": Utensils,
  "week-streak": Flame,
  "all-halls": Compass,
};

/** Your thumbs-up and thumbs-down, for the recap's favorite dish. Read-only here. */
function useTasteRatings(enabled: boolean) {
  return useQuery({
    queryKey: ["taste-ratings"],
    enabled,
    queryFn: async (): Promise<TasteRating[]> => {
      const { data, error } = await supabase
        .from("taste_ratings")
        .select("item_name, rating, created_at")
        .order("created_at", { ascending: false })
        .limit(500);
      if (error) throw error;
      return (data ?? []).map((r) => ({
        itemName: r.item_name as string,
        rating: r.rating as 1 | -1,
        date: new Date(r.created_at as string).toLocaleDateString("en-CA"),
      }));
    },
  });
}

export function Badges({ log }: { log: LoggedMeal[] }) {
  const earned = new Set(earnedBadges(log));
  return (
    <section className="mt-5 rounded-2xl border border-foreground/15 bg-card p-4">
      <h2 className="font-display text-lg font-bold">Badges</h2>
      <ul className="mt-3 grid grid-cols-3 gap-2">
        {BADGES.map((b) => {
          const has = earned.has(b.id);
          const Icon = has ? ICONS[b.id] : Lock;
          return (
            <li
              key={b.id}
              className={cn(
                "flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-center",
                has
                  ? "border-olive/40 bg-olive-soft"
                  : "border-foreground/10 text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid size-10 place-items-center rounded-full",
                  has ? "bg-olive text-primary-foreground" : "bg-foreground/5",
                )}
              >
                <Icon className="size-5" aria-hidden />
              </span>
              <span className="text-xs font-bold leading-tight">{b.name}</span>
              <span className="text-[0.65rem] leading-tight text-muted-foreground">
                {b.description}
              </span>
              <span className="sr-only">{has ? "Earned" : "Not earned yet"}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function WeeklyRecap({
  log,
  today,
  signedIn,
}: {
  log: LoggedMeal[];
  today: string;
  signedIn: boolean;
}) {
  const { data: ratings = [] } = useTasteRatings(signedIn);
  const recap = weeklyRecap(log, ratings, today);
  return (
    <section className="mt-5 rounded-2xl border border-foreground/15 bg-card p-4">
      <h2 className="font-display text-lg font-bold">This week</h2>
      <dl className="mt-3 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-foreground/5 px-3 py-2.5">
          <dt className="label-caps text-muted-foreground">Meals logged</dt>
          <dd className="font-display text-2xl font-extrabold">{recap.meals}</dd>
        </div>
        <div className="rounded-xl bg-foreground/5 px-3 py-2.5">
          <dt className="label-caps text-muted-foreground">Halls visited</dt>
          <dd className="font-display text-2xl font-extrabold">{recap.halls} of 3</dd>
        </div>
        {recap.favorite && (
          <div className="col-span-2 rounded-xl bg-olive-soft px-3 py-2.5">
            <dt className="label-caps text-olive">Favorite dish</dt>
            <dd className="font-display font-bold">{recap.favorite}</dd>
          </div>
        )}
      </dl>
    </section>
  );
}
