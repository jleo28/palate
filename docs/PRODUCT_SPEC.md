# Product spec

## Problem
First-year students arrive at an all-you-can-eat dining hall with no plan. The variety and volume push them towards whatever looks good in the moment, and the "freshman 15" follows. They do not need more nutrition information. They need to know what to pick, and how much, before they walk in.

## Who it is for
Wellness-focused freshmen and sophomores on a USC meal plan: gym-goers, students managing their weight, students who want steadier energy through the day. It is not trying to win the student who wants maximum quantity.

## The promise
Open the app, see today's plate for the hall you are heading to, walk in and take exactly that.

## In scope for this prototype
- A home dashboard that opens straight to today's recommended plates, one card per hall, with no sign-up and no survey in the way
- Onboarding that turns body stats, activity and goal into daily calorie and macro targets, offered rather than required
- Olive, a light companion who asks the onboarding questions and explains empty states
- Hall and meal selection for today (Everybody's Kitchen, Parkside, USC Village)
- A recommended plate per meal: specific items, the station they are at, and the portion
- Swap any single item for the next best fit
- A one-line "why this plate" explanation generated from the numbers
- Dietary filters (vegetarian, vegan, halal, no pork, no beef) and allergen exclusions
- A daily summary across the meals the student eats in hall
- A demo panel to change date and time, so the rotation can be shown live in the Week 5 presentation

## Out of scope (do not build)
- Pantry, shelf and receipt tracking (archived from the Crunch concept)
- Logging what was actually eaten, weight tracking, streaks
- Accounts, backend, social features
- Real USC menu ingestion (interface only, see DATA_SPEC.md)
- AI chat or generated text
- Monetisation

## Core flows
1. **First run**: the app opens on the dashboard with general balanced plates for the current meal period. Olive offers to personalise them. The student can browse all three halls and open any plate without answering a single question.
2. **Personalising**: Personalize > ten questions, one per screen, with Olive asking > back to the dashboard, now showing plates sized to them. The survey can be left at any point and resumes exactly where it stopped.
3. **Daily use**: the dashboard opens on whatever meal period it currently is > compare halls in the carousel > open a plate > optionally swap an item
4. **Adjust**: Profile > edit stats, goal or preferences > targets recalculate > the dashboard updates

## Acceptance criteria
- A new user sees a filled-in plate immediately on opening the app, before answering anything.
- A new user who chooses to personalise reaches their own plates in under 60 seconds of tapping.
- The meal period shown always matches the device clock unless the student has chosen otherwise, and that choice lapses at the next period boundary.
- Every plate shows item, station, portion in human units ("1½ scoops"), and per-item calories and protein.
- Plate totals are within ±10% of the meal's calorie target and at least 90% of its protein target, or the plate shows an honest note explaining which constraint could not be met (for example a vegan filter with few protein options).
- Changing hall, meal or date re-solves instantly (under 100 ms on a mid-range phone).
- Dietary and allergen filters are never violated. A filtered item never appears, including in swaps.
- Refreshing the page keeps the profile and last hall.

## Wellbeing guardrails
Many users will be 17 to 19 and new to managing their own food. The product must not become a restriction tool.
- Calorie target never falls below the user's estimated BMR, whatever the goal.
- "Lean out" is capped at a 15% deficit and never more than 500 kcal below maintenance.
- Goals are named by what they give the student: "Stay steady", "More energy", "Build muscle", "Lean out gently". No goal weight or weight-loss timeline in this prototype.
- No moral language about food: no "good", "bad", "cheat", "guilt-free", "earned".
- Over-target is shown in neutral colour, never red or warning styling.
- BMI is not shown. It came up in the team meeting as an input; it adds nothing the planner needs and is a poor individual measure. Flag this for team discussion rather than build it.
- Profile carries one quiet line linking to USC Student Health for anyone who wants to talk to someone about eating.

## Open questions for the team (do not block the build)
- Is BMI wanted anywhere? (See above.)
- Snacks and late-night options: in or out for v1?
- Does the plan carry a day's shortfall forward to dinner, or treat meals independently? Prototype treats them independently.
- Is Chef GPT the main competitor? Competitive analysis pending.
