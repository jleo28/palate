function pluralize(unit: string, servings: number): string {
  if (servings <= 1) return unit;
  if (unit.endsWith("s")) return unit;
  return `${unit}s`;
}

export function portionLabel(servings: number, servingUnit: string): string {
  const whole = Math.floor(servings);
  const frac = servings - whole;

  let numberLabel: string;
  if (servings === 0.5) {
    numberLabel = "½";
  } else if (frac === 0) {
    numberLabel = String(servings);
  } else if (Math.abs(frac - 0.5) < 1e-9) {
    numberLabel = `${whole}½`;
  } else {
    numberLabel = String(servings);
  }

  const unit = pluralize(servingUnit, servings);
  return `${numberLabel} ${unit}`;
}
