const VOWELS = "aeiou";

function pluralize(unit: string, servings: number): string {
  if (servings <= 1) return unit;
  if (unit.endsWith("s")) return unit;
  // "patty" -> "patties", but "tray" -> "trays"
  if (unit.endsWith("y") && !VOWELS.includes(unit[unit.length - 2])) {
    return `${unit.slice(0, -1)}ies`;
  }
  if (unit.endsWith("ch") || unit.endsWith("sh") || unit.endsWith("x")) {
    return `${unit}es`;
  }
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
