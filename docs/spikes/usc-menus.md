# Spike: USC Hospitality menus

**Date:** 2026-09-30 · **Question:** Can Palate ingest real USC dining hall menus, and is it allowed?

## TL;DR

| Question                                | Answer                                                                                                                                                                          |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Technically workable?                   | **Yes.** A public JSON endpoint serves the menus; no HTML parsing needed.                                                                                                       |
| Allowed?                                | **Nothing prohibits it, but nothing grants it either.** robots.txt allows it and no terms of use are published. The endpoint is undocumented, so we should ask USC Hospitality. |
| Allergens and dietary tags?             | **Yes**, per item.                                                                                                                                                              |
| Nutrition (calories, macros, portions)? | **No, none at all.** This is the biggest risk for a macro-matching product.                                                                                                     |
| How far ahead?                          | **To the end of the current week (Sunday).** It's published weekly, so the lookahead is 0–6 days.                                                                               |

**Recommendation:** Build the ingest (menu schema, then the scraper), because the data is clean and cheap to fetch politely. But treat nutrition as a product decision, not a scraper detail (see [Nutrition](#nutrition-the-real-problem)), and email USC Hospitality before production launch.

## The endpoint

The Dining Hall Menus page (`/dining-hall-menus/`) is a WordPress page. Its theme script (`custom.js`, `fetchMenuData`) loads menus client-side from:

```
GET https://hospitality.usc.edu/wp-json/hsp-api/v1/get-res-dining-menus/{venue}?y=YYYY&m=MM&d=DD
```

- **Venues:** `evk`, `parkside`, `university-village`. Our IDs are `evk`, `parkside`, `village`.
- **Response:** `application/json`, about 12–21 KB per hall per day, with `Cache-Control: max-age=0` and no ETag.
- **Other routes:** the namespace index (`/wp-json/hsp-api/v1`) lists only this one and `get-demo-res-dining-menus`. There's no nutrition route.

Shape (trimmed sample in [`usc-menus-sample.json`](usc-menus-sample.json)):

```jsonc
{
  "date": "20260930",
  "location": "usc-village-dining-hall",
  "meals": [
    {
      "name": "Lunch", // Breakfast | Brunch | Lunch | Dinner
      "stations": [
        // key absent when the meal isn't served
        {
          "station": "Flexitarian",
          "subtitle": "",
          "menu": [
            {
              "item": "Chicken Cacciatore",
              "allergens": ["soy"], // slugs
              "preferences": ["halal-ingredients"],
              "dietary_preferences": ["Soy", "Halal Ingredients"], // display labels, allergens + prefs merged
            },
          ],
        },
      ],
    },
  ],
}
```

### What one day looks like (Wed 30 Sep 2026)

| Hall     | Breakfast | Lunch | Dinner | Stations |
| -------- | --------- | ----- | ------ | -------- |
| EVK      | 23 items  | 28    | 28     | 2        |
| Parkside | 43        | 28    | 28     | 4–5      |
| Village  | 40        | 49    | 49     | 4–6      |

Across the three halls: 316 item rows in one day.

- **Allergen slugs seen:** `soy` 85, `dairy` 82, `gluten` 81, `eggs` 32, `pork` 19, `sesame` 15, `fish` 4, `not-analyzed` 3, `shellfish` 2. The site's filter UI also lists `peanuts` and `tree-nuts`.
- **Preference slugs:** `halal-ingredients` 215, `vegan` 155, `vegetarian` 87.

### Posting horizon

I probed EVK across dates, one request every 2 seconds:

| Date              | Result                        |
| ----------------- | ----------------------------- |
| Tue 29 Sep (past) | Full                          |
| Thu 1 Oct         | Full                          |
| Sat 3 Oct         | **Brunch + Dinner** (weekend) |
| Sun 4 Oct         | Full (55 items)               |
| Mon 5 Oct onward  | Empty `stations`              |

Menus appear to go up **weekly, running through Sunday**. Past days stay available.

## Allowed?

- **robots.txt:** it disallows only `/wp-admin/` (and explicitly allows `admin-ajax.php`), so `/wp-json/` is allowed. It sets `X-Robots-Tag: noindex` on the JSON, which is about search indexing, not fetching.
- **Terms:** the menu page links only to USC's [Privacy Notice](https://www.usc.edu/privacy-notice/). That notice mentions "our Terms of Use", but no such page is linked, and `usc.edu/terms-of-use` returns 404. I found no clause about automated access.
- **Data:** it's public, contains no personal data, and is served to any browser.
- **Risk:** it's an **undocumented internal API**. It could change or disappear without notice, and USC could reasonably object to heavy use.

**Ask USC Hospitality** (Joe or the team, not an automated process) for written OK. We need three things: permission to cache their public menu JSON for a student app, a contact for when the format changes, and whether they have nutrition data (see next section). Their site has an "Ask the Dietitian" service, so the data may exist internally.

## Nutrition: the real problem

USC publishes **no calories, macros or serving sizes**. Palate's core feature, a plate portioned to your macros, therefore rests entirely on estimates.

The brief's fallback, matching against USDA FoodData Central, gets us per-100 g values for a generic version of each dish. It **cannot** tell us:

- USC's recipe (for example, how much oil is in the stir-fry),
- what a "tong" or "ladle" weighs at each station,
- mixed or build-your-own items ("Make Your Own Waffle Bar", "SALAD BAR").

Options, from most to least accurate:

1. **USC provides nutrition.** Best by far, if Hospitality or its dietitian has recipe data.
2. **Curated nutrition table plus USDA fallback.** Menus repeat a lot, so a team-maintained `nutrition_overrides` table (normalized item name → per-serving macros and portion unit) covers the common items. USDA fills gaps with a `confidence` of `high`, `medium`, `low` or `none`.
3. **USDA only**, with a confidence flag. That's the brief's plan as written.

**Recommendation: option 2 now, and push for option 1.** Either way, the UI must say that macros are _estimates_ and hide or soften numbers when confidence is low. The target users are wellness-focused freshmen, so false precision here is a wellbeing risk as well as an accuracy one.

## Other things the ingest must handle

- **Role classification:** the planner needs `protein`, `carb`, `veg` or `extra` for each item, and USC doesn't provide it. Derive it from the station, keyword rules and the USDA food category, with a manual override column.
- **Non-dish rows:** section headers (`SALAD BAR`, `PIZZA BAR`), dressings, oils and sauces appear as items. The planner must exclude them, via a `kind` of `dish`, `component` or `header`.
- **Allergen mapping to our FDA big-9 type:** map `dairy` → `milk`, `eggs` → `egg`, `gluten` → `wheat`, `peanuts` → `peanut` and `tree-nuts` → `tree-nut`, and keep `soy`, `sesame`, `fish` and `shellfish` as they are. `pork` is not an allergen, so it becomes a dietary flag. **`not-analyzed` must mean "unknown" and never "safe"**, so the UI should show "Allergens not analyzed" and exclude these items when the user has any allergy set.
- **Diet tags:** `halal-ingredients` → `halal`, plus `vegan` and `vegetarian`. `gluten-free` and `dairy-free` are _derived_ from missing allergens, and only when the item was analyzed.
- **Brunch:** weekends serve `Brunch` instead of Breakfast and Lunch. Our `MealPeriod` type needs a `Brunch` value.
- **Item names:** they include stray double spaces ("Margherita Pizza"). Normalize whitespace and case into a match key.

## Proposed ingest behaviour (for `feature/menu-ingest`)

- **Schedule:** pg_cron once a day around 05:00 PT. Fetch today plus the next 7 days for each of the 3 halls: **24 requests a day**, sent one at a time about 2 s apart.
- **Identity:** `User-Agent: PalateMenuBot/1.0 (+<project URL>; <team contact email>)`. The team chooses the contact address.
- **Idempotency:** hash each raw payload, skip unchanged days, and upsert on `(hall, date, meal, station, item_key)`. Keep the raw JSON for 30 days for debugging.
- **Robustness:** validate the payload shape (zod). If it doesn't match, keep the last good data and write an `ingest_runs` row with status `failed` so we notice.
- **Tests:** use recorded fixtures, [`usc-menus-sample.json`](usc-menus-sample.json) among them. Never hit USC in CI.

## Decisions needed before PR 11 (`feature/menu-schema`)

1. OK to build the ingest now while someone emails USC Hospitality? Who sends that email?
2. Nutrition strategy: option 2 (curated table plus USDA with confidence) as recommended?
3. The contact email for the bot's User-Agent.
