import type { ReactNode } from "react";
import { Olive } from "./Olive";

interface OliveSaysProps {
  children: ReactNode;
  /** "line" is Olive speaking inline, "card" is a dismissible tip or empty state. */
  variant?: "line" | "card";
  onDismiss?: () => void;
  dismissLabel?: string;
  size?: number;
  action?: ReactNode;
}

/**
 * The only way Olive speaks. She appears in onboarding, once on the dashboard,
 * and in empty or edge states. Nowhere else, and never as a persistent
 * floating character.
 */
export function OliveSays({
  children,
  variant = "line",
  onDismiss,
  dismissLabel = "Got it",
  size = 40,
  action,
}: OliveSaysProps) {
  if (variant === "line") {
    return (
      <div className="flex items-start gap-3">
        <Olive size={size} className="shrink-0" />
        <p className="pt-1 text-base text-ink-soft">{children}</p>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-3 rounded-sheet border border-line bg-plate p-4 shadow-soft">
      <Olive size={size} mood="cheer" className="shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <p className="text-base text-ink">{children}</p>
        {(action || onDismiss) && (
          <div className="flex flex-wrap items-center gap-2">
            {action}
            {onDismiss && (
              <button
                type="button"
                onClick={onDismiss}
                className="tap-target rounded-chip border-2 border-line-strong px-4 text-sm text-ink"
              >
                {dismissLabel}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
