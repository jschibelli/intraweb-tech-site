#requires -Version 7.0
<#
.SYNOPSIS
    Creates a fully automated pull request from an issue with all configuration.

.DESCRIPTION
    This script automatically creates a pull request for an issue with:
    - Base branch set to 'develop'
    - Automatic branch detection or creation
    - Assignees, labels, and project assignment
    - DCO sign-off
    - Full project field configuration

.PARAMETER IssueNumber
    The issue number to create a PR for

.PARAMETER BaseBranch
    The base branch for the PR (default: "develop")

.PARAMETER HeadBranch
    The head branch (optional, will auto-detect from issue if not provided)

.PARAMETER Assignee
    GitHub username to assign (optional, will use issue assignee or default)

.PARAMETER Labels
    Comma-separated labels to add (optional, will use issue labels)

.PARAMETER Project
    Project key or number (optional, will use default from config)

.PARAMETER SignOff
    Include DCO sign-off in PR body (default: $true)

.PARAMETER DryRun
    Preview what would be done without making changes

.EXAMPLE
    .\create-pr-from-issue.ps1 -IssueNumber 250

.EXAMPLE
    .\create-pr-from-issue.ps1 -IssueNumber 250 -BaseBranch "develop" -SignOff
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [int]$IssueNumber,
    
    [string]$BaseBranch = "develop",
    
    [string]$HeadBranch = "",
    
    [string]$Assignee = "",
    
    [string[]]$Labels = @(),
    
    [string]$Project = "",
    
    [switch]$SignOff = $true,
    
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Branch naming convention helpers
$branchUtilsPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\\branch-management\\branch-utils.psm1"
if (Test-Path $branchUtilsPath) {
    Import-Module $branchUtilsPath -Force
} else {
    Write-Warning "Branch utilities module not found at $branchUtilsPath. Branch naming validation will be skipped."
}

# Load dependencies
$configHelperPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\configuration\project-config.ps1"
if (Test-Path $configHelperPath) {
    . $configHelperPath
} else {
    Write-Host "⚠️  Configuration helper not found, some features may be limited" -ForegroundColor Yellow
}

# Load issue status automation for updating issue status
$issueStatusPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\core-utilities\issue-status-automation.ps1"
if (Test-Path $issueStatusPath) {
    . $issueStatusPath
}

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required. Please install it first."
    }
}

function Get-IssueData {
    param([int]$IssueNumber)
    
    try {
        $issueJson = gh issue view $IssueNumber --json number,title,body,assignees,labels,state,url,projectCards 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            # Issue might not exist or be inaccessible, return a basic object
            return [PSCustomObject]@{
                number = $IssueNumber
                title = $null
                body = $null
                assignees = @()
                labels = @()
                state = "unknown"
                url = $null
            }
        }
        
        $issue = $issueJson | ConvertFrom-Json
        
        if ($issue.state -and $issue.state -ne "open") {
            Write-Warning "Issue #${IssueNumber} is not open (state: $($issue.state))"
        }
        
        return $issue
    } catch {
        # Return a basic object if we can't fetch the issue
        Write-Warning "Could not fully fetch issue #${IssueNumber}: $($_.Exception.Message)"
        return [PSCustomObject]@{
            number = $IssueNumber
            title = $null
            body = $null
            assignees = @()
            labels = @()
            state = "unknown"
            url = $null
        }
    }
}

