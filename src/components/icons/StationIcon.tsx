interface StationIconProps {
  station: string;
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
 * One small drawing per station, in the same soft, slightly irregular line as
 * the logo: round caps, open shapes, nothing geometric or iconographic.
 */
function glyph(station: string) {
  switch (station) {
    case "Grill":
      return (
        <>
          <path d="M5 13 q7 -4 14 0" {...STROKE} />
          <path d="M7 13 v4 q0 2 2 2 h6 q2 0 2 -2 v-4" {...STROKE} />
          <path d="M9 8 q1.5 -2 0 -4" {...STROKE} />
          <path d="M12.5 8 q1.5 -2 0 -4" {...STROKE} />
          <path d="M16 8 q1.5 -2 0 -4" {...STROKE} />
        </>
      );
    case "Main Line":
      return (
        <>
          <path d="M4 15 q8 5 16 0" {...STROKE} />
          <path d="M4 15 q8 -6 16 0" {...STROKE} />
          <path d="M12 6 v3" {...STROKE} />
          <path d="M9.5 7.5 q2.5 -3 5 0" {...STROKE} />
        </>
      );
    case "Global Kitchen":
      return (
        <>
          <path d="M4 12 q8 -7 16 0" {...STROKE} />
          <path d="M3.5 12 h17" {...STROKE} />
          <path d="M6 15 q6 4 12 0" {...STROKE} />
          <path d="M12 5 v2.5" {...STROKE} />
        </>
      );
    case "Plant Based":
      return (
        <>
          <path d="M12 20 v-8" {...STROKE} />
          <path d="M12 13 q-6 -1 -6 -7 q6 0 6 6" {...STROKE} />
          <path d="M12.5 12 q5 -2 5.5 -7 q-5.5 1 -5.5 6" {...STROKE} />
        </>
      );
    case "Salad Bar":
      return (
        <>
          <path d="M4 11 q8 -6 16 0" {...STROKE} />
          <path d="M4 11 q1 8 8 8 q7 0 8 -8" {...STROKE} />
          <path d="M9 8 q1 -3 3 -2" {...STROKE} />
          <path d="M14 8.5 q2 -2.5 3 -1" {...STROKE} />
        </>
      );
    case "Deli":
      return (
        <>
          <path d="M5 16 q2 -9 7 -9 q5 0 7 9" {...STROKE} />
          <path d="M5 16 h14" {...STROKE} />
          <path d="M9 12 h.01" {...STROKE} />
          <path d="M13 10.5 h.01" {...STROKE} />
          <path d="M15 13.5 h.01" {...STROKE} />
        </>
      );
    case "Breakfast Bar":
      return (
        <>
          <ellipse cx="12" cy="13" rx="8" ry="6" {...STROKE} />
          <ellipse cx="12" cy="12.5" rx="3" ry="2.5" {...STROKE} />
          <path d="M6 6 q1.5 -2 0 -3.5" {...STROKE} />
          <path d="M18 6 q1.5 -2 0 -3.5" {...STROKE} />
        </>
      );
    case "Fruit & Dairy":
      return (
        <>
          <path d="M12 8 q-6 0 -6 6 q0 6 6 6 q6 0 6 -6 q0 -6 -6 -6" {...STROKE} />
          <path d="M12 8 q0 -3 3 -4" {...STROKE} />
          <path d="M12 7.5 q-2 -2 -4 -1.5" {...STROKE} />
        </>
      );
    default:
      return (
        <>
          <circle cx="12" cy="12" r="7" {...STROKE} />
          <path d="M9 12 q3 3 6 0" {...STROKE} />
        </>
      );
  }
}

export function StationIcon({ station, size = 20, className = "" }: StationIconProps) {
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
      {glyph(station)}
    </svg>
  );
}
