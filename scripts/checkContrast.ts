/**
 * Verifies every foreground/background pairing the UI actually uses against
 * WCAG 2.1, in both light and dark mode, by parsing src/styles/tokens.css.
 * Run with `pnpm check:contrast`. Exits non-zero on any failure.
 */
import { readFileSync } from "node:fs";

type Mode = "light" | "dark";

const css = readFileSync(new URL("../src/styles/tokens.css", import.meta.url), "utf-8");

function parseTokens(): Record<Mode, Record<string, string>> {
  const darkStart = css.indexOf("@media (prefers-color-scheme: dark)");
  const lightSource = css.slice(0, darkStart);
  const darkSource = css.slice(darkStart);

  const read = (source: string) => {
    const out: Record<string, string> = {};
    for (const [, name, value] of source.matchAll(/--([a-z-]+):\s*(#[0-9a-fA-F]{6})\s*;/g)) {
      out[name] = value.toLowerCase();
    }
    return out;
  };

  const light = read(lightSource);
  return { light, dark: { ...light, ...read(darkSource) } };
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  const channels = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

interface Check {
  fg: string;
  bg: string;
  min: number;
  what: string;
}

/** 4.5 = AA normal text, 3 = AA large text and non-text UI boundaries. */
const CHECKS: Check[] = [
  { fg: "ink", bg: "tray", min: 4.5, what: "body text on the app background" },
  { fg: "ink", bg: "plate", min: 4.5, what: "body text on cards, rows and sheets" },
  { fg: "ink", bg: "accent-tint", min: 4.5, what: "label inside a selected option" },
  { fg: "ink-soft", bg: "tray", min: 4.5, what: "secondary text on the app background" },
  { fg: "ink-soft", bg: "plate", min: 4.5, what: "secondary text on cards and sheets" },
  { fg: "plate", bg: "accent", min: 4.5, what: "primary button label" },
  { fg: "accent", bg: "plate", min: 4.5, what: "accent text and active nav on cards" },
  { fg: "accent", bg: "tray", min: 4.5, what: "accent text on the app background" },

  { fg: "accent", bg: "tray", min: 3, what: "focus ring against the app background" },
  { fg: "accent", bg: "plate", min: 3, what: "focus ring against cards" },
  { fg: "line-strong", bg: "plate", min: 3, what: "input and chip borders on cards" },
  { fg: "line-strong", bg: "tray", min: 3, what: "input and chip borders on the app background" },

  { fg: "protein", bg: "plate", min: 3, what: "protein bar and wedge on cards" },
  { fg: "protein", bg: "tray", min: 3, what: "protein bar and wedge on the app background" },
  { fg: "carb", bg: "plate", min: 3, what: "carb bar and wedge on cards" },
  { fg: "carb", bg: "tray", min: 3, what: "carb bar and wedge on the app background" },
  { fg: "fat", bg: "plate", min: 3, what: "fat bar and wedge on cards" },
  { fg: "fat", bg: "tray", min: 3, what: "fat bar and wedge on the app background" },
  { fg: "veg", bg: "plate", min: 3, what: "veg bar and wedge on cards" },
  { fg: "veg", bg: "tray", min: 3, what: "veg bar and wedge on the app background" },
];

function toLab(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });

  // sRGB -> XYZ (D65), then XYZ -> CIE Lab against the D65 white point.
  const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
  const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
  const f = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  const [fx, fy, fz] = [f(x), f(y), f(z)];
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

/**
 * Perceptual distance (CIE76). Luminance ratio is the wrong tool here: these
 * colours are deliberately close in lightness and separate by hue instead.
 * 20 is a comfortable margin for categorical colour coding.
 */
function deltaE(a: string, b: string): number {
  const [l1, a1, b1] = toLab(a);
  const [l2, a2, b2] = toLab(b);
  return Math.sqrt((l1 - l2) ** 2 + (a1 - a2) ** 2 + (b1 - b2) ** 2);
}

/** The four macro colours must also stay separable from one another. */
const MACROS = ["protein", "carb", "fat", "veg"];
const MACRO_MIN_SEPARATION = 20;

const tokens = parseTokens();
const failures: string[] = [];
const rows: string[] = [];

for (const mode of ["light", "dark"] as Mode[]) {
  const t = tokens[mode];
  rows.push(`\n${mode.toUpperCase()}`);

  for (const check of CHECKS) {
    const fg = t[check.fg];
    const bg = t[check.bg];
    if (!fg || !bg) {
      failures.push(`${mode}: missing token --${!fg ? check.fg : check.bg}`);
      continue;
    }
    const r = ratio(fg, bg);
    const ok = r >= check.min;
    if (!ok) {
      failures.push(`${mode}: --${check.fg} on --${check.bg} is ${r.toFixed(2)}:1, needs ${check.min}:1 (${check.what})`);
    }
    rows.push(`  ${ok ? "PASS" : "FAIL"}  ${r.toFixed(2)}:1  (min ${check.min})  --${check.fg} on --${check.bg}  ${check.what}`);
  }

  for (let i = 0; i < MACROS.length; i++) {
    for (let j = i + 1; j < MACROS.length; j++) {
      const d = deltaE(t[MACROS[i]], t[MACROS[j]]);
      const separated = d >= MACRO_MIN_SEPARATION;
      if (!separated) {
        failures.push(`${mode}: --${MACROS[i]} and --${MACROS[j]} are only deltaE ${d.toFixed(1)} apart`);
      }
      rows.push(`  ${separated ? "PASS" : "FAIL"}  dE ${d.toFixed(1)}  (min ${MACRO_MIN_SEPARATION})  --${MACROS[i]} vs --${MACROS[j]}  macro colours stay separable`);
    }
  }
}

console.log(rows.join("\n"));

if (failures.length > 0) {
  console.error(`\nContrast check failed with ${failures.length} problem(s):`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`\nContrast check passed: ${CHECKS.length * 2} pairings and ${MACROS.length * (MACROS.length - 1)} macro comparisons meet their thresholds.`);
