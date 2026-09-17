---
name: ui-component-with-storybook
description: >-
  Create reusable accessible React components in packages/ui with colocated
  Storybook stories, tests, and public exports. Use when adding or scaffolding
  a new UI component, writing Component.stories.tsx, or when the user asks to
  create a component for @smart-pantry/ui.
---

# UI Component + Storybook

When creating or significantly extending a component in `packages/ui`, always ship the component, Storybook stories, tests, and public export together.

## Checklist

Copy and track:

```
- [ ] Component file(s) under packages/ui/src/components/<Name>/
- [ ] Colocated <Name>.stories.tsx covering key variants/states
- [ ] Colocated <Name>.test.tsx (Jest + RTL)
- [ ] Barrel export in components/<Name>/index.ts
- [ ] Public re-export from packages/ui/src/index.ts
- [ ] TypeScript props: no `any`; English names/docs
```

## File layout

```
packages/ui/src/components/<Name>/
  <Name>.tsx
  <Name>.stories.tsx
  <Name>.test.tsx
  index.ts
```

Internal helpers (e.g. Spinner) stay in the same folder and are **not** exported from `src/index.ts` unless they are public API.

## Component rules

- Accessible by default (`aria-*`, keyboard, disabled/loading states).
- Tailwind utility classes via `className`; no Next.js or Zustand imports.
- Export explicit prop types (`export interface <Name>Props`).
- Prefer `"use client"` only if the component needs hooks/events and will be consumed from RSC — usually omit in `ui` (callers decide).

## Storybook story template

Colocate stories next to the component. Use CSF3 + `autodocs`:

```tsx
import type { Meta, StoryObj } from "@storybook/react-vite";
import { fn } from "storybook/test";
import { ComponentName } from "./ComponentName";

const meta = {
  title: "Components/ComponentName",
  component: ComponentName,
  tags: ["autodocs"],
  args: {
    // sensible defaults
    onClick: fn(),
  },
  argTypes: {
    // controls for unions: variant, size, etc.
  },
} satisfies Meta<typeof ComponentName>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

// One story per important variant/state (loading, disabled, sizes, etc.)
```

### Story requirements

1. `title` must be `Components/<Name>`.
2. Include `tags: ["autodocs"]`.
3. Cover every public variant/size/state with named exports **or** a composed `AllVariants` / `AllSizes` story.
4. Use `fn()` from `storybook/test` for event handlers in `args`.
5. Do not import from `@smart-pantry/ui` inside the package — use relative imports.

## Public export

Update `packages/ui/src/index.ts`:

```ts
export { ComponentName } from "./components/ComponentName";
export type { ComponentNameProps } from "./components/ComponentName";
```

## Verify

```bash
npm run test -w @smart-pantry/ui
npm run typecheck -w @smart-pantry/ui
npm run storybook -w @smart-pantry/ui
```

Open http://localhost:6006 and confirm the new component appears under **Components**.

## Reference

- Existing example: `packages/ui/src/components/Button/`
- Storybook config: `packages/ui/.storybook/`
