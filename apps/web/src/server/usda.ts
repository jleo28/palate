import type { FdcFood } from "@palate/core";

const SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

// One server instance looks each dish up once; the CDN caches whole menus on top of this.
const cache = new Map<string, Promise<FdcFood[]>>();

/** USDA FoodData Central search over FNDDS (foods as eaten). Best matches first. */
export function searchFnnds(query: string): Promise<FdcFood[]> {
  const key = query.toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit;
  const pending = fetchFoods(query).catch((error: unknown) => {
    console.error("USDA search failed", query, error);
    cache.delete(key);
    return [];
  });
  cache.set(key, pending);
  return pending;
}

async function fetchFoods(query: string): Promise<FdcFood[]> {
  const apiKey = process.env["USDA_FDC_API_KEY"] || "DEMO_KEY";
  const res = await fetch(`${SEARCH_URL}?api_key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, dataType: ["Survey (FNDDS)"], pageSize: 8 }),
  });
  if (!res.ok) throw new Error(`USDA ${res.status}`);
  const body = (await res.json()) as { foods?: FdcFood[] };
  return body.foods ?? [];
}
