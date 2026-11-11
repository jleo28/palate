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
  type TourStep,
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

/**
 * Measures a `data-tour` element, following resize and scroll. Scrolls it so it sits above the
 * tour card when the page can move; fixed targets (the tab bar) stay put and the card moves.
 */
function useTargetRect(target: TourTarget | undefined, cardHeight: number) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  useLayoutEffect(() => {
    if (!target) {
      setRect(null);
      return;
    }
    let cleanup = () => {};
    let tries = 0;
    let timer = 0;
    setRect(null);
    // The step's page may still be loading after the tour navigates; wait for the target.
    const find = () => {
      const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
      if (el) cleanup = follow(el, cardHeight, setRect);
      else if (tries++ < 40) timer = window.setTimeout(find, 100);
    };
    find();
    return () => {
      window.clearTimeout(timer);
      cleanup();
    };
  }, [target, cardHeight]);
  return rect;
}

/** Scrolls `el` clear of the tour card, then reports its position until cleaned up. */
function follow(el: HTMLElement, cardHeight: number, setRect: (r: DOMRect) => void) {
  const r = el.getBoundingClientRect();
  const room = window.innerHeight - cardHeight - 32;
  if (r.bottom > room) window.scrollBy({ top: r.bottom - room, behavior: "instant" });
  else if (r.top < 16) window.scrollBy({ top: r.top - 16, behavior: "instant" });
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
}

/** The tour's own demo of a step's action, done on the real page. */
function demo(id: TourStep["id"], el: HTMLElement | null) {
  const click = (b: Element | null | undefined) => (b as HTMLElement | null)?.click();
  if (id === "halls") {
    click(
      [...(el?.querySelectorAll("button") ?? [])].find(
        (b) => !b.className.includes("bg-foreground"),
      ),
    );
  } else if (id === "swipe") {
    click(document.querySelector('[aria-label="Next plate"]'));
  } else if (id === "filters") {
    click(el?.querySelector("button"));
  } else if (id === "card") {
    click(el?.querySelector('button[aria-label="Edit goals and settings"]'));
  }
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
  /** Called on every step, so the host can walk to that step's tab. */
  onStep: (step: TourStep) => void;
  /** Saves the new name. */
  onName: (seedling: Seedling) => void;
  /** Finished or skipped: both count as done. */
  onDone: () => void;
}

export function OliveTour({ firstName, hall, seedling, onStep, onName, onDone }: Props) {
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
  // Action steps: has the user (or the demo) done the thing yet?
  const [acted, setActed] = useState(false);
  const pending = !!step.action && !acted;
  const stepLines: TourLine[] =
    step.action && acted
      ? [
          ...step.lines,
          {
            speaker: step.lines[0]!.speaker,
            text: step.action.done,
            ...(step.action.aside ? { aside: step.action.aside } : {}),
          },
        ]
      : step.lines;
  const onStepRef = useRef(onStep);
  onStepRef.current = onStep;
  useEffect(() => {
    onStepRef.current(step);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);
  const lines = stepLines.slice(0, lineIndex + 1);
  const current: TourLine = stepLines[lineIndex]!;
  const typed = useTypewriter(current.text, reduced || instant);
  const allLinesOut = lineIndex === stepLines.length - 1 && typed.done;
  const [cardHeight, setCardHeight] = useState(0);
  const rect = useTargetRect(step.target, cardHeight);
  // Target still under the card (it can't scroll): put the card at the top instead.
  const atTop = !!rect && cardHeight > 0 && rect.bottom + PAD > window.innerHeight - cardHeight - 8;
  const ctaRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const measure = () => setCardHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Next line once this one finishes typing.
  useEffect(() => {
    if (!typed.done || lineIndex >= stepLines.length - 1) return;
    const id = window.setTimeout(() => setLineIndex((i) => i + 1), reduced ? 0 : 450);
    return () => window.clearTimeout(id);
  }, [typed.done, lineIndex, stepLines.length, reduced]);

  // The user tries it themselves: any tap or swipe on the spotlit target counts.
  useEffect(() => {
    if (!pending || !step.target || !rect) return;
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) return;
    const did = () => window.setTimeout(() => setActed(true), 250);
    el.addEventListener("pointerup", did);
    return () => el.removeEventListener("pointerup", did);
  }, [pending, step.target, rect]);

  useEffect(() => {
    if (acted) {
      setInstant(false);
      setLineIndex(step.lines.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acted]);

  const showMe = () => {
    demo(step.id, step.target ? document.querySelector(`[data-tour="${step.target}"]`) : null);
    setActed(true);
  };

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
    if (pending) return showMe();
    if (!allLinesOut) {
      setInstant(true);
      setLineIndex(stepLines.length - 1);
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
    setActed(false);
  };

  // Tap the bubble: finish the line, then show the rest of the step.
  const tapBubble = () => {
    if (!typed.done) typed.complete();
    else if (lineIndex < stepLines.length - 1) setLineIndex(lineIndex + 1);
  };

  const speaking = !typed.done ? current.speaker : null;
  const showSeedling = index >= 1;

  return (
    <div className="pointer-events-none fixed inset-0 z-50" role="presentation">
      {/* Dim layer with a cutout around the target. Only an action step lets taps through it. */}
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
          {step.id === "swipe" && pending && (
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
      {pending && rect ? (
        <>
          {[
            { top: 0, left: 0, right: 0, height: Math.max(0, rect.top - PAD) },
            { top: rect.bottom + PAD, left: 0, right: 0, bottom: 0 },
            {
              top: rect.top - PAD,
              left: 0,
              width: Math.max(0, rect.left - PAD),
              height: rect.height + PAD * 2,
            },
            {
              top: rect.top - PAD,
              left: rect.right + PAD,
              right: 0,
              height: rect.height + PAD * 2,
            },
          ].map((style, i) => (
            <div key={i} className="pointer-events-auto fixed" style={style} />
          ))}
        </>
      ) : (
        <div className="pointer-events-auto absolute inset-0" />
      )}

      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label="Tour of Palate with Olive"
        className={cn(
          "pointer-events-auto fixed inset-x-0 mx-auto flex max-w-md px-4 outline-none",
          atTop
            ? "top-0 flex-col-reverse pt-[max(1rem,env(safe-area-inset-top))]"
            : "bottom-0 flex-col pb-[max(1rem,env(safe-area-inset-bottom))]",
        )}
      >
        <div
          className={cn(
            "relative z-10 flex items-end justify-between px-2",
            atTop ? "-mt-3" : "-mb-3",
          )}
          aria-hidden
        >
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
              {pending ? "Show me" : step.cta}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
