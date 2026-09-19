# Smart Pantry

[![CI](https://github.com/LucasAzLima/smart-pantry-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/LucasAzLima/smart-pantry-portfolio/actions/workflows/ci.yml)

This is a portfolio demo — a focused pantry app that shows product, architecture, and security choices in one place.

Portfolio web app for tracking a household pantry: items, quantities, storage categories, and expiry dates. Visitors can explore in **guest mode** (inventory in `localStorage`). After sign-in, inventory lives in **Supabase** (`pantry_items`, RLS by `user_id`); guest items migrate to the account on first authenticated load. Signed-in search, category filter, sort, and pagination run as **server-side queries** against Postgres; guests apply the same filters in the browser. Language preference lives in the browser via Zustand + `localStorage`.

## What it does

- Explore the pantry as a **guest** without an account (data stays in this browser)
- First guest visit seeds a sample pantry in `localStorage` (does not re-seed after Clear all)
- Sign up / sign in with email, password, and full name (Supabase Auth)
- Create an account from guest mode to save local items to the signed-in pantry
- Add and edit items with name, quantity, unit (`units`, `kg`, `g`, `l`, `ml`), category (Pantry / Fridge / Freezer), and optional expiry date (`YYYY-MM-DD`)
- Search by name, filter by category, and sort (name, expiry, quantity)
- Paginate the inventory grid (six items per page)
- Adjust quantity in place, remove an item (with confirmation), or clear the whole list
- Show expiry status: **Expired**, **Expiring soon** (within 7 days), or **Fresh**
- Persist inventory in Supabase when signed in (RLS by `user_id`); persist guest inventory and language preference in `localStorage`
- Open the account menu to sign out or **delete the account** (pantry rows cascade)
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
| `web` | `packages/web` | Dashboard, auth, guest mode, Zustand stores, Supabase clients, i18n |
| `@smart-pantry/ui` | `packages/ui` | Accessible primitives: Button, Input, Card, Badge, Modal |

### Web layout

```
packages/web/
  app/                    Routes (RSC) + error/loading boundaries
  app/components/<Name>/  Client islands (Name.tsx, tests, constants, index.ts)
  app/actions/            Server Actions (sign in/up/out, delete account)
  store/                  Zustand stores (pantry via Supabase or guest storage, locale)
  i18n/                   Dictionaries and translation helpers
  lib/                    Pure logic, Supabase clients/mappers, guest localStorage
  proxy.ts                Next.js 16 session refresh; `/` and `/login` are public
```

Server Components stay at the route boundary (`app/page.tsx`). Interactive UI is isolated in client component folders under `app/components/<Name>/`. Shared visuals come from `@smart-pantry/ui`; app-only screens stay in `web`.

## Stack

- **TypeScript** (strict) across all packages
- **Next.js 16** App Router (`web`)
- **React 19**
- **Tailwind CSS 4**
- **Zustand 5** (`web` — pantry list + query params: Supabase when signed in, `localStorage` when guest; locale uses persist)
- **Supabase** (Auth + Postgres + RLS)
- **Jest** + React Testing Library
- **Storybook 10** (Vite) for `@smart-pantry/ui`

Requires **Node.js 20+** and npm (workspaces).

## Engineering decisions

- **Guest vs account:** `/` is public. Guests keep a versioned inventory in `localStorage`; signed-in users use Supabase `pantry_items` with RLS (`auth.uid() = user_id`). Guest rows migrate once on first authenticated load (in-flight lock; restore storage if the insert fails).
- **Account deletion:** the Admin API runs with the service-role key on the server only; pantry rows cascade via foreign key. The anon key never deletes users.
- **List queries:** authenticated search, filter, sort, and pagination run in Postgres; guests reuse the same helpers in the browser so the UI stays consistent without a backend.
- **Expiry input:** typed `YYYY-MM-DD` instead of `input type="date"` so iOS and desktop share the same field chrome.
- **Rendering:** Server Components at the route (`app/page.tsx`); interactivity in client islands; shared primitives in `@smart-pantry/ui` with Storybook.
- **Errors and headers:** App Router `error.tsx` / `not-found.tsx` / `global-error.tsx` and route `loading.tsx` for recovery and wait states; responses set baseline security headers plus an enforcing CSP that allows Next inline bootstrap and Supabase (`connect-src`), without HSTS (left to the host).
- **i18n:** `en-US` / `pt-BR` via Zustand + `localStorage` for UI strings only; item names are user or demo data.

## Getting started

```bash
npm install
cp packages/web/.env.local.example packages/web/.env.local
```

Fill in `packages/web/.env.local` with your Supabase project URL and anon key (Dashboard → Project Settings → API). Apply SQL migrations under `supabase/migrations/` in the Supabase SQL editor (or CLI) before using the app.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Home (`/`) is public: guests can use the pantry locally. Sign in or create an account at `/login`.

### Environment variables

| Variable | Where | Description |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `packages/web/.env.local` and Vercel | Project origin only, e.g. `https://xxxx.supabase.co` (no `/rest/v1`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `packages/web/.env.local` and Vercel | Public anon key from Supabase API settings |
| `SUPABASE_SERVICE_ROLE_KEY` | `packages/web/.env.local` and Vercel (server only) | Service role key used for account deletion. Never ship to the browser. |

See [`packages/web/.env.local.example`](packages/web/.env.local.example).

### Deploying to Vercel

1. Import the GitHub repository in [Vercel](https://vercel.com).
2. Use the monorepo settings below so npm workspaces resolve correctly.
3. Add Environment Variables for **Production** (and Preview if desired):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only; required for account deletion)
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

A Husky **pre-commit** hook runs lint-staged on staged `packages/web` JS/TS files. Pull requests and pushes to `main` still run the full GitHub Actions suite (`typecheck`, `test`, `lint`, `build`). The `prepare` script skips Husky when `NODE_ENV=production` or `CI=true` (e.g. Vercel), so deploy installs do not require the Husky binary.

## Conventions

- Shared UI lives in `@smart-pantry/ui`; `web` consumes it. Do not duplicate primitives in the app.
- New UI components ship with colocated Storybook stories and tests (see `.cursor/skills/ui-component-with-storybook`).
- Client state belongs in Zustand stores under `packages/web/store/`, not in the UI package.
- App islands live under `packages/web/app/components/<Name>/` (folder + `index.ts` each); named constant maps live in `ComponentName.constants.ts` (see `.cursor/rules/web-architecture.mdc`).
- Code, comments, commits, and docs are in English.

See `AGENTS.md` for contributor and agent guidelines.
