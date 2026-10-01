import { Link, useRouterState } from "@tanstack/react-router";
import { UtensilsCrossed, BookOpen, IdCard } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const TABS = [
  { to: "/", label: "The Plate", icon: UtensilsCrossed },
  { to: "/menus", label: "Hall Menus", icon: BookOpen },
  { to: "/card", label: "My Palate", icon: IdCard },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-md px-4 pb-28 pt-5">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-foreground/15 bg-card/95 backdrop-blur">
        <div className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map((t) => {
            const active = pathname === t.to;
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "flex flex-col items-center gap-1 py-3 text-[0.68rem] font-semibold transition-colors",
                  active ? "text-olive" : "text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "grid size-9 place-items-center rounded-full transition-colors",
                    active ? "bg-olive text-primary-foreground" : "bg-transparent",
                  )}
                >
                  <Icon className="size-[18px]" />
                </span>
                {t.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display text-2xl font-extrabold tracking-tight", className)}>
      Palate
      <span className="ml-1 inline-block size-2 translate-y-[-2px] rounded-full bg-olive" />
    </span>
  );
}

export function ScreenHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <header className="mb-4 grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
      <div className="min-w-0">
        <p className="label-caps text-muted-foreground">{sub}</p>
        <h1 className="truncate text-[1.7rem] font-extrabold leading-tight">{title}</h1>
      </div>
      <Wordmark className="shrink-0 pt-1" />
    </header>
  );
}
