import { useState } from "react";
import { Plus, X } from "lucide-react";
import { CONFIRM_WITH_STAFF } from "@palate/core";

interface Props {
  value: string[];
  onChange: (next: string[]) => void;
}

/** Free-text "Other" allergies. Matches on item names are possible, never certain. */
export function CustomAllergyInput({ value, onChange }: Props) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const term = draft.trim();
    if (term && !value.some((v) => v.toLowerCase() === term.toLowerCase())) {
      onChange([...value, term]);
    }
    setDraft("");
  };

  return (
    <div className="space-y-2">
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          add();
        }}
      >
        <label className="sr-only" htmlFor="custom-allergy">
          Other allergy
        </label>
        <input
          id="custom-allergy"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Other, e.g. coconut"
          className="h-9 min-w-0 flex-1 rounded-full border border-foreground/20 bg-background px-3 text-sm"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="flex h-9 items-center gap-1 rounded-full border border-foreground/25 px-3 text-xs font-bold disabled:opacity-40"
        >
          <Plus className="size-3.5" /> Add
        </button>
      </form>

      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Other allergies">
          {value.map((term) => (
            <li
              key={term}
              className="flex items-center gap-1 rounded-full border border-destructive bg-destructive px-3 py-1 text-xs font-semibold text-destructive-foreground"
            >
              {term}
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v !== term))}
                aria-label={`Remove ${term}`}
                className="-mr-1 grid size-5 place-items-center rounded-full"
              >
                <X className="size-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        We flag item names that mention these, but recipes don't always say. {CONFIRM_WITH_STAFF}.
      </p>
    </div>
  );
}
