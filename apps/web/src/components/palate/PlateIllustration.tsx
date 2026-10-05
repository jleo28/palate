import { foodKind, isCountable, type FoodKind, type PlateItem } from "@palate/core";

// Placeholder drawings in the brand's sketch style, one per food kind, each in a 64×56 box.
// Final art can replace these one kind at a time.
function Shape({ kind }: { kind: FoodKind }) {
  switch (kind) {
    case "chicken":
      return (
        <>
          <path d="M6 30C8 14 26 6 42 10c14 4 20 16 14 28-6 10-24 14-36 10C10 45 5 38 6 30Z" />
          <path fill="none" d="m18 22 10 10m0-14 12 12m-2-12 8 8" />
        </>
      );
    case "steak":
      return (
        <>
          <path d="M6 18 50 8l4 8-44 10Z" />
          <path d="m8 30 44-10 4 8-44 10Z" />
          <path d="m10 42 40-8 2 7-38 8Z" />
        </>
      );
    case "fish":
      return (
        <>
          <path d="M5 30c15-23 35-22 48-3l8-10-1 27-8-10C35 51 16 49 5 30Z" />
          <circle className="fill-foreground" cx="19" cy="27" r="1.8" stroke="none" />
          <path fill="none" d="m31 15 5 30m6-26 4 20" />
        </>
      );
    case "shrimp":
      return (
        <>
          <path d="M48 12C32 0 6 10 8 32c2 14 18 20 30 12l-5-9c-7 5-16 2-16-7-1-12 15-18 27-8Z" />
          <path fill="none" d="m14 22 8 3m-8 8 9 0m-4 8 7-4" />
          <path d="m38 44 10 6-2-12Z" />
        </>
      );
    case "tofu":
      return (
        <>
          <path d="m6 18 22-12 25 10-22 13Z" />
          <path d="m6 18 1 25 24 10V29Zm25 11 22-13-1 25-21 12Z" />
        </>
      );
    case "round":
      return (
        <>
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={14 + (i % 3) * 17} cy={18 + Math.floor(i / 3) * 18} r="8.5" />
          ))}
        </>
      );
    case "scrambled":
      return (
        <path
          className="fill-food-yolk"
          d="M8 32c-5-10 6-19 14-14 2-9 17-10 20-2 9-4 19 4 15 14 6 7-2 16-12 14-4 7-19 7-23 0-10 2-18-6-14-12Z"
        />
      );
    case "boiled-egg":
      return (
        <>
          <path
            className="fill-card"
            d="M8 30C8 12 22 4 32 4s24 8 24 26c0 14-11 22-24 22S8 44 8 30Z"
          />
          <circle className="fill-food-yolk" cx="32" cy="30" r="11" />
        </>
      );
    case "grain":
      return (
        <>
          <path d="M4 36C6 13 49 8 58 33c2 9-8 16-27 16S2 44 4 36Z" />
          <path fill="none" strokeWidth="1" d="m12 31 5-3m5 10 5-3m4-10 5-3m6 14 5-3m-8 9 5-2" />
        </>
      );
    case "mash":
      return (
        <>
          <path className="fill-card" d="M6 40c0-16 12-28 26-28s26 12 26 28c0 6-52 6-52 0Z" />
          <path fill="none" d="M20 30c6-6 18-6 22 2" />
        </>
      );
    case "potato":
      return (
        <>
          <rect x="6" y="20" width="18" height="16" rx="5" />
          <rect x="26" y="12" width="18" height="16" rx="5" />
          <rect x="34" y="32" width="18" height="16" rx="5" />
          <rect x="12" y="38" width="16" height="14" rx="5" />
        </>
      );
    case "noodle":
      return (
        <g fill="none" strokeWidth="4">
          <path d="M5 16c13-10 14 15 27 4s13 14 25 4M4 32c12-10 15 14 28 4s13 14 26 3M8 48c12-9 15 10 28 2" />
        </g>
      );
    case "salad":
      return (
        <>
          <path d="M30 50C7 45 4 26 18 23 14 8 35 5 39 19c15-8 25 11 14 21-7 7-15 8-23 10Z" />
          <path fill="none" d="M30 46 28 17m0 13-11-6m11 14 15-14m-8 13 14 1" />
        </>
      );
    case "broccoli":
      return (
        <>
          <path fill="none" strokeWidth="5" d="M32 52V32m0 6-8-8m8 4 9-8" />
          <path d="M12 26c-6-10 6-20 14-14 4-10 20-10 22 0 10-4 18 8 10 16-4 6-38 8-46-2Z" />
        </>
      );
    case "sticks":
      return (
        <g strokeWidth="1.7">
          {[0, 1, 2, 3].map((i) => (
            <rect
              key={i}
              x={8 + i * 11}
              y={8}
              width="8"
              height="42"
              rx="4"
              transform={`rotate(${-18 + i * 12} ${12 + i * 11} 29)`}
            />
          ))}
        </g>
      );
    case "pizza":
      return (
        <>
          <path className="fill-food-carb" d="M6 10h52L32 54Z" />
          <path className="fill-food-protein" d="M6 10h52l-3 7H9Z" />
          <circle className="fill-food-fruit" cx="26" cy="22" r="4" />
          <circle className="fill-food-fruit" cx="38" cy="26" r="3.5" />
          <circle className="fill-food-fruit" cx="31" cy="36" r="3" />
        </>
      );
    case "toast":
      return (
        <>
          <path className="fill-food-carb" d="m8 13 45 5-7 36-41-9Z" />
          <path className="fill-food-veg" d="M14 24c10-4 22-2 32 2-2 8-4 14-6 18-10-1-20-3-28-6Z" />
        </>
      );
    case "pancake":
      return (
        <>
          <ellipse cx="32" cy="42" rx="27" ry="8" />
          <ellipse cx="32" cy="33" rx="27" ry="8" />
          <ellipse cx="32" cy="24" rx="27" ry="8" />
        </>
      );
    case "sausage":
      return <rect x="6" y="20" width="52" height="16" rx="8" />;
    case "banana":
      return (
        <path
          className="fill-food-yolk"
          d="M6 16c4 20 20 32 44 26l6 4 2-6c-2-4-6-4-8-4-20 2-32-8-36-24Z"
        />
      );
    case "melon":
      return (
        <>
          <path className="fill-food-veg" d="M4 20c4 22 52 22 56 0Z" />
          <path fill="none" d="M10 22c6 12 38 12 44 0" />
        </>
      );
    case "dairy":
      return (
        <>
          <ellipse cx="32" cy="30" rx="27" ry="18" />
          <path className="fill-card" d="M10 30c8-10 15 2 22-6 8-8 14 5 23-1-3 17-42 22-45 7Z" />
        </>
      );
    default:
      return (
        <>
          <path d="M4 24C9 11 23 9 34 17l19 14c8 6 2 20-8 18L13 42C4 40 0 32 4 24Z" />
          <path fill="none" d="m15 20 7 8m10-7 7 10m-24 4 8 4m10-5 8 6" />
        </>
      );
  }
}

