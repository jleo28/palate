# Design spec

The logo is in at `public/brand/logo.png`. Everything here is built on tokens, so a palette change is a one-file change.

## Direction
The subject is a dining hall tray. Moulded, practical, slightly worn, built to be read while you are holding it in a queue. The app should feel like a good tray: calm, legible at a glance, one thing on it that matters. That one thing is the plate.

Earthy, soft and welcoming: warm neutrals, low saturation, nothing neon and nothing loud for its own sake. The palette is taken from the logo itself rather than chosen alongside it, so the mark sits naturally on every surface.

## Tokens (src/styles/tokens.css)
The logo uses exactly five colours. Four tokens are those colours unchanged; the rest are tuned steps from them, darkened only as far as the contrast requirements demand.

| Token | Hex | Use | Relation to the logo |
|---|---|---|---|
| --tray | #E8DCC8 | app background | the icon's outer field, unchanged, so the mark sits on its own ground |
| --plate | #F2EAD9 | plate, cards, rows and sheet surfaces | the tray/card inside the icon, unchanged: plate on tray is the logo's own figure and ground |
| --ink | #312921 | text and icons | the bark brown of the "8te" lettering and the bar, unchanged |
| --ink-soft | #6A5E4E | secondary text | the bark brown lifted toward the oat field |
| --line | #DCCDB4 | dividers and tray ridges | the clay inset square behind the circle, unchanged |
| --line-strong | #877963 | borders of inputs, chips and option buttons | the same clay darkened to clear 3:1 as a control boundary |
| --accent | #566040 | primary action, selection, focus ring | the moss circle deepened until cream text on it clears AA |
| --accent-tint | #DFE0CC | fill of a selected option | the moss circle lifted into the oat family |
| --protein | #A65B3C | protein bars and wedges | clay, pulled warm and red from the inset square |
| --carb | #A1722A | carb bars and wedges | ochre, the oat field taken up in saturation |
| --fat | #6B6055 | fat bars and wedges | warm stone, between bark and clay |
| --veg | #6F7A4E | veg bars and wedges, on-target state | the moss circle, unchanged |

Dark mode redefines the same tokens in warm browns and greens, never blue-black: tray #1E1913, plate #2A241C, ink #F2EAD9 (the logo's cream, inverted onto dark), accent #9FB06F.

Contrast is verified, not assumed. `pnpm check:contrast` parses these tokens and checks every foreground/background pairing the UI uses, in both modes: AA (4.5:1) for text, 3:1 for focus rings, control borders, bars and wedges. It also checks the four macro colours stay at least ΔE 20 apart from each other in CIE Lab, because they separate by hue rather than lightness and a contrast ratio cannot see that. Macro colour is never the only signal: every bar carries its label and its numbers, and the daily targets in Profile use ink with a small colour swatch rather than coloured numerals.

Over-target is neutral. The bar fills to its cap in the same macro colour. Nothing turns red, and nothing changes weight or adds an icon to mark it.

Radius has hierarchy, not one value everywhere: plate is a circle, sheets 24px top corners, chips fully rounded, list rows square with a hairline.

## Type
- **Bricolage Grotesque** (Google Fonts) for the wordmark, screen titles and numbers. Its slightly irregular grotesque feels hand-lettered, like a station card.
- **Atkinson Hyperlegible** for everything else. Designed for legibility, which is the right call for a screen read in a noisy, bright hall.
- Scale: 13 / 15 / 17 / 22 / 30 / 44. Body 17 with 1.45 line height. Numbers use tabular figures.
- Sentence case everywhere. No all-caps labels.

## Warmth
The app should feel like a warm place to eat, not a demo of a planner. Richer, not busier: every addition has to make the room feel more inviting, and anything that only adds noise comes back out.

- **Texture.** A soft paper grain sits over the whole surface at about 5% opacity, fixed so it does not swim while the page scrolls and behind everything so it never intercepts a tap. It is generated noise rather than an image, so it costs nothing to ship.
- **Depth.** Cards and sheets sit on the ground with a warm, low shadow (`--shadow-soft`, `--shadow-card`) rather than being outlined onto it.
- **Drawing.** Stations and goals each have a small hand-drawn icon: open shapes, round caps, slightly irregular, in the same manner as the logo. None of the goal icons depict bodies, scales or measurements.
- **Olive.** A companion who appears where she is useful and nowhere else. See her own section below.

## The memorable thing: the plate
On the plate view the plate is a top-down circle about 270px wide, and a smaller version rides on each dashboard card. It is rendered as a real plate rather than a chart: a raised rim lit from the top left and falling away at the bottom right, a soft drop shadow underneath, and a shallow well for the food to sit in.

Each item is a wedge sized by its share of the plate's calories and filled with **the colour of that food**, not a macro key: roast chicken is golden, black beans are dark brown, broccoli is green, berries are deep red. Colours come from `src/lib/foodColors.ts`, matched by keyword on the item name with a warm role-based fallback. Colour is never the only signal: every item is listed by name, station and portion under the plate, and the plate carries a text description for screen readers.

