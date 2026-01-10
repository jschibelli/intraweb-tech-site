#!/usr/bin/env pwsh
# Enhanced Issue Creation with Automatic Branch Creation
# Creates GitHub issues and automatically generates corresponding feature branches
# Automatically sets issue type and configures project fields

param(
    [Parameter(Mandatory=$true)]
    [string]$Title,
    
    [Parameter(Mandatory=$true)]
    [string]$Body,
    
    [string]$Labels = "",
    [string]$Milestone = "",
    [string]$Project = "",  # Project key/name or number - uses default from config if not specified
    [string]$Assignee = "",
    [string]$BaseBranch = "develop",
    
    # Issue Type (Feature, Bug, Task)
    [ValidateSet("Feature", "Bug", "Task", "")]
    [string]$IssueType = "",
    
    # Project Field Configuration (uses defaults from config if not specified)
    [ValidateSet("P0", "P1", "P2", "")]
    [string]$Priority = "",
    
    [ValidateSet("XS", "S", "M", "L", "XL", "")]
    [string]$Size = "",
    
    [ValidateSet("Backlog", "Ready", "In progress", "In review", "Done", "")]
    [string]$Status = "",
    
    [int]$Estimate = 0,  # Estimate in days (0 = use default from config)
    
    [switch]$CreateBranch = $true,
    [switch]$PushBranch = $true,
    [switch]$ConfigureProjectFields = $true,
    [switch]$DryRun
)

# Load project configuration helper module
$configHelperPath = Join-Path $PSScriptRoot "..\configuration\project-config.ps1"
if (Test-Path $configHelperPath) {
    . $configHelperPath
} else {
    Write-Host "❌ Configuration helper module not found: $configHelperPath" -ForegroundColor Red
    exit 1
}

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "   Enhanced Issue Creation with Auto Branch" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

# Require project configuration
$config = Require-ProjectConfig
if (-not $config) {
    exit 1
}

# Determine project to use
$projectConfig = $null
$projectKey = $null
$projectNumber = $null

if ($Project) {
    # Try to find project by key or number
    $projectConfig = Get-ProjectById -ProjectKey $Project
    if ($projectConfig) {
        $projectKey = $Project
        $projectNumber = $projectConfig.projectNumber
    } else {
        Write-Host "⚠️  Project '$Project' not found in configuration" -ForegroundColor Yellow
        Write-Host "   Available projects:" -ForegroundColor Gray
        foreach ($key in $config.projects.PSObject.Properties.Name) {
            Write-Host "     - $key (Project #$($config.projects.$key.projectNumber))" -ForegroundColor Gray
        }
        exit 1
    }
} else {
    # Use default project
    $defaultProjectKey = $config.defaultProject
    if ($defaultProjectKey) {
        $projectConfig = Get-ProjectById -ProjectKey $defaultProjectKey
        if ($projectConfig) {
            $projectKey = $defaultProjectKey
            $projectNumber = $projectConfig.projectNumber
            Write-Host "Using default project: $projectKey (Project #$projectNumber)" -ForegroundColor Gray
        }
    }
}

if (-not $projectConfig) {
    Write-Host "❌ No project configured. Please run setup script:" -ForegroundColor Red
    Write-Host "   .\scripts\configuration\setup-project.ps1" -ForegroundColor Cyan
    exit 1
}

# Get defaults from config
$defaults = Get-ProjectDefaults -ProjectKey $projectKey

