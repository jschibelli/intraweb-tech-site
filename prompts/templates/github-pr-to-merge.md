---
title: GitHub PR to Merge Prompt
owner: automation
version: 0.1.0
last_reviewed: 2025-11-15
linked_scripts:
  - scripts/automation/pr-automation-unified.ps1
status: draft
---

Automate end-to-end: <PR_URL>. Monitor reviews, analyze CRGPT, draft threaded replies, update Project Status, run checks, drive to merge.

**Execution:** `pwsh ./scripts/automation/pr-automation-unified.ps1 -PRNumber <PR_NUMBER> -Action all`

**Use:** `.\scripts\pr-automation-unified.ps1 -PRNumber <PR_NUMBER> -Action all`

Universal PR Automation: <PR_NUMBER>. Configure project fields, monitor CRGPT, generate responses, check merge readiness, provide guidance.

**Available Actions:**
- `monitor` - Show PR status and watch for changes
- `analyze` - Analyze CR-GPT comments and generate report
- `respond` - Generate automated responses to CR-GPT comments
- `quality` - Run code quality checks (lint, type-check)
- `docs` - Update documentation
- `all` - Run all actions (recommended)