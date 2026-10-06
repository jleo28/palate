import { useState } from "react";
import {
  ALLERGENS,
  DISLIKES,
  effectiveGoal,
  feetAndInches,
  heightIn,
  type Allergen,
  type DietTag,
  type DislikeId,
  type Profile,
} from "@palate/core";
import { HALLS } from "@/lib/palate/halls";
import { cn } from "@/lib/utils";
import { CustomAllergyInput } from "./CustomAllergyInput";
import { GoalPicker } from "./GoalPicker";
import { SnackPicker } from "./SnackPicker";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const DIETS: DietTag[] = ["vegetarian", "vegan", "halal", "gluten-free", "dairy-free"];

const toggle = <T,>(list: T[], value: T) =>
  list.includes(value) ? list.filter((x) => x !== value) : [...list, value];

const chip = "rounded-full border px-3 py-1.5 text-xs font-semibold";
const field =
  "mt-1 w-full rounded-xl border border-foreground/20 bg-background px-3 py-2.5 font-medium outline-none focus:border-olive";

interface Props {
  profile: Profile;
  onSave: (next: Profile) => void;
  onStartOver: () => void;
  email: string | undefined;
  onSignOut: () => void;
}

/** The back of the card: goals and settings, edited as a draft until "Save changes". */
export function CardSettings({ profile, onSave, onStartOver, email, onSignOut }: Props) {
  const [draft, setDraft] = useState(profile);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [feet, setFeet] = useState(String(feetAndInches(profile.heightIn).feet));
  const [inches, setInches] = useState(String(feetAndInches(profile.heightIn).inches));
  const set = (patch: Partial<Profile>) => setDraft((d) => ({ ...d, ...patch }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(profile);

  return (
    <div className="space-y-5">
      <div>
        <p className="label-caps mb-2 text-muted-foreground">Goal</p>
        <GoalPicker
          compact
          body={draft}
          goal={draft.goal}
          highProtein={draft.highProtein ?? false}
          onGoal={(goal) => set({ goal })}
          onHighProtein={(highProtein) => set({ highProtein })}
        />
        <div className="mt-4">
          <SnackPicker value={draft.snacks ?? []} onChange={(snacks) => set({ snacks })} />
        </div>
      </div>

      <div className="rounded-2xl border-2 border-olive bg-olive-soft p-3">
        <p className="label-caps text-olive">Foods you skip</p>
        <p className="mt-0.5 mb-2 text-xs text-muted-foreground">
          Left off your plates entirely, and marked with a gray ~ on menus.
        </p>
        <div className="flex flex-wrap gap-2">
          {DISLIKES.map((d) => {
            const active = draft.dislikes.includes(d.id);
            return (
              <button
                key={d.id}
                type="button"
                aria-pressed={active}
                onClick={() => set({ dislikes: toggle<DislikeId>(draft.dislikes, d.id) })}
                className={cn(
                  chip,
                  active
                    ? "border-olive bg-olive text-primary-foreground"
                    : "border-foreground/20 bg-card text-muted-foreground",
                )}
              >
                {d.label}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="label-caps mb-2 text-muted-foreground">Dietary filters</p>
        <div className="flex flex-wrap gap-2">
          {DIETS.map((d) => {
            const active = draft.diets.includes(d);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={active}
                onClick={() => set({ diets: toggle(draft.diets, d) })}
                className={cn(
                  chip,
                  "capitalize",
                  active
                    ? "border-olive bg-olive text-primary-foreground"
                    : "border-foreground/20 text-muted-foreground",
                )}
              >
                {d.replace("-", " ")}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="label-caps mb-2 text-muted-foreground">Allergies</p>
        <div className="mb-3 flex flex-wrap gap-2">
          {ALLERGENS.map((a) => {
            const active = draft.allergies.includes(a.id);
            return (
              <button
                key={a.id}
                type="button"
                aria-pressed={active}
                onClick={() => set({ allergies: toggle<Allergen>(draft.allergies, a.id) })}
                className={cn(
                  chip,
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
          value={draft.customAllergies ?? []}
          onChange={(customAllergies) => set({ customAllergies })}
        />
      </div>

      <div>
        <p className="label-caps mb-2 text-muted-foreground">Primary hall</p>
        <div className="grid grid-cols-3 gap-2">
          {HALLS.map((h) => (
            <button
              key={h.id}
              type="button"
              aria-pressed={draft.hall === h.id}
              onClick={() => set({ hall: h.id })}
              className={cn(
                "rounded-xl border px-2 py-2 text-sm font-bold",
                draft.hall === h.id
                  ? "border-olive bg-olive text-primary-foreground"
                  : "border-foreground/20",
              )}
            >
              {h.short}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <label className="block">
          <span className="label-caps text-muted-foreground">Height (ft)</span>
          <input
            inputMode="numeric"
            value={feet}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 1);
              setFeet(v);
              set({ heightIn: heightIn(v, inches) });
            }}
            className={field}
          />
        </label>
        <label className="block">
          <span className="label-caps text-muted-foreground">Height (in)</span>
          <input
            inputMode="numeric"
            value={inches}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
              setInches(v);
              set({ heightIn: heightIn(feet, v) });
            }}
            className={field}
          />
        </label>
        <label className="block">
          <span className="label-caps text-muted-foreground">Weight (lb)</span>
          <input
            inputMode="numeric"
            value={draft.weightLb || ""}
            onChange={(e) => set({ weightLb: Number(e.target.value.replace(/\D/g, "")) || 0 })}
            className={field}
          />
        </label>
      </div>

      <div className="space-y-2">
        <button
          type="button"
          disabled={!dirty || draft.weightLb < 60 || draft.heightIn < 48 || feet === ""}
          onClick={() => onSave({ ...draft, goal: effectiveGoal(draft) })}
          className="h-12 w-full rounded-full bg-foreground text-base font-bold text-primary-foreground disabled:opacity-40"
        >
          {dirty ? "Save changes" : "No changes yet"}
        </button>
        <button
          type="button"
          onClick={() => setConfirmOpen(true)}
          className="h-11 w-full rounded-full border border-foreground/25 text-sm font-bold"
        >
          Start over
        </button>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-foreground/10 pt-4 text-xs">
        <span className="min-w-0 truncate text-muted-foreground">Signed in as {email}</span>
        <button
          type="button"
          onClick={onSignOut}
          className="shrink-0 rounded-full border border-foreground/25 px-3 py-1.5 font-bold"
        >
          Sign out
        </button>
      </div>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-sm rounded-2xl p-5">
          <DialogHeader className="text-left">
            <DialogTitle className="font-display text-xl">Start over?</DialogTitle>
            <DialogDescription>
              This deletes your profile, meal log and Seedling, and takes you back through setup.
              Your account stays. It can't be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setConfirmOpen(false)}
              className="h-11 rounded-full border border-foreground/25 text-sm font-bold"
            >
              Keep my card
            </button>
            <button
              type="button"
              onClick={onStartOver}
              className="h-11 rounded-full bg-foreground text-sm font-bold text-primary-foreground"
            >
              Start over
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
