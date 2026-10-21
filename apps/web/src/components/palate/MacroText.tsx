import { macroLine } from "@/lib/palate/macro-text";
import { useHideNumbers } from "@/lib/palate/hide-numbers";

type Macros = Parameters<typeof macroLine>[0];

/** A spelled-out macro line, or nothing when Hide Numbers is on. */
export function MacroText({ m, prefix = "" }: { m: Macros; prefix?: string }) {
  return useHideNumbers() ? null : (
    <>
      {prefix}
      {macroLine(m)}
    </>
  );
}
