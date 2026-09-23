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

## The memorable thing: the plate
On Today, the plate is a top-down circle, about 300px wide. Each item is a wedge sized by its share of the plate's calories, filled with its role colour at low opacity with a fine texture, and labelled around the rim. The centre reads the meal's calories, with protein beneath. Tapping a wedge scrolls to that item's row. When the plate re-solves (hall, meal or swap changes), wedges resize with a 250ms ease. That is the only ambient motion in the app; respect `prefers-reduced-motion`.

Everything else stays quiet so the plate carries the screen.

## Screens

### Welcome
Logo large, the name under it, then one line: "Know what to put on your plate before you walk in." One button: "Get started".

### Onboarding (one question per screen, Typeform style)
Ten questions, each on its own screen: age, height, weight, sex used for the estimate, activity, goal, diet, allergens, halls you use, meals you eat in hall. Definitions live in `src/features/onboarding/questions.ts` and drive both this flow and the editable sections in Profile, so the wording cannot drift between them.

- The question is large and left-aligned with generous space around it. A single progress bar sits at the top with an "n of 10" readout.
- Options are full-width tap targets, each labelled A, B, C, D. On desktop the letter key picks that option and Enter continues.
- Single-select questions auto-advance 350ms after a tap, once the selected state has visibly registered. Multi-select questions (diet, allergens, halls, meals) show a "Continue" button instead, and a checkmark on each selected option.
- Pressing an option scales it in slightly and fills it with --accent-tint. Back is always one tap away and answers persist when going back.
- Numeric questions get one screen each with a large input and, for height and weight, a unit toggle.
- Screens slide in vertically, downward going forward and upward going back. Under `prefers-reduced-motion` they cross-fade instead.
- The last question's button reads "See today's plate".

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

## Accessibility
- Contrast AA minimum for all text on tray and plate.
- Macro colours are never the only signal; bars carry labels and numbers.
- Visible focus rings in --accent, at 3:1 or better against both the tray and plate backgrounds.
- Touch targets at least 44px.
- The plate SVG has an accessible description listing the items and portions.
