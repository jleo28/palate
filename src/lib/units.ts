export function cmToFtIn(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches - feet * 12);
  if (inches === 12) return { feet: feet + 1, inches: 0 };
  return { feet, inches };
}

export function ftInToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLb(kg: number): number {
  return Math.round(kg * 2.20462);
}

export function lbToKg(lb: number): number {
  return lb / 2.20462;
}
