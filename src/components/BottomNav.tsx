import { NavLink } from "react-router-dom";
import { tap } from "../lib/haptics";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `tap-target flex flex-1 flex-col items-center justify-center gap-0.5 py-2 text-sm ${
    isActive ? "font-bold text-accent" : "text-ink-soft"
  }`;

/**
 * Fixed to the bottom of the phone-width column, inside the thumb zone, and
 * clear of the home indicator.
 */
export function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 z-30 mx-auto flex w-full max-w-[430px] border-t border-line bg-plate pb-[env(safe-area-inset-bottom,0px)]"
      style={{ left: "50%", transform: "translateX(-50%)" }}
      aria-label="Primary"
    >
      <NavLink to="/" className={linkClass} onClick={() => tap()} end>
        Home
      </NavLink>
      <NavLink to="/profile" className={linkClass} onClick={() => tap()}>
        Profile
      </NavLink>
    </nav>
  );
}
