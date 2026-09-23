# Process log

Part of the course submission: prompts used, what was built, how it changed.

## Iteration summary

Built in one continuous Claude Code session rather than the milestone-per-session cadence the build plan suggests, since the brief was to build the whole prototype out. The session followed the milestone order anyway (scaffold, sample data, planner core, onboarding, Today and the plate, swap, profile and demo panel, polish, deploy) because that is the order each piece depends on the last. The two biggest calls: generating the 122-item sample menu with a small deterministic script rather than hand-typing every hall/day/period list (so the data validator's minimums are provable rather than hoped-for), and substituting a crossfade for the plate's wedge-resize animation rather than tweening SVG arc paths (full path interpolation was judged not worth the complexity for a prototype). Both are flagged below for Audrey to review and defend in the group comparison, since they were made autonomously rather than requested.

## Sessions

<!-- Copy this block for each session. Keep the prompt verbatim. -->
### Session: M0 to M8, full build
**Date:** 2026-09-22
**Tool:** Claude Code
**Prompt:**
```
read the folder and build, i've assigned claude chat to plant handoff docs necessary for you to build it out fully:

Assignment context
This prototype is Audrey's individual submission for a class group project. Every team member builds their own prototype of the same product. The group then compares them and picks one to carry forward.
What the course asks for
Prototype: a link to the prototype, or a short video or demo showing how it works
Process documentation: the prompts used, the code (snippets or files), and a brief summary of how the prototype was iterated to its final version
Purpose: hands-on experience building with AI tools, and a basis for the group to compare approaches
What happens next
In Week 5 the group presents its chosen prototype to the class in Zoom breakout rooms and asks for feedback.
What this means for the build
Optimise for a clear, reliable demo on a phone over breadth of features. A small app that works every time beats a large one that breaks live.
The process log is graded material. Record every session's prompt verbatim in docs/process-log.md, and note where Audrey made a decision herself rather than accepting Claude Code's output.
Teammates will read this code to compare approaches. Keep it readable, keep src/core well named and tested, and keep the README honest about what is sample data and what is not built.
The demo panel exists for the Week 5 presentation. It must work without a network connection.
Keep a record of what did not work and why. Failed approaches are useful iteration evidence.

here's a bit more context. go.
```
**Mid-session follow-up prompts (verbatim):**
```
wait i'd like this to be both on git as a standalone repo that i can potentially add my teammates on to later and live on vercel as well (that's my deployment of choice)
```
```
skip the browser chrome check thing
```

**What was built:**
- M0 Scaffold: Vite + React 18 + TypeScript strict, React Router, Tailwind v4 wired to `src/styles/tokens.css` via `@theme inline`, Vitest with jsdom, `<Wordmark />` with the logo-fallback behaviour, Bricolage Grotesque and Atkinson Hyperlegible loaded from Google Fonts.
- M1 Sample data: `src/core/types.ts` (schema), a 122-item sample library authored with realistic per-serving macros, assembled into everyday/rotation schedules for all three halls by a seeded-shuffle script (`scripts/genMenu.ts`) so every hall x period x day passes the validator (`scripts/validateData.ts`, wired to `pnpm validate:data`).
- M2 Planner core: `src/core/{targets,filters,portion,why,rank,solver,swap,menu,plan}.ts`, all 12 required tests plus a few extras (28 tests total, all passing). On-target rate on the sample menu: 100% (126/126 hall x meal x day combinations), reported by the test 9 suite.
- M3 Onboarding: Welcome and the four-step wizard (Basics, Activity, Goal, Preferences), imperial default with a metric toggle, persisted to `localStorage` under the `8tesc:` prefix, goal copy follows the wellbeing guardrails (no weight-loss language, no BMI, lean out framed as "never below what your body needs").
- M4 Today: hall chips, meal tabs defaulting to the current period (from a demo-overridable clock), the plate SVG, the why line, station-grouped rows (walk order per DATA_SPEC's station list), macro bars, day summary.
- M5 Swap: bottom sheet using `swapItem`, up to 4 ranked options with kcal/protein deltas, filtered items provably excluded (see solver tests 7 and 8).
- M6 Profile and demo panel: daily targets plus the same onboarding step components reused for editing, sample-data disclosure line, USC Student Health link, demo panel (long-press the wordmark, or the panel is reachable any time in this build since there is no separate dev/prod gate yet) with date/time override, rotation-week readout, reset profile.
- M7 Polish: empty states include a one-tap hall switch, focus rings and 44px tap targets applied throughout, `vercel.json` SPA rewrite added.
- M8 Submission pack: this log, README.md.

**What I (Claude Code) decided without asking, flagged for Audrey to review:**
- Generated the sample menu with a script instead of hand-authoring 126 day lists. Realistic macros are still hand-picked per item; only the day-by-day assignment is programmatic.
- Simplified onboarding's "halls you use" (plural in DESIGN_SPEC) to a single-select "hall you use most", because `Profile.homeHall` in PLANNER_SPEC is singular. If the team wants multi-hall defaults, the type needs to change first.
- The "why" sentence template is my own wording within the 140-character, lead-with-protein shape the spec describes; the two example sentences in PLANNER_SPEC are illustrative, not literal strings to match.
- Plate wedges crossfade (opacity transition) on re-solve instead of the arcs tweening their angles. True path interpolation would need per-frame JS (SVG cannot tween `d` with plain CSS); a crossfade was judged good enough for a phone demo. Flag for the team if the tweened version matters for the pitch.
- Demo panel has no dev-only gate (DESIGN_SPEC says "a visible button in dev builds"); it is reachable via long-press on any build for now, since a build-mode gate wasn't specified.

**What Audrey decided herself:**
- Ship as a standalone GitHub repo (for adding teammates later) and deploy to Vercel, rather than leaving it as an unpublished local project.
- Skip live browser verification for this session (the Claude in Chrome extension was unresponsive) and rely on `pnpm typecheck`, `pnpm test`, and `pnpm build` instead. Visual/keyboard-focus verification at 390px still needs a manual pass before the Week 5 demo.

**Problems and fixes:**
- `pnpm` was not installed in the environment; installed via `npm install -g pnpm` (corepack's own install hit a permission error writing to `Program Files`, worked around it).
- First solver test crashed (`Cannot read properties of undefined`) because the brute-force loop skipped the one all-empty combination when literally no items were eligible for a meal, leaving the leaderboard empty. Fixed by not skipping the zero-line combination, so an empty plate with a note is a valid result instead of an unreachable state.
- The sample menu's breakfast rotation pool only carried two veg items (hash browns, breakfast potatoes), so on days the shuffle didn't pick both, the validator's "2 veg minimum" failed. Moved both into the breakfast everyday list rather than widening the rotation pool, since guaranteeing them daily is simpler than tuning shuffle odds.
- `tsc -b` failed on `node:fs` and `process` in the two data scripts because they were type-checked under the browser-facing `tsconfig.app.json` (DOM lib, no Node types). Split them into their own `tsconfig.scripts.json` with `"types": ["node"]`.
- Live browser verification (Claude in Chrome) was unresponsive for the whole session; verification relied on `tsc -b`, `vitest run`, and `vite build` instead. A manual phone-width and keyboard-focus pass is still owed before the Week 5 demo.

**Screenshot:** not captured this session (browser tooling was unavailable); to be added before Week 5.

**Deployment:**
- GitHub: `github.com/jleo28/8tesc` (private repo, so teammates can be added as collaborators later).
- Vercel: linked to the GitHub repo (`jleo28's projects` team), Vercel Authentication disabled so the link is publicly viewable, production alias `https://8tesc.vercel.app`. Auto-deploy on push to `main` confirmed working (the README-link commit above triggered a build automatically).

