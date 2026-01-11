---
title: Automation Security & Ops Guardrails
owner: automation
version: 0.1.0
last_reviewed: 2025-11-15
linked_scripts:
  - scripts/automation/core-utilities/ai-services.ps1
  - scripts/automation/pr-automation-unified.ps1
  - scripts/automation/issue-config-unified.ps1
status: draft
---

# Automation Security & Ops Guardrails

## API Key Management
- Store OpenAI/Anthropic keys in GitHub Actions secrets (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).
- For local use, prefer `.env.local` files ignored by Git and load via `$env:OPENAI_API_KEY`.
- Rotate keys quarterly and immediately after suspected leaks.

## Secret Ingestion
```powershell
# Example
$env:OPENAI_API_KEY = (Get-Content ./secrets/openai.key -Raw).Trim()
```

## Rate Limiting
- Default concurrency: 2 issues per queue, 1 PR automation job per PR number.
- `pr-automation-unified.ps1` batches AI calls and backs off exponentially on HTTP 429/503.
- Use `issue-queue-manager.ps1 -MaxConcurrent <N>` to cap automation throughput.

## Audit Logging
- All automation scripts log to `logs/automation/*.log`. Metrics collector parses:
  - `ISSUE_PROCESSED` lines from `continuous-issue-pipeline.ps1`
  - `PR_ANALYZED` lines from `pr-automation-unified.ps1`
  - `ERROR` lines from any script exceptions

## Manual Overrides
- Set `DRY_RUN_RESPONSES=true` in workflows to prevent auto-commenting.
- Pass `-DryRun` to any PowerShell helper for a side-effect-free preview.
- Use `scripts/automation/project-manager.ps1 -Operation status` before running watchers.

## Quarterly Review Checklist
1. Run `scripts/automation/tests/prompt-contract.ps1` and fix failures.
2. Revalidate workflow references to ensure script paths are current.
3. Rotate API keys & ensure secrets are scoped to required repos only.
4. Review automation logs for anomalous spikes in failures or API calls.

