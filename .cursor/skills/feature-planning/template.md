# <short-slug> — <Title>

**Status:** draft | ready | in progress | done  
**Packages:** ui | web | both  
**Suggested branch:** `<type/scope-short-slug>`  
**Plan created:** YYYY-MM-DD

## Context

- Problem / user story (1–3 sentences)
- Out of scope
- Assumptions

## Current state

### Web (`packages/web`)

- Relevant routes / islands:
- Relevant stores:
- Existing UI imports from `@smart-pantry/ui`:

### UI (`packages/ui`)

- Existing components to reuse:
- New public component needed: yes / no

## Decisions

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | | | open / decided |

## Data / API (optional)

Only if the feature needs server data. Leave empty otherwise.

- Shape:
- Where it is fetched (RSC / Route Handler / `lib/`):
- What stays in Zustand vs server:

## Implementation phases

### Phase 1 — MVP

- [ ] `ui`: …
- [ ] `web`: …
- [ ] Tests: …

### Phase 2 — Polish (optional)

- [ ] …

## Test plan

```bash
npm run typecheck
npm test
npm run lint
```

If `packages/ui` changes: `npm run storybook` — confirm the story under **Components**.

### Manual

- Steps and expected behavior (web route, empty/error states)

## Risks

| Risk | Mitigation |
|------|------------|
| | |
