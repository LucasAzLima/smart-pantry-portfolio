---
name: pull-request-description
description: >-
  Generates a GitHub Pull Request description (summary, how to test, before/after
  visual reference table) from the current branch diff and writes it to
  `.pr-description.md`. Use when the user asks for a PR description, PR template,
  or invokes /pr-description. Does not open a PR or create commits.
---

# Pull Request Description Generator

Use this skill when the user asks to generate a PR description, summarize changes
for a PR, or invokes `/pr-description`.

## Scope (important)

This skill **only** drafts and saves a PR description file.

- Do **not** run `git commit`, `git push`, or `gh pr create`.
- Do **not** open or update a Pull Request on GitHub.
- Do **not** stage or commit `.pr-description.md`.

---

## Execution Steps

1. Detect the merge base / target branch (prefer the branch’s upstream merge base;
   otherwise try `origin/main`, `main`, `origin/master`, `master` — whichever exists).
2. Inspect the changes: `git log <base>..HEAD` and `git diff <base>..HEAD` (and
   uncommitted changes if the user asks to include them).
3. Draft a clear PR description following the template below.
4. Write the result to **exactly** `.pr-description.md` at the repo root.
   - If the file already exists, **overwrite** its full contents (do not append).
   - Never create alternate names (e.g. `.pr-description-2.md`, timestamps, or dated copies).
5. Tell the user the file was created/updated and show a brief preview in chat.

---

## Content Guidelines

### 1. Description

- Short paragraph and/or bullets explaining **what** changed and **why**.
- Highlight key UI/UX changes, new `@smart-pantry/ui` components, store behavior, or edge cases.
- Write in clear, concise English.
- Keep bullets action-oriented (e.g. “Add…”, “Hide…”, “Enforce…”).

### 2. How to test it

- Step-by-step instructions so a reviewer can reproduce the flow.
- Cover positive flows and relevant edge cases from the change.
- **Do not invent** test steps for features that were not changed in the diff.
- If `packages/web` changed: mention `npm run dev` and the affected route (usually `/`).
- If `packages/ui` changed: mention `npm run storybook` and the story title under **Components**.
- Mention `npm test` / `npm run typecheck` when tests or types were part of the diff.

### 3. Visual reference

- Always include the `## Visual reference` header.
- Always include **only** the Before/After markdown table below (no extra comments or placeholders).
- Keep the `src` values as `your-image-url-here` — the user replaces them later.
- **Do not** generate, attach, or invent screenshots/videos.

---

## Output Template

Write `.pr-description.md` with this exact structure:

```markdown
## Description

<Short paragraph summarizing what changed and why.>

- <Key change 1>
- <Key change 2>

## How to test it

1. <Step 1>
2. <Step 2>
3. <Step 3>

## Visual reference

|                    Before                   |                    After                    |
| :-----------------------------------------: | :-----------------------------------------: |
| <img width="350" src="your-image-url-here"> | <img width="350" src="your-image-url-here"> |
```

---

## Rules & Constraints

- Only describe and test what the diff actually changed.
- Always use the single path `.pr-description.md` at the repo root; overwrite if it exists.
- Do not commit `.pr-description.md` (it is gitignored).
- Do not open a PR or push as part of this skill.
