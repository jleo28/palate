import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from "react";

interface SheetProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Past this far down, releasing dismisses rather than springs back. */
const DISMISS_PX = 110;

export function Sheet({ title, open, onClose, children }: SheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const dragStart = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);

  useEffect(() => {
    if (!open) {
      setDragY(0);
      return;
    }
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    dragStart.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return;
    // Only downward drags move the sheet; pulling up does nothing.
    setDragY(Math.max(0, e.clientY - dragStart.current));
  };

  const onPointerUp = () => {
    if (dragStart.current === null) return;
    const shouldClose = dragY > DISMISS_PX;
    dragStart.current = null;
    setDragY(0);
    if (shouldClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button type="button" aria-label="Close" className="absolute inset-0 bg-ink/40" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="relative z-10 w-full max-w-[430px] rounded-t-sheet bg-plate pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-xl"
        style={{
          transform: `translateY(${dragY}px)`,
          transition: dragStart.current === null ? "transform 220ms cubic-bezier(0.22,0.61,0.36,1)" : "none",
          maxHeight: "88dvh",
          overflowY: "auto",
        }}
      >
        {/* the grab handle: drag anywhere on this header to pull the sheet down */}
        <div
          className="cursor-grab touch-none px-5 pt-3 active:cursor-grabbing"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-line-strong opacity-60" />
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 id="sheet-title" className="font-display text-lg text-ink">
              {title}
            </h2>
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              className="tap-target flex items-center justify-center rounded-full text-ink-soft"
              aria-label="Close"
            >
              &#10005;
            </button>
          </div>
        </div>
        <div className="px-5">{children}</div>
      </div>
    </div>
  );
}
