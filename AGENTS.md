# Smart Pantry Agent Guide

Monorepo using npm workspaces:

- `packages/web` — Next.js App Router app
- `packages/ui` — shared React components (`@smart-pantry/ui`)

## Rules

1. TypeScript strict: never use `any`; define explicit types.
2. English only for code, comments, commits, and docs.
3. Shared UI belongs in `@smart-pantry/ui`; `web` consumes it.
4. Client state in `web` uses Zustand.
5. Tests use Jest + React Testing Library.

See `.cursor/rules/` for detailed Cursor rules and `packages/web/AGENTS.md` for Next.js version-specific notes.
