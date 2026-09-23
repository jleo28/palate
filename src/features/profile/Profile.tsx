import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { dailyTargets } from "../../core/targets";
import { BottomNav } from "../../components/BottomNav";
import { BobButton } from "../../components/BobButton";
import { OliveSays } from "../../components/OliveSays";
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
  const { profile, effectiveProfile, isOnboarded, units, setUnits, halls, setHalls, setProfile, haptics, setHaptics } =
    useProfile();
  const navigate = useNavigate();
  const [draft, setDraftState] = useState<Draft>(() => profileToDraft(effectiveProfile, halls));
  const [savedFlash, setSavedFlash] = useState(false);

  const setDraft = (patch: Partial<Draft>) => setDraftState((prev) => ({ ...prev, ...patch }));

  const targets = dailyTargets(effectiveProfile);
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
    <div className="app-shell bg-tray pb-28">
      <header className="flex items-center justify-between gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <h1 className="font-display text-xl text-ink">Profile</h1>
        <button
          type="button"
          onClick={() => navigate("/")}
          className="tap-target -mr-2 px-2 text-sm text-ink-soft"
        >
          Home
        </button>
      </header>

      <main className="flex flex-col gap-7 px-4 py-5">
        <section className="rounded-sheet border border-line bg-plate p-4">
          <h2 className="mb-3 font-display text-lg text-ink">
            {isOnboarded ? "Daily targets" : "General daily targets"}
          </h2>
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

        {!isOnboarded && (
          <OliveSays
            variant="card"
            action={<BobButton onClick={() => navigate("/onboarding")}>Personalize</BobButton>}
          >
            These are general numbers for now. Answer a few questions and I will size them to you.
          </OliveSays>
        )}

        {PROFILE_SECTIONS.map((question) => (
          <QuestionScreen
            key={question.id}
            question={question}
            draft={draft}
            setDraft={setDraft}
            units={units}
            setUnits={setUnits}
            onPickSingle={(value) => {
              select();
              setDraft({ [question.field]: value } as Partial<Draft>);
            }}
            asSection
          />
        ))}

        <section className="flex flex-col gap-3 rounded-sheet border border-line bg-plate p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
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
              className={`tap-target w-[72px] shrink-0 rounded-chip border-2 px-3 text-sm ${
                haptics ? "border-accent bg-accent text-plate" : "border-line-strong bg-plate text-ink"
              }`}
            >
              {haptics ? "On" : "Off"}
            </button>
          </div>
          <p className="text-sm text-ink-soft">This device: {HAPTIC_PATH_LABEL[path]}.</p>
        </section>

        <BobButton onClick={save}>{savedFlash ? "Saved" : profile ? "Save changes" : "Save and personalize"}</BobButton>

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
