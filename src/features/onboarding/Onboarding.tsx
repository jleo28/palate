import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../context/ProfileContext";
import { Wordmark } from "../../components/Wordmark";
import { QuestionScreen } from "./QuestionScreen";
import { LETTERS, QUESTIONS } from "./questions";
import { DEFAULT_DRAFT, draftToProfile, type Draft } from "./onboardingDraft";
import { select, success, tap } from "../../lib/haptics";

/** Long enough for the selected state to land before the screen moves. */
const AUTO_ADVANCE_MS = 350;

export function Onboarding() {
  const [index, setIndex] = useState(0);
  const [goingBack, setGoingBack] = useState(false);
  const [draft, setDraftState] = useState<Draft>(DEFAULT_DRAFT);
  const { units, setUnits, setProfile, setHalls } = useProfile();
  const navigate = useNavigate();
  const advanceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const question = QUESTIONS[index];
  const isLast = index === QUESTIONS.length - 1;

  const setDraft = (patch: Partial<Draft>) => setDraftState((prev) => ({ ...prev, ...patch }));

  useEffect(() => {
    return () => {
      if (advanceTimer.current) clearTimeout(advanceTimer.current);
    };
  }, []);

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
      navigate("/today");
    },
    [navigate, setHalls, setProfile]
  );

  const goNext = useCallback(() => {
    if (!canContinue()) return;
    if (isLast) {
      finish(draft);
      return;
    }
    tap();
    setGoingBack(false);
    setIndex((i) => i + 1);
  }, [canContinue, draft, finish, isLast]);

  const goBack = useCallback(() => {
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    tap();
    setGoingBack(true);
    if (index === 0) {
      navigate("/");
      return;
    }
    setIndex((i) => i - 1);
  }, [index, navigate]);

  /** Single-select answers move on by themselves once the choice has visibly registered. */
  const handleAnswered = useCallback(() => {
    select();
    if (question.kind !== "single") return;
    if (advanceTimer.current) clearTimeout(advanceTimer.current);
    advanceTimer.current = setTimeout(() => {
      if (isLast) finish(draft);
      else {
        setGoingBack(false);
        setIndex((i) => i + 1);
      }
    }, AUTO_ADVANCE_MS);
  }, [draft, finish, isLast, question.kind]);

  // Desktop: the option letter picks an answer, Enter continues.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === "Enter") {
        e.preventDefault();
        goNext();
        return;
      }

      if (question.kind === "number") return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      const letterIndex = LETTERS.indexOf(e.key.toUpperCase());
      if (letterIndex === -1 || letterIndex >= question.options.length) return;

      e.preventDefault();
      const option = question.options[letterIndex];
      if (question.kind === "single") {
        setDraft({ [question.field]: option.value } as Partial<Draft>);
      } else {
        const current = draft[question.field] as unknown[];
        const next = current.includes(option.value)
          ? current.filter((v) => v !== option.value)
          : [...current, option.value];
        setDraft({ [question.field]: next } as Partial<Draft>);
      }
      handleAnswered();
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [draft, goNext, handleAnswered, question]);

  const progress = ((index + 1) / QUESTIONS.length) * 100;

  return (
    <div className="flex min-h-screen flex-col bg-tray">
      <header className="flex flex-col gap-4 px-5 pt-[calc(1rem+env(safe-area-inset-top,0px))]">
        <div className="flex items-center justify-between">
          <Wordmark />
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

      <main className="flex-1 px-5 pt-8 pb-4">
        <div key={question.id} className={goingBack ? "question-enter-back" : "question-enter"}>
          <QuestionScreen
            question={question}
            draft={draft}
            setDraft={setDraft}
            units={units}
            setUnits={setUnits}
            onAnswered={handleAnswered}
          />
        </div>
      </main>

      <footer className="flex items-center gap-3 px-5 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] pt-2">
        <button
          type="button"
          onClick={goBack}
          className="tap-target rounded-chip border-2 border-line-strong bg-plate px-5 font-display text-base text-ink"
        >
          Back
        </button>

        {question.kind !== "single" && (
          <button
            type="button"
            onClick={goNext}
            disabled={!canContinue()}
            className="tap-target flex-1 rounded-chip bg-accent font-display text-base text-plate disabled:opacity-50"
          >
            {isLast ? "See today's plate" : "Continue"}
          </button>
        )}

        {question.kind === "single" && (
          <p className="flex-1 text-right text-sm text-ink-soft">Pick one to continue</p>
        )}
      </footer>
    </div>
  );
}
