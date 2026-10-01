import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Wordmark } from "@/components/palate/AppShell";
import { MacroRow } from "@/components/palate/MacroBits";
import { GoalPicker } from "@/components/palate/GoalPicker";
import { CustomAllergyInput } from "@/components/palate/CustomAllergyInput";
import {
  effectiveGoal,
  dailyTargets,
  mealTargets,
  ALLERGENS,
  allergenLabel,
  type Allergen,
  type DietTag,
  type GoalId,
  type HallId,
  type Profile,
} from "@palate/core";
import { HALLS } from "@/lib/palate/halls";
import { useStore } from "@/lib/palate/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/onboarding")({
  head: () => ({
    meta: [
      { title: "Set up your Palate Student Pass" },
      {
        name: "description",
        content:
          "Three quick steps: your stats, your goal, your USC dining hall. Palate does the macro math.",
      },
      { property: "og:title", content: "Set up your Palate Student Pass" },
      {
        property: "og:description",
        content: "Three quick steps: your stats, your goal, your USC dining hall.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Onboarding,
});

const DIETS: { id: DietTag; label: string }[] = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "halal", label: "Halal" },
  { id: "gluten-free", label: "Gluten-Free" },
  { id: "dairy-free", label: "Dairy-Free" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="label-caps text-muted-foreground">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  );
}

const inputCls =
  "w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 text-base font-medium outline-none focus:border-olive focus:ring-2 focus:ring-olive/25";

function Chip({
  active,
  destructive,
  children,
  onClick,
}: {
  active: boolean;
  destructive?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-3.5 py-2 text-sm font-semibold transition-colors",
        active
          ? destructive
            ? "border-destructive bg-destructive text-white"
            : "border-olive bg-olive text-primary-foreground"
          : "border-foreground/20 bg-background text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function Onboarding() {
  const navigate = useNavigate();
  const { profile, saveProfile } = useStore();
  const [step, setStep] = useState(0);

  const [name, setName] = useState(profile?.name ?? "");
  const [age, setAge] = useState(String(profile?.age ?? 20));
  const [gender, setGender] = useState<Profile["gender"]>(profile?.gender ?? "female");
  const [ft, setFt] = useState(String(Math.floor((profile?.heightIn ?? 66) / 12)));
  const [inch, setInch] = useState(String((profile?.heightIn ?? 66) % 12));
  const [weight, setWeight] = useState(String(profile?.weightLb ?? 150));
  const [goal, setGoal] = useState<GoalId>(profile?.goal ?? "maintain");
  const [highProtein, setHighProtein] = useState(profile?.highProtein ?? false);
  const [diets, setDiets] = useState<DietTag[]>(profile?.diets ?? []);
  const [allergies, setAllergies] = useState<Allergen[]>(profile?.allergies ?? []);
  const [customAllergies, setCustomAllergies] = useState<string[]>(profile?.customAllergies ?? []);
  const [hall, setHall] = useState<HallId>(profile?.hall ?? "village");

  const draft: Profile = {
    name: name.trim() || "Trojan",
    age: Number(age) || 20,
    gender,
    heightIn: (Number(ft) || 5) * 12 + (Number(inch) || 6),
    weightLb: Number(weight) || 150,
    goal,
    highProtein,
    diets,
    allergies,
    customAllergies,
    dislikes: profile?.dislikes ?? [],
    hall,
    ...(profile?.seedling ? { seedling: profile.seedling } : {}),
  };

  const daily = dailyTargets(draft);
  const perMeal = mealTargets(daily, "Lunch");

  const finish = () => {
    saveProfile({ ...draft, goal: effectiveGoal(draft) });
    void navigate({ to: "/" });
  };

  return (
    <div className="mx-auto w-full max-w-md px-4 pb-16 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <Wordmark />
        <span className="label-caps text-muted-foreground">Step {step + 1} of 3</span>
      </div>

      <div className="mb-6 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn("h-1.5 flex-1 rounded-full", i <= step ? "bg-olive" : "bg-foreground/15")}
          />
        ))}
      </div>

      {step === 0 && (
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold">Student Pass</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              The basics behind your macro math. Nothing leaves your phone.
            </p>
          </div>

          <div className="card-edge space-y-4 rounded-2xl bg-card p-4">
            <Field label="Name on card">
              <input
                className={inputCls}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jasmine M."
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Age">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </Field>
              <Field label="Gender">
                <select
                  className={inputCls}
                  value={gender}
                  onChange={(e) => setGender(e.target.value as Profile["gender"])}
                >
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="other">Other</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Height (ft)">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={ft}
                  onChange={(e) => setFt(e.target.value)}
                />
              </Field>
              <Field label="Height (in)">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={inch}
                  onChange={(e) => setInch(e.target.value)}
                />
              </Field>
            </div>
            <div className="space-y-4">
              <Field label="Weight (lb)">
                <input
                  className={inputCls}
                  inputMode="numeric"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Field>
            </div>
          </div>
        </section>
      )}

      {step === 1 && (
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold">Goal & Preferences</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Pick a direction — targets update live.
            </p>
          </div>

          <GoalPicker
            body={draft}
            goal={goal}
            highProtein={highProtein}
            onGoal={setGoal}
            onHighProtein={setHighProtein}
          />

          <div>
            <p className="label-caps mb-2 text-muted-foreground">Dietary filters</p>
            <div className="flex flex-wrap gap-2">
              {DIETS.map((d) => (
                <Chip
                  key={d.id}
                  active={diets.includes(d.id)}
                  onClick={() =>
                    setDiets((prev) =>
                      prev.includes(d.id) ? prev.filter((x) => x !== d.id) : [...prev, d.id],
                    )
                  }
                >
                  {d.label}
                </Chip>
              ))}
            </div>
          </div>

          <div>
            <p className="label-caps mb-2 text-muted-foreground">Allergies</p>
            <div className="flex flex-wrap gap-2">
              {ALLERGENS.map((a) => (
                <Chip
                  key={a.id}
                  active={allergies.includes(a.id)}
                  destructive={allergies.includes(a.id)}
                  onClick={() =>
                    setAllergies((prev) =>
                      prev.includes(a.id) ? prev.filter((x) => x !== a.id) : [...prev, a.id],
                    )
                  }
                >
                  {allergenLabel(a.id)}
                </Chip>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              We flag menu items USC lists as containing these.
            </p>
            <div className="mt-3">
              <CustomAllergyInput value={customAllergies} onChange={setCustomAllergies} />
            </div>
          </div>

          <div className="card-edge rounded-2xl bg-card p-4">
            <p className="label-caps mb-2 text-muted-foreground">Daily target</p>
            <MacroRow t={daily} />
            <p className="mt-3 text-xs text-muted-foreground">
              Roughly {perMeal.kcal} cal and {perMeal.protein}g protein per main meal.
            </p>
          </div>
        </section>
      )}

      {step === 2 && (
        <section className="space-y-4">
          <div>
            <h1 className="text-2xl font-extrabold">Your Hall</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Choose the hall you swipe into most. You can switch any time.
            </p>
          </div>

          <p className="inline-flex items-center gap-1.5 rounded-full bg-olive-soft px-3 py-1 text-xs font-bold text-olive">
            <Check className="size-3.5" aria-hidden /> University of Southern California · your
            campus
          </p>

          <div className="space-y-2.5">
            {HALLS.map((h) => (
              <button
                key={h.id}
                type="button"
                onClick={() => setHall(h.id)}
                className={cn(
                  "flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition-colors",
                  hall === h.id
                    ? "border-olive bg-olive text-primary-foreground"
                    : "border-foreground/20 bg-card",
                )}
              >
                <span className="min-w-0">
                  <span className="font-display block font-bold">{h.name}</span>
                  <span className="block truncate text-[0.72rem] opacity-80">{h.blurb}</span>
                </span>
                {hall === h.id && <Check className="size-5 shrink-0" />}
              </button>
            ))}
          </div>
        </section>
      )}

      <div className="mt-7 flex items-center gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => setStep((s) => s - 1)}
            className="grid size-12 shrink-0 place-items-center rounded-full border border-foreground/25"
          >
            <ArrowLeft className="size-5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-full bg-foreground text-base font-bold text-primary-foreground active:translate-y-px"
        >
          {step === 2 ? "Make my Palate card" : "Continue"}
          <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
