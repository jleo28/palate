type Macros = { kcal: number; protein: number; carbs: number; fat: number };

/** One line of macros, spelled out: "140 cal · 26g protein · 0g carbs · 3g fat". */
export function macroLine({ kcal, protein, carbs, fat }: Macros) {
  const r = Math.round;
  return `${r(kcal)} cal · ${r(protein)}g protein · ${r(carbs)}g carbs · ${r(fat)}g fat`;
}