# Function to automatically detect issue type from content
function Detect-IssueType {
    param(
        [string]$Title,
        [string]$Body,
        [string]$Labels
    )
    
    $titleLower = $Title.ToLower()
    $bodyLower = $Body.ToLower()
    $labelsLower = if ($Labels) { $Labels.ToLower() } else { "" }
    $combinedText = "$titleLower $bodyLower $labelsLower"
    
    # Bug indicators (highest priority - bugs are usually urgent)
    $bugKeywords = @(
        "bug", "fix", "broken", "error", "crash", "fails", "doesn't work", "not working",
        "issue", "problem", "defect", "regression", "broken", "malfunction", "glitch",
        "fixes", "fixed", "resolve", "resolution", "patch", "hotfix"
    )
    
    # Task indicators
    $taskKeywords = @(
        "task", "chore", "maintenance", "refactor", "cleanup", "update", "upgrade",
        "migrate", "documentation", "docs", "readme", "comment", "format", "lint",
        "config", "setup", "improve", "optimize", "review", "audit", "test"
    )
    
    # Feature indicators
    $featureKeywords = @(
        "feature", "add", "new", "implement", "create", "build", "enhancement",
        "enhance", "improve", "introduce", "support", "enable", "allow", "provide",
        "functionality", "capability", "ability"
    )
    
    # Check labels first (most reliable)
    $bugScore = 0
    $taskScore = 0
    $featureScore = 0
    
    if ($Labels) {
        $labelArray = $Labels -split "," | ForEach-Object { $_.Trim().ToLower() }
        foreach ($label in $labelArray) {
            if ($label -match "bug|fix|defect|error") { $bugScore += 3 }
            if ($label -match "task|chore|maintenance|refactor") { $taskScore += 3 }
            if ($label -match "feature|enhancement|new") { $featureScore += 3 }
        }
    }
    
    # Check title and body for keywords
    foreach ($keyword in $bugKeywords) {
        if ($combinedText -match "\b$keyword\b") {
            $bugScore += 2
        }
    }
    
    foreach ($keyword in $taskKeywords) {
        if ($combinedText -match "\b$keyword\b") {
            $taskScore += 2
        }
    }
    
    foreach ($keyword in $featureKeywords) {
        if ($combinedText -match "\b$keyword\b") {
            $featureScore += 2
        }
    }
    
    # Special patterns
    if ($titleLower -match "^(fix|bug|hotfix):") { $bugScore += 5 }
    if ($titleLower -match "^(feat|feature|add):") { $featureScore += 5 }
    if ($titleLower -match "^(chore|task|refactor):") { $taskScore += 5 }
    
    # Determine type based on scores
    if ($bugScore -gt $taskScore -and $bugScore -gt $featureScore) {
        return "Bug"
    } elseif ($taskScore -gt $featureScore) {
        return "Task"
    } else {
        return "Feature"  # Default to Feature
    }
}

# Apply defaults if not specified
if (-not $IssueType) { 
    Write-Host "Auto-detecting issue type from content..." -ForegroundColor Gray
    $IssueType = Detect-IssueType -Title $Title -Body $Body -Labels $Labels
    Write-Host "  Detected issue type: $IssueType" -ForegroundColor Cyan
} else {
    Write-Host "Using specified issue type: $IssueType" -ForegroundColor Cyan
}
if (-not $Priority) { $Priority = $defaults.Priority }
if (-not $Status) { 
    # If assignee is provided, set status to "Ready" (assigned, ready to start)
    # Otherwise use default from config (typically "Backlog")
    if ($Assignee) {
        $Status = "Ready"
    } else {
        $Status = $defaults.Status
    }
}
if (-not $Size) { $Size = $defaults.Size }
if ($Estimate -eq 0) { $Estimate = $defaults.Estimate }

# Function to generate branch name from issue title and type
function Get-BranchNameFromTitle {
    param([string]$IssueTitle, [int]$IssueNumber, [string]$IssueType = "Feature")
    
    # Map issue type to standard branch prefix convention
    $branchPrefix = switch ($IssueType.ToLower()) {
        "bug" { "bugfix" }
        "task" { "chore" }
        "feature" { "feature" }
        default { "feature" }
    }
    
    # Convert title to lowercase and replace spaces/special chars with hyphens
    $slug = $IssueTitle.ToLower() `
        -replace '[^\w\s-]', '' `
        -replace '\s+', '-' `
        -replace '-+', '-' `
        -replace '^-|-$', ''
    
    # Truncate if too long (max 50 chars after issue number)
    if ($slug.Length > 50) {
        $slug = $slug.Substring(0, 50).TrimEnd('-')
    }
    
    # Follow standard convention: {type}/{issue-number}-{title-slug}
    return "$branchPrefix/$IssueNumber-$slug"
}

