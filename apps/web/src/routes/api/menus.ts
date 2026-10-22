import { createFileRoute } from "@tanstack/react-router";
import type { HallId } from "@palate/core";
import { hallMenu, unmatched } from "@/server/menus";

const HALLS: HallId[] = ["village", "evk", "parkside"];

/**
 * GET /api/menus?hall=evk&date=2026-10-21 → that hall's real menu with nutrition estimates.
 * Cached at the edge for 6 hours, so USC sees a handful of requests a day.
 * ?report=unmatched lists dishes that still need a saved estimate.
 */
export const Route = createFileRoute("/api/menus")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const params = new URL(request.url).searchParams;
        const hall = params.get("hall") as HallId | null;
        const date = params.get("date") ?? "";
        if (!hall || !HALLS.includes(hall) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
          return Response.json(
            { error: "hall and date (YYYY-MM-DD) are required" },
            { status: 400 },
          );
        }
        try {
          // For keeping saved estimates up to date (see scripts/menu-estimates.md). Not cached.
          if (params.get("report") === "unmatched") {
            return Response.json({ hall, date, unmatched: await unmatched(hall, date) });
          }
          const items = await hallMenu(hall, date);
          return Response.json(
            { hall, date, items },
            {
              headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=86400" },
            },
          );
        } catch (error) {
          console.error(error);
          return Response.json({ error: "menu unavailable" }, { status: 502 });
        }
      },
    },
  },
});
