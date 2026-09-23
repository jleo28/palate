import { useEffect, useRef, type ReactNode } from "react";

interface SheetProps {
  title: string;
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

export function Sheet({ title, open, onClose, children }: SheetProps) {
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-ink/40"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="sheet-title"
        className="relative z-10 w-full max-w-md rounded-t-sheet bg-plate p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-xl"
      >
        <div className="mb-4 flex items-center justify-between">
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
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
