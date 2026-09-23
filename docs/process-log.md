# Process log

Part of the course submission: prompts used, what was built, how it changed.

## Iteration summary

Three sessions. The first built the whole prototype end to end; the second replaced the placeholder brand and rebuilt onboarding once the logo arrived; the third turned it from a planner that worked into somewhere warm, and moved the front door from the survey to a dashboard that shows real plates before it asks for anything. The palette in v2 is derived from the logo's own five colours rather than chosen to sit beside it, which is why the mark disappears into the Welcome background instead of sitting on it. Both sessions leaned on scripts to make claims checkable rather than assumed: a validator that proves every hall/day/period has enough to build a plate from, and a contrast checker that proves the palette against WCAG AA in both modes. The habit paid for itself twice in v2, catching a macro colour pair that was too close to tell apart and a border a hair under the 3:1 it needed.

Built in one continuous Claude Code session rather than the milestone-per-session cadence the build plan suggests, since the brief was to build the whole prototype out. The session followed the milestone order anyway (scaffold, sample data, planner core, onboarding, Today and the plate, swap, profile and demo panel, polish, deploy) because that is the order each piece depends on the last. The two biggest calls: generating the 122-item sample menu with a small deterministic script rather than hand-typing every hall/day/period list (so the data validator's minimums are provable rather than hoped-for), and substituting a crossfade for the plate's wedge-resize animation rather than tweening SVG arc paths (full path interpolation was judged not worth the complexity for a prototype). Both are flagged below for Audrey to review and defend in the group comparison, since they were made autonomously rather than requested.

## Sessions

<!-- Copy this block for each session. Keep the prompt verbatim. -->
### Session: v2.1, warmth, home first, and Olive
**Date:** 2026-09-22
**Tool:** Claude Code
**Prompt:**
```
perfect. Big session. Read CLAUDE.md and docs/ first, then make these changes and update PRODUCT_SPEC.md, DESIGN_SPEC.md and BUILD_PLAN.md so the docs match what you build.

1. Drop the "quiet design" principle
Remove the rule in DESIGN_SPEC.md that everything stays quiet so only the plate stands out. The app should feel warm, rich and finished, not like a demo. Keep the wellbeing guardrails in PRODUCT_SPEC.md exactly as they are. Only the visual restraint goes.
- Add subtle texture to backgrounds (a soft paper or linen grain, very low opacity), built from the earthy palette and the logo.
- Give the plate a tactile render: a slight rim, a soft shadow, and appetising food-coloured wedges rather than chart colours.
- Add small illustrated icons for each station and each goal option, in one consistent hand-drawn style that matches the logo.
- Add a satisfying moment when a plate first appears: items assemble onto it one by one.
Richer, not busier. Every addition should make the app feel more like a warm place to eat.

2. Home screen first, not the survey
On launch, open straight to the home dashboard. No onboarding gate.
- Before a profile exists, show combos for a general balanced target, with a warm card at the top: "Make these plates yours" with a "Personalize" button that opens onboarding. The card can be dismissed, and comes back as a smaller prompt the next day.
- After onboarding, the same dashboard shows personalised combos and the card disappears.
- Onboarding can be exited at any point and resumed where the user left off.

3. Dashboard layout
- Header: logo, today's date, and a meal switcher (Breakfast / Lunch / Dinner) as a segmented control.
- Main section: recommended combos, one card per hall: EVK, Parkside, Village. Each card shows a mini plate, the items with portions, calories and protein, and an "on target" state. Cards are a horizontal snap-scroll carousel with the next card peeking in from the edge, so all three halls feel browsable with a thumb. The user's home hall comes first.
- Tapping a card opens the full plate view (the current Today screen) for that hall, with swap.
- Below the carousel: the day summary.

4. Meal period follows device time
Put this in one config file:
- Breakfast: 00:00 to 10:59
- Lunch: 11:00 to 15:29
- Dinner: 15:30 to 23:59
On load, and when the app returns to the foreground, read the device's local time and select the matching meal. The user can switch manually. A manual choice sticks until the next period boundary, after which the app follows the clock again. Show a small "Now" dot on the period that matches the current time. The demo panel's time override must feed this same logic.

5. Onboarding confirmation (Typeform-style bob)
On selection (tap, letter key, or Enter on a focused option):
- The option fills with the accent colour, presses down (scale 0.97, translateY 2px), springs back up past its resting position and settles. About 250ms, with a springy ease.
- At the same time it blinks twice, Typeform style (about 2 x 80ms).
- A checkmark pops in. The other options fade back slightly.
- Only then, around 450 to 500ms after the tap, does the screen advance.
- Multi-select options bob on toggle. The Continue and OK buttons bob when pressed or when Enter is hit, then advance.
- Block double taps during the confirmation.
- Fire the haptics.ts call at the start of the bob.
- Under prefers-reduced-motion, use a plain fill and checkmark, then advance.
- Build this as one shared hook or component so all timings match.

6. Phone-first audit
The phone is the primary device. Laptop is secondary. Fix everything that fails this checklist:
- Test at 375, 390 and 430 widths. Use dvh units and handle safe-area insets (notch, home indicator).
- Primary actions and the bottom nav sit in the thumb zone. No important control lives only at the top of a tall screen.
- Touch targets are at least 44px. Nothing depends on hover.
- Inputs use at least 16px text so iOS doesn't zoom on focus, and inputmode="numeric" for age, height and weight.
- Carousels and sheets respond to swipe. Sheets can be dragged down to close.
- Add a web app manifest with display: standalone and a theme colour from the palette, so "Add to Home Screen" opens full screen like an app, using the logo as the icon.
- On a laptop, show the phone-width app centred on the textured background.

7. Olive, a light companion
Olive guides the user through the app. Keep her small and useful:
- Onboarding: Olive asks each question in one short friendly line, with the options below. She is the voice of the survey.
- First visit to the dashboard: one tip from Olive pointing at the meal switcher, dismissed with a tap. Show it once, never again.
- Empty and edge states: Olive explains what happened and what to do, for example when a filter leaves a hall with no vegan protein.
- Nowhere else. No chat, no floating persistent character, no multi-step tour.
- If public/brand/olive.svg (or .png) exists, use it. Otherwise draw a simple, charming olive character in SVG from the palette, in its own component so it can be swapped in one file.
- Olive follows the wellbeing guardrails strictly: encouraging, never nagging, never moralising about food, never commenting on the user's body or weight.

Finish with typecheck, tests and build. Screenshot the dashboard, a plate view and two onboarding screens at 390px in light and dark mode, saved to docs/screens/. Then log the session in docs/process-log.md with this prompt verbatim. v2.1 let's go.
```

**What was built:**
- **Warmth.** A generated paper grain (`feTurbulence` as a data URI, no image to ship) sits fixed over the whole surface at ~5% opacity, behind everything so it never intercepts a tap. Cards and sheets gained warm low shadows. Hand-drawn icons for all eight stations and all four goals, in open shapes with round caps to match the logo's manner.
- **The plate is a plate now.** A raised rim lit from the top left with a gradient, a real drop shadow beneath it, and a shallow well for the food. Wedges are the colour of the food rather than a macro key, from a new `src/lib/foodColors.ts` that matches on the item name (longest keyword first) with a warm role fallback. Items land one at a time, 90ms apart, each scaling up as it settles.
- **Home first.** The app opens on a dashboard; `/` is no longer gated. Before a profile exists it plans against `GUEST_PROFILE`, says so plainly, and Olive offers a Personalize card. Dismissing hides it for that day and it returns the next day as a single quiet line. The old Welcome screen is gone and `Today.tsx` became `PlateView.tsx` at `/plate/:hallId`.
- **Dashboard.** Header with logo, date and the meal switcher; a native snap-scroll carousel of hall cards with the next peeking in; the day summary below. The home hall sorts first, then the halls they said they use.
- **Meal periods.** All three windows live in `src/config/mealPeriods.ts` and cover the day with no gaps. The app reads the clock on load and again on `visibilitychange` and `focus`. A manual choice is held with the boundary it was made before and lapses once the clock passes it. The matching period always carries a "Now" dot. The demo panel's override feeds the same path rather than a parallel one.
- **The bob.** One hook, `src/lib/useConfirmBob.ts`, owns every timing: 250ms spring, two 80ms blinks, checkmark pop, others dimmed to 45%, advance at 470ms, haptic at the *start*. It holds a lock for the duration so a double tap cannot skip a question. Reduced motion drops to a plain fill and checkmark at 140ms.
- **Phone first.** `dvh` throughout, safe-area insets top and bottom, controls moved into a sticky footer in the thumb zone, hover styling wrapped in `@media (hover: hover)`, inputs forced to at least 16px so iOS does not zoom, `inputmode="numeric"` on the three numeric questions, a drag-down-to-close sheet with a grab handle, a web manifest with `display: standalone`, and a phone-width column centred on the textured ground on anything wider than 480px.
- **Olive.** Drawn in SVG from the palette (an olive with a pimento dimple and a leaf), swappable for `public/brand/olive.svg` in one file. She speaks only through `OliveSays` and appears in exactly three places: asking every onboarding question, one dismissible dashboard tip after onboarding, and empty states where she names the problem and offers the halls that do have something.
- **Docs.** The "everything else stays quiet" rule is gone from DESIGN_SPEC, replaced by a Warmth section and rewritten plate, dashboard, meal-period, bob, Olive and phone-first sections. PRODUCT_SPEC's scope, core flows and acceptance criteria now describe a dashboard-first app. BUILD_PLAN gained M9 and M10. The wellbeing guardrails were not touched.

**What I (Claude Code) decided without asking, flagged for Audrey to review:**
- The day summary on the dashboard plans the whole day at the *home* hall rather than mixing halls, because a day total assembled from three different halls would not describe a day anyone actually eats.
- Hall cards cap at four items with "and n more". Without the cap the card ran past the fold and the carousel stopped feeling browsable.
- Olive's onboarding lines are rewritten in her voice ("Roughly what do you weigh?" rather than "What do you weigh?"). The questions are the same; the phrasing is hers.
- Enter on a single-select confirms whatever is already selected rather than doing nothing, so the keyboard path never dead-ends on a question that already has a default.

**Problems and fixes:**
- The first hall card was far too tall: a 188px mini plate plus an uncapped item list pushed "See the full plate" below the fold, which undercut the whole point of a browsable carousel. Dropped the plate to 148px, the totals from `text-xl` to `text-lg`, and capped the list.
- M9 and M10 landed *above* M8 in BUILD_PLAN because I anchored the insert on a line that sits under M7. Caught it reading the file back and moved them.
- `DemoPanel` still referenced `demo.currentMeal`, which the context rewrite had replaced with the clock/manual split. Typecheck caught it; the panel now reports both what the clock says and whether a manual choice is overriding it.

**Verification:**
- `pnpm typecheck`, `pnpm test` (31 passing), `pnpm build`, `pnpm validate:data` and `pnpm check:contrast` all pass.
- Puppeteer drove the whole flow at **375, 390 and 430** in both light and dark: dashboard, carousel scroll, plate view, swap sheet, and the onboarding screens including one captured mid-bob to confirm the fill, checkmark and dimmed siblings all land together. No console errors at any width or scheme.
- Screenshots for the submission are in `docs/screens/`: dashboard, plate view, and two onboarding screens, each in light and dark at 390px.

**Still open:** haptics remain unverified on real hardware, same as v2. Profile names the detected path on whatever device opens it.

**Screenshots:** `docs/screens/{dashboard,plate-view,onboarding-single,onboarding-multi}-{light,dark}.png`
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

