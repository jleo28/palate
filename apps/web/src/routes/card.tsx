import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronDown, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppShell, ScreenHeader } from "@/components/palate/AppShell";
import { MacroBar } from "@/components/palate/MacroBits";
import { GoalPet } from "@/components/palate/GoalPet";
import { Button } from "@/components/ui/button";
import { GoalPicker } from "@/components/palate/GoalPicker";
import { CustomAllergyInput } from "@/components/palate/CustomAllergyInput";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GOALS,
  effectiveGoal,
  type Allergen,
  type DietTag,
  type DislikeId,
  type GoalId,
  type HallId,
  ALLERGENS,
  allergenLabel,
  DISLIKES,
} from "@palate/core";
import { HALLS, hallName } from "@/lib/palate/halls";
import { useStore } from "@/lib/palate/store";
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

const DIETS: DietTag[] = ["vegetarian", "vegan", "halal", "gluten-free", "dairy-free"];

function CardScreen() {
  const navigate = useNavigate();
  const { ready, profile, saveProfile, daily, consumedToday, log, addLog, removeLog } = useStore();
  const [editing, setEditing] = useState(false);
  const [allergyOpen, setAllergyOpen] = useState(false);
  const [outsideOpen, setOutsideOpen] = useState(false);
  const [outsideMacros, setOutsideMacros] = useState({ kcal: "", protein: "", carbs: "", fat: "" });

  useEffect(() => {
    if (ready && !profile) void navigate({ to: "/welcome" });
  }, [ready, profile, navigate]);

  if (!ready || !profile || !daily) {
    return (
      <AppShell>
        <div className="py-24 text-center text-sm text-muted-foreground">Loading your card…</div>
      </AppShell>
    );
  }

  const today = new Date().toISOString().slice(0, 10);
  const allAllergies = [
    ...(profile.allergies ?? []).map(allergenLabel),
    ...(profile.customAllergies ?? []),
  ];
  const todaysLog = log.filter((l) => l.date === today);
  const totalsByDay = log.reduce<Record<string, { kcal: number; protein: number }>>(
    (days, meal) => {
      const total = days[meal.date] ?? { kcal: 0, protein: 0 };
      days[meal.date] = { kcal: total.kcal + meal.kcal, protein: total.protein + meal.protein };
      return days;
    },
    {},
  );
  const completedDays = Object.values(totalsByDay).filter(
    (total) => total.kcal >= daily.kcal * 0.9 && total.protein >= daily.protein * 0.9,
  ).length;
  const metToday =
    consumedToday.kcal >= daily.kcal * 0.9 && consumedToday.protein >= daily.protein * 0.9;
  const startOfWeek = new Date();
  const day = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - ((day + 6) % 7));
  const weekStart = startOfWeek.toISOString().slice(0, 10);
  const weeklyDays = Object.entries(totalsByDay).filter(
    ([date, total]) =>
      date >= weekStart && total.kcal >= daily.kcal * 0.9 && total.protein >= daily.protein * 0.9,
  ).length;

  const logOutsideMeal = () => {
    const values = {
      kcal: Math.max(0, Number(outsideMacros.kcal) || 0),
      protein: Math.max(0, Number(outsideMacros.protein) || 0),
      carbs: Math.max(0, Number(outsideMacros.carbs) || 0),
      fat: Math.max(0, Number(outsideMacros.fat) || 0),
    };
    if (values.kcal === 0 && values.protein === 0 && values.carbs === 0 && values.fat === 0) return;
    addLog({
      hall: profile.hall,
      meal: "Lunch",
      ...values,
      items: [{ name: "Outside dining hall", portion: "Estimated" }],
      source: "outside",
    });
    setOutsideMacros({ kcal: "", protein: "", carbs: "", fat: "" });
    setOutsideOpen(false);
    toast.success("Outside meal added to your macro bank");
  };

  return (
    <AppShell>
      <ScreenHeader title="My Palate Card" sub="Profile & stats" />

      {/* Student ID card */}
      <section className="card-edge relative overflow-hidden rounded-3xl bg-card p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display text-4xl font-extrabold tracking-tight">Palate</p>
            <p className="label-caps mt-1 text-muted-foreground">USC · {hallName(profile.hall)}</p>
          </div>
          <span className="size-12 rounded-xl bg-olive" />
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
            <p className="label-caps text-muted-foreground">Weight</p>
            <p className="font-display font-bold">{profile.weightLb} lb</p>
          </div>
          <div>
            <p className="label-caps text-muted-foreground">Daily</p>
            <p className="font-display font-bold">{daily.kcal} cal</p>
          </div>
        </div>

        <div className="mt-5 h-6 rounded-md bg-foreground" />
      </section>

      <GoalPet completedDays={completedDays} metToday={metToday} weeklyDays={weeklyDays} />

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

      <Dialog open={outsideOpen} onOpenChange={setOutsideOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Estimate your meal</DialogTitle>
            <DialogDescription>
              Add what you know. Any blank value counts as zero.
            </DialogDescription>
          </DialogHeader>
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
                  value={outsideMacros[key]}
                  onChange={(event) =>
                    setOutsideMacros((current) => ({ ...current, [key]: event.target.value }))
                  }
                  className="mt-1 w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive"
                  placeholder="0"
                />
              </label>
            ))}
          </div>
          <Button
            type="button"
            onClick={logOutsideMeal}
            disabled={!Object.values(outsideMacros).some((value) => Number(value) > 0)}
            className="h-11 w-full rounded-full font-bold"
          >
            Add to macro bank
          </Button>
        </DialogContent>
      </Dialog>

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
                      ? "Outside dining hall"
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

      {/* Settings */}
      <section className="mt-5 rounded-2xl border border-foreground/15 bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-bold">Goals & settings</h2>
          <button
            onClick={() => setEditing((e) => !e)}
            className="flex items-center gap-1.5 rounded-full border border-foreground/25 px-3 py-1.5 text-xs font-bold"
          >
            <Pencil className="size-3.5" /> {editing ? "Done" : "Edit"}
          </button>
        </div>

        <Tabs defaultValue="goals">
          <TabsList className="mb-4 grid h-10 w-full grid-cols-2 rounded-xl">
            <TabsTrigger value="goals" className="rounded-lg">
              Goals & settings
            </TabsTrigger>
            <TabsTrigger value="preferences" className="rounded-lg">
              Preferences
            </TabsTrigger>
          </TabsList>
          <TabsContent value="goals" className="mt-0">
            {editing ? (
              <div className="space-y-4">
                <div>
                  <p className="label-caps mb-2 text-muted-foreground">Goal</p>
                  <GoalPicker
                    compact
                    body={profile}
                    goal={profile.goal}
                    highProtein={profile.highProtein ?? false}
                    onGoal={(goal) => saveProfile({ ...profile, goal })}
                    onHighProtein={(highProtein) => saveProfile({ ...profile, highProtein })}
                  />
                </div>

                <div>
                  <p className="label-caps mb-2 text-muted-foreground">Dietary filters</p>
                  <div className="flex flex-wrap gap-2">
                    {DIETS.map((d) => (
                      <button
                        key={d}
                        onClick={() =>
                          saveProfile({
                            ...profile,
                            diets: profile.diets.includes(d)
                              ? profile.diets.filter((x) => x !== d)
                              : [...profile.diets, d],
                          })
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-xs font-semibold capitalize",
                          profile.diets.includes(d)
                            ? "border-olive bg-olive text-primary-foreground"
                            : "border-foreground/20 text-muted-foreground",
                        )}
                      >
                        {d.replace("-", " ")}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => setAllergyOpen((o) => !o)}
                    aria-expanded={allergyOpen}
                    className="flex w-full items-center justify-between rounded-xl border border-foreground/20 px-3 py-2.5"
                  >
                    <span className="text-left">
                      <span className="label-caps block text-muted-foreground">Allergies</span>
                      <span className="mt-0.5 block text-sm font-semibold">
                        {allAllergies.length ? allAllergies.join(", ") : "None selected"}
                      </span>
                    </span>
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 text-muted-foreground transition-transform",
                        allergyOpen && "rotate-180",
                      )}
                    />
                  </button>
                  {allergyOpen && (
                    <div className="mt-2 space-y-3 rounded-xl border border-foreground/15 bg-background p-3">
                      <div className="flex flex-wrap gap-2">
                        {ALLERGENS.map((a) => {
                          const active = profile.allergies?.includes(a.id) ?? false;
                          return (
                            <button
                              key={a.id}
                              type="button"
                              onClick={() =>
                                saveProfile({
                                  ...profile,
                                  allergies: active
                                    ? (profile.allergies ?? []).filter((x) => x !== a.id)
                                    : [...(profile.allergies ?? []), a.id as Allergen],
                                })
                              }
                              className={cn(
                                "rounded-full border px-3 py-1.5 text-xs font-semibold",
                                active
                                  ? "border-destructive bg-destructive text-destructive-foreground"
                                  : "border-foreground/20 text-muted-foreground",
                              )}
                            >
                              {a.label}
                            </button>
                          );
                        })}
                      </div>
                      <CustomAllergyInput
                        value={profile.customAllergies ?? []}
                        onChange={(customAllergies) => saveProfile({ ...profile, customAllergies })}
                      />
                    </div>
                  )}
                </div>

                <div>
                  <p className="label-caps mb-2 text-muted-foreground">Primary hall</p>
                  <div className="grid grid-cols-3 gap-2">
                    {HALLS.map((h) => (
                      <button
                        key={h.id}
                        onClick={() => saveProfile({ ...profile, hall: h.id as HallId })}
                        className={cn(
                          "rounded-xl border px-2 py-2 text-sm font-bold",
                          profile.hall === h.id
                            ? "border-olive bg-olive text-primary-foreground"
                            : "border-foreground/20",
                        )}
                      >
                        {h.short}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="label-caps mb-2 text-muted-foreground">Current weight (lb)</p>
                  <input
                    inputMode="numeric"
                    value={profile.weightLb}
                    onChange={(e) =>
                      saveProfile({ ...profile, weightLb: Number(e.target.value) || 0 })
                    }
                    className="w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive"
                  />
                </div>

                <button
                  onClick={() => void navigate({ to: "/onboarding" })}
                  className="w-full rounded-full border border-foreground/25 py-2.5 text-sm font-bold"
                >
                  Redo full setup
                </button>
              </div>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Dietary</dt>
                  <dd className="font-semibold capitalize">
                    {profile.diets.length
                      ? profile.diets.map((d) => d.replace("-", " ")).join(", ")
                      : "No filters"}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-muted-foreground">Allergies</dt>
                  <dd
                    className={cn(
                      "text-right font-semibold",
                      allAllergies.length && "text-destructive",
                    )}
                  >
                    {allAllergies.length ? allAllergies.join(", ") : "None"}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Primary hall</dt>
                  <dd className="font-semibold">{hallName(profile.hall)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Height</dt>
                  <dd className="font-semibold">
                    {Math.floor(profile.heightIn / 12)}'{profile.heightIn % 12}"
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Protein target</dt>
                  <dd className="font-semibold">{daily.protein}g / day</dd>
                </div>
              </dl>
            )}
          </TabsContent>
          <TabsContent value="preferences" className="mt-0">
            <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
              Choose foods you’d rather skip. They’re left off your plates and get a gray ~ on
              menus.
            </p>
            <div className="flex flex-wrap gap-2">
              {DISLIKES.map((preference) => {
                const active = profile.dislikes?.includes(preference.id) ?? false;
                return (
                  <button
                    key={preference.id}
                    type="button"
                    onClick={() =>
                      saveProfile({
                        ...profile,
                        dislikes: active
                          ? (profile.dislikes ?? []).filter((id) => id !== preference.id)
                          : [...(profile.dislikes ?? []), preference.id as DislikeId],
                      })
                    }
                    className={cn(
                      "rounded-full border px-3 py-1.5 text-xs font-semibold",
                      active
                        ? "border-muted-foreground bg-muted text-foreground"
                        : "border-foreground/20 text-muted-foreground",
                    )}
                  >
                    {preference.label}
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </section>
    </AppShell>
  );
}
