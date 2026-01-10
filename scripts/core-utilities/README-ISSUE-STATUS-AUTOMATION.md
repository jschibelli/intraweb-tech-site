# Issue Status Automation

This module provides automatic GitHub project board status updates based on Git operations.

## How It Works

Git hooks automatically detect issue numbers from branch names and update the GitHub project board status:

- **Branch Checkout** → Status: "In progress" (if currently "Backlog" or "Ready")
- **Commit** → Status: "In progress" (if currently "Backlog")
- **PR Created** → Status: "In review" (if currently "In progress" and PR exists)
- **PR Merged** → Status: "Done" (if currently "In review" or "Ready")

## Branch Name Patterns Supported

The system detects issue numbers from these branch name patterns:

- `issue-{number}-*` (e.g., `issue-250-add-feature`)
- `feature/{number}-*` (e.g., `feature/250-add-feature`)
- `bugfix/{number}-*`
- `hotfix/{number}-*`
- `chore/{number}-*`
- Any branch containing a number that matches an existing issue

## Setup

Hooks are automatically installed during `setup-project.ps1` if you opt in. You can also install them manually:

```powershell
.\scripts\configuration\setup-git-hooks.ps1 -Enable
```

## Disable Hooks

To disable automatic status updates:

```powershell
.\scripts\configuration\setup-git-hooks.ps1 -Disable
```

## Manual Status Updates

You can still manually update issue status using:

```powershell
# Load the module
. .\scripts\core-utilities\issue-status-automation.ps1

# Update status
Update-IssueStatus -IssueNumber 250 -NewStatus "In progress"
```

## Configuration

Status transitions are configured in `scripts/configuration/git-hooks-config.json`. You can customize:
- Which statuses trigger transitions
- Branch name patterns
- Logging level

## Requirements

- PowerShell 7+
- GitHub CLI (`gh`) - authenticated
- Project configuration (`scripts/configuration/project-config.json`) from `.\scripts\configuration\setup-project.ps1`
