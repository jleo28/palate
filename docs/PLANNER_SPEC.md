# Planner spec (src/core)

Pure, deterministic TypeScript. Same inputs, same output, every time. No randomness, no dates read from the system clock inside core; callers pass the date in.

## 1. Daily targets

### Inputs
```ts
type Sex = "female" | "male" | "unspecified";
type Activity = "sedentary" | "light" | "moderate" | "very";
type Goal = "steady" | "energy" | "build" | "lean";

interface Profile {
  age: number;          // 16 to 30 accepted
  sex: Sex;
  heightCm: number;
  weightKg: number;
  activity: Activity;
  goal: Goal;
  diet: DietFilter[];   // see DATA_SPEC
  avoidAllergens: Allergen[];
  meals: MealPeriod[];  // which meals they eat in hall
  homeHall: HallId;
}
```
UI converts imperial to metric before calling core. Core only speaks metric.

### BMR (Mifflin-St Jeor)
`10 * kg + 6.25 * cm - 5 * age + s`, where s = +5 (male), -161 (female), -78 (unspecified).

### Maintenance
BMR x multiplier: sedentary 1.2, light 1.375, moderate 1.55, very 1.725.

### Goal adjustment
| Goal | Calories | Protein g/kg |
|---|---|---|
| steady | maintenance | 1.4 |
| energy | maintenance | 1.4 |
| build | maintenance x 1.10, max +300 | 1.8 |
| lean | maintenance x 0.85, max -500, floor BMR | 1.8 |

Then:
- Protein capped at 2.2 g/kg and at 35% of calories.
- Fat = 28% of calories, minimum 0.6 g/kg.
- Carbs = remaining calories / 4.
- "energy" shifts 5% of calories from fat to carbs.
- Round calories to nearest 10, grams to nearest 1.

### Meal split
Default weights: breakfast 0.25, lunch 0.35, dinner 0.40. Renormalise across the meals the user eats in hall. Each meal target is the daily target multiplied by its weight.

## 2. Plate solver

### Plate template
| Slot | Count | Serving options |
|---|---|---|
| protein | 1 | 1, 1.5, 2 |
| carb | 1 | 0.5, 1, 1.5, 2 |
| veg | 1 to 2 | 1 each |
| extra (fruit, dairy, soup) | 0 or 1 | 1 |

Desserts are excluded. If a slot has no eligible item after filtering, skip it and add a note.

### Candidates
All items served at that hall, meal period and date (rotation items plus everyday items), minus anything failing diet or allergen filters. To keep search small, pre-rank and keep the top 8 proteins by protein per kcal, top 6 carbs, top 6 veg, top 5 extras. Ties break on item id.

### Score (lower is better)
Let T be the meal target and A the plate totals.
```
score =
  1.0 * |A.kcal - T.kcal| / T.kcal
+ 1.5 * max(0, T.protein - A.protein) / T.protein      // under-protein hurts most
+ 0.3 * max(0, A.protein - 1.3 * T.protein) / T.protein
+ 0.5 * |A.carbs - T.carbs| / T.carbs
+ 0.5 * |A.fat - T.fat| / T.fat
+ 0.15 * (protein item already used earlier today ? 1 : 0)
+ 0.05 * (number of items - 3)                           // prefer simpler plates
```
Brute force over the pruned candidates. Return the best plate plus the best two plates with a different protein item (used as alternatives).

### On target
`onTarget = |A.kcal - T.kcal| <= 0.10 * T.kcal && A.protein >= 0.90 * T.protein`

### Swap
`swapItem(plate, itemId)` re-solves with every other slot locked and that item excluded. Returns up to 4 options ranked by score, each with its kcal and protein delta against the current plate.

### Day plan
`planDay(profile, menu, date, hall)` solves meals in order breakfast > lunch > dinner, feeding used proteins into the repeat penalty. No carry-over of surplus or shortfall.

### Output
```ts
interface PlateLine { itemId: string; servings: number; portionLabel: string; kcal: number; protein: number; carbs: number; fat: number; }
interface Plate { lines: PlateLine[]; totals: Macros; target: Macros; score: number; onTarget: boolean; notes: string[]; why: string; }
```
`portionLabel` turns servings into words using the item's `servingUnit`: 1.5 x "scoop" becomes "1½ scoops", 0.5 x "cup" becomes "½ cup".

### "Why this plate"
One sentence, built from a template, never more than 140 characters. Lead with the protein item's contribution, then the thing that makes the plate fit. Examples of the shape:
- "Grilled chicken covers 38 of your 45 g protein. One scoop of rice keeps lunch near 690 cal."
- "Tofu and edamame get you to 31 g protein on a vegan plate. Short of 40 g, so dinner picks up the rest."

## 3. Required tests
1. BMR matches hand-calculated values for each sex option
2. Lean goal never goes below BMR (test a small, sedentary profile)
3. Lean deficit capped at 500 kcal for a large, very active profile
4. Protein cap at 2.2 g/kg applies
5. Meal split renormalises when breakfast is skipped
6. Solver is deterministic (same input twice, deep-equal output)
7. Vegan filter never returns an animal product, including in swaps and alternatives
8. Allergen exclusion never returns a matching item
9. Typical profile on the sample menu is onTarget for at least 80% of hall x meal x day combinations (report the rate)
10. Empty protein slot produces a note, not a crash
11. portionLabel formats ½, 1, 1½, 2 correctly and pluralises the unit
12. Repeat penalty: lunch and dinner on the same day do not share a protein item when an alternative exists