function Get-BranchesLinkedToIssue {
    param([int]$IssueNumber)
    
    try {
        $repoInfo = gh repo view --json owner,name -q '@json'
        $repo = $repoInfo | ConvertFrom-Json
        
        $query = @"
query(`$owner: String!, `$repo: String!, `$issueNumber: Int!) {
  repository(owner: `$owner, name: `$repo) {
    issue(number: `$issueNumber) {
      linkedBranches(first: 10) {
        nodes {
          ref {
            name
          }
        }
      }
    }
  }
}
"@
        
        $result = gh api graphql -f query=$query `
            -f owner=$repo.owner.login `
            -f repo=$repo.name `
            -f issueNumber=$IssueNumber 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            return @()
        }
        
        $data = $result | ConvertFrom-Json
        $branches = @()
        
        if ($data.data.repository.issue.linkedBranches.nodes) {
            foreach ($node in $data.data.repository.issue.linkedBranches.nodes) {
                $branches += $node.ref.name
            }
        }
        
        return $branches
    } catch {
        Write-Warning "Could not fetch linked branches: $($_.Exception.Message)"
        return @()
    }
}

function Find-BranchForIssue {
    param(
        [int]$IssueNumber,
        [string]$IssueTitle
    )
    
    # First, try to get linked branches
    $linkedBranches = Get-BranchesLinkedToIssue -IssueNumber $IssueNumber
    
    if ($linkedBranches.Count -gt 0) {
        # Use the first linked branch
        $branch = $linkedBranches[0]
        Write-Host "  ✓ Found linked branch: $branch" -ForegroundColor Green
        
        # Verify branch exists on remote
        $exists = git ls-remote --heads origin $branch 2>&1
        if ($exists -match 'refs/heads') {
            return $branch
        } else {
            Write-Warning "Linked branch '$branch' not found on remote, will try other methods"
        }
    }
    
    # Try common branch name patterns
    $patterns = @(
        "issue-$IssueNumber-*",
        "feature/$IssueNumber-*",
        "bugfix/$IssueNumber-*",
        "chore/$IssueNumber-*",
        "hotfix/$IssueNumber-*"
    )
    
    foreach ($pattern in $patterns) {
        $branches = git branch -r --list "origin/$pattern" 2>&1
        if ($branches) {
            $branchName = ($branches[0] -replace '^\s*origin/', '').Trim()
            # Validate that we actually extracted a valid branch name
            if ($branchName -and $branchName.Length -gt 0) {
                Write-Host "  ✓ Found branch matching pattern: $branchName" -ForegroundColor Green
                return $branchName
            }
        }
    }
    
    # Generate branch name from issue title
    if ([string]::IsNullOrWhiteSpace($IssueTitle)) {
        # Fallback if issue title is missing
        $IssueTitle = "issue-$IssueNumber"
    }
    
    $slug = $IssueTitle.ToLower() `
        -replace '[^\w\s-]', '' `
        -replace '\s+', '-' `
        -replace '-+', '-' `
        -replace '^-|-$', ''
    
    # Ensure slug is not empty after sanitization
    if ([string]::IsNullOrWhiteSpace($slug)) {
        $slug = "issue-$IssueNumber"
    }
    
    if ($slug.Length > 50) {
        $slug = $slug.Substring(0, 50).TrimEnd('-')
    }
    
    $branchName = "feature/$IssueNumber-$slug"
    Write-Host "  ℹ️  No existing branch found, will create: $branchName" -ForegroundColor Yellow
    return $branchName
}

function Create-BranchForIssue {
    param(
        [int]$IssueNumber,
        [string]$BranchName,
        [string]$BaseBranch
    )
    
    # Validate branch name is not empty
    if ([string]::IsNullOrWhiteSpace($BranchName)) {
        throw "BranchName cannot be empty. Issue #${IssueNumber} requires a valid branch name."
    }
    
    try {
        # Enforce branch naming convention before attempting to create/link.
        if (Get-Command Assert-BranchName -ErrorAction SilentlyContinue) {
            Assert-BranchName -BranchName $BranchName | Out-Null
        }

        # Check if branch already exists
        $exists = git ls-remote --heads origin $BranchName 2>&1
        if ($exists -match 'refs/heads') {
            Write-Host "  ✓ Branch already exists: $BranchName" -ForegroundColor Green
            return $true
        }
        
        # Get issue ID for linking
        $issueId = gh issue view $IssueNumber --json id -q .id
        if (-not $issueId) {
            throw "Could not get issue ID"
        }
        
        # Get base branch OID
        $baseOid = git rev-parse "origin/$BaseBranch" 2>&1
        if ($LASTEXITCODE -ne 0) {
            $baseOid = git rev-parse $BaseBranch 2>&1
            if ($LASTEXITCODE -ne 0) {
                throw "Base branch '$BaseBranch' not found"
            }
        }
        $baseOid = $baseOid.Trim()
        
        # Create linked branch using GitHub API
        $mutation = @"
mutation(`$issueId: ID!, `$oid: GitObjectID!, `$name: String!) {
  createLinkedBranch(input: {issueId: `$issueId, oid: `$oid, name: `$name}) {
    linkedBranch {
      ref {
        name
      }
    }
  }
}
"@
        
        $result = gh api graphql -f query=$mutation -f issueId=$issueId -f oid=$baseOid -f name=$BranchName 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            $json = $result | ConvertFrom-Json
            if ($json.data.createLinkedBranch.linkedBranch) {
                Write-Host "  ✅ Created linked branch: $BranchName" -ForegroundColor Green
                return $true
            }
        }
        
        # Fallback: create branch manually
        Write-Host "  ⚠️  API creation failed, creating branch manually..." -ForegroundColor Yellow
        git fetch origin $BaseBranch 2>&1 | Out-Null
        git checkout -b $BranchName "origin/$BaseBranch" 2>&1 | Out-Null
        git push -u origin $BranchName 2>&1 | Out-Null
        
        Write-Host "  ✅ Created branch: $BranchName" -ForegroundColor Green
        return $true
        
    } catch {
        Write-Error "Failed to create branch: $($_.Exception.Message)"
        return $false
    }
}

function Test-BranchesHaveCommits {
    param(
        [string]$BaseBranch,
        [string]$HeadBranch
    )
    
    try {
        # Fetch latest refs to ensure we have up-to-date branch info
        git fetch origin $BaseBranch $HeadBranch 2>&1 | Out-Null
        
        # Check if base branch exists locally, if not use origin/base
        git rev-parse --verify $BaseBranch 2>&1 | Out-Null
        $baseRef = if ($LASTEXITCODE -eq 0) { $BaseBranch } else { "origin/$BaseBranch" }
        
        # Check if head branch exists locally
        git rev-parse --verify $HeadBranch 2>&1 | Out-Null
        $headExistsLocally = $LASTEXITCODE -eq 0
        
        # First, try local head vs base (local or remote) - most common scenario
        if ($headExistsLocally) {
            $localCommits = git rev-list --count "$baseRef..$HeadBranch" 2>&1
            if ($LASTEXITCODE -eq 0) {
                $localCount = [int]$localCommits.Trim()
                if ($localCount -gt 0) {
                    Write-Host "    Found $localCount commit(s) locally" -ForegroundColor Gray
                    return $true
                }
            }
        }
        
        # Check remote branches
        $remoteCommits = git rev-list --count "origin/$BaseBranch..origin/$HeadBranch" 2>&1
        if ($LASTEXITCODE -eq 0) {
            $remoteCount = [int]$remoteCommits.Trim()
            if ($remoteCount -gt 0) {
                Write-Host "    Found $remoteCount commit(s) on remote" -ForegroundColor Gray
                return $true
            }
        }
        
        # Try local head vs remote base (fallback)
        if ($headExistsLocally) {
            $mixedCommits = git rev-list --count "origin/$BaseBranch..$HeadBranch" 2>&1
            if ($LASTEXITCODE -eq 0) {
                $mixedCount = [int]$mixedCommits.Trim()
                if ($mixedCount -gt 0) {
                    Write-Host "    Found $mixedCount commit(s) (local head vs remote base)" -ForegroundColor Gray
                    return $true
                }
            }
        }
        
        # No commits found in any scenario
        return $false
    } catch {
        Write-Warning "Error checking commits between branches: $($_.Exception.Message)"
        return $false
    }
}

function Analyze-PRForProjectFields {
    param(
        [int]$PRNumber,
        [object]$Issue
    )
    
    # Default values
    $priority = "P1"
    $size = "M"
    $status = "In review"
    
    try {
        # Get PR details
        $prData = gh pr view $PRNumber --json additions,deletions,files,changedFiles 2>&1 | ConvertFrom-Json
        
        # Analyze based on changes
        $totalChanges = $prData.additions + $prData.deletions
        $fileCount = $prData.changedFiles
        
        # Determine Size based on changes
        if ($totalChanges -lt 50) {
            $size = "XS"
        } elseif ($totalChanges -lt 200) {
            $size = "S"
        } elseif ($totalChanges -lt 500) {
            $size = "M"
        } elseif ($totalChanges -lt 1000) {
            $size = "L"
        } else {
            $size = "XL"
        }
        
        # Adjust based on file count
        if ($fileCount -gt 20) {
            if ($size -eq "XS") { $size = "S" }
            elseif ($size -eq "S") { $size = "M" }
            elseif ($size -eq "M") { $size = "L" }
        }
        
        # Priority: Use issue priority if available, otherwise default to P1
        if ($Issue -and $Issue.labels) {
            foreach ($label in $Issue.labels) {
                if ($label.name -match 'priority[:\-]?(p0|p1|p2|p3)') {
                    $priority = $Matches[1].ToUpper()
                    break
                }
            }
        }
        
    } catch {
        Write-Warning "Could not analyze PR for project fields: $($_.Exception.Message)"
    }
    
    return @{
        Priority = $priority
        Size = $size
        Status = $status
    }
}

function Get-PRProjectItemId {
    param(
        [int]$PRNumber,
        [string]$ProjectId
    )
    
    try {
        $prId = gh pr view $PRNumber --json id -q .id
        if (-not $prId) {
            return $null
        }
        
        $query = @"
query(`$prId: ID!) {
  node(id: `$prId) {
    ... on PullRequest {
      projectItems(first: 10) {
        nodes {
          id
          project {
            id
          }
        }
      }
    }
  }
}
"@
        
        $response = gh api graphql -f query=$query -f prId=$prId 2>&1 | ConvertFrom-Json
        
        if ($response.data.node.projectItems.nodes) {
            $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $ProjectId } | Select-Object -First 1
            if ($projectItem) {
                return $projectItem.id
            }
        }
        
        return $null
    } catch {
        Write-Warning "Could not get PR project item ID: $($_.Exception.Message)"
        return $null
    }
}

function Set-PRProjectFields {
    param(
        [string]$ProjectItemId,
        [string]$ProjectId,
        [string]$ProjectKey,
        [hashtable]$Fields
    )
    
    $successCount = 0
    
    # Set Status
    if ($Fields.Status) {
        $statusFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Status"
        $statusOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Status" -OptionName $Fields.Status
        if ($statusFieldId -and $statusOptionId) {
            $result = gh project item-edit --id $ProjectItemId --field-id $statusFieldId --project-id $ProjectId --single-select-option-id $statusOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set Status to '$($Fields.Status)'" -ForegroundColor Green
                $successCount++
            } else {
                Write-Warning "Failed to set Status: $result"
            }
        }
    }
    
    # Set Priority
    if ($Fields.Priority) {
        $priorityFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Priority"
        $priorityOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Priority" -OptionName $Fields.Priority
        if ($priorityFieldId -and $priorityOptionId) {
            $result = gh project item-edit --id $ProjectItemId --field-id $priorityFieldId --project-id $ProjectId --single-select-option-id $priorityOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set Priority to '$($Fields.Priority)'" -ForegroundColor Green
                $successCount++
            } else {
                Write-Warning "Failed to set Priority: $result"
            }
        }
    }
    
    # Set Size
    if ($Fields.Size) {
        $sizeFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Size"
        $sizeOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Size" -OptionName $Fields.Size
        if ($sizeFieldId -and $sizeOptionId) {
            $result = gh project item-edit --id $ProjectItemId --field-id $sizeFieldId --project-id $ProjectId --single-select-option-id $sizeOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set Size to '$($Fields.Size)'" -ForegroundColor Green
                $successCount++
            } else {
                Write-Warning "Failed to set Size: $result"
            }
        }
    }
    
    return $successCount
}

function Add-PRToProject {
    param(
        [string]$PRUrl,
        [string]$ProjectKey,
        [int]$PRNumber,
        [object]$Issue
    )
    
    try {
        $config = Get-ProjectConfig
        if (-not $config) {
            Write-Warning "Project config not available, skipping project assignment"
            return $false
        }
        
        $projectConfig = Get-ProjectById -ProjectKey $ProjectKey
        if (-not $projectConfig) {
            Write-Warning "Project '$ProjectKey' not found"
            return $false
        }
        
        $orgName = $config.organization
        $projectNumber = $projectConfig.projectNumber
        $projectId = $projectConfig.projectId
        
        # Add PR to project
        Write-Host "  Adding PR to project..." -ForegroundColor Gray
        
        # GitHub CLI uses --owner for both organization and user projects
        # For user projects, --owner should be the username
        # For organization projects, --owner should be the org name
        $result = gh project item-add $projectNumber --owner $orgName --url $PRUrl 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "Failed to add PR to project: $result"
            return $false
        }
        
        Write-Host "  ✅ Added PR to project #$projectNumber" -ForegroundColor Green
        
        # Wait a moment for the item to be added
        Start-Sleep -Seconds 2
        
        # Get project item ID
        $projectItemId = Get-PRProjectItemId -PRNumber $PRNumber -ProjectId $projectId
        
        if (-not $projectItemId) {
            Write-Warning "Could not get project item ID for PR, fields may not be set"
            return $true  # PR was added, just couldn't configure fields
        }
        
        # Analyze PR to determine project fields
        Write-Host "  Analyzing PR for project fields..." -ForegroundColor Gray
        $fields = Analyze-PRForProjectFields -PRNumber $PRNumber -Issue $Issue
        
        # Set project fields
        Write-Host "  Configuring project fields..." -ForegroundColor Gray
        $setCount = Set-PRProjectFields -ProjectItemId $projectItemId -ProjectId $projectId -ProjectKey $ProjectKey -Fields $fields
        
        if ($setCount -gt 0) {
            Write-Host "  ✅ Configured $setCount project field(s)" -ForegroundColor Green
        }
        
        return $true
    } catch {
        Write-Warning "Could not add PR to project: $($_.Exception.Message)"
        return $false
    }
}

function Get-DCOSignOff {
    param([int]$IssueNumber)
    
    $signOff = @"

---

### Sign-off

- [x] I have read the [Contributing Guide](https://github.com/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/blob/main/CONTRIBUTING.md)
- [x] This PR addresses issue #${IssueNumber}
- [x] My changes follow the project's code style guidelines
- [x] I have tested my changes locally
- [x] All checks pass

**Developer Certificate of Origin (DCO)**
By submitting this PR, I certify that:
- The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file
- The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications
- The contribution was provided directly to me by some other person who certified the above
"@
    
    return $signOff
}

# Main execution
Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "   Automated PR Creation from Issue" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

Ensure-GhCli

# Get issue data
Write-Host "Step 1: Fetching issue data..." -ForegroundColor Yellow
$issue = Get-IssueData -IssueNumber $IssueNumber

# Handle case where issue data might be incomplete
if (-not $issue.title) {
    # Try to get title from branch name or use fallback
    if ($HeadBranch) {
        $issue.title = $HeadBranch -replace '^[^/]+/\d+-', '' -replace '-', ' '
        $issue.title = (Get-Culture).TextInfo.ToTitleCase($issue.title)
    } else {
        $issue.title = "PR for issue #${IssueNumber}"
    }
}

if (-not $issue.body) {
    $issue.body = "This PR addresses issue #${IssueNumber}"
}

Write-Host "  Issue #${IssueNumber}: $($issue.title)" -ForegroundColor Cyan
if ($issue.url) {
    Write-Host "  URL: $($issue.url)" -ForegroundColor Gray
}

# Determine head branch
Write-Host ""
Write-Host "Step 2: Determining branch..." -ForegroundColor Yellow
if ($HeadBranch) {
    Write-Host "  Using specified branch: $HeadBranch" -ForegroundColor Cyan
    $headBranch = $HeadBranch
} else {
    $headBranch = Find-BranchForIssue -IssueNumber $IssueNumber -IssueTitle $issue.title
    
    # Validate branch name is not empty
    if ([string]::IsNullOrWhiteSpace($headBranch)) {
        # Fallback: generate a simple branch name
        $headBranch = "feature/$IssueNumber-issue"
        Write-Host "  ⚠️  Generated fallback branch name: $headBranch" -ForegroundColor Yellow
    }
    
    # Check if branch exists, create if needed
    $exists = git ls-remote --heads origin $headBranch 2>&1
    if (-not ($exists -match 'refs/heads')) {
        Write-Host "  Creating branch: $headBranch" -ForegroundColor Yellow
        if (-not $DryRun) {
            if (-not (Create-BranchForIssue -IssueNumber $IssueNumber -BranchName $headBranch -BaseBranch $BaseBranch)) {
                throw "Failed to create branch"
            }
        } else {
            Write-Host "  [DRY RUN] Would create branch: $headBranch" -ForegroundColor Magenta
        }
    }
}

# Determine assignee
Write-Host ""
Write-Host "Step 3: Determining assignee..." -ForegroundColor Yellow
if ($Assignee) {
    $prAssignee = $Assignee
    Write-Host "  Using specified assignee: $prAssignee" -ForegroundColor Cyan
} elseif ($issue.assignees -and $issue.assignees.Count -gt 0) {
    $prAssignee = $issue.assignees[0].login
    Write-Host "  Using issue assignee: $prAssignee" -ForegroundColor Cyan
} else {
    $config = Get-ProjectConfig
    if ($config -and $config.defaultAssignee) {
        $prAssignee = $config.defaultAssignee
        Write-Host "  Using default assignee: $prAssignee" -ForegroundColor Cyan
    } else {
        $prAssignee = ""
        Write-Host "  No assignee specified" -ForegroundColor Gray
    }
}

# Determine labels
Write-Host ""
Write-Host "Step 4: Determining labels..." -ForegroundColor Yellow
$prLabels = @()
if ($Labels.Count -gt 0) {
    $prLabels = $Labels
    Write-Host "  Using specified labels: $($prLabels -join ', ')" -ForegroundColor Cyan
} elseif ($issue.labels -and $issue.labels.Count -gt 0) {
    $prLabels = $issue.labels.name
    Write-Host "  Using issue labels: $($prLabels -join ', ')" -ForegroundColor Cyan
} else {
    $prLabels = @("ready-to-review")
    Write-Host "  Using default label: ready-to-review" -ForegroundColor Cyan
}

# Build PR body
Write-Host ""
Write-Host "Step 5: Building PR description..." -ForegroundColor Yellow
$prBody = "Closes #${IssueNumber}`n`n$($issue.body)"

if ($SignOff) {
    $prBody += Get-DCOSignOff -IssueNumber $IssueNumber
}

# Check if PR already exists for this issue
Write-Host ""
Write-Host "Step 6: Checking for existing PRs..." -ForegroundColor Yellow
$existingPRs = gh pr list --head $headBranch --state all --json number,title,url 2>&1 | ConvertFrom-Json

if ($existingPRs -and $existingPRs.Count -gt 0) {
    $existingPR = $existingPRs[0]
    Write-Host "  ⚠️  PR already exists for this branch: PR #$($existingPR.number)" -ForegroundColor Yellow
    Write-Host "  URL: $($existingPR.url)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Using existing PR #$($existingPR.number)" -ForegroundColor Green
    Write-Host ""
    exit 0
}

# Also check by issue reference
$prsForIssue = gh pr list --search "is:pr $IssueNumber" --state all --json number,title,url 2>&1 | ConvertFrom-Json
if ($prsForIssue -and $prsForIssue.Count -gt 0) {
    $existingPR = $prsForIssue[0]
    Write-Host "  ⚠️  PR already exists for issue #${IssueNumber}: PR #$($existingPR.number)" -ForegroundColor Yellow
    Write-Host "  URL: $($existingPR.url)" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "✅ Using existing PR #$($existingPR.number)" -ForegroundColor Green
    Write-Host ""
    exit 0
}

Write-Host "  ✓ No existing PR found, proceeding with creation" -ForegroundColor Green

# Create PR
Write-Host ""
Write-Host "Step 7: Creating pull request..." -ForegroundColor Yellow
Write-Host "  Base: $BaseBranch" -ForegroundColor Cyan
Write-Host "  Head: $headBranch" -ForegroundColor Cyan
Write-Host "  Title: $($issue.title)" -ForegroundColor Cyan

# Check if there are commits between branches before creating PR
Write-Host "  Checking for commits between branches..." -ForegroundColor Gray
$hasCommits = Test-BranchesHaveCommits -BaseBranch $BaseBranch -HeadBranch $headBranch

# Check if commits exist locally but not on remote, and offer to push
if ($hasCommits) {
    $localCommits = git rev-list --count "$BaseBranch..$headBranch" 2>&1
    $localSuccess = $LASTEXITCODE -eq 0
    
    if ($localSuccess) {
        $localCount = [int]$localCommits.Trim()
        
        # Check remote commits
        $remoteCommits = git rev-list --count "origin/$BaseBranch..origin/$headBranch" 2>&1
        $remoteSuccess = $LASTEXITCODE -eq 0
        $remoteCount = if ($remoteSuccess) { [int]$remoteCommits.Trim() } else { 0 }
        
        if ($localCount -gt $remoteCount) {
            $unpushedCount = $localCount - $remoteCount
            Write-Host "  ⚠️  Found $unpushedCount unpushed commit(s) on local branch" -ForegroundColor Yellow
            Write-Host "  Pushing commits to remote..." -ForegroundColor Gray
            git push origin $headBranch 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Successfully pushed commits" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Could not push commits automatically. Please push manually: git push origin $headBranch" -ForegroundColor Yellow
            }
        }
    }
}

if (-not $hasCommits) {
    Write-Host "" -ForegroundColor Red
    Write-Host "  ❌ Cannot create PR: No commits found between $BaseBranch and $headBranch" -ForegroundColor Red
    Write-Host "" -ForegroundColor Yellow
    Write-Host "  The branch '$headBranch' exists but has no commits that differ from '$BaseBranch'." -ForegroundColor Yellow
    Write-Host "  To create a PR, you need to:" -ForegroundColor Yellow
    Write-Host "    1. Checkout the branch: git checkout $headBranch" -ForegroundColor Gray
    Write-Host "    2. Make your changes and commit them" -ForegroundColor Gray
    Write-Host "    3. Push the changes: git push origin $headBranch" -ForegroundColor Gray
    Write-Host "    4. Then run this script again" -ForegroundColor Gray
    Write-Host "" -ForegroundColor Yellow
    Write-Host "===============================================" -ForegroundColor Blue
    Write-Host "  PR Creation Stopped" -ForegroundColor Blue
    Write-Host "===============================================" -ForegroundColor Blue
    Write-Host ""
    exit 1
}

Write-Host "  ✓ Found commits between branches" -ForegroundColor Green

if ($DryRun) {
    Write-Host ""
    Write-Host "  [DRY RUN] Would execute:" -ForegroundColor Magenta
    Write-Host "    gh pr create --base $BaseBranch --head $headBranch --title `"$($issue.title)`" --body `"...`"" -ForegroundColor Gray
    if ($prAssignee) {
        Write-Host "    --assignee $prAssignee" -ForegroundColor Gray
    }
    if ($prLabels.Count -gt 0) {
        Write-Host "    --label $($prLabels -join ',')" -ForegroundColor Gray
    }
    Write-Host ""
    Write-Host "✅ [DRY RUN] PR creation preview complete" -ForegroundColor Green
    exit 0
}

# Build gh pr create command
# Use --body-file to handle multi-line body content properly
$tempBodyFile = [System.IO.Path]::GetTempFileName()
try {
    $prBody | Out-File -FilePath $tempBodyFile -Encoding utf8 -NoNewline
    
    $createArgs = @(
        "pr", "create",
        "--base", $BaseBranch,
        "--head", $headBranch,
        "--title", $issue.title,
        "--body-file", $tempBodyFile
    )
    
    $prResult = gh @createArgs 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        $errorMessage = $prResult -join "`n"
        
        # Check for specific error cases
        if ($errorMessage -match "No commits between") {
            Write-Host "" -ForegroundColor Red
            Write-Host "  ❌ Cannot create PR: No commits between $BaseBranch and $headBranch" -ForegroundColor Red
            Write-Host "" -ForegroundColor Yellow
            Write-Host "  The branch '$headBranch' has no commits that differ from '$BaseBranch'." -ForegroundColor Yellow
            Write-Host "  To create a PR, you need to:" -ForegroundColor Yellow
            Write-Host "    1. Checkout the branch: git checkout $headBranch" -ForegroundColor Gray
            Write-Host "    2. Make your changes and commit them" -ForegroundColor Gray
            Write-Host "    3. Push the changes: git push origin $headBranch" -ForegroundColor Gray
            Write-Host "    4. Then run this script again" -ForegroundColor Gray
            Write-Host "" -ForegroundColor Yellow
            Write-Host "===============================================" -ForegroundColor Blue
            Write-Host "  PR Creation Stopped" -ForegroundColor Blue
            Write-Host "===============================================" -ForegroundColor Blue
            Write-Host ""
            exit 1
        }
        
        throw "Failed to create PR: $errorMessage"
    }
    
    # Extract PR number and URL first
    $prUrl = $prResult | Select-String -Pattern 'https://github\.com/[^/]+/[^/]+/pull/\d+' | ForEach-Object { $_.Matches[0].Value }
    $prNumber = $prUrl -replace '.*/pull/(\d+).*', '$1'
    
    # Add labels separately (in case some don't exist, we can continue)
    if ($prLabels.Count -gt 0) {
        foreach ($label in $prLabels) {
            $labelResult = gh pr edit $prNumber --add-label $label 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Added label: $label" -ForegroundColor Green
            } else {
                Write-Warning "Could not add label '$label': $labelResult"
            }
        }
    }
    
    # Add assignee separately if needed
    if ($prAssignee) {
        $assigneeResult = gh pr edit $prNumber --add-assignee $prAssignee 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Added assignee: $prAssignee" -ForegroundColor Green
        } else {
            Write-Warning "Could not add assignee '$prAssignee': $assigneeResult"
        }
    }
} finally {
    # Clean up temp file
    if (Test-Path $tempBodyFile) {
        Remove-Item $tempBodyFile -Force -ErrorAction SilentlyContinue
    }
}

