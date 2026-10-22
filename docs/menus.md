# Live menus and nutrition estimates

Hall Menus, the Plate and "I ate something else" use today's real menu from USC Hospitality.

## How it works

1. `GET /api/menus?hall=evk&date=YYYY-MM-DD` (`apps/web/src/routes/api/menus.ts`) fetches the day from USC's public feed (see `docs/spikes/usc-menus.md`). Vercel caches each response for 6 hours.
2. `parseUscDay` (`@palate/core`) drops section headers, tags toppings and condiments as `component` (never put on a generated plate), maps allergens, and treats `not-analyzed` as unknown (left off plates for anyone with allergies).
3. Each item gets nutrition in this order:
   - a saved estimate in `apps/web/src/server/nutrition-estimates.json` (`source: "ai"` written by Claude, `"override"` set by the team),
   - else a confident USDA FoodData Central (FNDDS) match (`isConfidentMatch` / `bestMatch` in `@palate/core`),
   - else USDA's closest entry, so nothing is ever "not yet estimated".

Allergen and diet labels always come from USC, never from an estimate.

## Keeping estimates up to date (no API cost)

New dishes fall back to USDA's closest entry until they get a saved estimate. Every so often, open Claude Code in this repo and say **"update the menu estimates"**. Claude will:

1. Run `GET /api/menus?hall=<hall>&date=<date>&report=unmatched` for each hall over the coming days (needs `USDA_FDC_API_KEY` in `apps/web/.env.local`).
2. Estimate each listed dish per typical hall serving, using USDA's closest foods as reference, and add it to `nutrition-estimates.json`.
3. Open a PR.

To correct any dish, edit its entry in `nutrition-estimates.json` and set `"source": "override"`.

## Settings

- `USDA_FDC_API_KEY` (server only): free at https://fdc.nal.usda.gov/api-key-signup. Set in Vercel and in `apps/web/.env.local`.
- `MENU_BOT_CONTACT` (optional): added to the bot's User-Agent so USC Hospitality can reach the team.
