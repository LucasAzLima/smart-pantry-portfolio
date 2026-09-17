# Smart Pantry Agent Guide

Monorepo using npm workspaces:

- `packages/web` — Next.js App Router app
- `packages/ui` — shared React components (`@smart-pantry/ui`) + Storybook

## Rules

1. TypeScript strict: never use `any`; define explicit types.
2. English only for code, comments, commits, and docs.
3. Shared UI belongs in `@smart-pantry/ui`; `web` consumes it.
4. Client state in `web` uses Zustand.
5. Tests use Jest + React Testing Library.
6. New UI components ship with colocated Storybook stories (skill: `ui-component-with-storybook`).

See `.cursor/rules/` for detailed Cursor rules and `packages/web/AGENTS.md` for Next.js version-specific notes.

## Agent skills

| Skill | Role |
| --- | --- |
| `conventional-commits` | Suggest a commit plan (message + files). Does not commit. |
| `local-commits` | Create local commits from that plan. Never pushes. |
| `pull-request-description` | Draft `.pr-description.md`. Does not open a PR. |
| `ui-component-with-storybook` | New shared UI component + stories + tests + public export. |

## Shortcuts

| You say | Agent does |
| --- | --- |
| how to commit / split commits / `/conventional-commits` | Plan only |
| commit / commita / `/local-commits` | Local commits. If on `main`, create a feature branch first; never commit on `main`. |
| PR description / `/pr-description` | Write `.pr-description.md` |
