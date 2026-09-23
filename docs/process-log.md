# Process log

Part of the course submission: prompts used, what was built, how it changed.

## Iteration summary

Two sessions. The first built the whole prototype end to end; the second replaced the placeholder brand and rebuilt onboarding once the logo arrived. The palette in v2 is derived from the logo's own five colours rather than chosen to sit beside it, which is why the mark disappears into the Welcome background instead of sitting on it. Both sessions leaned on scripts to make claims checkable rather than assumed: a validator that proves every hall/day/period has enough to build a plate from, and a contrast checker that proves the palette against WCAG AA in both modes. The habit paid for itself twice in v2, catching a macro colour pair that was too close to tell apart and a border a hair under the 3:1 it needed.

Built in one continuous Claude Code session rather than the milestone-per-session cadence the build plan suggests, since the brief was to build the whole prototype out. The session followed the milestone order anyway (scaffold, sample data, planner core, onboarding, Today and the plate, swap, profile and demo panel, polish, deploy) because that is the order each piece depends on the last. The two biggest calls: generating the 122-item sample menu with a small deterministic script rather than hand-typing every hall/day/period list (so the data validator's minimums are provable rather than hoped-for), and substituting a crossfade for the plate's wedge-resize animation rather than tweening SVG arc paths (full path interpolation was judged not worth the complexity for a prototype). Both are flagged below for Audrey to review and defend in the group comparison, since they were made autonomously rather than requested.

## Sessions

<!-- Copy this block for each session. Keep the prompt verbatim. -->
### Session: v2, palette from the logo and a Typeform-style onboarding
**Date:** 2026-09-22
**Tool:** Claude Code
**Prompt:**
```
can confirm that the live on vercel does work. here's v2: The logo is now in the project (check public/brand/ first; if it is elsewhere, find it and move it to public/brand/logo.svg, or logo.png if it is a raster). Two changes in this session.

1. Palette: earthy, soft, welcoming
Drop the cardinal and gold direction entirely. Nothing should read as USC colours.
- Open the logo and extract its actual colours. The new palette must be built around them so the logo sits naturally on every surface.
- Direction: earthy and soft. Think oat, clay, sage, moss, bark, warm stone. Low saturation, warm neutrals, nothing neon or high-contrast for its own sake.
- Avoid the generic cream background with a terracotta accent (near #F4F1EA and #D97757). Let the logo's own colours make the palette specific.
- Keep the token names working but rename any that describe the old colours (--cardinal, --butter) to role names (--accent, --carb and so on). Update every usage.
- Macro colours need to stay distinguishable from each other, in light and dark mode, and still never be the only signal.
- Over-target stays neutral, never alarming.
- All text meets WCAG AA on every background it appears on. Check it, don't assume.
- Redo dark mode with the same earthy logic (warm dark browns and greens, not blue-black).
- grep the repo and docs for "cardinal", "gold", "butter" and "campus" and remove the old direction everywhere, including the token table and focus-ring note in docs/DESIGN_SPEC.md. Update DESIGN_SPEC.md with the new hex values and one line on how each relates to the logo.
- Make sure Wordmark now renders the logo, sized well on Welcome and in the Today header.

2. Onboarding as a Typeform-style flow with haptics
Rebuild the profile setup so it feels like Typeform:
- One question per screen, large, left-aligned, with generous space. Progress bar at the top.
- Options are big full-width tap targets, labelled A, B, C, D. On desktop, pressing the letter key selects the option and Enter continues.
- Single-select questions auto-advance about 350ms after a tap, once the selected state has visibly registered. Multi-select questions (diet, allergens, halls, meals) show a "Continue" button instead.
- Selection feedback: a quick press-in scale and fill, and a checkmark for multi-select. Back is always one tap away, and answers persist when going back.
- Numeric questions (age, height, weight) get one screen each with a large input and a unit toggle.
- Transitions between questions slide vertically. Under prefers-reduced-motion, cross-fade instead.

Haptics:
- Create one src/lib/haptics.ts with tap(), select() and success(), used for option selection, advancing, and finishing onboarding.
- Use navigator.vibrate where supported (Android Chrome), with short patterns (about 10ms for select, a double pulse for success).
- iOS Safari does not support the Vibration API. Add a best-effort fallback: toggling a hidden <input type="checkbox" switch> through its label, which triggers a system haptic on recent iOS Safari. Feature-detect, fail silently, and never let it affect focus, scroll or screen readers.
- Add a "Haptics" on/off toggle in Profile, on by default, saved to localStorage.
- Haptics are an extra, never the only feedback. The visual selected state must carry the interaction on its own.

Test on a real phone if possible and tell me which haptic path fired on each device. Run typecheck, tests and build, check every onboarding screen at 390px in light and dark mode, then add a session entry to docs/process-log.md with this prompt verbatim.
```

**What was built:**
- **Logo.** The asset sheet turned up as `Asset sheet for 8te branding.zip` at the repo root, not in `public/brand/`. It is a raster export set (11 PNG sizes, light only), so `logo.png` (512), `apple-touch-icon.png` (180) and `favicon.png` (48) went into `public/brand/` and the old placeholder favicon.svg was removed. `Wordmark` now renders the image directly with an `onError` fall back to the text mark, which also removed the old `fetch(HEAD)` probe and its flash of text on load.
- **Palette.** Decoded the logo PNG with a small throwaway script to get its actual colours rather than eyeballing them. It uses exactly five: `#E8DCC8` oat field, `#F2EAD9` cream card, `#312921` bark lettering, `#DCCDB4` clay inset, `#6F7A4E` moss circle. Four of those are now tokens unchanged, and the rest are steps from them. `--tray`/`--plate` map to the icon's own field and card, so on Welcome the logo's background disappears into the page and the card appears to float.
- **Token rename.** `--cardinal` split into `--accent` (moss, interactive) and `--protein` (clay); `--butter` to `--carb`, `--herb` to `--veg`, `--slate` to `--fat`. Added `--line-strong` for control borders and `--accent-tint` for the selected-option fill. Every usage updated; nothing named for a colour remains.
- **Contrast, proved not assumed.** New `scripts/checkContrast.ts` (`pnpm check:contrast`) parses tokens.css and checks 40 real pairings across both modes: AA 4.5:1 for text, 3:1 for focus rings, control borders, bars and wedges. It also checks the four macro colours stay at least ΔE 20 apart in CIE Lab.
- **Onboarding.** Rebuilt as ten one-question screens driven by a declarative `questions.ts`, which also drives Profile's editable sections so the two cannot drift. A/B/C/D labelled full-width options, letter keys and Enter on desktop, 350ms auto-advance on single-select, Continue plus checkmarks on multi-select, press-in scale, one-tap Back with answers preserved, vertical slide that becomes a real cross-fade under `prefers-reduced-motion`.
- **Haptics.** `src/lib/haptics.ts` with `tap()`, `select()`, `success()`, the Vibration API path, the hidden iOS switch fallback (mounted once by `HapticsFallback`, `aria-hidden`, `tabIndex={-1}`, pointer-events none, and it restores focus after clicking), a Profile toggle saved to `localStorage`, and a line in Profile naming which path the current device will use.

**What I (Claude Code) decided without asking, flagged for Audrey to review:**
- Halls became a genuine multi-select as asked, but the core `Profile` type only has a singular `homeHall`. Rather than change the portable planner types, `halls` is stored as a UI preference alongside `units`, and it now controls which hall chips Today shows first; `homeHall` stays the last-used hall. The empty state still offers every hall, so a filter that empties one hall can always be escaped.
- Profile's daily target numbers are now ink with a small colour swatch instead of coloured numerals. At 22px regular, coloured numerals for protein and carbs would have been 4.19:1 and 3.54:1 against the card, under the 4.5:1 AA threshold for text that size. The swatch keeps the colour association without putting colour on the text.
- `--accent` is the logo's moss deepened from `#6F7A4E` to `#566040`. The logo green as-is gives only 3.84:1 for cream text on it, which fails AA. `--veg` keeps the logo green exactly, since it is a bar fill rather than a text background.
- Plate wedge opacity went from 0.28 to 0.5. At 0.28 the rendered wedges did not actually meet the 3:1 I had verified for the solid colours, so the check was measuring something that was not on screen.

**Problems and fixes:**
- My first separability check compared macro colours by luminance contrast ratio and "failed" all six pairs at about 1.1:1. That metric was simply wrong for the question: these colours are deliberately close in lightness and separate by hue, which a contrast ratio cannot see. Replaced it with CIE76 ΔE in Lab space, which is the right tool and passes at 27 to 41.
- Light-mode `--fat` and `--veg` came out ΔE 18.9 apart, just under the threshold. Rather than guess a replacement, scripted a sweep of ten candidates against all three constraints at once and took `#6B6055`, which lands at ΔE 22.1 from veg and clears 4.5:1 on both surfaces.
- `--line-strong` at `#8F8064` gave 2.85:1 on the oat background, just under the 3:1 needed for a control boundary. Darkened to `#877963`.
- The reduced-motion cross-fade was initially being flattened by the blanket `animation-duration: 0.01ms !important` rule, which would have made the transition vanish instead of fading. Removed the duplicate rule that `sed` had left behind and verified in the browser that the computed animation really is `question-fade` at 180ms under `reduce`, and `question-in-up` at 280ms otherwise.
- Found a real bug in tested core code while reading a screenshot: `portionLabel(2, "patty")` produced "2 pattys". Fixed the pluraliser for consonant-y and sibilant units and added tests (31 tests now pass).

**Verification:**
- `pnpm typecheck`, `pnpm test` (31 passing, on-target rate still 100%), `pnpm build`, `pnpm validate:data` and `pnpm check:contrast` all pass.
- The Claude in Chrome extension was unresponsive again this session, so verification was scripted instead: puppeteer-core driving the installed Chrome (kept in a scratch directory, not added to this repo) walked the whole flow at 390x844 and captured every screen in light mode, dark mode and reduced motion. No console errors on any screen. That script is how the "2 pattys" bug and the washed-out wedges were caught.

**Haptics on a real phone:** not verified. I have no physical device here, and neither path can be exercised meaningfully in headless Chrome, which reports `navigator.vibrate` as present but has no motor. Profile names the detected path on whatever device it is opened on, so checking it is one tap: expect "Vibration API (Android)" on Android Chrome and "iOS switch fallback" on iOS Safari. Worth confirming on an iPhone before the Week 5 demo, since the switch trick depends on recent iOS Safari and is best-effort by nature.

**Screenshot:** not committed; captured to a scratch directory during verification.

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

