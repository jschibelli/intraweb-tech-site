---
title: Branch Health Audit Prompt
owner: automation
version: 0.1.0
last_reviewed: 2025-11-15
linked_scripts:
  - scripts/branch-management/branch-health-audit.ps1
status: draft
---

# Branch Health Audit Prompt

Guides an automation agent (or GitHub Actions step) through auditing local + remote branches using `branch-health-audit.ps1`, capturing findings, and deciding whether to auto-clean stale branches.

## Preconditions

- PowerShell 7+, git, gh CLI available
- Repo cloned at `C:\Users\jschi\OneDrive\Desktop\2025_portfolio\portfolio-os`
- `gh auth status` is valid to resolve issue titles (optional but recommended)

## Runbook

1. **Collect Context**
   - Ask user which scope to scan (`local`, `remote`, `all`), desired `MaxAgeDays`, and whether they want a JSON report saved (default `reports/branch-health.json`).
   - Confirm if auto-cleanup should run and whether it should be live or dry-run first.

2. **Execute Audit (Dry Run First)**
   ```powershell
   pwsh scripts/branch-management/branch-health-audit.ps1 `
     -Scope {{scope}} `
     -MaxAgeDays {{max_age}} `
     -OutputFormat table `
     -ReportPath "{{report_path}}" `
     -AutoFix:$false `
     -DryRun
   ```
   - Capture the rendered table plus the JSON file (if requested) for summary.

3. **Summarize Findings**
   - Count number of branches flagged as stale, missing upstreams, or failing naming rules.
   - Highlight critical branches (e.g., age > 30 days or ahead/behind deltas).

4. **Optional Auto-Fix**
   - If user agrees, rerun without `-DryRun` and with `-AutoFix`.
   ```powershell
   pwsh scripts/branch-management/branch-health-audit.ps1 `
     -Scope local `
     -MaxAgeDays {{max_age}} `
     -AutoFix `
     -BaseBranch develop
   ```
   - Report which branches were deleted (or errors if any).

5. **Next Steps**
   - Suggest syncing problematic branches via `sync-feature-branch.ps1`.
   - Attach/commit the JSON report or upload to dashboards if required.

## Prompt Template (for AI Agent)

```
You are Portfolio OS's Branch Health Auditor. Follow these steps:

1. Run `branch-health-audit.ps1` with the provided parameters in DRY RUN mode first.
2. Summarize:
   - total branches inspected
   - stale branches (list top 5 with age + ahead/behind)
   - branches missing upstream tracking
   - naming violations
3. Ask if the operator wants to auto-delete stale merged branches. If yes, re-run with `-AutoFix` (no dry run) and list deletions.
4. Provide a final recommendation: which branches to sync, delete manually, or escalate.

Always include the command(s) you executed and where any report file was written.
```

## Validation Checklist

- [ ] Dry-run output captured and summarized
- [ ] User explicitly opted-in before destructive `-AutoFix` action
- [ ] JSON/CSV report path shared
- [ ] Follow-up actions (sync, PR cleanup) suggested

