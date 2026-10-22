import { useQuery } from "@tanstack/react-query";
import type { HallId, MenuItem } from "@palate/core";
import { today } from "./dates";
import { MENU } from "./menu";

/**
 * Today's real menu for a hall, from USC Hospitality via /api/menus. Falls back to the sample
 * menu (flagged `sample`) while loading fails, so the app always has something to show.
 */
export function useHallMenu(hall: HallId) {
  const date = today();
  const query = useQuery({
    queryKey: ["menu", hall, date],
    queryFn: async () => {
      const res = await fetch(`/api/menus?hall=${hall}&date=${date}`);
      if (!res.ok) throw new Error(`menu ${res.status}`);
      const body = (await res.json()) as { items: MenuItem[] };
      if (!body.items.length) throw new Error("empty menu");
      return body.items;
    },
    staleTime: 60 * 60 * 1000,
    retry: 1,
  });
  const sample = query.isError;
  const items = query.data ?? (sample ? MENU.filter((i) => i.hall === hall) : []);
  return { items, loading: query.isPending, sample, date };
}
