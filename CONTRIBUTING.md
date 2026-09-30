# Contributing to Palate

## Branches (gitflow)

| Branch | Purpose | Branches from | Merges into |
| --- | --- | --- | --- |
| `main` | Production. Vercel deploys it. | | |
| `develop` | Integration. The default branch. | `main` | |
| `feature/*` | New behaviour | `develop` | `develop` (squash) |
| `fix/*` | Bug fixes | `develop` | `develop` (squash) |
| `chore/*` | Tooling, deps, docs, refactors | `develop` | `develop` (squash) |
| `spike/*` | Time-boxed investigation, docs only | `develop` | `develop` (squash) |
| `release/x.y.z` | Release prep | `develop` | `main` (merge commit), then back into `develop` |
| `hotfix/*` | Urgent production fix | `main` | `main` (merge commit), then back into `develop` |

- Every change reaches `develop` through a PR, and CI must pass before merging. Claude Code may merge its own PRs once CI is green.
- After a release merges into `main`, tag it `vx.y.z` and back-merge `main` into `develop`.
- **Never force-push `main` or `develop`.**

## Pull requests

- One concern per PR, small enough to read in five minutes.
- Use the template: **Why** (the important part), **What**, **How to test**, and **Notes** if needed.

## Commits

Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`, `test:`, `style:`, `ci:`. PR titles follow the same format because they become the squash commit.

## Before you push

```bash
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

Never commit secrets. Add new env vars to `.env.example`.
