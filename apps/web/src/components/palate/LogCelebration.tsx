import { useEffect, useRef, type CSSProperties } from "react";
import type { Seedling } from "@palate/core";
import { SeedlingAvatar } from "./SeedlingAvatar";

const COLORS = ["var(--olive)", "var(--amber-ink)", "var(--clay)", "oklch(0.82 0.13 95)"];

// Fixed, not random, so the burst looks the same every time and renders the same on the server.
const PIECES = Array.from({ length: 22 }, (_, i) => ({
  angle: (360 / 22) * i + (i % 3) * 7,
  distance: 90 + ((i * 37) % 70),
  color: COLORS[i % COLORS.length],
  delay: (i % 4) * 30,
  round: i % 2 === 0,
}));

/** A short party when a meal is logged: Seedling jumps, blows a party horn, confetti flies. */
export function LogCelebration({ seedling, onDone }: { seedling: Seedling; onDone: () => void }) {
  // A ref keeps the timer from restarting when the parent passes a new callback.
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const t = setTimeout(() => done.current(), 1800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className="party-fade fixed inset-0 z-50 grid place-items-center bg-background/75 backdrop-blur-[2px]"
      onClick={onDone}
      role="status"
      aria-label="Meal logged"
    >
      <div className="relative size-40">
        {PIECES.map((p, i) => (
          <span
            key={i}
            aria-hidden
            className="confetti absolute left-1/2 top-1/2 h-3.5 w-2"
            style={
              {
                "--angle": `${p.angle}deg`,
                "--distance": `${p.distance}px`,
                animationDelay: `${p.delay}ms`,
                background: p.color,
                borderRadius: p.round ? "9999px" : "1px",
              } as CSSProperties
            }
          />
        ))}
        <div className="pet-party relative size-40">
          <SeedlingAvatar seedling={seedling} className="size-40" />
          {/* Party horn with its streamer unrolling. */}
          <svg
            viewBox="0 0 60 40"
            className="absolute -right-12 top-[4.5rem] w-24"
            fill="none"
            strokeLinecap="round"
            aria-hidden
          >
            <path d="M2 22 L22 14 L22 30 Z" fill="var(--amber-ink)" />
            <path d="M8 19.5 L8 24.5 M14 17 L14 27" stroke="var(--background)" strokeWidth="2" />
            <path
              className="party-streamer"
              d="M22 22 C32 22 34 12 42 14 C50 16 48 26 56 24"
              stroke="var(--clay)"
              strokeWidth="3.5"
              pathLength={1}
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