// Centres (in the 240-unit plate) and a base scale for 1–6 foods.
const LAYOUTS: Record<number, { at: [number, number][]; scale: number }> = {
  1: { at: [[120, 120]], scale: 1.6 },
  2: {
    at: [
      [86, 120],
      [154, 120],
    ],
    scale: 1.15,
  },
  3: {
    at: [
      [86, 94],
      [154, 94],
      [120, 154],
    ],
    scale: 1.15,
  },
  4: {
    at: [
      [88, 90],
      [152, 90],
      [88, 152],
      [152, 152],
    ],
    scale: 1.05,
  },
  5: {
    at: [
      [88, 82],
      [152, 82],
      [68, 140],
      [120, 158],
      [172, 140],
    ],
    scale: 0.92,
  },
  6: {
    at: [
      [78, 92],
      [120, 74],
      [162, 92],
      [78, 148],
      [120, 166],
      [162, 148],
    ],
    scale: 0.84,
  },
};

// Scooped foods grow with portions; countable ones are drawn as separate pieces.
const MOUND = [0.85, 1, 1.12, 1.22, 1.3, 1.36];
const PIECE_OFFSETS: [number, number][] = [
  [-9, -6],
  [9, 4],
  [-3, 11],
  [12, -10],
];

function Food({ entry, at, scale }: { entry: PlateItem; at: [number, number]; scale: number }) {
  const { item, qty } = entry;
  const kind = foodKind(item.name);
  const fill =
    item.role === "protein"
      ? "fill-food-protein"
      : item.role === "carb"
        ? "fill-food-carb"
        : item.role === "veg"
          ? "fill-food-veg"
          : "fill-food-fruit";
  const stroke =
    item.role === "veg"
      ? "stroke-food-veg-ink"
      : item.role === "extra"
        ? "stroke-food-fruit-ink"
        : "stroke-foreground";
  const [cx, cy] = at;
  const pieces = isCountable(item.unit) ? Math.min(qty, 4) : 1;
  const s = pieces > 1 ? scale * 0.72 : scale * (MOUND[Math.min(qty, 6) - 1] ?? 1);
  const place = (dx: number, dy: number) =>
    `translate(${cx + dx * scale - 32 * s} ${cy + dy * scale - 28 * s}) scale(${s})`;

  return (
    <g>
      {Array.from({ length: pieces }, (_, i) => {
        const [dx, dy] = pieces > 1 ? (PIECE_OFFSETS[i] ?? [0, 0]) : [0, 0];
        return (
          <g key={i} transform={place(dx, dy)} className={`${fill} ${stroke}`} strokeWidth="1.7">
            <Shape kind={kind} />
          </g>
        );
      })}
      {qty > 1 && (
        <g transform={`translate(${cx + 26 * scale} ${cy - 24 * scale})`}>
          <circle r="10" className="fill-foreground" />
          <text
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-background font-bold"
            fontSize="10"
          >
            ×{qty}
          </text>
        </g>
      )}
    </g>
  );
}

