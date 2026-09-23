import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { QuestionScreen } from "./QuestionScreen";
import { LETTERS, QUESTIONS } from "./questions";
import { DEFAULT_DRAFT, draftToProfile, type Draft } from "./onboardingDraft";
import { BobButton } from "../../components/BobButton";
import { useConfirmBob } from "../../lib/useConfirmBob";
import { success, tap } from "../../lib/haptics";
import { loadJson, removeJson, saveJson } from "../../lib/storage";

interface SavedProgress {
  index: number;
  draft: Draft;
}

export function Onboarding() {
  const saved = loadJson<SavedProgress>("onboardingProgress");
  const [index, setIndex] = useState(saved?.index ?? 0);
  const [draft, setDraftState] = useState<Draft>(saved?.draft ?? DEFAULT_DRAFT);
  const [goingBack, setGoingBack] = useState(false);
  const { units, setUnits, setProfile, setHalls } = useProfile();
  const navigate = useNavigate();

  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

  // Every answer is written down as it is given, so leaving and coming back
  // picks up exactly where they stopped.
  useEffect(() => {
    saveJson("onboardingProgress", { index, draft });
  }, [index, draft]);

  const setDraft = (patch: Partial<Draft>) => setDraftState((prev) => ({ ...prev, ...patch }));

  const canContinue = useCallback(() => {
    if (question.kind === "multi" && question.required) {
      return (draft[question.field] as unknown[]).length > 0;
    }
    return true;
  }, [question, draft]);

  const finish = useCallback(
    (finalDraft: Draft) => {
      success();
      setHalls(finalDraft.halls);
      setProfile(draftToProfile(finalDraft));
      removeJson("onboardingProgress");
      navigate("/");
    },
    [navigate, setHalls, setProfile]
  );

  const advance = useCallback(() => {
    if (isLast) {
      finish(draft);
      return;
    }
    setGoingBack(false);
    setIndex((i) => i + 1);
  }, [draft, finish, isLast]);

  const { confirm, confirmingKey, isConfirming } = useConfirmBob({ onAdvance: advance });

  const goBack = () => {
    if (isConfirming) return;
    tap();
    setGoingBack(true);
    if (index === 0) {
      navigate("/");
      return;
    }
    setIndex((i) => i - 1);
  };

  const exit = () => {
    tap();
    navigate("/");
  };

  /** A single-select answer: set it, bob it, then move on. */
  const pickSingle = (value: unknown) => {
    if (question.kind !== "single") return;
    confirm(String(value), () => setDraft({ [question.field]: value } as Partial<Draft>), true);
  };

  /** A multi-select toggle: bob, but stay put. */
  const toggleMulti = (value: unknown) => {
    if (question.kind !== "multi") return;
    const current = draft[question.field] as unknown[];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    confirm(String(value), () => setDraft({ [question.field]: next } as Partial<Draft>), false);
  };

  const pressContinue = () => {
    if (!canContinue()) return;
    confirm("__continue__", () => {}, true);
  };

  // Desktop: the option letter picks an answer, Enter continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (isConfirming) return;

      if (e.key === "Enter") {
        e.preventDefault();
        if (question.kind === "single") {
          // Enter on a single-select confirms whatever is already chosen.
          confirm(String(draft[question.field]), () => {}, true);
        } else {
          pressContinue();
        }
        return;
      }

      if (question.kind === "number") return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const letterIndex = LETTERS.indexOf(e.key.toUpperCase());
      if (letterIndex === -1 || letterIndex >= question.options.length) return;

      e.preventDefault();
      const option = question.options[letterIndex];
      if (question.kind === "single") pickSingle(option.value);
      else toggleMulti(option.value);
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, isConfirming, question, confirm]);

  const progress = ((index + 1) / QUESTIONS.length) * 100;

  return (
    <div className="app-shell flex flex-col bg-tray" style={{ minHeight: "100dvh" }}>
      <header className="flex flex-col gap-3 px-4 pt-[calc(0.75rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={exit}
            className="tap-target -ml-2 px-2 text-sm text-ink-soft"
            aria-label="Save and close setup"
          >
            Close
          </button>
          <span className="text-sm tabular-nums text-ink-soft">
            {index + 1} of {QUESTIONS.length}
          </span>
        </div>
        <div
          className="h-1.5 w-full overflow-hidden rounded-full bg-line"
          role="progressbar"
          aria-valuenow={index + 1}
          aria-valuemin={1}
          aria-valuemax={QUESTIONS.length}
          aria-label="Setup progress"
        >
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </header>

      <main className="flex-1 px-4 pt-6 pb-4">
        <div key={question.id} className={goingBack ? "question-enter-back" : "question-enter"}>
          <QuestionScreen
            question={question}
            draft={draft}
            setDraft={setDraft}
            units={units}
            setUnits={setUnits}
            onPickSingle={pickSingle}
            onToggleMulti={toggleMulti}
            confirmingKey={confirmingKey}
            locked={isConfirming}
          />
        </div>
      </main>

      {/* Controls sit at the bottom, in the thumb zone. */}
      <footer className="sticky bottom-0 flex items-center gap-3 border-t border-line bg-tray px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3">
        <BobButton variant="secondary" onClick={goBack} disabled={isConfirming}>
          Back
        </BobButton>

        {question.kind === "single" ? (
          <p className="flex-1 text-right text-sm text-ink-soft">Pick one to continue</p>
        ) : (
          <BobButton
            onClick={pressContinue}
            disabled={!canContinue() || isConfirming}
            bobbing={confirmingKey === "__continue__"}
            className="flex-1"
          >
            {isLast ? "See my plates" : "Continue"}
          </BobButton>
        )}
      </footer>
    </div>
  );
}
