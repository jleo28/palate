# 8te

Macro-matched dining hall plates for USC students.

Built with TanStack Start, React 19, Tailwind CSS 4 and shadcn/ui. Original prototype by Jasmine Mai.

## Development

Needs Node 22+ and pnpm (`corepack enable`).

```sh
pnpm install
pnpm dev
```

| Path         | What                       |
| ------------ | -------------------------- |
| `apps/web`   | The TanStack Start web app |
| `packages/*` | Shared packages            |

Root scripts run through Turborepo: `dev`, `build`, `lint`, `typecheck`, `test`.
