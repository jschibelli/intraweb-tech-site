---
title: Portfolio OS Prompt System Audit
owner: automation
version: 0.1.0
last_reviewed: 2025-11-15
linked_scripts: []
status: draft
---

# Portfolio OS Prompt System Audit

_Generated: 2025-11-15_

This report inventories every prompt asset under `prompts/`, assesses how well each supports the Home Automation system, and outlines remediation steps required to make the entire library actionable.

> Verification basis: Files located under `C:\Users\jschi\OneDrive\Desktop\2025_portfolio\portfolio-os\prompts\` at the time of writing. No referenced PowerShell scripts currently exist in the root `scripts/automation/` treethose citations reflect historical or planned assets only.

## 1. Directory Coverage Snapshot

| Folder | Purpose | Key Files | Health Summary |
| --- | --- | --- | --- |
| `automation/` | Strategy + prompts for issue/PR automation | `automation-prompt-audit.md`, `issue-management-prompt-engineering.md`, `integration-implementation-guide.md`, `workflow-evaluation-report.md`, etc. | Thorough strategy docs but all reference missing scripts/workflows; duplication between files; needs owners/versioning. |
| `agents/` | Agent role assignments | `agent-assignments.md` | Specifies Jason/Chris responsibilities and scripts that do not currently exist; includes garbled characters; stale issue links. |
| `generated/` | Script-specific helper prompts | `automation-metrics-workflow-prompt.md`, `docs-updater-workflow-prompt.md`, `manage-projects-workflow-prompt.md`, `pr-agent-assignment-workflow-prompt.md` | Assume scripts exist and even reference `$(System.Collections.Hashtable.FullPath)` placeholders; none of the scripts live in the repo, so prompts cannot be executed. |
| `templates/` | Quick one-liners and lightweight prompt shells | `github-complete-prompt-list.md`, `github-pr-to-merge.md` | Useful references but still lean on `pr-automation-unified.ps1` and other missing utilities; no automation safeguards. |
| `workflows/` | End-to-end automation playbooks | `e2e-issue-to-merge.md`, `default-two-agent-pr-assignment-strategy.md` | Detailed instructions with command sequences for non-existent scripts (`continuous-issue-pipeline.ps1`, etc.); includes outdated project status snapshots. |
| Root files | Global guide | `README.md`, `documentation-guide.md`, `multi-agent-e2e-workflow.md` | Provide orientation but duplicate sections elsewhere; do not reflect current reality (no scripts, different docs URL). |

## 2. Detailed Findings by Area

### 2.1 Automation Folder
- `automation-prompt-audit.md` (new) now catalogs gaps but highlights that **zero automation prompts are executable** until scripts are restored.
- `issue-management-prompt-engineering.md` duplicates implementation steps from `integration-implementation-guide.md` and references `scripts/ai-enhanced-issue-config.ps1` plus GitHub workflow steps that fail because scripts are absent.
- `github-issue-auto-configuration.md` contains accurate field IDs yet points to `scripts/auto-configure-issue-updated.ps1` and `set-estimate-iteration.ps1`, neither of which are in the repo. Documentation should either include the script source or offer a current manual workflow.
- `integration-implementation-guide.md` and `workflow-evaluation-report.md` both enumerate the same missing scripts and outdated workflow instructions; they need consolidation plus live status tracking.
- `issue-analysis-prompt-template.md` and `pr-automation-prompt-template.md` define JSON contracts without any validation harness or helper modules (`Invoke-AICompletion`, `ai-pr-analyzer.ps1`) to consume them.

### 2.2 Agents Folder
- `agent-assignments.md` hardcodes Jason/Chris tasks for issues #264-#268 and references branches plus scripts that never landed. Unicode corruption (``) indicates copy/paste encoding issues.
- No automation links ensure the document stays current; there is no script discovering active agents/issues dynamically.

### 2.3 Generated Folder
- All four prompts map to scripts (`automation-metrics.ps1`, `docs-updater.ps1`, `manage-projects.ps1`, `assign-pr-agents.ps1`) that do not exist under `scripts/`. They also include literal PowerShell variable placeholders (e.g., `$(System.Collections.Hashtable.FullPath)`) that would confuse downstream models.
- Prompts lack version info, owners, or validationthey appear to be generated stubs awaiting manual cleanup.

### 2.4 Templates Folder
- `github-complete-prompt-list.md` offers actionable one-liners but assumes supporting automation (auto-configure, universal PR automation) is working.
- `github-pr-to-merge.md` explicitly tells users to run `.\scripts\pr-automation-unified.ps1`, which is missing; following the instructions will currently fail.

### 2.5 Workflows Folder
- `e2e-issue-to-merge.md` and `multi-agent-e2e-workflow.md` are comprehensive but out of date: they rely on `continuous-issue-pipeline.ps1`, `issue-implementation.ps1`, `pr-automation-unified.ps1`, etc. None exist in the repo root.
- Both documents mix historical project board data with instructions, making it unclear what is evergreen vs. situational. They should reference live dashboards instead.
- `default-two-agent-pr-assignment-strategy.md` is a reusable template yet filled with `[PR #XXX]` placeholders and commands for missing scriptsneeds parameterization and actual script support.

### 2.6 Root Guides
- `prompts/README.md` only highlights a subset of automation prompts; it omits the `generated/`, `agents/`, and other directories entirely.
- `documentation-guide.md` points to `DOCS_MAP.md` and docs running on port 3000/3001, but there is no confirmation those instructions remain valid; it lacks a feedback loop for missing docs.
- `multi-agent-e2e-workflow.md` references the same missing automation stack as the workflows folder and contains stale epic data.

## 3. System-Level Risks

1. **Broken Automation Chain**: Every prompt referencing a PowerShell script currently leads to a missing file. This undermines trust in the Home Automation system.
2. **Duplication & Drift**: Multiple files contain overlapping instructions (issue configuration, PR automation, continuous pipeline), but they disagree on script names, ports, and workflows.
3. **Lack of Ownership**: No prompt file declares an owner, version, or last-reviewed date, so it is unclear who maintains accuracy.
4. **Placeholder Leakage**: Generated prompts include template placeholders that were never resolved, increasing the chance of hallucinated commands.
5. **Security & Ops Blind Spots**: None of the docs outline API key handling, rate limiting, or audit requirements despite repeated AI references.

## 4. Recommended Remediation Plan

### Phase 1  Restore Foundations
1. **Script Restoration**: Port required PowerShell scripts (`auto-configure-pr.ps1`, `issue-config-unified.ps1`, `pr-automation-unified.ps1`, `docs-updater.ps1`, `continuous-issue-pipeline.ps1`, `issue-queue-manager.ps1`, `issue-implementation.ps1`, `monitoring/automation-metrics.ps1`, AI services utilities) from historical worktrees into `scripts/automation/`.
2. **Workflow Hardening**: Update GitHub Actions (`orchestrate-issues-prs.yml`, `pr-automation-optimized.yml`, etc.) to reference the restored scripts and surface descriptive failures if prerequisites are missing.
3. **Prompt Metadata**: Add front-matter to every prompt (`title`, `owner`, `version`, `last_reviewed`, `linked_scripts`, `status`) so accuracy can be tracked.

### Phase 2  Rationalize Documentation
1. **Single Source of Truth**: Merge overlapping sections between `issue-management-prompt-engineering.md`, `integration-implementation-guide.md`, and `workflow-evaluation-report.md`, keeping status tables in one location.
2. **Automated Validation**: Build a prompt test harness (`scripts/automation/tests/prompt-contract.ps1`) that calls `Invoke-AICompletion` with dummy data to confirm JSON outputs meet the documented schema.
3. **Agent Docs Refresh**: Replace hardcoded issue assignments with generated data (e.g., script pulls `gh issue list` for label `automation`). Fix encoding artifacts and ensure docs update alongside workflows.

### Phase 3  Continuous Improvement
1. **Generated Prompt Pipeline**: Define a process for generating/updating prompts in `generated/` with clear owners and acceptance criteria before publishing.
2. **Monitoring & Metrics**: Implement `automation-metrics.ps1` plus dashboards feeding success/failure counts back into documentation (e.g., append latest metrics to `automation-prompt-audit.md`).
3. **Security Guidelines**: Add `prompts/automation/security-and-ops.md` detailing API key storage, rate limiting, audit logging, and human override policies.

## 5. Action Checklist

- [ ] Recover and verify all referenced PowerShell scripts; document locations and usage.
- [ ] Update GitHub workflows to match the restored scripts and add guard clauses.
- [ ] Add metadata blocks to every prompt file and record owners.
- [ ] Consolidate duplicative documentation and clearly label evergreen vs. time-bound content.
- [ ] Create automated tests/linters for prompt JSON contracts and placeholder replacement.
- [ ] Establish a quarterly review cadence to keep prompt instructions aligned with actual system capabilities.

Implementing the steps above will align the prompt library with real automation capabilities, reduce drift, and give the Home Automation system a trustworthy knowledge base for future enhancements.

