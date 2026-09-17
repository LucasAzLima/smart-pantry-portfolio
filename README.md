# Smart Pantry

Portfolio web app for tracking a household pantry: items, quantities, storage categories, and expiry dates. Inventory lives in the browser (Zustand + `localStorage`); there is no backend yet.

## What it does

- Add items with name, quantity, unit (`units`, `kg`, `g`, `l`, `ml`), category (Pantry / Fridge / Freezer), and optional expiry date
- Search by name and filter by category
- Adjust quantity in place, remove an item (with confirmation), or clear the whole list
- Show expiry status: **Expired**, **Expiring soon** (within 7 days), or **Fresh**
- Persist inventory and language preference in `localStorage`
- Switch UI language between English (`en-US`) and Portuguese (`pt-BR`)

## Structure

```
packages/
  web/   Next.js App Router app (product)
  ui/    Shared React components (@smart-pantry/ui) + Storybook
```

| Package | Path | Description |
| --- | --- | --- |
| `web` | `packages/web` | Dashboard, Zustand stores, i18n, domain helpers |
| `@smart-pantry/ui` | `packages/ui` | Accessible primitives: Button, Input, Card, Badge, Modal |

### Web layout

```
packages/web/
  app/           Routes and client islands (header, dashboard, modals)
  store/         Zustand stores (pantry items, locale)
  i18n/          Dictionaries and translation helpers
  lib/           Pure logic (expiry status, inventory filters)
```

Server Components stay at the route boundary (`app/page.tsx`). Interactive UI is isolated in client components under `app/components/`. Shared visuals come from `@smart-pantry/ui`; app-only screens stay in `web`.

## Stack

- **TypeScript** (strict) across all packages
- **Next.js 16** App Router (`web`)
- **React 19**
- **Tailwind CSS 4**
- **Zustand 5** with persist middleware (`web` only)
- **Jest** + React Testing Library
- **Storybook 10** (Vite) for `@smart-pantry/ui`

Requires **Node.js 20+** and npm (workspaces).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
