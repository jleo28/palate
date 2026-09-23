/**
 * Best-effort haptic feedback. Haptics are always an extra: every interaction
 * that calls one of these must already be carrying its own visible state
 * change, because most browsers will do nothing here.
 *
 * Two paths:
 *  - Vibration API (Android Chrome, some Android browsers)
 *  - iOS Safari has no Vibration API. Recent versions do play a system haptic
 *    when a <input type="checkbox" switch> is toggled through its label, so we
 *    keep one hidden switch around and click its label. It is inert to focus,
 *    scrolling and screen readers.
 */

export type HapticPath = "vibration" | "ios-switch" | "none";

const FALLBACK_INPUT_ID = "haptics-fallback-input";
const FALLBACK_LABEL_ID = "haptics-fallback-label";

let enabled = true;

export function setHapticsEnabled(next: boolean): void {
  enabled = next;
}

function supportsVibration(): boolean {
  return typeof navigator !== "undefined" && typeof navigator.vibrate === "function";
}

function supportsIosSwitch(): boolean {
  if (typeof document === "undefined") return false;
  try {
    return "switch" in document.createElement("input");
  } catch {
    return false;
  }
}

/** Which path this device will actually use. Surfaced in Profile so it can be checked on a real phone. */
export function hapticPath(): HapticPath {
  if (supportsVibration()) return "vibration";
  if (supportsIosSwitch()) return "ios-switch";
  return "none";
}

function pulse(pattern: number | number[]): void {
  if (!enabled) return;

  if (supportsVibration()) {
    try {
      navigator.vibrate(pattern);
      return;
    } catch {
      // fall through to the iOS path
    }
  }

  if (!supportsIosSwitch()) return;

  try {
    const label = document.getElementById(FALLBACK_LABEL_ID);
    const input = document.getElementById(FALLBACK_INPUT_ID) as HTMLInputElement | null;
    if (!label || !input) return;

    const active = document.activeElement as HTMLElement | null;
    label.click();
    // Clicking the label can pull focus to the hidden input; put it straight back.
    if (document.activeElement !== active) {
      input.blur();
      active?.focus?.();
    }
  } catch {
    // Haptics are decoration. Never let them surface an error.
  }
}

/** A light tick, for advancing between screens. */
export function tap(): void {
  pulse(8);
}

/** A short confirmation, for choosing an option. */
export function select(): void {
  pulse(10);
}

/** A double pulse, for finishing onboarding. */
export function success(): void {
  pulse([12, 40, 18]);
}

export const HAPTICS_FALLBACK_IDS = {
  input: FALLBACK_INPUT_ID,
  label: FALLBACK_LABEL_ID,
};
