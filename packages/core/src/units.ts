/** Parse a number typed into a form. Blank or invalid input gives the fallback; 0 stays 0. */
export function parseNumber(value: string, fallback: number) {
  const n = Number(value.trim());
  return value.trim() === "" || !Number.isFinite(n) ? fallback : n;
}

/** Height in inches from feet and inches fields. Inches are clamped to 0–11. */
export function heightIn(feet: string, inches: string, fallback = { feet: 5, inches: 6 }) {
  const ft = Math.max(0, Math.round(parseNumber(feet, fallback.feet)));
  const inch = Math.min(11, Math.max(0, Math.round(parseNumber(inches, fallback.inches))));
  return ft * 12 + inch;
}

export const feetAndInches = (totalInches: number) => ({
  feet: Math.floor(totalInches / 12),
  inches: totalInches % 12,
});
