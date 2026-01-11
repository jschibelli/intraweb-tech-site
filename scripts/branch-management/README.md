# Branch Management Toolkit

Portfolio OS now includes a full suite of PowerShell helpers for managing feature branches consistently.

## Script Catalog

| Script | Purpose | Highlights |
| --- | --- | --- |
| `create-branch-from-develop.ps1` | Create a single branch from `develop`. | GitHub issue title fetch, naming convention enforcement. |
| `manage-branches.ps1` | Legacy multi-operation tool. | Preset issue ranges, rename/update/list operations. |
| `branch-health-audit.ps1` | Inspect local/remote branches for drift. | Fetch + prune, stale detection, optional auto-delete for merged branches, JSON export. |
| `sync-feature-branch.ps1` | Rebase/merge a branch onto `develop`. | Working-tree safety checks, optional test hook, push with `--force-with-lease`. |
| `batch-branch-orchestrator.ps1` | Bulk-create branches for many issues. | Accepts presets/JSON configs, force recreate, optional push, structured report. |

Shared helpers live in `branch-utils.psm1` so every script gets consistent logging, git wrappers, naming validation, and GitHub issue lookups.

## Requirements

- PowerShell 7+
- `git` and `gh` available on PATH
- Authenticated `gh` CLI session for fetching issue titles

Run these scripts from the repo root:

```pwsh
pwsh scripts/branch-management/branch-health-audit.ps1 -Scope all -MaxAgeDays 10 -AutoFix -DryRun
pwsh scripts/branch-management/sync-feature-branch.ps1 -Branch feature/321-improve-automation -Strategy rebase -Push -ForceWithLease
pwsh scripts/branch-management/batch-branch-orchestrator.ps1 -Preset docs -Push -ReportPath reports/docs-branches.json
```

## Automation Prompts

Need an AI/agent workflow? Use the prompt playbooks in `prompts/automation/`:

- `branch-health-audit.md` – guide agents through dry-run audits and optional cleanup.
- `sync-feature-branch.md` – interactive helper for rebases/merges with test + push guardrails.
- `batch-branch-orchestrator.md` – batch creation workflow with dry-run confirmation and reporting.

See `apps/docs/contents/docs/scripts-reference/complete-guide/` for detailed documentation.

