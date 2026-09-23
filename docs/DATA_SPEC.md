# Data spec

## Halls
| id | Name | Short |
|---|---|---|
| evk | Everybody's Kitchen | EVK |
| parkside | Parkside Restaurant & Grill | Parkside |
| village | USC Village Dining Hall | Village |

## Meal periods (sample hours, confirm with USC before launch)
breakfast 07:00 to 10:30, lunch 11:00 to 15:00, dinner 16:30 to 21:00. Today opens on the period in progress, or the next one.

## Schema
```ts
type HallId = "evk" | "parkside" | "village";
type MealPeriod = "breakfast" | "lunch" | "dinner";
type Role = "protein" | "carb" | "veg" | "extra" | "dessert";
type DietTag = "vegetarian" | "vegan" | "halal" | "contains_pork" | "contains_beef";
type DietFilter = "vegetarian" | "vegan" | "halal" | "no_pork" | "no_beef";
type Allergen = "milk" | "egg" | "fish" | "shellfish" | "tree_nuts" | "peanuts" | "wheat" | "soy" | "sesame";

interface MenuItem {
  id: string;             // kebab-case, stable, e.g. "grilled-chicken-breast"
  name: string;           // as a student would see it on the station card
  station: string;
  role: Role;
  servingUnit: string;    // singular: "scoop", "piece", "cup", "ladle", "slice"
  servingGrams: number;
  kcal: number;           // per serving
  protein: number;
  carbs: number;
  fat: number;
  tags: DietTag[];
  allergens: Allergen[];
  source: "sample";
}

interface MenuFile {
  rotationWeeks: number;          // sample uses 2
  rotationAnchor: string;         // ISO date of a week 1 Monday, e.g. "2026-08-24"
  items: MenuItem[];              // the library
  everyday: Record<HallId, Record<MealPeriod, string[]>>;             // salad bar, grill staples
  rotation: Record<HallId, Record<string, Record<MealPeriod, string[]>>>;
  // rotation key is "w{week}-{dow}", e.g. "w1-mon"
}
```
`rotationWeek(date) = floor(daysBetween(anchor, date) / 7) mod rotationWeeks + 1`

`getMenu(menu, hall, period, date)` returns the everyday items plus that day's rotation items, de-duplicated.

## Sample data to author (src/data/menu.sample.json)
- Library of about 90 items with realistic per-serving nutrition, in line with typical USDA values for that food and portion. Protein, carb and fat calories should reconcile to within 10% of `kcal`.
- Stations (sample names, not USC's): Grill, Main Line, Global Kitchen, Plant Based, Salad Bar, Deli, Breakfast Bar, Fruit & Dairy.
- Each hall has its own character so switching halls visibly changes the plate. For example one leans towards grill and bowls, one towards global dishes, one towards plant-based.
- Each hall x period x day serves 12 to 18 items, of which everyday items are about a third.
- Include enough rotation variety that week 1 and week 2 Tuesday dinner at the same hall look clearly different.
- Mix in the kinds of dishes the team named: fajitas, salad bar, rotating entrées.

## Validator (pnpm validate:data)
Fail the build if any hall x period x day:
- has fewer than 2 proteins, of which at least 1 is vegetarian and 1 is vegan
- has fewer than 2 carbs or fewer than 2 veg
- references an item id that does not exist
And if any item's macro calories differ from `kcal` by more than 10%, or it is tagged vegan without also being tagged vegetarian.

## Future: real USC data
Build a `MenuSource` interface now and ship only the sample implementation:
```ts
interface MenuSource { getMenu(hall: HallId, period: MealPeriod, date: string): Promise<MenuItem[]>; }
```
USC Hospitality publishes residential dining menus online. Before anything scrapes them, the team needs to confirm with USC Dining what data exists (item names, stations, allergens, nutrition) and get permission. If per-item nutrition is not available, items will need matching to USDA FoodData Central, which fits the `foods` table already in the team repo schema.
