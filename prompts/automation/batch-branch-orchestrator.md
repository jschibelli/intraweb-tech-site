---
title: Batch Branch Orchestrator Prompt
owner: automation
version: 0.1.0
last_reviewed: 2025-11-15
linked_scripts:
  - scripts/branch-management/batch-branch-orchestrator.ps1
status: draft
---

# Batch Branch Orchestrator Prompt

Enable maintainers to create/push multiple issue branches using presets, CLI lists, or JSON configs, while logging results for documentation.

## Preconditions

- Repo cloned locally; git + gh configured.
- Issue numbers (or JSON config) identified and accessible.
- Operator understands whether to force-delete existing branches.

## Runbook

1. **Collect Inputs**
   - Source branch (default `develop`)
   - Issue list source: preset (`blog`, `dashboard`, `docs`, `infra`), manual numbers, or config file path.
   - Naming pattern (default `{type}/{issue-number}-{title}`) and default type (`feature`).
   - Should branches be pushed? Should existing ones be force recreated?
   - Desired report path (default `reports/batch-branches.json`).

2. **Confirm Issue Set**
   - If using preset/JSON, echo the resolved list to the operator for approval.

3. **Dry Run (recommended)**
   ```powershell
   pwsh scripts/branch-management/batch-branch-orchestrator.ps1 `
     -Preset {{preset|custom}} `
     -Issues {{comma_separated}} `
     -ConfigPath "{{config}}" `
     -Source {{source}} `
     -Pattern "{{pattern}}" `
     -Type {{type}} `
     -Push:{{true|false}} `
     -Force:{{true|false}} `
     -ReportPath "{{report_path}}" `
     -DryRun
   ```

4. **Live Run**
   - After approval, drop `-DryRun` and rerun.
   - Monitor output for failures; if a branch fails to create/push, capture the error and continue (script already logs status per issue).

5. **Summarize**
   - Provide counts for Created / Skipped / Failed.
   - Surface the `ReportPath` JSON for downstream docs or dashboards.
   - Suggest next actions (e.g., assign developers, open draft PRs, run branch health audit).

## Prompt Template

```
You orchestrate batch branch creation.
- Gather: source branch, issue set (preset/list/JSON), push + force flags, report path.
- Run the orchestrator with `-DryRun` first, summarize planned branches, and ask for confirmation.
- Execute the live run, capturing successes/failures.
- Return a table of Issue → Branch → Status and provide the JSON report location.
If any branches fail, recommend follow-up remediation steps.
```

## Validation Checklist

- [ ] Issue list confirmed before live creation
- [ ] Dry run executed unless operator explicitly skipped
- [ ] JSON report path shared
- [ ] Failures flagged with actionable guidance

