---
name: conventional-commits
description: >-
  Suggest Conventional Commit splits (message + files) by package and feature
  for this monorepo. Use when the user asks how to split changes, how to commit,
  for commit messages, or invokes /conventional-commits.
---

# Conventional commits (suggestions only)

When the user asks how to split changes, how to commit, or for commit messages:

1. Inspect the current diff / changed files.
2. **Only suggest** a plan: for each commit, list **message** + **files**.
3. Do **not** run `git add` / `git commit` unless the user explicitly asks afterward (`local-commits`).

## Message format

```
type(scope): short summary

Optional body: 1–3 short lines on what changed and why.
```

- Subject: English, imperative, no trailing period.
- Types: `feat`, `fix`, `refactor`, `chore`, `test`, `docs`, `build`, `ci` (match `git log` when unsure).
- **`refactor`** only when user-visible behavior is unchanged. If the screen, flow, or copy changes → `feat` or `fix`.
- Summary = outcome/why, not a file dump.
- **Body** (optional): blank line after the subject, then 1–3 lines on impact/motivation. Do **not** restate the file list. Prefer a body for non-obvious changes. Skip for trivial chore/docs.

Match existing history, e.g. `feat(ui): add Storybook catalog and component story skill`.

## Scopes

**Scope = package or product area**, kebab-case:

| Scope | Use for |
| --- | --- |
| `ui` | `packages/ui` (`@smart-pantry/ui`), Storybook, colocated component tests |
| `web` | `packages/web` pages, stores, app-only components |
| `pantry` | Product behavior of the pantry demo (store + UI flow together when they are one slice) |
| `agents` | `AGENTS.md`, `.cursor/rules`, `.cursor/skills` → prefer `docs(agents)` |

- Never use app-wide scopes like `app` or `smart-pantry` for product features.
- If a change is really the shared package API, use `ui`, then a separate `web` commit for the consumer.

## How to group files

**Default: fine-grained splits** (prefer small commits over one fat feature commit).

Split by **package / capability**, in dependency order:

1. **Shared UI** — new or changed public component in `packages/ui`. Keep the component, stories, tests, barrel, and `src/index.ts` export **in the same commit** (see `ui-component-with-storybook`).
2. **Web consumer** — pages, Zustand stores, and app-only wiring in `packages/web` that use the new UI.
3. **Agent conventions** — `docs(agents): …` for rules/skills/`AGENTS.md` only.
4. **Tooling** — root `package.json`, CI, workspace config as `chore` / `build` / `ci`.

Typical vertical slice:

```
feat(ui): add QuantityStepper with stories and tests
feat(web): use QuantityStepper on the pantry demo
docs(agents): document QuantityStepper skill checklist
```

### Do **not** over-split

- Same file in two consecutive commits → **merge** those commits (avoid `git add -p`).
- Inseparable pairs stay together: page + its route file; store + the only test that covers it when both are tiny.
- Do not split a UI component from its colocated `.stories.tsx` / `.test.tsx`.
- Tiny one-liners across packages may stay in one commit; offer a fine split **and** a one-commit alternative when the diff is small.

## Suggestion output format

For each proposed commit:

### Commit N
**Message:**
```
type(scope): …

Optional body lines…
```
**Files:**
- `path/to/file.ts`
- …
