/**
 * Small taps of haptic feedback, where the phone allows it.
 *
 * - Android (and anything with the Vibration API): short vibrations.
 * - iPhone: Safari has no Vibration API, but since iOS 18 toggling a native switch
 *   (`<input type="checkbox" switch>`) gives a light system tap. We keep one hidden switch and
 *   toggle it through its label. Unofficial: if an iOS update stops it, this quietly does nothing.
 *   It may only fire from inside a real tap, so call `haptic` from event handlers.
 * - Everywhere else, or with Haptics turned off in My Palate: nothing.
 *
 * The on/off choice is per device (localStorage), like other feel-only preferences.
 */

export type HapticKind = "tick" | "success";

const KEY = "palate.haptics.v1";
let iosLabel: HTMLLabelElement | null = null;

export function hapticsEnabled() {
  try {
    return localStorage.getItem(KEY) !== "off";
  } catch {
    return true;
  }
}

export function setHapticsEnabled(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "on" : "off");
  } catch {
    /* storage blocked: stays on for this visit */
  }
  if (on) haptic("tick");
}

const isIOS = () =>
  typeof navigator !== "undefined" &&
  (/iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));

function iosTap() {
  if (!iosLabel) {
    const input = document.createElement("input");
    input.type = "checkbox";
    input.setAttribute("switch", "");
    input.id = "palate-haptic-switch";
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    const label = document.createElement("label");
    label.htmlFor = input.id;
    label.setAttribute("aria-hidden", "true");
    label.style.cssText =
      "position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;overflow:hidden;left:-9999px";
    label.appendChild(input);
    document.body.appendChild(label);
    iosLabel = label;
  }
  iosLabel.click();
}

/** A tick for small changes; a success double-tap for things worth celebrating. */
export function haptic(kind: HapticKind = "tick") {
  if (typeof window === "undefined" || !hapticsEnabled()) return;
  if (typeof navigator.vibrate === "function") {
    navigator.vibrate(kind === "success" ? [14, 70, 22] : 10);
    return;
  }
  if (!isIOS()) return;
  iosTap();
  if (kind === "success") window.setTimeout(iosTap, 90);
}