# Extract PR number and URL
$prUrl = $prResult | Select-String -Pattern 'https://github\.com/[^/]+/[^/]+/pull/\d+' | ForEach-Object { $_.Matches[0].Value }
$prNumber = $prUrl -replace '.*/pull/(\d+).*', '$1'

Write-Host "  ✅ PR #${prNumber} created: $prUrl" -ForegroundColor Green

# Update issue status to "In review" (work complete, PR being reviewed)
Write-Host ""
Write-Host "Step 8: Updating issue status..." -ForegroundColor Yellow
try {
    $config = Get-ProjectConfig
    if ($config -and $config.defaultProject) {
        $projectKey = $config.defaultProject
        $updated = Update-IssueStatus -IssueNumber $IssueNumber -NewStatus "In review" -ProjectKey $projectKey -Silent
        if ($updated) {
            Write-Host "  ✅ Updated issue #${IssueNumber} status to 'In review'" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Could not update issue status (issue may not be in project)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️  Project config not available, skipping issue status update" -ForegroundColor Yellow
    }
} catch {
    Write-Warning "Could not update issue status: $($_.Exception.Message)"
}

# Add to project
if ($Project -or (Get-ProjectConfig)) {
    Write-Host ""
    Write-Host "Step 9: Adding PR to project..." -ForegroundColor Yellow
    
    $projectKey = if ($Project) { $Project } else {
        $config = Get-ProjectConfig
        if ($config -and $config.defaultProject) {
            $config.defaultProject
        } else {
            ""
        }
    }
    
    if ($projectKey) {
        Add-PRToProject -PRUrl $prUrl -ProjectKey $projectKey -PRNumber $prNumber -Issue $issue
    } else {
        Write-Host "  ⚠️  No project specified, skipping" -ForegroundColor Yellow
    }
}

# Summary
Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "              Summary" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "  PR #${prNumber}: $($issue.title)" -ForegroundColor Cyan
Write-Host "  URL: $prUrl" -ForegroundColor Cyan
Write-Host "  Base: $BaseBranch" -ForegroundColor Cyan
Write-Host "  Head: $headBranch" -ForegroundColor Cyan
if ($prAssignee) {
    Write-Host "  Assignee: $prAssignee" -ForegroundColor Cyan
}
if ($prLabels.Count -gt 0) {
    Write-Host "  Labels: $($prLabels -join ', ')" -ForegroundColor Cyan
}
if ($SignOff) {
    Write-Host "  DCO Sign-off: ✅ Included" -ForegroundColor Green
}
Write-Host ""
Write-Host "✅ PR creation complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review the PR at: $prUrl" -ForegroundColor Gray
Write-Host "  2. Run automation: .\scripts\pr-management\pr-automation-unified.ps1 -PRNumber $prNumber -Action all" -ForegroundColor Gray
Write-Host ""

