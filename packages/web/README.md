# web

Next.js App Router package for Smart Pantry. This is the product app: auth, dashboard, guest mode, client state, and i18n.

Home (`/`) is public. Without a session, inventory is stored in **guest `localStorage`**. After sign-in, inventory is loaded and mutated through **Supabase** (`pantry_items`, RLS by authenticated `user_id`); leftover guest items are migrated once. Signed-in list views use server-side search, category filter, sort, and range pagination (`listPantryItems`); guests filter, sort, and paginate in the browser. Locale preference is persisted in `localStorage` via Zustand.

## Layout

- `app/` — routes (RSC by default) and client islands under `app/components/`
- `app/actions/` — Server Actions for sign in, sign up, sign out, and account deletion
- `store/` — Zustand stores (`usePantryStore` ↔ Supabase or guest storage, `useLocaleStore`, inventory filters)
- `i18n/` — `en-US` / `pt-BR` dictionaries and `useTranslation`
- `lib/` — domain helpers, Supabase clients (`lib/supabase/`), guest storage, and auth helpers
- `proxy.ts` — session refresh and auth redirects (Next.js 16 proxy; `/` and `/login` stay public)

Shared UI is imported from [`@smart-pantry/ui`](../ui).

## Environment

Copy [`.env.local.example`](./.env.local.example) to `.env.local`:

```bash
cp .env.local.example .env.local
```

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Project origin only (`https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Anon/public key from Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes (server) | Service role key for account deletion. Never expose to the browser. |

Apply migrations from [`../../supabase/migrations`](../../supabase/migrations) to your Supabase project before first use.

### Vercel

When deploying this package on Vercel from the monorepo:

1. Set Root Directory to `packages/web` (or install/build from the repo root with `-w web`).
2. Configure the same `NEXT_PUBLIC_*` variables plus `SUPABASE_SERVICE_ROLE_KEY` in the Vercel project settings for Production and Preview.
3. Add the deployment URL to Supabase Auth redirect allowlists.

See the [repository README](../../README.md#deploying-to-vercel) for the recommended install/build commands.

## Scripts

Prefer root commands (`npm run dev`, `npm test`, `npm run typecheck`). From this package:

```bash
npm run dev        # next dev
npm run build      # next build
npm run start      # next start
npm run lint       # eslint
npm test           # jest
npm run typecheck  # tsc --noEmit
```

See the [repository README](../../README.md) for setup and product overview.
