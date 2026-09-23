import { useState } from "react";

type OliveMood = "friendly" | "thinking" | "cheer";

interface OliveProps {
  size?: number;
  mood?: OliveMood;
  className?: string;
}

const ASSET_PATH = "/brand/olive.svg";

/**
 * Olive, the companion. Drawn here from the palette in the same soft,
 * hand-drawn manner as the logo. If a designed asset is dropped at
 * public/brand/olive.svg it is used instead, so swapping her is one file.
 */
export function Olive({ size = 44, mood = "friendly", className = "" }: OliveProps) {
  const [assetFailed, setAssetFailed] = useState(false);

  if (!assetFailed) {
    return (
      <img
        src={ASSET_PATH}
        alt=""
        aria-hidden="true"
        width={size}
        height={size}
        onError={() => setAssetFailed(true)}
        className={className}
        style={{ display: "block" }}
      />
    );
  }

  const browLift = mood === "thinking" ? 2 : 0;
  const mouthPath =
    mood === "cheer"
      ? "M26 40 q6 7 12 0"
      : mood === "thinking"
        ? "M28 41 q4 2 8 0"
        : "M27 40 q5 5 10 0";

  return (
    <svg
      viewBox="0 0 64 64"
      width={size}
      height={size}
      role="img"
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: "block" }}
    >
      {/* body: an olive, tilted a touch so she reads as drawn rather than placed */}
      <g transform="rotate(-6 32 34)">
        <ellipse cx="32" cy="34" rx="20" ry="24" fill="var(--veg)" />
        <ellipse cx="32" cy="34" rx="20" ry="24" fill="none" stroke="var(--ink)" strokeWidth="2.5" opacity="0.85" />
        {/* the pimento dimple, the olive's one bright note */}
        <ellipse cx="32" cy="16" rx="7" ry="4.5" fill="var(--protein)" />
        <ellipse cx="32" cy="16" rx="7" ry="4.5" fill="none" stroke="var(--ink)" strokeWidth="2" opacity="0.8" />
        {/* a leaf, so she is unmistakably a growing thing */}
        <path d="M48 16 q9 -6 12 -13 q-9 0 -13 6 q-2 4 1 7 z" fill="var(--accent)" stroke="var(--ink)" strokeWidth="2" strokeLinejoin="round" opacity="0.9" />
        {/* face */}
        <circle cx="25" cy={33 - browLift} r="2.6" fill="var(--ink)" />
        <circle cx="39" cy={33 - browLift} r="2.6" fill="var(--ink)" />
        <path d={mouthPath} fill="none" stroke="var(--ink)" strokeWidth="2.4" strokeLinecap="round" />
        {/* cheeks */}
        <ellipse cx="20" cy="38" rx="3" ry="2" fill="var(--protein)" opacity="0.35" />
        <ellipse cx="44" cy="38" rx="3" ry="2" fill="var(--protein)" opacity="0.35" />
      </g>
    </svg>
  );
}
