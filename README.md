# Smart Pantry Portfolio

Monorepo for a smart pantry web application.

## Structure

| Package | Path | Description |
| --- | --- | --- |
| `web` | `packages/web` | Next.js (App Router) application |
| `@smart-pantry/ui` | `packages/ui` | Shared React UI components + Storybook |

## Stack

- TypeScript (strict)
- Next.js App Router (`web`)
- React (`ui` + `web`)
- Tailwind CSS
- Zustand (client state in `web`)
- Jest + React Testing Library
- Storybook (component catalog for `ui`)

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

Open [http://localhost:6006](http://localhost:6006) to browse `@smart-pantry/ui` components in isolation.

## Scripts

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

- Shared UI lives in `@smart-pantry/ui`; the `web` app consumes it.
- New UI components ship with colocated Storybook stories and tests (see `.cursor/skills/ui-component-with-storybook`).
