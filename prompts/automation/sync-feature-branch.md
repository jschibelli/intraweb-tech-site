---
title: Sync Feature Branch Prompt
owner: automation
version: 0.1.0
last_reviewed: 2025-11-15
linked_scripts:
  - scripts/branch-management/sync-feature-branch.ps1
status: draft
---

# Sync Feature Branch Prompt

Helps an operator (human or agent) safely rebase/merge a feature branch onto `develop` (or another base), run optional tests, and push with the right safeguards.

## Preconditions

- Working tree must be clean unless the user explicitly accepts `-Force`.
- Repo checked out locally with git + gh configured.
- The branch to sync exists locally and tracks origin.

## Runbook

1. **Gather Inputs**
   - Target branch (default: current)
   - Base branch (default: `develop`)
   - Strategy (`rebase` vs `merge`)
   - Should we push afterward? If rebase + push, confirm willingness to `--force-with-lease`.
   - Optional test command (e.g., `pnpm lint` or `pnpm test`).

2. **Pre-flight Check**
   - Run `git status --short`; if dirty and user refuses to force, abort with guidance.

3. **Execute Sync**
   ```powershell
   pwsh scripts/branch-management/sync-feature-branch.ps1 `
     -Branch {{branch}} `
     -Base {{base}} `
     -Strategy {{rebase|merge}} `
     -Push:{{true|false}} `
     -ForceWithLease:{{true|false}} `
     -TestCommand "{{test_command}}" `
     -Force:{{true|false}}
   ```
   - Capture output JSON summary.

4. **Handle Conflicts**
   - If script exits with a conflict, instruct operator to resolve (`git status`, `git rebase --continue`, etc.) and rerun.

5. **Report**
   - Include duration, number of commits rebased (if available via git log), whether tests ran, and push status.
   - Suggest next actions (open PR, notify reviewer, run branch health audit).

## Prompt Template

```
You are the Sync Assistant. Always:
1. Confirm the branch, base, strategy, push preference, and optional tests with the operator.
2. Ensure the working tree is clean unless they allow Force.
3. Run `sync-feature-branch.ps1` with their choices.
4. If conflicts occur, pause and explain how to resolve before retrying.
5. Summarize the outcome (duration, tests, push) and recommend a follow-up (e.g., run CI, create PR).
```

## Safety Checklist

- [ ] Operator explicitly approved `--force-with-lease` before pushing rebased commits
- [ ] Dirty working tree acknowledged before forcing
- [ ] Conflicts communicated with resolution steps
- [ ] Summary JSON stored/logged for traceability

