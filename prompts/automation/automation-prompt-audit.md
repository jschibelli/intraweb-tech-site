---
title: Automation Prompt Library Audit
owner: automation
version: 0.1.0
last_reviewed: 2025-11-15
linked_scripts: []
status: draft
---

# Automation Prompt Library Audit

_Generated: 2025-11-15_

This report catalogs the current automation prompt assets, maps them to supporting workflows/scripts, and recommends upgrades to strengthen the Portfolio OS Home Automation system.

> Note: Script existence/paths verified against `C:\Users\jschi\OneDrive\Desktop\2025_portfolio\portfolio-os` at the time of writing.

## 1. Prompt Catalog & Gaps

| Document | Intent & Audience | Current Completeness | Gaps / Immediate Actions |
| --- | --- | --- | --- |
| `issue-management-prompt-engineering.md` | End-to-end strategy for AI-driven issue/PR/project automation; audience = automation engineers configuring GitHub Actions + PowerShell. | Comprehensive narrative (principles, templates, architecture) but lacks ownership/status and implementation checkpoints. | References scripts (`issue-config-unified.ps1`, `ai-enhanced-pr-automation.ps1`) and workflows that do not exist in the main repo; duplicates implementation steps already in `integration-implementation-guide.md`; no versioning or change log. |
| `github-issue-auto-configuration.md` | Field mapping and manual/CLI recipes for consistent issue setup; audience = contributors running scripts locally. | Contains up-to-date project IDs/options (as of 2025-01-07) and thorough CLI snippets. | Primary script `scripts/auto-configure-issue-updated.ps1` missing; field IDs lack validation guardrail; preset guidance is static (no AI pathway); no linkage to `issue-analysis-prompt-template.md`. |
| `integration-implementation-guide.md` | Phase-based rollout plan for completing automation stack; audience = maintainers executing roadmap. | Detailed checklist + step-by-step instructions with code samples. | Depends on seven missing scripts (auto-configure-pr, pr-automation-unified, docs-updater, continuous-issue-pipeline, issue-queue-manager, issue-implementation, ai-services); PowerShell snippets assume directories such as `scripts/automation/issue-management` that are absent; checklist status stale. |
| `issue-analysis-prompt-template.md` | Canonical AI prompt for analyzing GitHub issues; audience = PowerShell/GitHub Actions integrators. | Highly detailed template with JSON contract and integration notes. | Does not document escaping/placeholder constraints; assumes helper `Invoke-AICompletion` exists; no examples of failed responses or validation; duplicative criteria vs. `issue-management-prompt-engineering.md`. |
| `pr-automation-prompt-template.md` | AI prompt for PR analysis + CR-GPT responses. | Rich guidance incl. response templates and GitHub Actions sample. | References helper scripts `ai-pr-analyzer.ps1`, `post-cr-gpt-responses.ps1`, `update-pr-status.ps1` that do not exist; lacks mapping to `pr-automation-optimized.yml`; does not specify rate limits / token strategy. |
| `workflow-evaluation-report.md` | Audit of current automation coverage. | Clear snapshot of missing components and phased recommendations. | Last updated before latest repo changes; relies on same missing script list; duplicates recommendations from `integration-implementation-guide.md`; does not track remediation progress or owners. |

## 2. Prompt  Workflow/Script Coverage

