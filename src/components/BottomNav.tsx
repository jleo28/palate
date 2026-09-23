import { NavLink } from "react-router-dom";

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `tap-target flex flex-1 flex-col items-center justify-center gap-0.5 text-sm ${
    isActive ? "font-bold text-cardinal" : "text-ink-soft"
  }`;

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-30 flex border-t border-line bg-plate pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Primary"
    >
      <NavLink to="/today" className={linkClass}>
        Today
      </NavLink>
      <NavLink to="/profile" className={linkClass}>
        Profile
      </NavLink>
    </nav>
  );
}
