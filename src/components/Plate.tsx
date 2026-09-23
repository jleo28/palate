import { useEffect, useState } from "react";
import type { MenuItem, Plate as PlateModel, Role } from "../core/types";

interface PlateProps {
  plate: PlateModel;
  itemsById: Map<string, MenuItem>;
  onWedgeClick?: (itemId: string) => void;
}

const ROLE_COLOR: Record<Role, string> = {
  protein: "var(--protein)",
  carb: "var(--carb)",
  veg: "var(--veg)",
  extra: "var(--fat)",
  dessert: "var(--fat)",
};

const CX = 150;
const CY = 150;
const R = 130;

function polarPoint(angleDeg: number) {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: CX + R * Math.cos(rad), y: CY + R * Math.sin(rad) };
}

function wedgePath(startDeg: number, endDeg: number): string {
  if (endDeg - startDeg >= 359.999) {
    // A single arc command cannot span a full circle, so split it into two halves.
    const mid = startDeg + 180;
    return `${wedgePath(startDeg, mid)} ${wedgePath(mid, endDeg)}`;
  }
  const start = polarPoint(startDeg);
  const end = polarPoint(endDeg);
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y} Z`;
}

export function Plate({ plate, itemsById, onWedgeClick }: PlateProps) {
  const [visible, setVisible] = useState(false);

  const signature = plate.lines.map((l) => `${l.itemId}:${l.servings}`).join("|");

  useEffect(() => {
    setVisible(false);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, [signature]);

  const totalKcal = plate.lines.reduce((sum, l) => sum + l.kcal, 0);
  let cursor = 0;
  const wedges = plate.lines.map((line) => {
    const item = itemsById.get(line.itemId);
    const share = totalKcal > 0 ? line.kcal / totalKcal : 1 / Math.max(plate.lines.length, 1);
    const startDeg = cursor * 360;
    cursor += share;
    const endDeg = cursor * 360;
    return {
      line,
      item,
      path: wedgePath(startDeg, Math.max(endDeg, startDeg + 0.5)),
      color: item ? ROLE_COLOR[item.role] : "var(--line)",
    };
  });

  const description =
    plate.lines.length === 0
      ? "No plate could be assembled for the current filters."
      : plate.lines
          .map((l) => `${itemsById.get(l.itemId)?.name ?? l.itemId}, ${l.portionLabel}`)
          .join("; ");

  return (
    <div className="mx-auto flex w-full max-w-[300px] flex-col items-center">
      <svg
        viewBox="0 0 300 300"
        role="img"
        aria-label={`Plate: ${description}`}
        className="w-full"
        style={{
          opacity: visible ? 1 : 0.4,
          transition: "opacity 250ms ease",
        }}
      >
        <title>Today&apos;s plate</title>
        <desc>{description}</desc>
        <circle cx={CX} cy={CY} r={R + 6} fill="var(--plate)" stroke="var(--line)" strokeWidth={2} />
        {wedges.length === 0 ? (
          <circle cx={CX} cy={CY} r={R} fill="var(--tray)" />
        ) : (
          wedges.map((w) => (
            <path
              key={w.line.itemId}
              d={w.path}
              fill={w.color}
              fillOpacity={0.5}
              stroke="var(--plate)"
              strokeWidth={2}
              className="cursor-pointer"
              onClick={() => onWedgeClick?.(w.line.itemId)}
            />
          ))
        )}
        <circle cx={CX} cy={CY} r={R * 0.42} fill="var(--plate)" stroke="var(--line)" strokeWidth={1} />
        <text x={CX} y={CY - 6} textAnchor="middle" className="font-display" fontSize={30} fill="var(--ink)">
          {plate.totals.kcal}
        </text>
        <text x={CX} y={CY - 6} textAnchor="middle" dy={20} fontSize={13} fill="var(--ink-soft)">
          cal
        </text>
        <text x={CX} y={CY + 34} textAnchor="middle" fontSize={15} fill="var(--ink-soft)">
          {plate.totals.protein} g protein
        </text>
      </svg>
    </div>
  );
}
