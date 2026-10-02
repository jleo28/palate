# Decisions

One line per decision, newest last. Format: `YYYY-MM-DD: decision (why)`.

- 2026-09-30: Rebuild on Jasmine Mai's Lovable prototype (TanStack Start, React 19, Tailwind 4, shadcn/ui) as the design language and starting codebase (the team picked it).
- 2026-09-30: Overwrite the previous prototype repo and keep its history at the tag `archive/crunch-v0`.
- 2026-09-30: The product is called **Palate**, and the repo is `jleo28/palate`.
- 2026-09-30: Remove the Lovable connection; git is the only source of truth.
- 2026-09-30: Use gitflow with `main` and `develop` (the default branch); squash into `develop`, merge commits for releases and hotfixes.
- 2026-09-30: Claude Code self-merges its PRs into `develop` once CI is green.
- 2026-09-30: Use pnpm workspaces and Turborepo, with `apps/web`, `packages/core` (React Native safe domain logic) and `supabase/`.
- 2026-09-30: Use Supabase for auth, profiles, meal log and menus, with RLS on every table.
- 2026-09-30: Scrape real menus from USC Hospitality with an Edge Function on pg_cron, gated by a feasibility and terms spike. When nutrition is missing, fall back to USDA FoodData Central with a confidence flag.
- 2026-09-30: Deploy to Vercel: a preview per PR, production from `main`.
- 2026-09-30: iOS (Expo) is still the launch target; the web app ships first as the reference implementation.
- 2026-09-30: Branch protection is unavailable because the repo is private on GitHub Free. CI is the merge gate until the repo gets GitHub Pro (free with the Student Developer Pack).
- 2026-09-30: Ingest USC menus from the public `hsp-api` JSON endpoint without asking USC Hospitality first (robots.txt allows it and no terms forbid it). Keep it polite: about 24 requests a day, spaced out, with an identifying User-Agent. See `docs/spikes/usc-menus.md`.
- 2026-09-30: Nutrition comes from a team-curated table for common items, with USDA FoodData Central matching and a confidence flag for the rest. The UI labels macros as estimates.
- 2026-09-30: Seedling is the companion's name, and the card tab is "My Palate".
- 2026-09-30: Shipped `v0.1.0-alpha.1` to production as a demo ahead of Supabase, using sample menus and localStorage.
- 2026-09-30: Guardrails live in `@palate/core` and are enforced in the maths. Cut is off under BMI 18.5, with a floor of 1,200 kcal (female and other) or 1,500 (male), a 500 kcal maximum deficit, and protein from the weight at BMI 25 when BMI is over 30. BMI is never shown.
- 2026-09-30: High Protein is a toggle (1.2 g/lb), not a goal. Old profiles migrate to Maintain with the toggle on.
- 2026-09-30: The day's calories are a hard cap on plates. The per-meal guide rolls with logged meals, and an unlogged meal keeps its share instead of piling onto the next one.
- 2026-09-30: Budget states use soft amber (a macro over target) and muted clay (the day over its cap). Allergen warnings are the only thing that uses red.
- 2026-09-30: Generated plates leave out skipped foods and items flagged for the user's allergies (listed or possible custom matches). "Confirm with dining staff" is always shown, and nothing says a plate is safe.
- 2026-09-30: Seedling grows from days showed up (any logged meal), never from hitting calorie targets. There are no streaks, and gaps never undo growth.
- 2026-09-30: Card settings save as a draft ("Save changes"). "Start over" clears the profile, log and Seedling on the device after a confirmation.
- 2026-10-01: Allergen warnings stay red. They're a health risk and must read clearly, the one exception to the PRD's "nothing turns red".
- 2026-10-01: Add streaks per the PRD: a day counts when a meal is logged, with two automatic freezes per calendar month and no guilt copy. Seedling growth still counts total days.
- 2026-10-01: Speak to "dining hall warriors" (anyone who eats in the halls a lot), not to class years.
- 2026-10-01: Remove every remaining reference to the old name from the app, code and docs.
