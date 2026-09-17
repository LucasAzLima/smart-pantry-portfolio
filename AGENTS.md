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
7. Place `packages/web` code per `.cursor/rules/web-architecture.mdc` (skill: `web-layering`).
8. Next.js/React performance: skill `vercel-react-best-practices` (rule: `web-performance`).
9. Plan non-trivial features before coding (skill: `feature-planning`); verify with `verify` before merge.

See `.cursor/rules/` for detailed Cursor rules and `packages/web/AGENTS.md` for Next.js version-specific notes.

## Agent skills

| Skill | Role |
| --- | --- |
| `conventional-commits` | Suggest a commit plan (message + files). Does not commit. |
| `local-commits` | Create local commits from that plan. Never pushes. |
| `pull-request-description` | Draft `.pr-description.md`. Does not open a PR. |
| `ui-component-with-storybook` | New shared UI component + stories + tests + public export. |
| `web-layering` | RSC pages, client islands, Zustand, shared UI boundaries. |
| `vercel-react-best-practices` | Vercel React/Next performance rules (read by category, not all at once). |
| `feature-planning` | Write a plan in `.cursor/plans/`. Does not implement. |
| `verify` | Typecheck, Jest, lint, Storybook/manual checks. |
| `branch-review` | Review the branch; own mode can fix. Never pushes. |
| `pre-merge-checklist` | Merge-readiness table after review/fixes. |

## Shortcuts

| You say | Agent does |
| --- | --- |
| plan / planejar / `/feature-planning` | Plan file only |
| how to commit / split commits / `/conventional-commits` | Commit plan only |
| commit / commita / `/local-commits` | Local commits. If on `main`, create a feature branch first; never commit on `main`. |
| test / verify / `/verify` | Run checks |
| review branch / fix review / `/branch-review` | Review (and fix if asked) |
| merge checklist / `/pre-merge-checklist` | Pre-merge table |
| PR description / `/pr-description` | Write `.pr-description.md` |