The centre reads the meal's calories with protein beneath. Tapping a wedge scrolls to that item's row.

**Serving the plate.** When a plate first appears its items land one at a time, about 90ms apart, each scaling up slightly as it settles. Under `prefers-reduced-motion` the whole plate is put down at once.

## Screens

### Home (the dashboard)
The app opens here, always. There is no onboarding gate and no welcome screen: someone who has never used it before sees real plates immediately.

```
+--------------------------------+
| [logo] 8teSC        Tue Sep 22 |
| ( Breakfast  Lunch  Dinner• )  |  segmented control, dot = now
|                                |
| [Olive] Make these plates      |  only before onboarding
|         yours.  [Personalize]  |
|                                |
| Dinner today                   |
| +----------------+ +--------   |
| | EVK            | | Parks     |  snap carousel, next card peeks
| | Grill and bowls| | Globa     |
| |   ( plate )    | |  ( pl     |
| | 690 cal  42 g  | | 710       |
| | [on target]    | | [on t     |
| | items...       | | item      |
| +----------------+ +--------   |
|                                |
| Your day                       |
| 2,150 of 2,200 cal             |
| Protein ████████░  bars        |
+--------------------------------+
| Home             Profile       |
+--------------------------------+
```

- **Header:** logo, today's date, and the meal switcher.
- **Carousel:** one card per hall, horizontal snap-scroll with the next card peeking in so all three feel browsable with a thumb. The user's home hall comes first, then the halls they said they use. Each card shows a mini plate, the items with portions and calories, the totals, and an on-target state. Tapping a card opens the full plate view for that hall.
- **Day summary** sits below the carousel.

**Before a profile exists** the dashboard plans against a general balanced target (`src/lib/guestProfile.ts`) and says so. Olive offers a card at the top: "Make these plates yours" with a Personalize button. Dismissing it hides it for the rest of that day; the next day it returns as a single quiet line with a Personalize link rather than the full card. After onboarding the card is gone for good.

### Meal period follows the clock
Windows live in one file, `src/config/mealPeriods.ts`:

| Period | From | To |
|---|---|---|
| Breakfast | 00:00 | 10:59 |
| Lunch | 11:00 | 15:29 |
| Dinner | 15:30 | 23:59 |

They cover the whole day with no gaps, so every local time maps to exactly one period. The app reads the device's local time on load and again whenever it returns to the foreground (`visibilitychange` and `focus`), then selects the matching period.

A manual choice from the switcher holds until the clock crosses the end of the period it was made in, after which the app goes back to following the clock. The period that matches the current time always carries a small "Now" dot, so a manual choice never hides what time it actually is. The demo panel's date and time override feeds this same logic rather than sitting beside it.

### Plate view
Reached by tapping a hall card. The hall name, the meal switcher, the plate, the why line, station-grouped rows with swap, macro bars and the day total. Rows are grouped by station in the order you would walk the hall, each with its drawn icon.

### Onboarding (one question per screen, Typeform style)
Ten questions, each on its own screen: age, height, weight, sex used for the estimate, activity, goal, diet, allergens, halls you use, meals you eat in hall. Definitions live in `src/features/onboarding/questions.ts` and drive both this flow and the editable sections in Profile, so the wording cannot drift between them.

- The question is large and left-aligned with generous space around it. A single progress bar sits at the top with an "n of 10" readout.
- Options are full-width tap targets, each labelled A, B, C, D. On desktop the letter key picks that option and Enter continues.
- Multi-select questions (diet, allergens, halls, meals) show a "Continue" button; single-select questions advance by themselves once the confirmation has played.
- Numeric questions get one screen each with a large input and, for height and weight, a unit toggle.
- Screens slide in vertically, downward going forward and upward going back. Under `prefers-reduced-motion` they cross-fade instead.
- Back is always one tap away and answers persist when going back. **Onboarding can be left at any point** with Close: progress is written to `localStorage` on every answer and resuming returns to the exact question they stopped on.
- The last question's button reads "See my plates".

### The confirmation bob
All of it lives in one hook, `src/lib/useConfirmBob.ts`, so nothing drifts out of step. On selection by tap, letter key or Enter:

1. The option fills with the accent colour and the haptic fires **at the start** of the bob, not after it.
2. It presses down (scale 0.97, translateY 2px), springs back past its resting position, and settles. About 250ms on a springy curve.
3. At the same time it blinks twice, about 2 x 80ms.
4. A checkmark pops in, and the other options fade back to 45%.
5. Only then, about 470ms after the tap, does the screen advance.

Multi-select options bob on toggle but nothing advances. Continue and Back bob when pressed or when Enter is hit, then act. Further taps are ignored while a confirmation is in flight, so a double tap cannot skip a question. Under `prefers-reduced-motion` there is no bob and no blink: the fill and the checkmark carry the confirmation, and the screen advances after 140ms.

### Olive
A light companion, deliberately small. She appears in exactly three places:

1. **Onboarding.** She asks each question in one short friendly line. She is the voice of the survey.
2. **The dashboard, once.** On the first visit after onboarding she points at the meal switcher and explains why that meal is showing. Dismissed with a tap, and never shown again.
3. **Empty and edge states.** When a filter leaves a hall with nothing to build from, Olive says what happened and what to do next, with the halls that do have something as buttons.

