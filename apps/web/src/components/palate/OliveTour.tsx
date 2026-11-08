import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Dices } from "lucide-react";
import {
  nextNameIdea,
  renameSeedling,
  suggestedSeedlingName,
  tourSteps,
  TOUR_HALL_NAMES,
  type HallId,
  type Seedling,
  type TourLine,
  type TourTarget,
} from "@palate/core";
import { Olive } from "./Olive";
import { SeedlingAvatar } from "./SeedlingAvatar";
import { cn } from "@/lib/utils";

const PAD = 8;
const DIM = "oklch(0.2 0.02 129 / 0.62)";

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

/** Measures a `data-tour` element, following resize and scroll. */
function useTargetRect(target: TourTarget | undefined) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ block: "center", behavior: "auto" });
    const measure = () => setRect(el.getBoundingClientRect());
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    window.addEventListener("resize", measure);
    window.addEventListener("scroll", measure, true);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", measure);
      window.removeEventListener("scroll", measure, true);
    };
  }, [target]);
  return rect;
}

/** Types a line out quickly. `complete()` jumps to the end. */
function useTypewriter(text: string, instant: boolean) {
  const [shown, setShown] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) {
      setShown(text.length);
      return;
    }
    setShown(0);
    const id = window.setInterval(() => {
      setShown((n) => {
        if (n >= text.length) {
          window.clearInterval(id);
          return n;
        }
        return n + 2;
      });
    }, 18);
    return () => window.clearInterval(id);
  }, [text, instant]);
  return {
    text: text.slice(0, shown),
    done: shown >= text.length,
    complete: () => setShown(text.length),
  };
}

interface Props {
  firstName: string;
  hall: HallId;
  seedling: Seedling;
  /** Saves the new name. */
  onName: (seedling: Seedling) => void;
  /** Finished or skipped: both count as done. */
  onDone: () => void;
}

