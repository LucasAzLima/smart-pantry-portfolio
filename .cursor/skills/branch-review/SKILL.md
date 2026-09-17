---
name: branch-review
description: >-
  Reviews the current branch (or a commit/PR) against Smart Pantry conventions.
  Own-task mode can fix with one commit per finding; external mode outputs review
  comments only. Use for review branch, review commit, fix review, or when the
  user asks what changed on this branch.
---

# Branch review

Also read: `AGENTS.md`, `.cursor/rules/web-architecture.mdc`, skills `web-layering` and `ui-component-with-storybook`. For `packages/web` performance issues, open the matching file under `vercel-react-best-practices/rules/`.

## Review modes

| Mode | Trigger | Behavior |
| --- | --- | --- |
| **Own** | All commits in the range are by the current git author; or user says `fix review` | Review + optional fixes |
| **External** | User says `review external`; or any commit author ≠ current email | Review only — comments in English, no code edits |

```bash
git config user.email
git log <base>..HEAD --format='%ae' | sort -u
```

State the mode at the top. The user can override.

## Base branch

Default `<base>` = `main` (or `origin/main` if that is ahead). Use another branch only if the user names it.

State `Base: <base>..HEAD` in the review.

```bash
git log <base>..HEAD --oneline
git diff <base>..HEAD --stat
git diff <base>..HEAD
```

Single commit: `git show <sha>`.

## Review output (always)

### 1. Summary (3–6 bullets)

### 2. Bugs

Each: `file:line`, why, suggested fix.

### 3. Improvements

**🔴 High** | **🟡 Medium** | **🟢 Low** — file, what, why.

### 4. Architecture & quality

| Area | What to check |
| --- | --- |
| **Placement** | RSC page vs `app/components/` vs `store/` vs `@smart-pantry/ui` vs `lib/` |
| **UI package** | No Next.js/Zustand; stories + tests + public export for new components |
| **Zustand** | Selectors, not whole-store subscribe; no store in `packages/ui` |
| **Types** | No `any`; English names |
| **Tests** | Behavior that can regress has a test |
| **Hygiene** | No secrets, no unrelated files, no dead code |

### 5. External mode only — PR comments

For each 🔴/🟡 item:

```markdown
**File:** `path/to/file.tsx` (line ~NN)
**Comment:**
> [English PR review comment — constructive, specific]
```

Do not edit files in external mode.

## Fix workflow (own mode only)

When the user says `fix review`, `fix review 🔴`, or `fix review 🟡`:

1. Finish the review first (or reuse findings in this thread).
2. Scope: `fix review 🔴` = high only; `fix review 🟡` = high + medium; `fix review` = ask or all 🔴+🟡.
3. **One commit per finding** via `local-commits` — never squash fixes together.
4. Message: `fix(scope): …` or `refactor(scope): …` per `conventional-commits`.
5. After fixes, run `verify`, then `pre-merge-checklist`.
6. **Never `git push`.**
