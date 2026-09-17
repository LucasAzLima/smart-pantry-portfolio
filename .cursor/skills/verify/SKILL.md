---
name: verify
description: >-
  Runs Smart Pantry checks after implementation—typecheck, Jest, lint, and a
  Storybook/manual checklist when UI changed. Use after implement, fix review,
  or when the user asks to test, verify, or run checks.
---

# Verify

Run what applies after a change. **Do not claim pass without running the command.**

## Layer 1 — Always run

From the repo root:

```bash
npm run typecheck
npm test
```

If `packages/web` changed, also:

```bash
npm run lint
```

Narrow when the diff is clearly one workspace:

```bash
npm run typecheck -w web
npm test -w web
npm run typecheck -w @smart-pantry/ui
npm test -w @smart-pantry/ui
```

## Layer 2 — Add tests when valuable

| Change | Test with |
| --- | --- |
| Zustand / pure logic | Jest next to the file (`usePantryStore.test.ts`) |
| Shared UI | Colocated `<Name>.test.tsx` (Jest + RTL) + stories |
| Client island with branching UI | RTL in `packages/web` |

Do not add trivial snapshot-only tests. Bug fixes that could regress need a test.

## Layer 3 — Storybook (UI package)

When `packages/ui` changed:

```bash
npm run storybook
```

Confirm the component under **Components** at http://localhost:6006. If Storybook cannot be opened, say so and fall through to Layer 4.

## Layer 4 — App / manual checklist

When `packages/web` user-visible behavior changed, exercise the flow (browser tools if available: click, type, empty/error states — not a screenshot-only check). If the browser is unavailable, give the user a concrete checklist:

```markdown
## Manual test — <feature>
- [ ] `npm run dev` → open http://localhost:3000
- [ ] Action: … → Expected: …
- [ ] Empty / disabled / error: …
```

## After implementation

1. Layer 1 always
2. Layer 2 if logic or UI branching was added
3. Layer 3 if `@smart-pantry/ui` changed
4. Layer 4 if a web flow changed

```markdown
## Test results
| Layer | Command | Result |
|-------|---------|--------|
| Typecheck | npm run typecheck | pass/fail |
| Jest | npm test | pass/fail / N tests |
| Lint | npm run lint | pass/fail/skipped |
| Storybook | npm run storybook | pass/fail/skipped |
| Manual | checklist or browser | pass/pending |
```
