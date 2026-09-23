# 8teSC

8teSC (read "ate SC") tells USC students exactly what to put on their plate at the dining hall, portioned to their goals. Open the app, see today's recommended plate for the hall you're heading to, walk in, and take exactly that.

This is Audrey's individual prototype for a class group project. Every team member built their own version of the same product; the group compares them and carries one forward. See `docs/PRODUCT_SPEC.md` for the full brief.

**Live prototype:** https://8tesc.vercel.app

## 60-second demo script

1. **Onboard.** Open the link, tap "Get started," and answer the ten questions, one per screen. Single-answer questions advance by themselves; the multi-answer ones (diet, allergens, halls, meals) have a Continue button. Imperial is the default with a metric toggle. On a phone with haptics, each selection gives a short tap. Under a minute start to finish.
2. **Show a plate.** Today opens on the current meal period. Point out the plate (sized by calorie share per item), the one-line "why," the station-grouped rows below it, and the macro bars.
3. **Switch hall.** Tap a different hall chip (EVK / Parkside / Village). The plate re-solves instantly and looks different, because each hall's menu has its own character (EVK leans grill and bowls, Parkside leans global dishes, Village leans plant-based).
4. **Swap an item.** Tap "Swap" on any row. The sheet shows up to 4 alternatives with the calorie/protein change; tap one and the plate updates.
5. **Jump a rotation week.** Long-press the wordmark to open the demo panel. Change the date by 7 days and reopen the same hall/meal; the sample menu's two-week rotation makes it look different.

## How the planner works

`src/core` is a pure, deterministic TypeScript module with no React, DOM, or network calls. Given a profile (age, sex, height, weight, activity, goal, diet, allergens), it computes BMR (Mifflin-St Jeor) and a maintenance calorie level, applies a goal adjustment that is capped and floored so it never asks a user to eat below their BMR, and splits the result across the meals they eat in hall. For each meal, it filters the hall's menu by diet and allergen rules, then brute-forces combinations of protein/carb/veg/extra servings (pruned to the top candidates per slot to stay fast) and scores each against the calorie and protein targets, penalizing repeated proteins across the same day. The result is a specific plate with per-item portions in plain language ("1½ scoops"), a one-line explanation of why it fits, and up to two alternatives with a different protein. Swapping a single item re-solves just that slot with everything else locked. Full rules are in `docs/PLANNER_SPEC.md`; the logic is unit-tested in `src/core/__tests__`.

## What is sample data

**All menu data is sample data**, authored for this prototype and not sourced from USC Dining. It's realistic (nutrition is in line with typical USDA values for each food and portion) but the item names, exact nutrition, and rotation schedule are invented. Every item in `src/data/menu.sample.json` carries `source: "sample"`, and the Profile screen says so once, plainly. Building against real USC dining data would require USC Dining's permission and either their own per-item nutrition data or a matching step against USDA FoodData Central; see `docs/DATA_SPEC.md` for what that would take.

Everything else (the planner, onboarding, the plate, swaps, the demo panel) runs against real, computed logic. Nothing in the app calls an LLM or an external API; every number and every "why" sentence is calculated from the data in this repo.

## Stack and structure

Vite + React 18 + TypeScript (strict), React Router, Tailwind CSS v4 (every color/radius/font pulled from `src/styles/tokens.css`), Vitest. State is React context plus `localStorage` (key prefix `8tesc:`); there is no backend.

```
src/
  core/        pure TypeScript planner (targets, solver, swap, plan). No React, no DOM, no network.
  data/        sample menu JSON + loader + validator
  features/    onboarding/, today/, profile/, demo/
  components/  shared UI (Plate, MacroBar, Sheet, Wordmark, ...)
  styles/      tokens.css, global.css
docs/          specs + process-log.md (the full build history and prompts used)
```

## Running it locally

```
pnpm install
pnpm dev            # start the dev server
pnpm test           # run the core planner test suite
pnpm typecheck
pnpm build
pnpm validate:data  # check the sample menu against the data rules
pnpm check:contrast # prove the palette meets WCAG AA in light and dark mode
```

## Deploying

The repo is set up for a static Vercel deployment (`vercel.json` handles the client-side routing rewrite). Import the GitHub repo in Vercel with the default Vite build settings (`pnpm build`, output `dist`) and it deploys as-is.

## What is not built (by design)

Out of scope for this prototype, per `docs/PRODUCT_SPEC.md`: pantry/receipt tracking, logging what was actually eaten, accounts or a backend, real USC menu ingestion, any AI-generated text, and monetization. BMI is intentionally not shown; see the product spec for why.
