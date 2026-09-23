# 8teSC prototype

8teSC (read "ate SC") tells USC students exactly what to put on their plate at the dining hall, portioned to their goals. This repo is Audrey's individual prototype for the class project. It will be compared against teammates' prototypes, so it must be demoable from a single link on a phone.

Read these before writing code, in this order:
1. docs/PRODUCT_SPEC.md: what we are building and what we are not
2. docs/PLANNER_SPEC.md: the targets maths and the plate solver
3. docs/DATA_SPEC.md: menu schema and sample data
4. docs/DESIGN_SPEC.md: tokens, screens, copy
5. docs/BUILD_PLAN.md: milestones, in order. Do one milestone per session unless told otherwise.

## Stack
- Vite + React 18 + TypeScript (strict)
- React Router for screens
- Tailwind CSS v4, with every colour, radius and font pulled from CSS variables defined in `src/styles/tokens.css`
- Vitest for tests
- State: React context plus `localStorage` (key prefix `8tesc:`). No backend.
- Deploy target: Vercel (static build)

## Structure
```
src/
  core/        pure TypeScript planner. No React, no DOM, no network. Fully tested.
  data/        sample menu JSON + loader + validator
  features/    onboarding/, today/, profile/, demo/
  components/  shared UI (Plate, MacroBar, Sheet, Wordmark, ...)
  styles/      tokens.css, global.css
docs/          specs + process-log.md
public/brand/  logo lands here later
```
`src/core` must stay portable: it will later move into `packages/core` in the team monorepo, next to the existing portion solver. Keep its public API in `src/core/index.ts`.

## Rules
- Mobile first. Design and test at 390 x 844. Desktop just centres the phone-width column.
- No LLM or external API calls. Every recommendation and every "why" sentence is computed from data.
- All menu data is sample data until USC dining data is secured. Every item carries `source: "sample"` and the UI says so once, in Profile.
- UI copy is US English and defaults to imperial units (ft/in, lb) with a metric toggle. These docs are written in UK English; do not "fix" either.
- Follow the wellbeing guardrails in PRODUCT_SPEC.md. They are requirements, not suggestions.
- The logo is not ready. Render the name through the single `<Wordmark />` component. If `public/brand/logo.svg` exists, Wordmark shows it; otherwise it renders the text "8teSC" in the display face. Swapping the logo must be a one-file change.
- Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
- No em dashes in UI copy.

## Commands
```
pnpm dev
pnpm test
pnpm typecheck
pnpm build
pnpm validate:data   # runs the menu validator
```

## Definition of done (every milestone)
- `pnpm typecheck`, `pnpm test`, `pnpm build` all pass
- New core logic has tests
- Screens checked at 390px wide, keyboard focus visible, no console errors
- Append an entry to `docs/process-log.md` (format is in that file). This log is part of the course submission, so record the prompt that started the session verbatim.
