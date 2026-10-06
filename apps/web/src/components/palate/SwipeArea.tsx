import { useRef, type ReactNode } from "react";

const THRESHOLD = 50;

interface Props {
  onNext: () => void;
  onPrevious: () => void;
  label: string;
  children: ReactNode;
}

/**
 * Horizontal swipe target: left for next, right for previous. Vertical scrolling still works
 * (touch-action: pan-y), and arrow keys do the same as swipes for keyboard users.
 */
export function SwipeArea({ onNext, onPrevious, label, children }: Props) {
  const start = useRef<{ x: number; y: number } | null>(null);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={label}
      tabIndex={0}
      className="touch-pan-y select-none rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      onPointerDown={(e) => {
        start.current = { x: e.clientX, y: e.clientY };
      }}
      onPointerUp={(e) => {
        if (!start.current) return;
        const dx = e.clientX - start.current.x;
        const dy = e.clientY - start.current.y;
        start.current = null;
        if (Math.abs(dx) < THRESHOLD || Math.abs(dx) < Math.abs(dy)) return;
        if (dx < 0) onNext();
        else onPrevious();
      }}
      onPointerCancel={() => {
        start.current = null;
      }}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onNext();
        if (e.key === "ArrowLeft") onPrevious();
      }}
    >
      {children}
    </div>
  );
}