Nowhere else. No chat, no floating persistent character, no multi-step tour.

She lives in `src/components/Olive.tsx` and speaks through `src/components/OliveSays.tsx`. If `public/brand/olive.svg` or `.png` is dropped in she is used instead of the drawn version, so swapping her is one file. She is drawn from the palette in the same hand-drawn manner as the logo.

Olive follows the wellbeing guardrails in PRODUCT_SPEC.md strictly: encouraging, never nagging, never moralising about food, and never commenting on the user's body or weight.

### Haptics
`src/lib/haptics.ts` exposes `tap()`, `select()` and `success()`, used for advancing, option selection and finishing onboarding. It prefers `navigator.vibrate` (Android Chrome) with short patterns, about 10ms for a selection and a double pulse for success. iOS Safari has no Vibration API, so there is a best-effort fallback that toggles a hidden `<input type="checkbox" switch>` through its label, which plays a system haptic on recent iOS Safari. Both paths are feature-detected and fail silently, and the hidden switch is inert to focus, scrolling and screen readers.

Haptics are an extra and never the only feedback: every interaction that fires one already carries a visible state change on its own. Profile has a Haptics on/off toggle, on by default, saved to `localStorage`, and it names which path the current device will use so it can be checked on a real phone.

### Today
```
+--------------------------------+
| 8teSC               Tue Sep 22 |
| [EVK] [Parkside] [Village]     |  hall chips
| Breakfast  Lunch  Dinner       |  meal tabs, current underlined
|                                |
|          ( PLATE )             |
|           690 cal              |
|           42 g protein         |
|                                |
| Why: Grilled chicken covers... |
|                                |
| Grill                          |
| Grilled chicken  1½ pieces     |
| 280 cal · 38 g        [Swap]   |
| ------------------------------ |
| Main Line                      |
| Brown rice  1 scoop            |
| ...                            |
|                                |
| Protein  ████████░  42 / 45 g  |
| Carbs    ██████░░░  70 / 80 g  |
| Fat      █████░░░░  19 / 22 g  |
|                                |
| Today so far: 3 meals, 2,150   |
| of 2,200 cal                   |
+--------------------------------+
| Today            Profile       |  bottom nav
+--------------------------------+
```
Rows are grouped by station, in the order you would walk the hall. If the plate is not on target, a note sits under the plate in ink-soft, stating the fact and the reason.

### Swap sheet
Bottom sheet titled "Swap brown rice". Up to 4 options, each with name, station, portion and the change: "+40 cal, +2 g protein". Tapping one swaps and closes. The plate animates.

### Profile
Daily targets at the top (calories, protein, carbs, fat), then editable sections for stats, goal, preferences. Footer: "Menus are sample data for this prototype." and the Student Health link.

### Demo panel
Opened by long-pressing the wordmark (and a visible button in dev builds). Date picker, time picker, rotation week readout, "Reset profile". Built for the Week 5 presentation.

## Copy
- Plain verbs, sentence case, US English.
- Buttons say what happens: "See today's plate", "Swap", "Save changes".
- Empty and error states give direction: "No vegan protein at Parkside for breakfast today. Village has three." Include a button to switch hall.
- Never moralise about food. See the guardrails in PRODUCT_SPEC.md.

## Phone first
The phone is the primary device and the laptop is secondary, not the other way round.

- Designed and checked at **375, 390 and 430** wide. Layout is fluid between them; nothing is pinned to one width.
- Heights use `dvh`, not `vh`, so the mobile browser's collapsing toolbar cannot clip the bottom of a screen.
- Safe-area insets are respected top and bottom: headers add `env(safe-area-inset-top)` and the bottom nav and sticky footers add `env(safe-area-inset-bottom)`, so nothing hides behind a notch or a home indicator.
- **Primary actions sit in the thumb zone.** The bottom nav is fixed to the bottom, and onboarding's Back and Continue live in a sticky footer rather than at the top of a tall screen.
- Touch targets are at least 44px and nothing depends on hover. Hover styling is wrapped in `@media (hover: hover)` so a phone never gets a stuck hover state.
- Inputs render at 16px or larger, so iOS Safari does not zoom when one takes focus, and age, height and weight all use `inputmode="numeric"`.
- The hall carousel is a native snap-scroll, so it swipes. Sheets can be **dragged down to close** as well as tapped away or dismissed with Escape.
- `public/manifest.webmanifest` declares `display: standalone` with the logo as the icon and the palette's oat as the theme colour, so "Add to Home Screen" opens full screen like an app.
- On a laptop the app stays at phone width, centred on the textured ground with a soft shadow, rather than stretching across the window.

## Accessibility
- Contrast AA minimum for all text on tray and plate.
- Macro colours are never the only signal; bars carry labels and numbers.
- Visible focus rings in --accent, at 3:1 or better against both the tray and plate backgrounds.
- Touch targets at least 44px.
- The plate SVG has an accessible description listing the items and portions.
