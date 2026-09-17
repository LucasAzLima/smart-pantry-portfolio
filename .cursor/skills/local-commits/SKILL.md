---
name: local-commits
description: >-
  Apply a conventional-commit plan locally (one or more commits). Use when the
  user asks to create commits, commit the changes, run the commit plan, or invokes
  /local-commits. Requires an explicit user request. If on main/master, create a
  feature branch first — never commit on main. Never pushes. On hook/lint failure,
  stop and report — do not fix or retry.
---

# Local commits

Use this skill when the user **explicitly** asks to create git commits locally
(e.g. “commit”, “commita”, “create the commits”, “aplica o plano de commits”,
`/local-commits`).

**Read first:** `.cursor/skills/conventional-commits/SKILL.md` for message format,
scope rules, and file grouping. This skill **executes** that plan; it does not replace it.

## Scope (important)

- **Local commits only** — never `git push`, `gh pr create`, or remote-changing commands.
- **Only commit** what the user asked for (the agreed plan or the current staged scope).
- Do **not** commit `.pr-description.md`, secrets (`.env`, credentials), or unrelated files.
- Do **not** update `git config`.

## When to run

1. User explicitly requested commits (not on “how should I commit?” alone — that is
   `conventional-commits` suggestions only).
2. You have a commit plan: either from the user, from a prior `conventional-commits`
   suggestion in the same thread, or generate one following that skill before committing.

If the plan is ambiguous (which commits to run, “all” vs “only commit 1”), ask before
proceeding.

## Execution steps

Before starting, in parallel:

- `git status`
- `git diff` (staged + unstaged)
- `git log -5 --oneline` (message style)
- `git branch --show-current` (or `git rev-parse --abbrev-ref HEAD`)

**Protected branch check (before any `git add` / `git commit`):**

- **Never commit on `main` or `master`.** `HEAD` must be a feature branch before the first
  `git add` / `git commit`.
- If the current branch **is** `main` or `master` and the user asked to commit:
  1. Create and switch to a feature branch. Keep the working tree as-is:
     `git checkout -b <branch>`.
  2. Branch name: use the name the user gave; otherwise derive from the first commit in
     the plan as `type/scope-short-slug` (kebab-case), e.g. `docs/agents-git-workflow`,
     `feat/ui-quantity-stepper`.
  3. Tell the user the branch that was created, then continue with the commit plan.
- Do **not** stop and wait for the user to create the branch. Do **not** commit while
  still on `main`/`master`.

For **each** commit in the plan, **in dependency order**:

1. Stage **only** the files listed for that commit (`git add <paths>`).
2. Commit with HEREDOC (subject + optional body from the plan):

```bash
git commit -m "$(cat <<'EOF'
type(scope): short summary

Optional body lines…
EOF
)"
```

3. Verify the message has **no** `Co-authored-by` trailer:

```bash
git log -1 --format='%B'
```

4. If a trailer appeared, **stop** and tell the user (do not amend unless they ask).

After all requested commits: `git status` and summarize hashes + messages.

## Pre-commit / lint failure (critical)

If `git commit` **fails** because a hook rejected it (lint, format, tests, etc.):

1. **Stop immediately** — do not create further commits from the plan.
2. **Return the full hook/lint error** to the user (stdout/stderr from the failed commit).
3. **Do not** auto-fix analyzer, format, or test failures to “make the commit pass”.
4. **Do not** run a second commit attempt, `--amend`, or `--no-verify` unless the user
   explicitly asks after seeing the error.
5. Report what was **already committed** (if any earlier commits in the plan succeeded)
   and what remains **staged or unstaged**.

The user decides whether to fix, restage, or retry.

## Safety rules

- **Never commit on `main` or `master`** — create a feature branch first, then commit
  there. See **Protected branch check** above.
- **Never** `git push --force` to `main`/`master`; warn if user asks for force push.
- **Never** `--no-verify` / `--no-gpg-sign` unless the user explicitly requests it.
- **Never** `git commit --amend` unless all user-rule amend conditions are met.
- If commit failed due to hook, **never amend** — fix is a **new** attempt only when the
  user asks.
- Do not commit files that likely contain secrets; warn the user if they requested them.

## Relationship with other skills

| Skill | Role |
| --- | --- |
| `conventional-commits` | Suggest plan (message + files); no `git commit` unless user then asks |
| `local-commits` (this) | Execute plan locally after explicit request |
| `pull-request-description` | Draft `.pr-description.md`; no commit, no push |

## Output to the user

After success:

- State the branch name (especially if it was just created from `main`/`master`).
- List each commit: hash + subject.
- Confirm no push was performed.
- `git status` summary.

After hook/lint failure:

- Paste or summarize the error output.
- State which commits succeeded (if any) and what is left uncommitted.
- Do not propose fixes unless the user asks.

After creating a branch from `main`/`master`:

- State the new branch name.
- Continue with the commit plan on that branch (do not ask the user to re-invoke).
