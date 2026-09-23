import { useState } from "react";
import { useProfile } from "../../context/ProfileContext";
import { dailyTargets } from "../../core/targets";
import { Wordmark } from "../../components/Wordmark";
import { BottomNav } from "../../components/BottomNav";
import { QuestionScreen } from "../onboarding/QuestionScreen";
import { PROFILE_SECTIONS } from "../onboarding/questions";
import { profileToDraft, draftToProfile, type Draft } from "../onboarding/onboardingDraft";
import { hapticPath, select, success } from "../../lib/haptics";

const HAPTIC_PATH_LABEL: Record<ReturnType<typeof hapticPath>, string> = {
  vibration: "Vibration API (Android)",
  "ios-switch": "iOS switch fallback",
  none: "Not supported on this device",
};

export function Profile() {
  const { profile, units, setUnits, halls, setHalls, setProfile, haptics, setHaptics } = useProfile();
  const [draft, setDraftState] = useState<Draft>(() => profileToDraft(profile!, halls));
  const [savedFlash, setSavedFlash] = useState(false);

  const setDraft = (patch: Partial<Draft>) => setDraftState((prev) => ({ ...prev, ...patch }));

  const targets = dailyTargets(profile!);
  const path = hapticPath();

  const save = () => {
    success();
    setHalls(draft.halls);
    setProfile(draftToProfile(draft));
    setSavedFlash(true);
    setTimeout(() => setSavedFlash(false), 1600);
  };

  const macros = [
    { label: "Calories", value: `${targets.daily.kcal}`, swatch: null },
    { label: "Protein", value: `${targets.daily.protein}g`, swatch: "bg-protein" },
    { label: "Carbs", value: `${targets.daily.carbs}g`, swatch: "bg-carb" },
    { label: "Fat", value: `${targets.daily.fat}g`, swatch: "bg-fat" },
  ];

  return (
    <div className="min-h-screen bg-tray pb-24">
      <header className="flex items-center justify-between px-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
        <Wordmark />
      </header>

      <main className="flex flex-col gap-8 px-5 py-6">
        <section className="rounded-row border border-line bg-plate p-4">
          <h1 className="mb-3 font-display text-lg text-ink">Daily targets</h1>
          <dl className="grid grid-cols-4 gap-2 text-center">
            {macros.map((m) => (
              <div key={m.label}>
                <dt className="flex items-center justify-center gap-1.5 text-xs text-ink-soft">
                  {m.swatch && <span aria-hidden="true" className={`h-2 w-2 rounded-full ${m.swatch}`} />}
                  {m.label}
                </dt>
                <dd className="font-display text-lg text-ink">{m.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        {PROFILE_SECTIONS.map((question) => (
          <QuestionScreen
            key={question.id}
            question={question}
            draft={draft}
            setDraft={setDraft}
            units={units}
            setUnits={setUnits}
            onAnswered={select}
            showLetters={false}
          />
        ))}

        <section className="flex flex-col gap-3 rounded-row border border-line bg-plate p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="font-display text-base text-ink">Haptics</h2>
              <p className="text-sm text-ink-soft">A light tap when you pick an answer.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={haptics}
              aria-label="Haptics"
              onClick={() => {
                setHaptics(!haptics);
                if (!haptics) select();
              }}
              className={`tap-target relative w-[72px] shrink-0 rounded-chip border-2 px-3 text-sm ${
                haptics ? "border-accent bg-accent text-plate" : "border-line-strong bg-plate text-ink"
              }`}
            >
              {haptics ? "On" : "Off"}
            </button>
          </div>
          <p className="text-sm text-ink-soft">
            This device: {HAPTIC_PATH_LABEL[path]}.
          </p>
        </section>

        <button
          type="button"
          onClick={save}
          className="tap-target rounded-chip bg-accent font-display text-base text-plate"
        >
          {savedFlash ? "Saved" : "Save changes"}
        </button>

        <footer className="flex flex-col gap-2 border-t border-line pt-4 text-sm text-ink-soft">
          <p>Menus are sample data for this prototype.</p>
          <a
            href="https://studenthealth.usc.edu"
            target="_blank"
            rel="noreferrer"
            className="underline decoration-line-strong underline-offset-2"
          >
            USC Student Health, if you would like to talk to someone about eating
          </a>
        </footer>
      </main>

      <BottomNav />
    </div>
  );
}
