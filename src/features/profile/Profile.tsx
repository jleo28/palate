import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { dailyTargets } from "../../core/targets";
import { Wordmark } from "../../components/Wordmark";
import { BottomNav } from "../../components/BottomNav";
import { BasicsStep } from "../onboarding/BasicsStep";
import { ActivityStep } from "../onboarding/ActivityStep";
import { GoalStep } from "../onboarding/GoalStep";
import { PreferencesStep } from "../onboarding/PreferencesStep";
import type { Draft } from "../onboarding/onboardingDraft";

export function Profile() {
  const { profile, units, setUnits, updateProfile } = useProfile();
  const [draft, setDraftState] = useState<Draft>({ ...profile! });
  const [savedFlash, setSavedFlash] = useState(false);

  const setDraft = (patch: Partial<Draft>) => setDraftState((prev) => ({ ...prev, ...patch }));

  const targets = dailyTargets(profile!);

  const save = () => {
    updateProfile(draft);
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  return (
    <div className="min-h-screen bg-tray pb-24">
      <header className="flex items-center justify-between px-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
        <Wordmark />
      </header>

      <main className="flex flex-col gap-8 px-5 py-6">
        <section className="rounded-row border border-line bg-plate p-4">
          <h1 className="mb-3 font-display text-lg text-ink">Daily targets</h1>
          <dl className="grid grid-cols-4 gap-2 text-center">
            <div>
              <dt className="text-xs text-ink-soft">Calories</dt>
              <dd className="font-display text-lg text-ink">{targets.daily.kcal}</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Protein</dt>
              <dd className="font-display text-lg text-cardinal">{targets.daily.protein}g</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Carbs</dt>
              <dd className="font-display text-lg text-butter">{targets.daily.carbs}g</dd>
            </div>
            <div>
              <dt className="text-xs text-ink-soft">Fat</dt>
              <dd className="font-display text-lg text-slate">{targets.daily.fat}g</dd>
            </div>
          </dl>
        </section>

        <BasicsStep draft={draft} setDraft={setDraft} units={units} setUnits={setUnits} />
        <ActivityStep draft={draft} setDraft={setDraft} />
        <GoalStep draft={draft} setDraft={setDraft} />
        <PreferencesStep draft={draft} setDraft={setDraft} />

        <button
          type="button"
          onClick={save}
          className="tap-target rounded-chip bg-cardinal font-display text-base text-plate"
        >
          {savedFlash ? "Saved" : "Save changes"}
        </button>

        <footer className="flex flex-col gap-2 border-t border-line pt-4 text-sm text-ink-soft">
          <p>Menus are sample data for this prototype.</p>
          <a
            href="https://studenthealth.usc.edu"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line underline-offset-2"
          >
            USC Student Health, if you would like to talk to someone about eating
          </a>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
