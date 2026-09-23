import { useRef } from "react";

const LONG_PRESS_MS = 550;

export function useLongPress(onLongPress: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const triggered = useRef(false);

  const start = () => {
    triggered.current = false;
    timer.current = setTimeout(() => {
      triggered.current = true;
      onLongPress();
    }, LONG_PRESS_MS);
  };

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
  };

  return {
    onPointerDown: start,
    onPointerUp: clear,
    onPointerLeave: clear,
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  };
}
