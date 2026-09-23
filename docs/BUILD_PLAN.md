# Build plan

Each milestone is one Claude Code session. The prompt under each is ready to paste. Finish the Definition of done in CLAUDE.md before moving on.

## M0: Scaffold
> Read CLAUDE.md and every file in docs/. Scaffold the project exactly as described in CLAUDE.md: Vite, React, TypeScript strict, React Router, Tailwind v4 wired to tokens.css, Vitest, and the pnpm scripts listed. Add the Wordmark component with the logo fallback behaviour. Load both Google Fonts. Stop when the dev server shows the Welcome screen on the tray background. Then start docs/process-log.md.

## M1: Sample data
> Following docs/DATA_SPEC.md, write the types, author src/data/menu.sample.json, the getMenu and rotationWeek helpers, the MenuSource interface with its sample implementation, and the validator behind pnpm validate:data. Make the three halls feel different. Run the validator and fix the data until it passes.

## M2: Planner core
> Implement src/core per docs/PLANNER_SPEC.md: targets, meal split, solver, swap, planDay, portionLabel and the "why" sentence. Write all 12 required tests. Print the on-target rate from test 9 and, if it is under 80%, adjust the sample data rather than the scoring weights, and tell me what you changed.

## M3: Onboarding
> Build Welcome and the four onboarding steps from docs/DESIGN_SPEC.md, with imperial default and metric toggle. Persist the profile to localStorage. On finish, route to Today. Enforce the wellbeing guardrails from PRODUCT_SPEC.md in the goal copy.

## M4: Today and the plate
> Build Today: hall chips, meal tabs defaulting to the current period, the plate SVG as described in DESIGN_SPEC.md, the why line, station-grouped rows, macro bars and the day summary. Wire it to planDay. Check at 390px and in dark mode.

## M5: Swap
> Add the swap sheet using swapItem. Animate the plate wedges on change, respecting reduced motion. Make sure filtered items can never appear as swap options.

## M6: Profile and demo panel
> Build Profile (targets, editable sections, sample data line, Student Health link) and the demo panel (date, time, rotation readout, reset). Editing the profile must update Today immediately.

## M7: Polish and deploy
> Audit every screen against DESIGN_SPEC.md: contrast, focus, 44px targets, empty and error states, copy. Fix what fails and list what you fixed. Then prepare the project for Vercel (build settings, SPA rewrites in vercel.json).

Deploying: push to GitHub, import the repo in Vercel, deploy. The Vercel URL is the prototype link for the submission.

## M8: Submission pack
> Write README.md for a classmate who has never seen the project: what 8teSC does, the link, a 60-second demo script (onboard, show a plate, switch hall, swap an item, use the demo panel to jump a rotation week), how the planner works in one paragraph, and what is sample data. Then tidy docs/process-log.md into a short iteration summary at the top, keeping the full log below it.

Submission = Vercel link + README.md + docs/process-log.md + the repo link for code.

## When the logo arrives
Drop it at `public/brand/logo.svg`. If Jasmine's palette differs, change values in tokens.css only.
