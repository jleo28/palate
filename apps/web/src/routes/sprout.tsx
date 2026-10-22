import { createFileRoute } from "@tanstack/react-router";
import {
  daysShowedUp,
  daysTogether,
  isPaused,
  isRestDay,
  isSleepy,
  setPaused,
  streak,
} from "@palate/core";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { SeedlingCard } from "@/components/palate/SeedlingCard";
import { today as localToday } from "@/lib/palate/dates";
import { useStore } from "@/lib/palate/store";
import { useRequireProfile } from "@/lib/palate/useRequireProfile";

export const Route = createFileRoute("/sprout")({
  head: () => ({ meta: [{ title: "Sprout | Palate" }] }),
  component: SproutScreen,
});

/** Your companion, its growth, your streak and this month's cards. */
function SproutScreen() {
  const { ready, profile, log, saveProfile } = useStore();
  useRequireProfile();

  if (!ready || !profile?.seedling) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-muted-foreground">Loading…</div>
      </AppShell>
    );
  }

  const today = localToday();
  const currentStreak = streak(
    log.map((l) => l.date),
    today,
    (d) => isRestDay(profile.wellbeing, d),
    profile.cardSpends,
  );

  return (
    <AppShell>
      <ScreenHeader title="Sprout" sub="Your companion" />
      <SeedlingCard
        seedling={profile.seedling}
        daysShowedUp={daysShowedUp(log)}
        daysTogether={daysTogether(profile.createdOn, today)}
        checkedInToday={log.some((l) => l.date === today)}
        sleepy={
          !isPaused(profile.wellbeing) &&
          isSleepy(
            log.map((l) => l.date),
            today,
            (d) => isRestDay(profile.wellbeing, d),
          )
        }
        streak={currentStreak}
        paused={isPaused(profile.wellbeing)}
        onPausedChange={(pause) =>
          void saveProfile({ ...profile, wellbeing: setPaused(profile.wellbeing, today, pause) })
        }
        onChange={(seedling) => void saveProfile({ ...profile, seedling })}
      />
    </AppShell>
  );
}
