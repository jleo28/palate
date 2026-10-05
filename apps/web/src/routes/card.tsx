import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { MacroBar } from "@/components/palate/MacroBits";
import { SeedlingCard } from "@/components/palate/SeedlingCard";
import { SeedlingHint } from "@/components/palate/SeedlingHint";
import { Button } from "@/components/ui/button";
import { CardSettings } from "@/components/palate/CardSettings";
import { PalateCard } from "@/components/palate/PalateCard";
import { OutsideMealDialog } from "@/components/palate/OutsideMealDialog";
import { ProgressRing } from "@/components/palate/ProgressRing";
import { GOALS, allergenLabel, daysShowedUp, effectiveGoal, streak } from "@palate/core";
import { hallName } from "@/lib/palate/halls";
import { today as localToday } from "@/lib/palate/dates";
import { useStore } from "@/lib/palate/store";
import { useRequireProfile } from "@/lib/palate/useRequireProfile";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/card")({
  head: () => ({
    meta: [
      { title: "My Palate Card — macro bank & goals" },
      {
        name: "description",
        content:
          "Your digital Palate student card: today's macro bank, meals logged at USC dining halls, and editable goals and dietary filters.",
      },
      { property: "og:title", content: "My Palate Card — macro bank & goals" },
      {
        property: "og:description",
        content: "Track consumed vs remaining macros and edit your goal any time.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: CardScreen,
});

function CardScreen() {
  const navigate = useNavigate();
  const {
    ready,
    session,
    profile,
    saveProfile,
    daily,
    consumedToday,
    log,
    addLog,
    removeLog,
    resetAll,
    signOut,
  } = useStore();
  const [outsideOpen, setOutsideOpen] = useState(false);

  useRequireProfile();

  if (!ready || !profile || !daily) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-muted-foreground">Loading your card…</div>
      </AppShell>
    );
  }

  const today = localToday();
  const allAllergies = [
    ...(profile.allergies ?? []).map(allergenLabel),
    ...(profile.customAllergies ?? []),
  ];
  const todaysLog = log.filter((l) => l.date === today);
  const showedUp = daysShowedUp(log);
  const checkedInToday = todaysLog.length > 0;

  return (
    <AppShell>
      <ScreenHeader title="My Palate Card" sub="Profile & stats" />
      {profile.seedling && <SeedlingHint screen="card" seedling={profile.seedling} />}

      <PalateCard
        front={
          <>
            <div className="flex items-start justify-between gap-3 pr-10">
              <div>
                <p className="font-display text-4xl font-extrabold tracking-tight">Palate</p>
                <p className="label-caps mt-1 text-muted-foreground">
                  USC · {hallName(profile.hall)}
                </p>
              </div>
              <ProgressRing value={consumedToday.kcal} target={daily.kcal} />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-y-3">
              <div>
                <p className="label-caps text-muted-foreground">Name</p>
                <p className="font-display font-bold">{profile.name}</p>
              </div>
              <div>
                <p className="label-caps text-muted-foreground">Goal</p>
                <p className="font-display font-bold">
                  {GOALS.find((g) => g.id === effectiveGoal(profile))?.label}
                  {profile.highProtein ? " · High Protein" : ""}
                </p>
              </div>
              <div>
                <p className="label-caps text-muted-foreground">Height · weight</p>
                <p className="font-display font-bold">
                  {Math.floor(profile.heightIn / 12)}'{profile.heightIn % 12}" · {profile.weightLb}{" "}
                  lb
                </p>
              </div>
              <div>
                <p className="label-caps text-muted-foreground">Daily</p>
                <p className="font-display font-bold">{daily.kcal} cal</p>
              </div>
              <div className="col-span-2">
                <p className="label-caps text-muted-foreground">Allergies</p>
                <p
                  className={cn(
                    "font-display font-bold",
                    allAllergies.length && "text-destructive",
                  )}
                >
                  {allAllergies.length ? allAllergies.join(", ") : "None"}
                </p>
              </div>
            </div>

            <div className="mt-5 h-6 rounded-md bg-foreground" />
          </>
        }
        back={
          <>
            <h2 className="mb-4 pr-10 font-display text-xl font-bold">Goals & settings</h2>
            <CardSettings
              key={JSON.stringify(profile)}
              profile={profile}
              onSave={(next) => {
                void saveProfile(next);
                toast.success("Saved. Your plates will follow these settings.");
              }}
              email={session?.user.email}
              onSignOut={() => void signOut().then(() => navigate({ to: "/welcome" }))}
              onStartOver={() => {
                void resetAll().then(() => navigate({ to: "/onboarding" }));
              }}
            />
          </>
        }
      />

      {profile.seedling && (
        <SeedlingCard
          seedling={profile.seedling}
          daysShowedUp={showedUp}
          checkedInToday={checkedInToday}
          streak={streak(
            log.map((l) => l.date),
            today,
          )}
          onChange={(seedling) => void saveProfile({ ...profile, seedling })}
        />
      )}

      {/* Macro bank */}
      <section className="mt-5 rounded-2xl border border-foreground/15 bg-card p-4">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-lg font-bold">Today's macro bank</h2>
          <span className="text-xs font-semibold text-olive">
            {todaysLog.length} {todaysLog.length === 1 ? "meal" : "meals"} logged
          </span>
        </div>
        <div className="space-y-3">
          <MacroBar label="Calories" value={consumedToday.kcal} target={daily.kcal} unit="" />
          <MacroBar label="Protein" value={consumedToday.protein} target={daily.protein} />
          <MacroBar label="Carbs" value={consumedToday.carbs} target={daily.carbs} />
          <MacroBar label="Fat" value={consumedToday.fat} target={daily.fat} />
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setOutsideOpen(true)}
          className="mt-4 h-11 w-full rounded-full font-bold"
        >
          <Plus className="size-4" /> Ate outside dining hall
        </Button>
      </section>

      <OutsideMealDialog
        open={outsideOpen}
        onOpenChange={setOutsideOpen}
        onLog={({ name, meal, ...macros }) => {
          addLog({
            hall: profile.hall,
            meal,
            ...macros,
            items: [{ name, portion: "Estimated" }],
            source: "outside",
          });
          setOutsideOpen(false);
          toast.success(`Added to today's ${meal.toLowerCase()}`);
        }}
      />

      {/* Logged meals */}
      {todaysLog.length > 0 && (
        <section className="mt-5">
          <h2 className="label-caps mb-2 text-muted-foreground">Logged today</h2>
          <div className="space-y-2">
            {todaysLog.map((l) => (
              <div
                key={l.id}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 rounded-2xl border border-foreground/15 bg-card px-3.5 py-3"
              >
                <div className="min-w-0">
                  <p className="font-display text-sm font-bold">
                    {l.source === "outside"
                      ? `${l.meal} · outside the halls`
                      : `${l.meal} · ${hallName(l.hall)}`}
                  </p>
                  <p className="truncate text-[0.72rem] text-muted-foreground">
                    {l.items.map((i) => `${i.portion} ${i.name}`).join(", ")}
                  </p>
                  <p className="mt-0.5 text-[0.72rem] font-semibold text-olive">
                    {Math.round(l.kcal)} cal · {Math.round(l.protein)}g protein
                  </p>
                </div>
                <button
                  onClick={() => removeLog(l.id)}
                  aria-label="Remove logged meal"
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-foreground/25"
                >
                  <Trash2 className="size-4" />
                </button>
              </div>
            ))}
          </div>
        </section>
      )}
    </AppShell>
  );
}
