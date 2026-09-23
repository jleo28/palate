import { useEffect, useRef } from "react";
import { HAPTICS_FALLBACK_IDS } from "../lib/haptics";

/**
 * The hidden switch that src/lib/haptics.ts clicks on iOS Safari. It is mounted
 * once, hidden from screen readers and from the tab order, and cannot be hit by
 * a pointer. It never renders anything a user can see.
 */
export function HapticsFallback() {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // `switch` is not in React's attribute types yet, so it is set directly.
    inputRef.current?.setAttribute("switch", "");
  }, []);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        width: 1,
        height: 1,
        overflow: "hidden",
        clipPath: "inset(50%)",
        pointerEvents: "none",
        opacity: 0,
        left: 0,
        bottom: 0,
      }}
    >
      <input ref={inputRef} id={HAPTICS_FALLBACK_IDS.input} type="checkbox" tabIndex={-1} aria-hidden="true" />
      <label id={HAPTICS_FALLBACK_IDS.label} htmlFor={HAPTICS_FALLBACK_IDS.input} aria-hidden="true">
        Haptic feedback
      </label>
    </div>
  );
}
