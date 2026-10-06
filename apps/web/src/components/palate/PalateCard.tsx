import { useEffect, useRef, useState, type ReactNode } from "react";
import { Check, Pencil } from "lucide-react";
import { cn } from "@/lib/utils";

const PEEK_KEY = "palate.cardPeek.v1";
const HALF_MS = 180;

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

interface Props {
  front: ReactNode;
  back: ReactNode;
}

/**
 * A card that flips on the Y axis between front and back. It turns 90°, swaps faces, then turns
 * back, so each face keeps its own height. Under reduced motion it crossfades instead. On the first
 * visit it half-flips once to hint that there's a back.
 */
export function PalateCard({ front, back }: Props) {
  const [side, setSide] = useState<"front" | "back">("front");
  const [turn, setTurn] = useState({ angle: 0, animate: true });
  const [fading, setFading] = useState(false);
  const [peek, setPeek] = useState(false);
  const busy = useRef(false);
  const swipeFrom = useRef<number | null>(null);

  useEffect(() => {
    try {
      if (localStorage.getItem(PEEK_KEY)) return;
      localStorage.setItem(PEEK_KEY, "1");
    } catch {
      return;
    }
    if (!reducedMotion()) setPeek(true);
  }, []);

  const flip = () => {
    if (busy.current) return;
    busy.current = true;
    const next = side === "front" ? "back" : "front";

    if (reducedMotion()) {
      setFading(true);
      setTimeout(() => {
        setSide(next);
        setFading(false);
        busy.current = false;
      }, 150);
      return;
    }

    const out = next === "back" ? 90 : -90;
    setTurn({ angle: out, animate: true });
    setTimeout(() => {
      // Edge-on: swap faces and jump to the opposite edge without animating, then turn in.
      setSide(next);
      setTurn({ angle: -out, animate: false });
      // A short timer (not rAF, which pauses in hidden tabs) lets the jump paint first.
      setTimeout(() => {
        setTurn({ angle: 0, animate: true });
        setTimeout(() => (busy.current = false), HALF_MS);
      }, 20);
    }, HALF_MS);
  };

  return (
    <div style={{ perspective: 900 }}>
      <section
        onAnimationEnd={() => setPeek(false)}
        className={cn(
          "card-edge relative rounded-3xl bg-card p-5",
          peek && "card-peek",
          fading ? "opacity-0" : "opacity-100",
          "transition-opacity duration-150",
        )}
        style={{
          transform: `rotateY(${turn.angle}deg)`,
          transition: turn.animate ? `transform ${HALF_MS}ms ease-in-out, opacity 150ms` : "none",
        }}
        aria-label={side === "front" ? "Your Palate card" : "Goals and settings"}
      >
        <button
          type="button"
          onClick={flip}
          aria-label={
            side === "front" ? "Edit goals and settings" : "Done, show the front of your card"
          }
          className="absolute top-3 right-3 z-10 flex h-9 items-center gap-1.5 rounded-full border border-foreground/20 bg-background/90 px-3 text-xs font-bold"
        >
          {side === "front" ? (
            <>
              <Pencil className="size-3.5" aria-hidden /> Edit
            </>
          ) : (
            <>
              <Check className="size-3.5" aria-hidden /> Done
            </>
          )}
        </button>
        {side === "front" ? (
          // The whole front is a flip target: tap it, or swipe it sideways.
          <button
            type="button"
            onClick={flip}
            onPointerDown={(e) => (swipeFrom.current = e.clientX)}
            onPointerUp={(e) => {
              const from = swipeFrom.current;
              swipeFrom.current = null;
              if (from !== null && Math.abs(e.clientX - from) > 50) flip();
            }}
            aria-label="Your Palate card. Tap to edit goals and settings."
            className="block w-full cursor-pointer touch-pan-y text-left"
          >
            {front}
          </button>
        ) : (
          back
        )}
      </section>

      {side === "front" && (
        <button
          type="button"
          onClick={flip}
          className="mt-2 w-full text-center text-xs font-semibold text-olive underline-offset-2 hover:underline"
        >
          Tap the card to edit your goals & settings
        </button>
      )}
    </div>
  );
}
