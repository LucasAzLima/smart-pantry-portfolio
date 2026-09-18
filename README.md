# Smart Pantry

Portfolio web app for tracking a household pantry: items, quantities, storage categories, and expiry dates. Inventory is stored in **Supabase** (`pantry_items`) and scoped to the signed-in user. Search, category filter, sort, and pagination run as **server-side queries** against Postgres. Language preference still lives in the browser via Zustand + `localStorage`.

## What it does

- Sign up / sign in with email and password (Supabase Auth)
- Add and edit items with name, quantity, unit (`units`, `kg`, `g`, `l`, `ml`), category (Pantry / Fridge / Freezer), and optional expiry date
- Search by name, filter by category, and sort (name, expiry, quantity) via Supabase
- Paginate the inventory grid (six items per page)
- Adjust quantity in place, remove an item (with confirmation), or clear the whole list
- Show expiry status: **Expired**, **Expiring soon** (within 7 days), or **Fresh**
- Persist inventory in Supabase (RLS by `user_id`); persist language preference in `localStorage`
- Switch UI language between English (`en-US`) and Portuguese (`pt-BR`)

## Structure

```
packages/
  web/   Next.js App Router app (product)
  ui/    Shared React components (@smart-pantry/ui) + Storybook
supabase/
  migrations/   SQL schema for pantry_items + RLS
```

| Package | Path | Description |
| --- | --- | --- |
| `web` | `packages/web` | Dashboard, auth, Zustand stores, Supabase clients, i18n |
| `@smart-pantry/ui` | `packages/ui` | Accessible primitives: Button, Input, Card, Badge, Modal |

### Web layout

```
packages/web/
  app/           Routes and client islands (header, dashboard, modals, login)
  store/         Zustand stores (pantry items via Supabase, locale)
  i18n/          Dictionaries and translation helpers
  lib/           Pure logic + Supabase clients/mappers
```

Server Components stay at the route boundary (`app/page.tsx`). Interactive UI is isolated in client components under `app/components/`. Shared visuals come from `@smart-pantry/ui`; app-only screens stay in `web`.

## Stack

- **TypeScript** (strict) across all packages
- **Next.js 16** App Router (`web`)
- **React 19**
- **Tailwind CSS 4**
- **Zustand 5** (`web` — pantry list state + query params synced with Supabase; locale uses persist)
- **Supabase** (Auth + Postgres + RLS)
- **Jest** + React Testing Library
- **Storybook 10** (Vite) for `@smart-pantry/ui`

Requires **Node.js 20+** and npm (workspaces).

## Getting started

```bash
npm install
cp packages/web/.env.local.example packages/web/.env.local
```

Fill in `packages/web/.env.local` with your Supabase project URL and anon key (Dashboard → Project Settings → API). Apply SQL migrations under `supabase/migrations/` in the Supabase SQL editor (or CLI) before using the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Unauthenticated users are redirected to `/login`.

### Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `packages/web/.env.local` and Vercel | Project origin only, e.g. `https://xxxx.supabase.co` (no `/rest/v1`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `packages/web/.env.local` and Vercel | Public anon key from Supabase API settings |

See [`packages/web/.env.local.example`](packages/web/.env.local.example).

### Deploying to Vercel

1. Import the GitHub repository in [Vercel](https://vercel.com).
2. Use the monorepo settings below so npm workspaces resolve correctly.
3. Add Environment Variables for **Production** (and Preview if desired):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. In the Supabase Dashboard → Authentication → URL configuration, add your Vercel URL(s) to **Site URL** / **Redirect URLs**.
5. Deploy. Confirm sign-in and a full pantry CRUD cycle against the live project.

Recommended Vercel settings:

| Setting | Value |
| --- | --- |
| Framework Preset | Next.js |
| Root Directory | `packages/web` |
| Install Command | `cd ../.. && npm install` |
| Build Command | `cd ../.. && npm run build -w web` |
| Output Directory | leave default |

### Component catalog (Storybook)

```bash
npm run storybook
```

Open [http://localhost:6006](http://localhost:6006) to browse `@smart-pantry/ui` in isolation.

## Scripts

Run these from the repository root:

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Next.js development server |
| `npm run storybook` | Start Storybook for the UI package |
| `npm run build` | Build the web app for production |
| `npm run build-storybook` | Build a static Storybook site |
| `npm run lint` | Lint the web package |
| `npm run test` | Run tests in all workspaces |
| `npm run typecheck` | Type-check all packages |

## Conventions

- Shared UI lives in `@smart-pantry/ui`; `web` consumes it. Do not duplicate primitives in the app.
- New UI components ship with colocated Storybook stories and tests (see `.cursor/skills/ui-component-with-storybook`).
- Client state belongs in Zustand stores under `packages/web/store/`, not in the UI package.
- Code, comments, commits, and docs are in English.

See `AGENTS.md` for contributor and agent guidelines.
