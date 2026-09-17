---
name: feature-planning
description: >-
  Creates a structured implementation plan for a Smart Pantry feature. Use when
  the user says plan, plan feature, planejar, plan task, or asks to plan before
  implementing. Planning only — does not write application code.
---

# Feature planning

Use before non-trivial features or refactors. **Do not implement code** in this skill.

## When to use

- Shortcut: `plan <description>` / `planejar` / `/feature-planning`
- New screen, store, shared UI component, or a change that spans `web` + `ui`

Skip for tiny one-file fixes unless the user asks to plan.

## Workflow

### 1. Gather input

- Goal, acceptance criteria, out of scope
- Packages: `ui` | `web` | both
- Design notes or constraints if the user provided them

### 2. Explore (read-only)

```bash
git status -sb
```

Find the nearest existing pattern:

- Route / island: `packages/web/app/`
- Store: `packages/web/store/`
- Shared UI: `packages/ui/src/components/`

Read first: `AGENTS.md`, `.cursor/rules/web-architecture.mdc`, skill `web-layering`. If the plan adds a reusable component, also read `ui-component-with-storybook`.

### 3. Write the plan file

Create or overwrite:

`.cursor/plans/<short-slug>.plan.md`

Use [template.md](template.md). Keep it actionable: paths, types, test commands. Status starts as `draft` until the user approves.

Create `.cursor/plans/` if it does not exist. Do not commit the plan unless the user asks.

### 4. Suggest a branch (do not create unless asked)

`type/scope-short-slug` — same scheme as `local-commits` (e.g. `feat/ui-quantity-stepper`, `feat/web-pantry-list`).

Do **not** create the branch, push, or start coding during planning.

### 5. Present a summary

Reply with: scope, packages, key decisions, risks, suggested branch, plan file path.

## Do not

- Edit application code
- Run `git commit`, `git push`, or `gh pr create`
- Invent APIs or product rules that are not in the request or the codebase