| Prompt / Doc | Intended Script(s) / Workflow(s) | Current Implementation Status | Notes / Blockers |
| --- | --- | --- | --- |
| `issue-management-prompt-engineering.md` | `scripts/automation/issue-management/issue-config-unified.ps1`, `scripts/ai-enhanced-issue-config.ps1`, GitHub workflow `orchestrate-issues-prs.yml` | Scripts/workflow paths absent in repo; only legacy references in worktrees. | Need to port or recreate the unified issue config + AI wrapper in `/scripts/automation`. |
| `github-issue-auto-configuration.md` | `scripts/auto-configure-issue-updated.ps1`, `scripts/set-estimate-iteration.ps1`, manual `gh project item-edit` commands | Neither script located in repo root; manual commands usable but undocumented in automation toolchain. | Either reintroduce scripts from worktrees or update doc to reflect manual-only path. |
| `integration-implementation-guide.md` | `orchestrate-issues-prs.yml`, `pr-automation-optimized.yml`, AI services module, `auto-configure-pr.ps1`, `pr-automation-unified.ps1`, `docs-updater.ps1`, `continuous-issue-pipeline.ps1`, `issue-queue-manager.ps1`, `issue-implementation.ps1` | Workflows exist but call non-existent scripts; AI services module not present; rest of scripts missing. | Requires script creation + workflow patching before guide is actionable. |
| `issue-analysis-prompt-template.md` | `Invoke-AIIssueAnalysis` helper inside `issue-config-unified.ps1`, GitHub Action step `AI Issue Analysis`, PowerShell utility `ai-issue-analyzer.ps1` | No helper or analyzer script in repo; workflow lacks AI step; template currently theoretical. | Must build shared AI client (`core-utilities/ai-services.ps1`) plus analyzer wrapper. |
| `pr-automation-prompt-template.md` | `ai-pr-analyzer.ps1`, `post-cr-gpt-responses.ps1`, `update-pr-status.ps1`, workflow `pr-automation-optimized.yml` | Workflow exists but does not call AI analyzer; none of the helper scripts exist. | Need PR data fetch + response posting scripts aligned with CR-GPT conventions. |
| `workflow-evaluation-report.md` | Cross-checks all workflows (`orchestrate-issues-prs.yml`, `pr-automation-optimized.yml`, `project-status-automation.yml`, `add-to-project.yml`) and scripts listed above | Report matches current state (missing scripts) but lacks automated verification. | Consider generating report from scripted audit to keep findings fresh. |

### Coverage Insights

1. **Zero prompt is currently executable end-to-end** because every template references helper scripts that are missing from the main workspace.  
2. **GitHub Actions workflows run but degrade**: they reference non-existent scripts, so steps will fail or are commented out.  
3. **PowerShell tree gap**: `scripts/automation/` currently holds only documentationno `.ps1` filesso automation is effectively broken.  
4. **AI layer untreated**: `Invoke-AICompletion`, prompt templating, and API key handling exist only in docs, not code.

## 3. Recommended Enhancements

### Immediate (restore functionality)

- **Recreate core scripts** (`auto-configure-pr.ps1`, `pr-automation-unified.ps1`, `docs-updater.ps1`, `continuous-issue-pipeline.ps1`, `issue-queue-manager.ps1`, `issue-implementation.ps1`, `ai-services.ps1`) under `scripts/automation/`, sourced from historical worktrees or rebuilt from doc snippets.
- **Patch workflows** (`.github/workflows/orchestrate-issues-prs.yml`, `pr-automation-optimized.yml`) to reference the restored scripts and add failure guards when scripts are missing.
- **Add repository-wide `Invoke-AICompletion` utility** with provider abstraction and secure secret loading; document usage inline with prompts.

### Near-Term (stabilize AI-driven prompts)

- **Version each prompt file** (front-matter with `version`, `owner`, `last_reviewed`) and link to the script/workflow implementing it.
- **Create prompt validation harness** (e.g., `scripts/automation/tests/prompt-contract.ps1`) that runs JSON schema checks against AI responses for the issue/PR templates.
- **Attach usage guides**: embed How to trigger steps within each prompt doc, referencing CLI + workflow triggers once scripts return.
- **Consolidate duplicated content** by splitting strategy (`issue-management-prompt-engineering.md`) from implementation guide; cross-link instead of restating long sections.

### Future (optimize & monitor)

- **Automation metrics layer**: add `scripts/automation/monitoring/automation-metrics.ps1` to log success/failure counts and feed into dashboards.
- **Security & ops guardrails**: centralize API key management, rate limiting, and audit logging guidance inside `prompts/automation/security.md`.
- **Learning loop**: implement telemetry to capture AI recommendation accuracy and feed back into prompt tuning (documented in `issue-analysis-prompt-template.md`).

## 4. Next Steps & Validation

1. **Source missing scripts** from `worktrees/agent-*` and port them (with updates) into `scripts/automation/`.  
2. **Update workflows** to fail fast with descriptive errors if dependencies are absent.  
3. **Run dry-run tests** for issue + PR flows, confirming prompts generate valid JSON and that GitHub field updates succeed using `gh project item-edit`.  
4. **Schedule quarterly prompt reviews**: capture owners, success metrics, and backlog items directly in each doc.

Once these actions are complete, the Home Automation system will have a documented, testable bridge between prompt strategy and executable workflows.

