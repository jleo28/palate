import { cn } from "@/lib/utils";

// Olive, Palate's companion. Geometry and colours come from the Olive asset pack
// (olive-curious.svg, 140×140 viewBox). Inlined so the motion classes can reach #leaf and #eyes.
// Flat fills only, per the brand rules; these are fixed character colours, not theme tokens.
export function Olive({
  className,
  label = "Olive, Palate's companion",
}: {
  className?: string;
  label?: string;
}) {
  return (
    <svg
      viewBox="0 0 140 140"
      className={cn("olive olive--idle", className)}
      role="img"
      aria-label={label}
    >
      <ellipse
        id="leaf"
        cx="80"
        cy="24"
        rx="11"
        ry="5"
        fill="#8A9560"
        transform="rotate(-35 80 24)"
      />
      <rect x="68.5" y="26" width="4" height="10" rx="2" fill="#6F7A4E" />
      <path
        d="M70 34 C30 34 22 74 26 96 C30 118 110 118 114 96 C118 74 110 34 70 34 Z"
        fill="#8A9560"
      />
      <g id="eyes">
        <ellipse cx="53" cy="80" rx="5.5" ry="7.5" fill="#241F19" />
        <ellipse cx="87" cy="80" rx="5.5" ry="7.5" fill="#241F19" />
        <circle cx="55" cy="77" r="1.9" fill="#F2EAD9" />
        <circle cx="89" cy="77" r="1.9" fill="#F2EAD9" />
      </g>
      <ellipse cx="70" cy="96" rx="3.4" ry="3.8" fill="#241F19" />
      <ellipse cx="39" cy="92" rx="7" ry="4" fill="#E0A468" />
      <ellipse cx="101" cy="92" rx="7" ry="4" fill="#E0A468" />
    </svg>
  );
}
