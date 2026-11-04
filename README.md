# Palate

Live: https://palateusc.vercel.app

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

## Supabase

Auth, profiles and the meal log live in Supabase (project `zfnlftgwjwugxnymkuzi`). The web app has the
project URL and publishable key built in, both of which are public and protected by row-level security,
so `pnpm dev` works with no setup. To use another project, copy `.env.example` to `apps/web/.env.local`.

Schema changes are SQL files in `supabase/migrations`. To apply them to the hosted project:

```sh
npx supabase@2.119.0 login                                   # once, opens your browser
npx supabase@2.119.0 link --project-ref zfnlftgwjwugxnymkuzi  # once, asks for the database password
pnpm db:push
```

Never put the secret (service-role) key in the app or in any `VITE_` variable.

## Feedback emails

The Give feedback form on My Palate inserts into `public.feedback`. A database webhook calls the
`feedback-email` Edge Function, which emails the message, sender and timestamp through Resend.

1. Create a Resend API key (and verify a sending domain, or use `onboarding@resend.dev` for testing).
2. Set the secrets (pick any long random string for `WEBHOOK_SECRET`):

   ```sh
   npx supabase@2.119.0 secrets set RESEND_API_KEY=<your key> WEBHOOK_SECRET=<random>
   # optional: FEEDBACK_FROM="Palate <feedback@yourdomain>"
   # optional: FEEDBACK_TO=a@x.com,b@y.com  (extra recipients; palateusc@gmail.com always gets it)
   ```

3. Deploy the function. The webhook authenticates with the shared secret, not a JWT:

   ```sh
   npx supabase@2.119.0 functions deploy feedback-email --no-verify-jwt
   ```

4. Dashboard → Database → Webhooks → Create: table `public.feedback`, event `INSERT`, type
   Supabase Edge Function `feedback-email`, method POST, and add header
   `x-webhook-secret: <same random string>`.
5. Send a test message from My Palate → Give feedback, then check the inbox and the function logs.
