import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * A dish name kept to one line. When it's cut off, tapping it shows the whole name (tap again to
 * shorten). Names that fit are plain text.
 */
export function DishName({ name, className }: { name: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [cut, setCut] = useState(false);
  const [open, setOpen] = useState(false);
  const overflows = () => {
    const el = ref.current;
    return !!el && el.scrollWidth > el.clientWidth + 1;
  };

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el || open) return;
    const check = () => setCut(overflows());
    check();
    // The display font can load after first paint and widen the text without resizing the box.
    void document.fonts?.ready.then(check);
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [name, open]);

  const toggle = (e: { stopPropagation: () => void }) => {
    if (!open && !overflows()) return;
    e.stopPropagation();
    setOpen(!open);
  };
  const interactive = cut || open;

  return (
    <span
      ref={ref}
      onClick={toggle}
      onKeyDown={(e) => {
        if (interactive && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          toggle(e);
        }
      }}
      {...(interactive
        ? {
            role: "button",
            tabIndex: 0,
            "aria-expanded": open,
            "aria-label": open ? name : `${name}, tap to show the full name`,
          }
        : {})}
      className={cn(
        "block min-w-0",
        open ? "break-words whitespace-normal" : "truncate",
        interactive && "cursor-pointer",
        className,
      )}
    >
      {name}
    </span>
  );
}
