import { useEffect, useId, useRef, useState } from "react";
import type { MenuItem, Plate as PlateModel } from "../core/types";
import { foodColor } from "../lib/foodColors";

interface PlateProps {
  plate: PlateModel;
  itemsById: Map<string, MenuItem>;
  onWedgeClick?: (itemId: string) => void;
  /** 300 on the plate view, smaller inside a dashboard card. */
  size?: number;
  /** Mini plates inside cards skip the centre readout. */
  showCenter?: boolean;
}

const CX = 150;
const CY = 150;
const R = 122;

/** Items land one after another rather than all at once. */
const STAGGER_MS = 90;

function polarPoint(angleDeg: number, radius: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

function wedgePath(startDeg: number, endDeg: number, radius: number): string {
  if (endDeg - startDeg >= 359.999) {
    const mid = startDeg + 180;
    return `${wedgePath(startDeg, mid, radius)} ${wedgePath(mid, endDeg, radius)}`;
  }
  const start = polarPoint(startDeg, radius);
  const end = polarPoint(endDeg, radius);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function Plate({ plate, itemsById, onWedgeClick, size = 300, showCenter = true }: PlateProps) {
  const uid = useId().replace(/:/g, "");
  const signature = plate.lines.map((l) => `${l.itemId}:${l.servings}`).join("|");
  const [served, setServed] = useState(0);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  // Serve the plate: each item lands in turn. Reduced motion puts the whole
  // plate down at once.
  useEffect(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];

    const count = plate.lines.length;
    if (count === 0) {
      setServed(0);
      return;
    }

    if (prefersReducedMotion()) {
      setServed(count);
      return;
    }

    setServed(0);
    for (let i = 1; i <= count; i++) {
      timers.current.push(setTimeout(() => setServed(i), i * STAGGER_MS));
    }

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
  }, [signature, plate.lines.length]);

  const totalKcal = plate.lines.reduce((sum, l) => sum + l.kcal, 0);
  let cursor = 0;
  const wedges = plate.lines.map((line) => {
    const item = itemsById.get(line.itemId);
    const share = totalKcal > 0 ? line.kcal / totalKcal : 1 / Math.max(plate.lines.length, 1);
    const startDeg = cursor * 360;
    cursor += share;
    const endDeg = cursor * 360;
    return {
      line,
      item,
      path: wedgePath(startDeg, Math.max(endDeg, startDeg + 0.5), R),
      color: foodColor(item),
    };
  });

  const description =
    plate.lines.length === 0
      ? "No plate could be assembled for the current filters."
      : plate.lines.map((l) => `${itemsById.get(l.itemId)?.name ?? l.itemId}, ${l.portionLabel}`).join("; ");

  const centerR = R * 0.4;

  return (
    <div className="mx-auto flex flex-col items-center" style={{ width: size, maxWidth: "100%" }}>
      <svg
        viewBox="0 0 300 300"
        role="img"
        aria-label={`Plate: ${description}`}
        className="w-full overflow-visible"
      >
        <title>Today&apos;s plate</title>
        <desc>{description}</desc>

        <defs>
          {/* the plate sits on the surface rather than being drawn on it */}
          <filter id={`shadow-${uid}`} x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow dx="0" dy="6" stdDeviation="7" floodColor="var(--ink)" floodOpacity="0.16" />
          </filter>
          {/* the rim catches light at the top left and falls away at the bottom right */}
          <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="0.7" y2="1">
            <stop offset="0%" stopColor="var(--plate-rim-high)" />
            <stop offset="55%" stopColor="var(--plate)" />
            <stop offset="100%" stopColor="var(--plate-rim-low)" />
          </linearGradient>
          <radialGradient id={`well-${uid}`} cx="0.42" cy="0.36" r="0.75">
            <stop offset="0%" stopColor="var(--plate-rim-high)" />
            <stop offset="100%" stopColor="var(--plate)" />
          </radialGradient>
        </defs>

        {/* rim */}
        <circle cx={CX} cy={CY} r={R + 16} fill={`url(#rim-${uid})`} filter={`url(#shadow-${uid})`} />
        <circle cx={CX} cy={CY} r={R + 16} fill="none" stroke="var(--plate-rim-low)" strokeWidth="1.5" opacity="0.9" />
        {/* the well the food sits in */}
        <circle cx={CX} cy={CY} r={R + 3} fill={`url(#well-${uid})`} />
        <circle cx={CX} cy={CY} r={R + 3} fill="none" stroke="var(--plate-rim-low)" strokeWidth="1" opacity="0.7" />

        {wedges.map((w, i) => {
          const visible = i < served;
          return (
            <g
              key={w.line.itemId}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? "scale(1)" : "scale(0.86)",
                transformOrigin: "150px 150px",
                transition: "opacity 220ms ease-out, transform 260ms cubic-bezier(0.34, 1.4, 0.64, 1)",
              }}
            >
              <path
                d={w.path}
                fill={w.color}
                stroke="var(--plate)"
                strokeWidth={2.5}
                strokeLinejoin="round"
                className={onWedgeClick ? "cursor-pointer" : undefined}
                onClick={onWedgeClick ? () => onWedgeClick(w.line.itemId) : undefined}
              />
              {/* a soft highlight so the food reads as having body */}
              <path d={w.path} fill="var(--plate-rim-high)" opacity="0.14" style={{ pointerEvents: "none" }} />
            </g>
          );
        })}

        {plate.lines.length === 0 && <circle cx={CX} cy={CY} r={R} fill="var(--tray)" opacity="0.5" />}

        {showCenter && (
          <>
            <circle cx={CX} cy={CY} r={centerR} fill="var(--plate)" />
            <circle cx={CX} cy={CY} r={centerR} fill="none" stroke="var(--plate-rim-low)" strokeWidth="1" />
            <text x={CX} y={CY - 4} textAnchor="middle" className="font-display" fontSize={30} fill="var(--ink)">
              {plate.totals.kcal}
            </text>
            <text x={CX} y={CY - 4} textAnchor="middle" dy={19} fontSize={13} fill="var(--ink-soft)">
              cal
            </text>
            <text x={CX} y={CY + 33} textAnchor="middle" fontSize={15} fill="var(--ink-soft)">
              {plate.totals.protein} g protein
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
