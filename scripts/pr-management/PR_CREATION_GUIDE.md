# Automated PR Creation Guide

## Overview

The PR automation system now supports **fully automated pull request creation** from issues. When you say "Create a pull request for this issue," it will automatically:

✅ **Create the PR** with base branch set to `develop`  
✅ **Find or create the branch** linked to the issue  
✅ **Set assignees** (from issue or default)  
✅ **Apply labels** (from issue or defaults)  
✅ **Add to GitHub Projects** (if configured)  
✅ **Include DCO sign-off** in PR body  
✅ **Link PR to issue** automatically  

## Usage

### Method 1: Direct Script (Recommended)

```powershell
# Create PR from issue
.\scripts\pr-management\create-pr-from-issue.ps1 -IssueNumber 250

# With custom base branch
.\scripts\pr-management\create-pr-from-issue.ps1 -IssueNumber 250 -BaseBranch "release/v1.0"

# With custom assignee and labels
.\scripts\pr-management\create-pr-from-issue.ps1 -IssueNumber 250 -Assignee "jschibelli" -Labels @("ready-to-review", "frontend")

# Dry run to preview
.\scripts\pr-management\create-pr-from-issue.ps1 -IssueNumber 250 -DryRun
```

### Method 2: Unified Automation Script

```powershell
# Create PR using the unified automation script
.\scripts\pr-management\pr-automation-unified.ps1 -IssueNumber 250 -Action create

# Create PR and then run all automation
.\scripts\pr-management\pr-automation-unified.ps1 -IssueNumber 250 -Action create
.\scripts\pr-management\pr-automation-unified.ps1 -PRNumber <PR_NUMBER> -Action all
```

## How It Works

### 1. Branch Detection
The script automatically:
- Checks for branches linked to the issue via GitHub's `linkedBranches` API
- Searches for branches matching common patterns (`issue-{number}-*`, `feature/{number}-*`, etc.)
- Creates a new branch if none exists, using the issue title to generate a branch name

### 2. PR Creation
- Base branch: Always set to `develop` (or specified `-BaseBranch`)
- Title: Uses issue title
- Body: Includes issue description + "Closes #{number}" + DCO sign-off
- Assignee: Uses issue assignee, or default from config, or specified `-Assignee`
- Labels: Uses issue labels, or defaults to `ready-to-review`, or specified `-Labels`

### 3. Project Integration
- Automatically adds PR to the default project (from `project-config.json`)
- Or uses specified project with `-Project` parameter

### 4. DCO Sign-off
Automatically includes a comprehensive Developer Certificate of Origin sign-off in the PR body.

## Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `-IssueNumber` | int | Yes | - | Issue number to create PR for |
| `-BaseBranch` | string | No | `develop` | Base branch for the PR |
| `-HeadBranch` | string | No | Auto-detect | Head branch (will auto-detect from issue) |
| `-Assignee` | string | No | Auto-detect | GitHub username to assign |
| `-Labels` | string[] | No | Auto-detect | Labels to add to PR |
| `-Project` | string | No | Auto-detect | Project key or number |
| `-SignOff` | switch | No | `$true` | Include DCO sign-off |
| `-DryRun` | switch | No | `$false` | Preview without making changes |

## Examples

### Basic Usage
```powershell
# Simple: Create PR for issue #250
.\scripts\pr-management\create-pr-from-issue.ps1 -IssueNumber 250
```

### With Custom Configuration
```powershell
# Create PR with custom assignee and labels
.\scripts\pr-management\create-pr-from-issue.ps1 `
    -IssueNumber 250 `
    -Assignee "jschibelli" `
    -Labels @("ready-to-review", "frontend", "priority-high") `
    -Project "workant"
```

### For Release Branch
```powershell
# Create PR targeting release branch
.\scripts\pr-management\create-pr-from-issue.ps1 `
    -IssueNumber 250 `
    -BaseBranch "release/v1.0"
```

### Preview First
```powershell
# See what would happen without creating
.\scripts\pr-management\create-pr-from-issue.ps1 -IssueNumber 250 -DryRun
```

## Integration with Existing Automation

After creating a PR, you can use the existing automation:

```powershell
# 1. Create PR
.\scripts\pr-management\create-pr-from-issue.ps1 -IssueNumber 250

# 2. Run full automation on the created PR
.\scripts\pr-management\pr-automation-unified.ps1 -PRNumber <PR_NUMBER> -Action all -AutoFix
```

The `-AutoFix` flag will automatically:
- Verify base branch is `develop` (and fix if needed)
- Monitor PR status
- Analyze CR-GPT comments
- Generate responses
- Run quality checks
- Update documentation

## Troubleshooting

### Branch Not Found
If the script can't find a branch:
- It will automatically create one using the issue title
- The branch will be linked to the issue via GitHub API
- Format: `feature/{issue-number}-{title-slug}`

### PR Already Exists
The script checks for existing PRs and will:
- Detect if a PR already exists for the branch
- Detect if a PR already exists for the issue
- Exit gracefully with the existing PR information

### Project Configuration
If project assignment fails:
- Ensure `project-config.json` is set up (run `.\scripts\configuration\setup-project.ps1`)
- Or specify project manually with `-Project` parameter

## Next Steps

After creating a PR:
1. Review the PR at the provided URL
2. Run automation: `.\scripts\pr-management\pr-automation-unified.ps1 -PRNumber <NUMBER> -Action all`
3. Monitor progress: `.\scripts\pr-management\pr-automation-unified.ps1 -PRNumber <NUMBER> -Action monitor`

## See Also

- [PR Automation Unified Script](pr-automation-unified.ps1) - Full PR automation
- [Auto Configure PR](auto-configure-pr.ps1) - Configure existing PRs
- [Project Configuration](../configuration/project-config.ps1) - Project setup

