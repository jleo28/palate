# Design spec

Brand is in progress with Jasmine. Everything here is built on tokens so the final logo and palette drop in without touching components.

## Direction
The subject is a dining hall tray. Moulded, practical, slightly worn, built to be read while you are holding it in a queue. The app should feel like a good tray: calm, legible at a glance, one thing on it that matters. That one thing is the plate.

## Tokens (src/styles/tokens.css)
| Token | Hex | Use |
|---|---|---|
| --tray | #E8ECE6 | app background, the pale sage of a cafeteria tray |
| --plate | #FFFFFF | plate and sheet surfaces |
| --ink | #1C2230 | text, icons |
| --ink-soft | #5A6272 | secondary text |
| --cardinal | #9E1B32 | primary action, protein. A nod to campus, not USC's official cardinal |
| --butter | #E9B949 | carbs, highlights |
| --herb | #3F7A5A | veg, on-target state |
| --slate | #6F86A8 | fat |
| --line | #D3D9D0 | dividers, tray ridges |

Dark mode: redefine the same tokens under `prefers-color-scheme: dark` (tray #161A20, plate #20252D, ink #EEF0EC). Macro colours stay recognisable in both.

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
Wordmark large, one line under it: "Know what to put on your plate before you walk in." One button: "Get started".

### Onboarding (4 steps, progress shown as 4 short bars, since it is a real sequence)
1. Basics: age, height, weight, "Sex used for the estimate" (Female / Male / Prefer not to say), unit toggle
2. Activity: four options, each with a plain description ("3 to 5 workouts a week")
3. Goal: Stay steady / More energy / Build muscle / Lean out gently, each with one line on what it does
4. Preferences: diet chips, allergen chips, halls you use, meals you eat in hall
Final button: "See today's plate".

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
- Visible focus rings in cardinal.
- Touch targets at least 44px.
- The plate SVG has an accessible description listing the items and portions.
