import type { ButtonHTMLAttributes, ReactNode } from "react";

interface BobButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  bobbing?: boolean;
  children: ReactNode;
}

/**
 * A button that plays the same confirmation bob as an onboarding option, so
 * pressing Continue feels like choosing an answer rather than something else.
 */
export function BobButton({
  variant = "primary",
  bobbing = false,
  className = "",
  children,
  ...props
}: BobButtonProps) {
  const base = "option-button tap-target rounded-chip font-display text-base disabled:opacity-50";
  const look =
    variant === "primary"
      ? "bg-accent text-plate px-6"
      : "border-2 border-line-strong bg-plate text-ink px-5";

  return (
    <button
      type="button"
      className={`${base} ${look} ${bobbing ? "is-confirming" : ""} ${className}`.trim()}
      {...props}
    >
      <span className="flex w-full items-center justify-center">{children}</span>
    </button>
  );
}