# Step 1: Create the GitHub issue
Write-Host "Step 1: Creating GitHub issue..." -ForegroundColor Yellow
Write-Host "  Title: $Title" -ForegroundColor Cyan

if ($DryRun) {
    Write-Host "  [DRY RUN] Would create issue with title: $Title" -ForegroundColor Magenta
    $issueNumber = 999
} else {
    # Build the gh issue create command
    $createCmd = "gh issue create --title `"$Title`" --body `"$Body`""
    
    if ($Labels) {
        $createCmd += " --label `"$Labels`""
    }
    
    if ($Milestone) {
        $createCmd += " --milestone `"$Milestone`""
    }
    
    if ($Assignee) {
        $createCmd += " --assignee `"$Assignee`""
    }
    
    Write-Host "  Executing: $createCmd" -ForegroundColor Gray
    
    try {
        $issueUrl = Invoke-Expression $createCmd
        
        # Extract issue number from URL
        if ($issueUrl -match '/issues/(\d+)') {
            $issueNumber = [int]$Matches[1]
            Write-Host "  ✅ Issue #$issueNumber created: $issueUrl" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Failed to extract issue number from: $issueUrl" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "  ❌ Failed to create issue: $_" -ForegroundColor Red
        exit 1
    }
}

# Step 2: Set Issue Type (if specified)
if ($IssueType -and -not $DryRun) {
    Write-Host ""
    Write-Host "Step 2: Setting issue type..." -ForegroundColor Yellow
    
    $issueTypeId = Get-IssueTypeId -IssueTypeName $IssueType
    if ($issueTypeId) {
        try {
            $issueId = gh issue view $issueNumber --json id -q .id
            gh api graphql -f query='mutation($issueId: ID!, $issueTypeId: ID!) { updateIssue(input: {id: $issueId, issueTypeId: $issueTypeId}) { issue { id issueType { id name } } } }' -f issueId=$issueId -f issueTypeId=$issueTypeId 2>&1 | Out-Null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set issue type to '$IssueType'" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Failed to set issue type" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ⚠️  Failed to set issue type: $_" -ForegroundColor Yellow
        }
    } else {
        Write-Host "  ⚠️  Issue type '$IssueType' not found in configuration" -ForegroundColor Yellow
    }
}

# Step 3: Add issue to project
if ($projectConfig -and -not $DryRun) {
    Write-Host ""
    Write-Host "Step 3: Adding issue to project..." -ForegroundColor Yellow
    
    try {
        $repoOwner = gh repo view --json owner -q .owner.login
        $repoName = gh repo view --json name -q .name
        $issueUrl = "https://github.com/$repoOwner/$repoName/issues/$issueNumber"
        
        # Use organization from config
        $orgName = $config.organization
        gh project item-add $projectNumber --owner $orgName --url $issueUrl 2>&1 | Out-Null
        
        Write-Host "  ✅ Added to project #$projectNumber ($projectKey)" -ForegroundColor Green
        
        # Configure project fields
        if ($ConfigureProjectFields) {
            Write-Host ""
            Write-Host "Step 3a: Configuring project fields..." -ForegroundColor Yellow
            
            try {
                $currentIssueId = gh issue view $issueNumber --json id -q .id
                $projectItemId = (gh api graphql -f query='query($issueId: ID!) { node(id: $issueId) { ... on Issue { projectItems(first: 10) { nodes { id } } } } }' -f issueId=$currentIssueId | ConvertFrom-Json).data.node.projectItems.nodes[0].id
                
                if ($projectItemId) {
                    $projectId = $projectConfig.projectId
                    
                    # Set Status
                    if ($Status) {
                        $statusFieldId = Get-ProjectFieldId -ProjectKey $projectKey -FieldName "Status"
                        $statusOptionId = Get-ProjectOptionId -ProjectKey $projectKey -FieldName "Status" -OptionName $Status
                        if ($statusFieldId -and $statusOptionId) {
                            gh project item-edit --id $projectItemId --field-id $statusFieldId --project-id $projectId --single-select-option-id $statusOptionId 2>&1 | Out-Null
                            Write-Host "  ✅ Set Status to '$Status'" -ForegroundColor Green
                        }
                    }
                    
                    # Set Priority
                    if ($Priority) {
                        $priorityFieldId = Get-ProjectFieldId -ProjectKey $projectKey -FieldName "Priority"
                        $priorityOptionId = Get-ProjectOptionId -ProjectKey $projectKey -FieldName "Priority" -OptionName $Priority
                        if ($priorityFieldId -and $priorityOptionId) {
                            gh project item-edit --id $projectItemId --field-id $priorityFieldId --project-id $projectId --single-select-option-id $priorityOptionId 2>&1 | Out-Null
                            Write-Host "  ✅ Set Priority to '$Priority'" -ForegroundColor Green
                        }
                    }
                    
                    # Set Size
                    if ($Size) {
                        $sizeFieldId = Get-ProjectFieldId -ProjectKey $projectKey -FieldName "Size"
                        $sizeOptionId = Get-ProjectOptionId -ProjectKey $projectKey -FieldName "Size" -OptionName $Size
                        if ($sizeFieldId -and $sizeOptionId) {
                            gh project item-edit --id $projectItemId --field-id $sizeFieldId --project-id $projectId --single-select-option-id $sizeOptionId 2>&1 | Out-Null
                            Write-Host "  ✅ Set Size to '$Size'" -ForegroundColor Green
                        }
                    }
                    
                    # Set Estimate
                    if ($Estimate -gt 0) {
                        $estimateFieldId = Get-ProjectFieldId -ProjectKey $projectKey -FieldName "Estimate"
                        if ($estimateFieldId) {
                            gh project item-edit --id $projectItemId --field-id $estimateFieldId --project-id $projectId --number $Estimate 2>&1 | Out-Null
                            Write-Host "  ✅ Set Estimate to $Estimate days" -ForegroundColor Green
                        }
                    }
                }
            } catch {
                Write-Host "  ⚠️  Failed to configure project fields: $_" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "  ⚠️  Failed to add to project: $_" -ForegroundColor Yellow
    }
}

# Function to create a linked branch using GitHub's createLinkedBranch mutation
function Create-LinkedBranchForIssue {
    param(
        [int]$IssueNumber,
        [string]$BranchName,
        [string]$BaseBranch = "develop"
    )
    
    try {
        # Get issue ID
        $issueId = gh issue view $IssueNumber --json id -q .id
        if (-not $issueId) {
            return $false
        }
        
        # Get the OID of the base branch (where the new branch will start from)
        $baseOid = git rev-parse "origin/$BaseBranch" 2>&1
        if ($LASTEXITCODE -ne 0) {
            $baseOid = git rev-parse $BaseBranch 2>&1
            if ($LASTEXITCODE -ne 0) {
                return $false
            }
        }
        $baseOid = $baseOid.Trim()
        
        # Use createLinkedBranch to create a new branch linked to the issue
        # This creates the branch AND links it in one operation
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
        $json = $result | ConvertFrom-Json
        
        if ($json.data.createLinkedBranch.linkedBranch) {
            $createdName = $json.data.createLinkedBranch.linkedBranch.ref.name
            if ($createdName -eq $BranchName) {
                return $true
            } else {
                # Branch was created but with a different name (branch already existed)
                return $false
            }
        }
        
        return $false
        
    } catch {
        return $false
    }
}

# Step 4: Create branch (if requested)
if ($CreateBranch) {
    Write-Host ""
    Write-Host "Step 4: Creating feature branch..." -ForegroundColor Yellow
    
    # Generate branch name with issue type prefix
    $branchName = Get-BranchNameFromTitle -IssueTitle $Title -IssueNumber $issueNumber -IssueType $IssueType
    Write-Host "  Branch name: $branchName" -ForegroundColor Cyan
    Write-Host "  Issue type: $IssueType" -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "  [DRY RUN] Would create linked branch: $branchName from $BaseBranch" -ForegroundColor Magenta
    } else {
        try {
            # Check if branch already exists
            $branchExists = git ls-remote --heads origin $branchName 2>&1
            if ($branchExists -match 'refs/heads') {
                Write-Host "  ⚠️  Branch '$branchName' already exists on remote" -ForegroundColor Yellow
                Write-Host "  ℹ️  GitHub should auto-detect this branch in the Development section" -ForegroundColor Cyan
                Write-Host "     because it contains issue number #$issueNumber in its name" -ForegroundColor Cyan
            } else {
                # Branch doesn't exist - create it using createLinkedBranch for proper linking
                Write-Host "  Creating linked branch using GitHub API..." -ForegroundColor Gray
                
                if (Create-LinkedBranchForIssue -IssueNumber $issueNumber -BranchName $branchName -BaseBranch $BaseBranch) {
                    Write-Host "  ✅ Linked branch created: $branchName" -ForegroundColor Green
                    Write-Host "  ✅ Branch is now linked to issue #$issueNumber in Development section" -ForegroundColor Green
                    
                    # Fetch the newly created branch
                    git fetch origin $branchName 2>&1 | Out-Null
                    
                    # Checkout the branch locally
                    git checkout $branchName 2>&1 | Out-Null
                } else {
                    # Fallback: create branch manually if API creation fails (branch name conflict)
                    Write-Host "  ⚠️  Branch name may already exist, creating manually..." -ForegroundColor Yellow
                    
                    # Ensure we're on the base branch and it's up to date
                    git checkout $BaseBranch 2>&1 | Out-Null
                    git pull origin $BaseBranch 2>&1 | Out-Null
                    
                    # Create the branch manually
                    git branch $branchName 2>&1 | Out-Null
                    
                    if ($PushBranch) {
                        git push origin $branchName 2>&1 | Out-Null
                        Write-Host "  ✅ Branch created and pushed" -ForegroundColor Green
                        Write-Host "  ℹ️  GitHub should auto-detect this branch (contains issue #$issueNumber)" -ForegroundColor Cyan
                    }
                }
            }
            
        } catch {
            Write-Host "  ❌ Failed to create branch: $_" -ForegroundColor Red
        }
    }
}

# Step 5: Display summary
Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "              Summary" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
$repoOwner = gh repo view --json owner -q .owner.login
$repoName = gh repo view --json name -q .name
Write-Host "  Issue #${issueNumber}: $Title" -ForegroundColor Cyan
Write-Host "  URL: https://github.com/$repoOwner/$repoName/issues/$issueNumber" -ForegroundColor Cyan

if ($IssueType) {
    Write-Host "  Type: $IssueType" -ForegroundColor Cyan
}

if ($projectConfig -and $ConfigureProjectFields) {
    if ($Status) { Write-Host "  Status: $Status" -ForegroundColor Cyan }
    if ($Priority) { Write-Host "  Priority: $Priority" -ForegroundColor Cyan }
    if ($Size) { Write-Host "  Size: $Size" -ForegroundColor Cyan }
    if ($Estimate -gt 0) { Write-Host "  Estimate: $Estimate days" -ForegroundColor Cyan }
    Write-Host "  Project: $projectKey (Project #$projectNumber)" -ForegroundColor Cyan
}

if ($CreateBranch) {
    Write-Host "  Branch: $branchName" -ForegroundColor Cyan
    Write-Host "  Base: $BaseBranch" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Review the issue at the URL above" -ForegroundColor Gray

if ($CreateBranch) {
    Write-Host "  2. Checkout the branch: git checkout $branchName" -ForegroundColor Gray
    Write-Host "  3. Start implementing the changes" -ForegroundColor Gray
} else {
    Write-Host "  2. Start working on the issue" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Issue creation complete!" -ForegroundColor Green

