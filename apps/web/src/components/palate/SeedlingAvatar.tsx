import type { ReactElement } from "react";
import { TONES, seedlingDetails, type Seedling, type SpeciesId } from "@palate/core";
import { cn } from "@/lib/utils";

// Placeholder art in the brand's sketch style. Jasmine will supply final illustrations;
// swap them in here, keyed by species.
const ink = { className: "stroke-foreground", strokeWidth: 4, fill: "none" } as const;
const leaf = "fill-food-veg stroke-foreground";

const TOPS: Record<SpeciesId, ReactElement> = {
  sprout: (
    <>
      <path {...ink} d="M70 34v-12" />
      <path className={leaf} strokeWidth="4" d="M70 24c-4-14-20-16-26-8 6 10 18 12 26 8Z" />
      <path className={leaf} strokeWidth="4" d="M70 24c4-14 20-16 26-8-6 10-18 12-26 8Z" />
    </>
  ),
  clover: (
    <>
      <path {...ink} d="M70 34V24" />
      <circle className={leaf} strokeWidth="4" cx="60" cy="16" r="9" />
      <circle className={leaf} strokeWidth="4" cx="80" cy="16" r="9" />
      <circle className={leaf} strokeWidth="4" cx="70" cy="6" r="9" />
    </>
  ),
  fern: (
    <path
      className={leaf}
      strokeWidth="4"
      d="M70 34C66 22 58 14 50 10l8 8-12 0 12 6-10 4 14 2C64 32 68 34 70 34c2 0 6-2 8-4l14-2-10-4 12-6-12 0 8-8c-8 4-16 12-20 24Z"
    />
  ),
  cactus: (
    <>
      <rect className={leaf} strokeWidth="4" x="61" y="2" width="18" height="34" rx="9" />
      <path className={leaf} strokeWidth="4" d="M61 22h-8c-4 0-6-3-6-6v-6" />
      <path className={leaf} strokeWidth="4" d="M79 18h8c4 0 6-3 6-6V6" />
    </>
  ),
  tulip: (
    <>
      <path {...ink} d="M70 34V22" />
      <path
        className="fill-food-fruit stroke-foreground"
        strokeWidth="4"
        d="M56 6l7 6 7-10 7 10 7-6c2 12-4 18-14 18S54 18 56 6Z"
      />
    </>
  ),
  sunflower: (
    <>
      <path {...ink} d="M70 34V26" />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse
          key={i}
          className="fill-food-yolk stroke-foreground"
          strokeWidth="3"
          cx="70"
          cy="2"
          rx="5"
          ry="9"
          transform={`rotate(${i * 45} 70 14)`}
        />
      ))}
      <circle
        className="fill-food-protein stroke-foreground"
        strokeWidth="3"
        cx="70"
        cy="14"
        r="7"
      />
    </>
  ),
  mushroom: (
    <>
      <path
        className="fill-food-fruit stroke-foreground"
        strokeWidth="4"
        d="M44 30c0-16 12-26 26-26s26 10 26 26Z"
      />
      <circle className="fill-card" cx="60" cy="18" r="4" />
      <circle className="fill-card" cx="80" cy="14" r="3" />
    </>
  ),
  basil: (
    <>
      <path {...ink} d="M70 34V26" />
      <path className={leaf} strokeWidth="4" d="M70 28C52 24 50 4 70 0c20 4 18 24 0 28Z" />
      <path className="stroke-food-veg-ink" strokeWidth="2.5" d="M70 26V6" />
    </>
  ),
  mint: (
    <>
      <path {...ink} d="M70 34V8" />
      {[
        [58, 24, -30],
        [82, 24, 30],
        [60, 12, -30],
        [80, 12, 30],
      ].map(([x, y, r]) => (
        <ellipse
          key={`${x}-${y}`}
          className={leaf}
          strokeWidth="3"
          cx={x}
          cy={y}
          rx="8"
          ry="5"
          transform={`rotate(${r} ${x} ${y})`}
        />
      ))}
    </>
  ),
  bamboo: (
    <>
      <rect className={leaf} strokeWidth="4" x="56" y="4" width="10" height="32" rx="3" />
      <rect className={leaf} strokeWidth="4" x="74" y="10" width="10" height="26" rx="3" />
      <path {...ink} strokeWidth="2.5" d="M56 18h10m8 4h10" />
    </>
  ),
  succulent: (
    <path
      className={leaf}
      strokeWidth="4"
      d="M70 34 52 30c-6-8-4-14 2-18l8 10 2-18 6 14 6-14 2 18 8-10c6 4 8 10 2 18Z"
    />
  ),
  daisy: (
    <>
      <path {...ink} d="M70 34V24" />
      {Array.from({ length: 6 }, (_, i) => (
        <ellipse
          key={i}
          className="fill-card stroke-foreground"
          strokeWidth="3"
          cx="70"
          cy="3"
          rx="5"
          ry="8"
          transform={`rotate(${i * 60} 70 13)`}
        />
      ))}
      <circle className="fill-food-yolk stroke-foreground" strokeWidth="3" cx="70" cy="13" r="5" />
    </>
  ),
};

const STAGE_SCALE = [0.74, 0.84, 0.92, 1];

interface Props {
  seedling: Seedling;
  /** Growth stage 0–3. */
  stage?: number;
  className?: string;
  celebrate?: boolean;
}

export function SeedlingAvatar({ seedling, stage = 3, className, celebrate }: Props) {
  const d = seedlingDetails(seedling.seed);
  const tone = TONES[seedling.tone] ?? TONES[0];

  return (
    <svg
      viewBox="0 0 140 140"
      className={cn(celebrate && "pet-celebrate", className)}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <g
        transform={`translate(70 136) scale(${STAGE_SCALE[stage] ?? 1}) rotate(${d.tilt}) translate(-70 -136)`}
      >
        <g transform="translate(0 8)">{TOPS[seedling.species]}</g>
        <path
          className="stroke-foreground"
          strokeWidth="4"
          style={{ fill: tone }}
          d="M35 50c2-10 14-16 35-16s33 6 35 16l-5 62c-1 12-15 17-30 17s-30-5-31-17Z"
        />
        <path {...ink} d="M51 127l-2 9m39-9 2 9" />
        {d.eyes === "happy" ? (
          <path {...ink} strokeWidth="3.5" d="M54 86c2-4 8-4 10 0m14 0c2-4 8-4 10 0" />
        ) : (
          <>
            <circle className="fill-foreground" cx="59" cy="86" r={d.eyes === "wide" ? 5 : 3.5} />
            <circle className="fill-foreground" cx="83" cy="86" r={d.eyes === "wide" ? 5 : 3.5} />
          </>
        )}
        <path {...ink} strokeWidth="3" d="M66 95c3 3 7 3 10 0" />
        {d.cheeks && (
          <>
            <circle className="fill-food-fruit/60" cx="49" cy="96" r="5" />
            <circle className="fill-food-fruit/60" cx="93" cy="96" r="5" />
          </>
        )}
        {d.freckle && <circle className="fill-foreground/40" cx="88" cy="74" r="1.8" />}
      </g>
    </svg>
  );
}
