import { useCallback, useEffect, useRef, useState } from "react";
import { select as hapticSelect } from "./haptics";

/**
 * The single source of truth for confirmation timing. Every option, every
 * Continue button and every OK button uses this, so nothing drifts out of
 * step with anything else.
 */
export const BOB_MS = 250;
export const ADVANCE_MS = 470;
export const REDUCED_ADVANCE_MS = 140;

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

interface UseConfirmBobOptions {
  /** Runs once the confirmation has played out. */
  onAdvance?: () => void;
}

/**
 * Plays the confirmation on the thing that was just chosen, then advances.
 * While a confirmation is in flight further taps are ignored, so a double tap
 * cannot skip a question.
 */
export function useConfirmBob({ onAdvance }: UseConfirmBobOptions = {}) {
  const [confirmingKey, setConfirmingKey] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const locked = useRef(false);

  const cancel = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    locked.current = false;
    setConfirmingKey(null);
  }, []);

  useEffect(() => () => cancel(), [cancel]);

  /**
   * @param key identifies what is bobbing, so only that element animates
   * @param apply the state change itself, run immediately so the fill and
   *              checkmark are visible during the bob
   * @param advance whether to move on afterwards (multi-select toggles do not)
   */
  const confirm = useCallback(
    (key: string, apply: () => void, advance = true) => {
      if (locked.current) return;

      apply();
      // The haptic fires at the start of the bob, not after it.
      hapticSelect();

      const reduced = prefersReducedMotion();
      setConfirmingKey(key);

      if (!advance) {
        // A toggle bobs but nothing moves on, so it only needs unlocking.
        locked.current = true;
        timer.current = setTimeout(() => {
          locked.current = false;
          setConfirmingKey(null);
        }, reduced ? REDUCED_ADVANCE_MS : BOB_MS);
        return;
      }

      locked.current = true;
      timer.current = setTimeout(
        () => {
          locked.current = false;
          setConfirmingKey(null);
          onAdvance?.();
        },
        reduced ? REDUCED_ADVANCE_MS : ADVANCE_MS
      );
    },
    [onAdvance]
  );

  return {
    confirm,
    confirmingKey,
    isConfirming: confirmingKey !== null,
    cancel,
  };
}
