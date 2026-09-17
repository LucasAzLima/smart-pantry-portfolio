---
name: pre-merge-checklist
description: >-
  Pre-merge checks after review or fixes—typecheck, tests, lint, Storybook/UI
  export, secrets. Use after fix review, before merge, or when the user says
  merge checklist or pre-merge check.
---

# Pre-merge checklist

Run after `fix review` or when the user asks if the branch is ready to merge.

## 1. Identify the diff

```bash
git status -sb
git log origin/main..HEAD --oneline
```

Default base: `origin/main` (fall back to `main`).

## 2. Checks (must run)

Follow `.cursor/skills/verify/SKILL.md`. Do not claim pass without running.

At minimum:

```bash
npm run typecheck
npm test
```

If `packages/web` changed: `npm run lint`.

## 3. Package-specific

**`packages/ui`**
- [ ] New public component: stories + tests + export from `src/index.ts`
- [ ] No Next.js or Zustand imports
- [ ] Storybook story title is `Components/<Name>`

**`packages/web`**
- [ ] New interactive UI is a client island, not a `"use client"` page-only-for-the-store
- [ ] Shared visuals imported from `@smart-pantry/ui`, not duplicated
- [ ] Store changes use selectors

**Hygiene**
- [ ] No `.env`, credentials, or `.pr-description.md` staged
- [ ] No `any`
- [ ] Commits are conventional (`type(scope): …`)

## 4. Output

```markdown
## Pre-merge checklist — <branch>

| Check | Status | Notes |
|-------|--------|-------|
| Typecheck | ✅ / ❌ | |
| Tests | ✅ / ❌ | |
| Lint | ✅ / ❌ / N/A | |
| UI stories/export | ✅ / ❌ / N/A | |
| Ready to merge | yes / no | |
```

Never push or merge. The user opens/merges the PR.
