import type { PlateItem } from "@palate/core";

function plateKey(items: PlateItem[]) {
  return items.map(({ id, item, qty }) => `${id}:${item.id}-${qty}`).join("|");
}

function FoodDrawing({ entry, index, count }: { entry: PlateItem; index: number; count: number }) {
  const { item, qty } = entry;
  const name = item.name.toLowerCase();
  const layouts = {
    1: ["translate(72 72) scale(1.7)"],
    2: ["translate(35 74) scale(1.6)", "translate(122 74) scale(1.6)"],
    3: [
      "translate(35 43) scale(1.55)",
      "translate(121 43) scale(1.55)",
      "translate(78 121) scale(1.55)",
    ],
    4: [
      "translate(39 39) scale(1.42)",
      "translate(121 39) scale(1.42)",
      "translate(39 121) scale(1.42)",
      "translate(121 121) scale(1.42)",
    ],
  };
  const slots = layouts[Math.min(count, 4) as keyof typeof layouts] ?? layouts[4];
  const transform = slots[index % slots.length];
  const portionMarks = Math.min(qty, 4);

  const isRound = /meatball|falafel|chickpea|berry|edamame/.test(name);
  const isGrain = /rice|quinoa|oatmeal|mashed/.test(name);
  const isNoodle = /penne|mein/.test(name);
  const isLeafy = /salad|broccoli|beans|zucchini|carrot/.test(name);
  const isEgg = /egg/.test(name);
  const isToast = /toast|pizza|pancake/.test(name);
  const isFruit = /banana|melon/.test(name);
  const isDairy = /yogurt|cottage/.test(name);
  const isTofu = /tofu/.test(name);
  const isFish = /salmon|shrimp/.test(name);

  const fillClass =
    item.role === "protein"
      ? "fill-food-protein"
      : item.role === "carb"
        ? "fill-food-carb"
        : item.role === "veg"
          ? "fill-food-veg"
          : "fill-food-fruit";
  const strokeClass =
    item.role === "veg"
      ? "stroke-food-veg-ink"
      : item.role === "extra"
        ? "stroke-food-fruit-ink"
        : "stroke-foreground";

  return (
    <g transform={transform} className={`${fillClass} ${strokeClass}`} strokeWidth="1.7">
      {isRound && (
        <>
          {Array.from({ length: Math.max(3, portionMarks + 2) }).map((_, i) => (
            <circle
              key={i}
              cx={12 + (i % 3) * 17}
              cy={13 + Math.floor(i / 3) * 18}
              r={name.includes("berry") ? 7 : 9}
            />
          ))}
          <path fill="none" d="m10 38 10-7m17 8 9-8m-20-20 6 6" />
        </>
      )}
      {isGrain && (
        <>
          <path d="M4 32C6 9 49 4 58 29c2 9-8 16-27 16S2 40 4 32Z" />
          <g fill="none" strokeWidth="1">
            <path d="m12 27 5-3m5 10 5-3m4-10 5-3m6 14 5-3m-8 9 5-2m-27 3 5-2" />
          </g>
        </>
      )}
      {isNoodle && (
        <g fill="none" strokeWidth="4">
          <path d="M5 12c13-10 14 15 27 4s13 14 25 4M4 28c12-10 15 14 28 4s13 14 26 3M8 44c12-9 15 10 28 2" />
        </g>
      )}
      {isLeafy && (
        <>
          <path d="M30 47C7 42 4 23 18 20 14 5 35 2 39 16c15-8 25 11 14 21-7 7-15 8-23 10Z" />
          <path fill="none" d="M30 43 28 14m0 13L17 21m11 14 15-14m-8 13 14 1" />
        </>
      )}
      {isEgg && (
        <>
          <path className="fill-card" d="M6 29C6 11 22 2 34 11c9-5 23 7 20 21-4 18-47 18-48-3Z" />
          <circle className="fill-food-yolk" cx="31" cy="29" r="11" />
        </>
      )}
      {isToast && (
        <>
          <path d="m8 11 43 5-7 36-39-9Z" />
          <path fill="none" d="m15 20 28 3m-30 7 27 3m-29 7 27 2" />
        </>
      )}
      {isFruit && (
        <>
          <path d="M7 17c15 21 31 22 48 1-2 25-16 38-32 32C10 45 5 32 7 17Z" />
          <path fill="none" d="M14 25c12 13 24 14 35 1" />
        </>
      )}
      {isDairy && (
        <>
          <ellipse cx="30" cy="25" rx="27" ry="18" />
          <path className="fill-card" d="M8 25c8-10 15 2 22-6 8-8 14 5 23-1-3 17-42 22-45 7Z" />
          <path fill="none" d="m18 17 5 3m16-4 5 3m-12 9 5 3" />
        </>
      )}
      {isTofu && (
        <>
          <path d="m6 18 22-12 25 10-22 13Z" />
          <path d="m6 18 1 25 24 10V29Zm25 11 22-13-1 25-21 12Z" />
          <path fill="none" d="m16 17 9 4m14-6 7 3" />
        </>
      )}
      {isFish && (
        <>
          <path d="M5 30c15-23 35-22 48-3l8-10-1 27-8-10C35 51 16 49 5 30Z" />
          <circle className="fill-foreground" cx="19" cy="27" r="1.8" stroke="none" />
          <path fill="none" d="m31 15 5 30m6-26 4 20" />
        </>
      )}
      {!isRound &&
        !isGrain &&
        !isNoodle &&
        !isLeafy &&
        !isEgg &&
        !isToast &&
        !isFruit &&
        !isDairy &&
        !isTofu &&
        !isFish && (
          <>
            <path d="M4 20C9 7 23 5 34 13l19 14c8 6 2 20-8 18L13 38C4 36 0 28 4 20Z" />
            <path fill="none" d="m15 16 7 8m10-7 7 10m-24 4 8 4m10-5 8 6" />
          </>
        )}
    </g>
  );
}

export function PlateIllustration({ items }: { items: PlateItem[] }) {
  const description = items
    .map(({ item, qty }) => `${qty} ${qty === 1 ? item.unit : item.unitPlural} ${item.name}`)
    .join(", ");

  return (
    <figure
      className="relative mb-5 overflow-hidden rounded-2xl bg-olive-soft py-3"
      aria-label={`Illustrated plate with ${description}`}
    >
      <svg
        className="pointer-events-none absolute -left-1 top-5 h-36 w-10 text-olive/35"
        viewBox="0 0 40 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M20 142c-2-32-1-60 0-88M10 8v31c0 13 20 13 20 0V8M15 8v30M20 8v30M25 8v30" />
      </svg>
      <svg
        className="pointer-events-none absolute -right-1 top-6 h-36 w-10 text-olive/35"
        viewBox="0 0 40 150"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
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
        <path
          className="stroke-foreground/15"
          d="M119 36c47 0 85 38 85 84s-37 84-84 84-84-37-84-84 37-84 83-84Z"
        />
        {items.slice(0, 4).map((entry, index) => (
          <FoodDrawing
            key={entry.id}
            entry={entry}
            index={index}
            count={Math.min(items.length, 4)}
          />
        ))}
      </svg>

      <figcaption className="label-caps absolute bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap text-olive">
        Your plate
      </figcaption>
    </figure>
  );
}
