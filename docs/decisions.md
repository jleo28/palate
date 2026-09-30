# Decisions

One line per decision, newest last. Format: `YYYY-MM-DD: decision (why)`.

- 2026-09-30: Rebuild on Jasmine Mai's Lovable prototype (TanStack Start, React 19, Tailwind 4, shadcn/ui) as the design language and starting codebase (the team picked it).
- 2026-09-30: Overwrite the previous prototype repo and keep its history at the tag `archive/crunch-v0`.
- 2026-09-30: Rename the product from 8teSC to **Palate**, and the repo from `jleo28/8tesc` to `jleo28/palate`.
- 2026-09-30: Remove the Lovable connection; git is the only source of truth.
- 2026-09-30: Use gitflow with `main` and `develop` (the default branch); squash into `develop`, merge commits for releases and hotfixes.
- 2026-09-30: Claude Code self-merges its PRs into `develop` once CI is green.
- 2026-09-30: Use pnpm workspaces and Turborepo, with `apps/web`, `packages/core` (React Native safe domain logic) and `supabase/`.
- 2026-09-30: Use Supabase for auth, profiles, meal log and menus, with RLS on every table.
- 2026-09-30: Scrape real menus from USC Hospitality with an Edge Function on pg_cron, gated by a feasibility and terms spike. When nutrition is missing, fall back to USDA FoodData Central with a confidence flag.
- 2026-09-30: Deploy to Vercel: a preview per PR, production from `main`.
- 2026-09-30: iOS (Expo) is still the launch target; the web app ships first as the reference implementation.
- 2026-09-30: Branch protection is unavailable because the repo is private on GitHub Free. CI is the merge gate until the repo gets GitHub Pro (free with the Student Developer Pack).
