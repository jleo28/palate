import { useState } from "react";
import { Plus } from "lucide-react";
import { ALLERGENS, type Allergen } from "@palate/core";
import { cn } from "@/lib/utils";
import { CustomAllergyInput } from "./CustomAllergyInput";

const chip = "rounded-full border px-3 py-1.5 text-xs font-semibold";
const on = "border-destructive bg-destructive text-destructive-foreground";
const off = "border-foreground/20 text-muted-foreground";

interface Props {
  allergies: Allergen[];
  onAllergies: (next: Allergen[]) => void;
  custom: string[];
  onCustom: (next: string[]) => void;
}

/** The nine listed allergens plus an "Other" chip that opens a free-text field. */
export function AllergyPicker({ allergies, onAllergies, custom, onCustom }: Props) {
  const [otherOpen, setOtherOpen] = useState(custom.length > 0);
  const showOther = otherOpen || custom.length > 0;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Allergies">
        {ALLERGENS.map((a) => {
          const active = allergies.includes(a.id);
          return (
            <button
              key={a.id}
              type="button"
              aria-pressed={active}
              onClick={() =>
                onAllergies(active ? allergies.filter((x) => x !== a.id) : [...allergies, a.id])
              }
              className={cn(chip, active ? on : off)}
            >
              {a.label}
            </button>
          );
        })}
        <button
          type="button"
          aria-expanded={showOther}
          aria-controls="other-allergies"
          onClick={() => setOtherOpen((open) => !open || custom.length > 0)}
          className={cn(chip, "flex items-center gap-1", custom.length ? on : off)}
        >
          <Plus className="size-3" aria-hidden /> Other
          {custom.length > 0 && ` (${custom.length})`}
        </button>
      </div>
      {showOther && (
        <div id="other-allergies">
          <CustomAllergyInput value={custom} onChange={onCustom} />
        </div>
      )}
    </div>
  );
}
