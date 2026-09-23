import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { ProgressBars } from "../../components/ProgressBars";
import { Wordmark } from "../../components/Wordmark";
import { BasicsStep } from "./BasicsStep";
import { ActivityStep } from "./ActivityStep";
import { GoalStep } from "./GoalStep";
import { PreferencesStep } from "./PreferencesStep";
import { DEFAULT_DRAFT, draftToProfile, type Draft } from "./onboardingDraft";

const STEP_COUNT = 4;

export function Onboarding() {
  const [step, setStep] = useState(0);
  const [draft, setDraftState] = useState<Draft>(DEFAULT_DRAFT);
  const { units, setUnits, setProfile } = useProfile();
  const navigate = useNavigate();

  const setDraft = (patch: Partial<Draft>) => setDraftState((prev) => ({ ...prev, ...patch }));

  const isLastStep = step === STEP_COUNT - 1;

  const canAdvance = () => {
    if (step === 3) return draft.meals.length > 0;
    return true;
  };

  const next = () => {
    if (isLastStep) {
      setProfile(draftToProfile(draft));
      navigate("/today");
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_COUNT - 1));
  };

  const back = () => {
    if (step === 0) {
      navigate("/");
      return;
    }
    setStep((s) => s - 1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-tray">
      <header className="flex flex-col gap-4 px-5 pt-[calc(1.25rem+env(safe-area-inset-top,0px))]">
        <Wordmark />
        <ProgressBars step={step} total={STEP_COUNT} />
      </header>

      <main className="flex-1 px-5 py-6">
        {step === 0 && <BasicsStep draft={draft} setDraft={setDraft} units={units} setUnits={setUnits} />}
        {step === 1 && <ActivityStep draft={draft} setDraft={setDraft} />}
        {step === 2 && <GoalStep draft={draft} setDraft={setDraft} />}
        {step === 3 && <PreferencesStep draft={draft} setDraft={setDraft} />}
      </main>

      <footer className="flex gap-3 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-2">
        <button
          type="button"
          onClick={back}
          className="tap-target flex-1 rounded-chip border border-line bg-plate font-display text-base text-ink"
        >
          Back
        </button>
        <button
          type="button"
          onClick={next}
          disabled={!canAdvance()}
          className="tap-target flex-[2] rounded-chip bg-cardinal font-display text-base text-plate disabled:opacity-50"
        >
          {isLastStep ? "See today's plate" : "Continue"}
        </button>
      </footer>
    </div>
  );
}