export function OliveTour({ firstName, hall, seedling, onName, onDone }: Props) {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [lineIndex, setLineIndex] = useState(0);
  const [name, setName] = useState(() => suggestedSeedlingName(seedling));
  const [hop, setHop] = useState(0);
  // CTA pressed mid-line: show the whole step at once.
  const [instant, setInstant] = useState(false);
  const steps = tourSteps({
    firstName,
    seedlingName: seedling.name,
    hallName: TOUR_HALL_NAMES[hall],
  });
  const step = steps[index]!;
  const lines = step.lines.slice(0, lineIndex + 1);
  const current: TourLine = step.lines[lineIndex]!;
  const typed = useTypewriter(current.text, reduced || instant);
  const allLinesOut = lineIndex === step.lines.length - 1 && typed.done;
  const rect = useTargetRect(step.target);
  const ctaRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Next line once this one finishes typing.
  useEffect(() => {
    if (!typed.done || lineIndex >= step.lines.length - 1) return;
    const id = window.setTimeout(() => setLineIndex((i) => i + 1), reduced ? 0 : 450);
    return () => window.clearTimeout(id);
  }, [typed.done, lineIndex, step.lines.length, reduced]);

  useEffect(() => {
    (ctaRef.current ?? dialogRef.current)?.focus();
  }, [index]);

  const skip = useCallback(() => onDone(), [onDone]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") skip();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [skip]);

  const advance = () => {
    if (!allLinesOut) {
      setInstant(true);
      setLineIndex(step.lines.length - 1);
      return;
    }
    if (step.id === "seedling") {
      onName(renameSeedling(seedling, name));
      setHop((h) => h + 1);
    }
    if (index === steps.length - 1) return onDone();
    setIndex(index + 1);
    setLineIndex(0);
    setInstant(false);
  };

  // Tap the bubble: finish the line, then show the rest of the step.
  const tapBubble = () => {
    if (!typed.done) typed.complete();
    else if (lineIndex < step.lines.length - 1) setLineIndex(lineIndex + 1);
  };

  const speaking = !typed.done ? current.speaker : null;
  const showSeedling = index >= 1;

  return (
    <div className="fixed inset-0 z-50" role="presentation">
      {/* Dim layer with a cutout around the target. Clicks never reach the page. */}
      {rect ? (
        <div
          aria-hidden
          className="tour-spotlight pointer-events-none fixed rounded-3xl ring-2 ring-olive"
          style={{
            top: rect.top - PAD,
            left: rect.left - PAD,
            width: rect.width + PAD * 2,
            height: rect.height + PAD * 2,
            boxShadow: `0 0 0 9999px ${DIM}`,
          }}
        >
          {step.id === "swipe" && (
            <div className="absolute inset-0 grid place-items-center">
              <span className="tour-swipe-hint flex items-center gap-1 rounded-full bg-card px-3 py-1.5 text-xs font-bold shadow">
                <span className="size-5 rounded-full bg-olive" /> swipe
              </span>
            </div>
          )}
        </div>
      ) : (
        <div aria-hidden className="fixed inset-0 animate-in fade-in" style={{ background: DIM }} />
      )}
      <div className="absolute inset-0" onClick={(e) => e.stopPropagation()} />

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Tour of Palate with Olive"
        className="fixed inset-x-0 bottom-0 mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))] outline-none"
      >
        <div className="relative z-10 -mb-3 flex items-end justify-between px-2" aria-hidden>
          <div
            key={`olive-${index === 0 ? "in" : "stay"}`}
            className={cn("size-24", index === 0 && "tour-bounce-in")}
          >
            <div className={cn("size-full", speaking === "olive" && "tour-talking")}>
              <Olive className="size-full" label="" />
            </div>
          </div>
          {showSeedling && (
            <div key={`seed-${hop}`} className={cn("size-20", hop > 0 && "tour-hop")}>
              <div className={cn(index === 1 && hop === 0 && "tour-grow")}>
                <div className={cn(speaking === "seedling" && "tour-wave")}>
                  <SeedlingAvatar seedling={seedling} className="size-20" />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="relative rounded-3xl border border-foreground/15 bg-background p-4 shadow-xl">
          <button
            type="button"
            onClick={tapBubble}
            className="block w-full space-y-2 text-left"
            aria-label={typed.done ? undefined : "Show the whole line"}
          >
            {lines.map((line, i) => {
              const isCurrent = i === lineIndex;
              const who = line.speaker === "olive" ? "Olive" : seedling.name;
              return (
                <p
                  key={i}
                  className={cn(
                    "rounded-2xl px-3 py-2 text-[0.95rem] leading-snug",
                    line.speaker === "olive" ? "bg-olive-soft" : "bg-card ml-6",
                  )}
                >
                  <span className="font-display font-bold text-olive">{who}: </span>
                  {isCurrent ? typed.text : line.text}
                  {line.aside && (!isCurrent || typed.done) && (
                    <span className="ml-1 text-xs italic text-muted-foreground">
                      ({line.aside})
                    </span>
                  )}
                </p>
              );
            })}
          </button>
          {/* Screen readers get each whole line once, not letter by letter. */}
          <p className="sr-only" aria-live="polite">
            {lines
              .map((l) => `${l.speaker === "olive" ? "Olive" : seedling.name}: ${l.text}`)
              .join(" ")}
          </p>

          {step.id === "seedling" && allLinesOut && (
            <div className="mt-3 flex gap-2 animate-in fade-in">
              <label className="sr-only" htmlFor="tour-seedling-name">
                Name your Seedling
              </label>
              <input
                id="tour-seedling-name"
                value={name}
                maxLength={24}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && advance()}
                className="h-12 min-w-0 flex-1 rounded-full border border-foreground/25 bg-card px-4 text-base font-bold"
              />
              <button
                type="button"
                onClick={() => setName((n) => nextNameIdea(n))}
                aria-label="Suggest another name"
                className="grid size-12 shrink-0 place-items-center rounded-full border border-foreground/25 bg-card"
              >
                <Dices className="size-5" aria-hidden />
              </button>
            </div>
          )}

          <div className="mt-3 flex items-center gap-2">
            {index < steps.length - 1 && (
              <button
                type="button"
                onClick={skip}
                className="h-11 rounded-full px-4 text-sm font-bold text-muted-foreground"
              >
                Skip tour
              </button>
            )}
            <span className="ml-auto mr-1 text-xs text-muted-foreground" aria-hidden>
              {index + 1}/{steps.length}
            </span>
            <button
              ref={ctaRef}
              type="button"
              onClick={advance}
              className="h-12 rounded-full bg-foreground px-6 text-base font-bold text-primary-foreground"
            >
              {step.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
