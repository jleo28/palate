import type { MenuItem, Role } from "./types";

function proteinPerKcal(item: MenuItem): number {
  return item.kcal > 0 ? item.protein / item.kcal : 0;
}

export function topByProteinPerKcal(items: MenuItem[], role: Role, limit: number): MenuItem[] {
  return items
    .filter((item) => item.role === role)
    .slice()
    .sort((a, b) => {
      const diff = proteinPerKcal(b) - proteinPerKcal(a);
      if (Math.abs(diff) > 1e-9) return diff;
      return a.id.localeCompare(b.id);
    })
    .slice(0, limit);
}