function plateKey(items: PlateItem[]) {
  return items.map(({ id, item, qty }) => `${id}:${item.id}-${qty}`).join("|");
}

export function PlateIllustration({ items }: { items: PlateItem[] }) {
  const shown = items.slice(0, 6);
  const layout = LAYOUTS[shown.length] ?? LAYOUTS[1]!;
  const description = items
    .map(({ item, qty }) => `${qty} ${qty === 1 ? item.unit : item.unitPlural} ${item.name}`)
    .join(", ");

  return (
    <figure
      className="relative mb-5 overflow-hidden rounded-2xl bg-olive-soft py-3"
      aria-label={items.length ? `Illustrated plate with ${description}` : "An empty plate"}
    >
      <svg
        className="pointer-events-none absolute top-1/2 left-1 h-[13rem] max-h-[88%] w-12 -translate-y-1/2 text-olive/40"
        viewBox="0 0 40 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M20 142c-2-32-1-60 0-88M10 8v31c0 13 20 13 20 0V8M15 8v30M20 8v30M25 8v30" />
      </svg>
      <svg
        className="pointer-events-none absolute top-1/2 right-1 h-[13rem] max-h-[88%] w-12 -translate-y-1/2 text-olive/40"
        viewBox="0 0 40 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M20 142c2-32 1-60 0-87V10c11 11 12 33 0 45M16 142h8" />
      </svg>

      <svg
        key={plateKey(items)}
        className="plate-sketch-in mx-auto block aspect-square w-[13.5rem] max-w-[68%]"
        viewBox="0 0 240 240"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path
          className="fill-card stroke-foreground"
          strokeWidth="2.5"
          d="M120 13c58 0 106 47 106 106s-46 108-105 108S14 179 14 120 61 13 120 13Z"
        />
        <path
          className="stroke-foreground/20"
          strokeWidth="1.5"
          d="M120 28c51 0 92 41 92 92s-40 92-91 92-93-41-93-92 41-92 92-92Z"
        />
        {shown.map((entry, i) => (
          <Food key={entry.id} entry={entry} at={layout.at[i] ?? [120, 120]} scale={layout.scale} />
        ))}
      </svg>
    </figure>
  );
}
