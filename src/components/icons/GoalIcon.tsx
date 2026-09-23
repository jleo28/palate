import type { Goal } from "../../core/types";

interface GoalIconProps {
  goal: Goal;
  size?: number;
  className?: string;
}

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * One drawing per goal, in the same hand-drawn line as the station icons.
 * None of these depict bodies, scales or measurements: see the wellbeing
 * guardrails in docs/PRODUCT_SPEC.md.
 */
function glyph(goal: Goal) {
  switch (goal) {
    // a level, balanced line
    case "steady":
      return (
        <>
          <path d="M4 14 q4 -3 8 0 q4 3 8 0" {...STROKE} />
          <path d="M12 6 v2.5" {...STROKE} />
          <circle cx="12" cy="18.5" r="1.4" {...STROKE} />
        </>
      );
    // a small sun, for steadier energy through the day
    case "energy":
      return (
        <>
          <circle cx="12" cy="12" r="4.5" {...STROKE} />
          <path d="M12 3.5 v2" {...STROKE} />
          <path d="M12 18.5 v2" {...STROKE} />
          <path d="M3.5 12 h2" {...STROKE} />
          <path d="M18.5 12 h2" {...STROKE} />
          <path d="M6 6 l1.5 1.5" {...STROKE} />
          <path d="M16.5 16.5 l1.5 1.5" {...STROKE} />
        </>
      );
    // a sprouting seed, for building
    case "build":
      return (
        <>
          <path d="M12 20 v-7" {...STROKE} />
          <path d="M12 13 q-5 0 -5 -5 q5 0 5 5" {...STROKE} />
          <path d="M12 14 q5 -1 5 -6 q-5 1 -5 6" {...STROKE} />
          <path d="M8 20 h8" {...STROKE} />
        </>
      );
    // a gently waning moon, for a small, unhurried change
    case "lean":
      return (
        <>
          <path d="M15.5 4.5 q-9 2 -9 8 q0 6 9 7 q-5 -4 -5 -7.5 q0 -4 5 -7.5" {...STROKE} />
          <path d="M18 8 q1 1.5 0 3" {...STROKE} />
        </>
      );
  }
}

export function GoalIcon({ goal, size = 24, className = "" }: GoalIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "block" }}
    >
      {glyph(goal)}
    </svg>
  );
}
