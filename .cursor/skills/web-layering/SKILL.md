---
name: web-layering
description: >-
  Smart Pantry web layering—RSC pages, client islands, Zustand stores, and
  shared UI from @smart-pantry/ui. Use when adding a screen, store, or
  server-backed feature, or when a page mixes fetch, state, and presentational UI.
---

# Web layering

Scope: `packages/web`. **Reference:** `app/page.tsx` + `app/components/PantryDemo.tsx` + `store/usePantryStore.ts`.

Shared primitives live in `@smart-pantry/ui`. Follow `ui-component-with-storybook` when the UI is reusable.

## Layer responsibilities

| Layer | Path | Responsibility |
| --- | --- | --- |
| **Route / RSC** | `app/**/page.tsx`, `layout.tsx` | Layout, metadata, static structure. Default: Server Component. |
| **Client island** | `app/components/<Name>/` | `"use client"` for hooks, events, Zustand. Compose shared UI. Local UI state (`useState`) stays here. Folder per component: `Name.tsx`, `Name.test.tsx`, `Name.constants.ts`, `index.ts`. |
| **Store** | `store/` | Client app state and actions. Select slices; do not subscribe to the whole store. |
| **Shared UI** | `packages/ui` | Dumb, accessible components. Props in, events out. No Zustand, no Next.js, no fetch. |
| **Lib** | `lib/` (when needed) | Pure helpers: parse, format, validate. No React. |

## Zustand

```tsx
// ✅
const items = usePantryStore((state) => state.items);
const addItem = usePantryStore((state) => state.addItem);

// ❌ — re-renders on every store change
const { items, addItem } = usePantryStore();
```

- One store per domain (`usePantryStore`). Split only when a store becomes a junk drawer.
- Keep actions on the store; keep form field drafts in component `useState`.

## Pages vs islands

```tsx
// app/page.tsx — RSC, no store hooks
import { PantryDemo } from "./components/PantryDemo";

export default function Home() {
  return (
    <main>
      <h1>Smart Pantry</h1>
      <PantryDemo />
    </main>
  );
}
```

```tsx
// app/components/PantryDemo/PantryDemo.tsx
"use client";

import { Button } from "@smart-pantry/ui";
import { usePantryStore } from "@/store/usePantryStore";
```

## Checklist (new feature)

1. [ ] Route is an RSC unless the whole page must be interactive.
2. [ ] Interactive UI is a client island under `app/components/<Name>/` (folder + `index.ts` for every component).
3. [ ] Named constant maps/lists live in `ComponentName.constants.ts`; the `.tsx` stays render/interaction-focused.
4. [ ] Reusable visuals are in `@smart-pantry/ui` with stories + tests.
5. [ ] Client state is a Zustand store with selectors; UI package stays dumb.
6. [ ] Pure logic is in `lib/`, not inline in the page.
7. [ ] No fetch inside `packages/ui`. No React Query unless client cache is required.

## See also

- File placement: `.cursor/rules/web-architecture.mdc`
- Next.js conventions: `.cursor/rules/web-next.mdc`
- Performance: `.cursor/skills/vercel-react-best-practices`
