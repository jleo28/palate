import { Info } from "lucide-react";
import { CONFIRM_WITH_STAFF } from "@palate/core";
import { cn } from "@/lib/utils";

/** The allergen disclaimer, sized to be noticed. Neutral on purpose: red is for allergen hits. */
export function AllergenNotice({
  filtered = false,
  className,
}: {
  /** True when the user has allergies and we've left matching items out. */
  filtered?: boolean;
  className?: string;
}) {
  return (
    <div
      role="note"
      className={cn(
        "flex gap-2 rounded-xl border border-foreground/15 bg-card px-3 py-2 text-xs",
        className,
      )}
    >
      <Info className="mt-px size-4 shrink-0 text-muted-foreground" aria-hidden />
      <p className="text-muted-foreground">
        {filtered
          ? "We left out items USC lists with your allergies, but labels can be incomplete and kitchens share equipment."
          : "Allergen info comes from USC's labels, which can be incomplete, and kitchens share equipment."}{" "}
        <span className="font-semibold text-foreground">{CONFIRM_WITH_STAFF} before you eat.</span>
      </p>
    </div>
  );
}
