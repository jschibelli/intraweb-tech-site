#requires -Version 7.0
<#
.SYNOPSIS
    Requests a new review on a pull request, typically after changes have been addressed.

.DESCRIPTION
    This script automatically requests a new review on a PR when changes have been pushed.
    It can re-request reviews from previous reviewers or request from specific reviewers.

.PARAMETER PRNumber
    The pull request number

.PARAMETER Reviewers
    Optional list of specific reviewers to request. If not provided, will re-request from previous reviewers.

.PARAMETER AutoDetect
    If true, automatically detects if PR needs review (e.g., has CHANGES_REQUESTED status)

.PARAMETER DryRun
    Preview what would be done without making changes

.EXAMPLE
    .\request-pr-review.ps1 -PRNumber 14

.EXAMPLE
    .\request-pr-review.ps1 -PRNumber 14 -Reviewers @("jschibelli", "reviewer2")

.EXAMPLE
    .\request-pr-review.ps1 -PRNumber 14 -AutoDetect
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [int]$PRNumber,
    
    [Parameter(Mandatory=$false)]
    [string[]]$Reviewers = @(),
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoDetect = $true,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required. Please install it first."
    }
}

function Get-PRReviewers {
    param([int]$PRNumber)
    
    try {
        # IMPORTANT: don't merge stderr into stdout when we plan to parse JSON
        $json = gh pr view $PRNumber --json reviewRequests,reviews,author 2>$null
        if ($LASTEXITCODE -ne 0 -or -not $json) { return @() }

        $prData = $json | ConvertFrom-Json
        
        $reviewers = @()
        
        # Get requested reviewers
        if ($prData.reviewRequests) {
            foreach ($request in $prData.reviewRequests) {
                if ($request.requestedReviewer.login) {
                    $reviewers += $request.requestedReviewer.login
                }
            }
        }
        
        # Get reviewers who have already reviewed
        if ($prData.reviews) {
            foreach ($review in $prData.reviews) {
                if ($review.author.login -and $review.author.login -ne $prData.author.login) {
                    if ($reviewers -notcontains $review.author.login) {
                        $reviewers += $review.author.login
                    }
                }
            }
        }
        
        return $reviewers
    } catch {
        Write-Warning "Could not get PR reviewers: $($_.Exception.Message)"
        return @()
    }
}

function Test-HasCopilotReview {
    <#
    .SYNOPSIS
    Returns true if the PR has a GitHub Copilot review/reviewer activity.

    .NOTES
    Copilot is typically a GitHub App/bot and can't be (re)requested via `gh pr edit --add-reviewer`.
    #>
    param([int]$PRNumber)

    try {
        # 1) Try structured review/reviewRequest signals (may not include Copilot on some setups)
        $json = gh pr view $PRNumber --json reviews,reviewRequests 2>$null
        if ($LASTEXITCODE -eq 0 -and $json) {
            $prData = $json | ConvertFrom-Json

            # Check requested reviewers
            if ($prData.reviewRequests) {
                foreach ($request in $prData.reviewRequests) {
                    $login = $request.requestedReviewer.login
                    if ($login -and ($login -like "*copilot*" -or $login -eq "Copilot" -or $login -like "*[bot]")) {
                        return $true
                    }
                }
            }

            # Check submitted reviews
            if ($prData.reviews) {
                foreach ($review in $prData.reviews) {
                    $login = $review.author.login
                    $type = $review.author.type
                    if ($login -and ($login -like "*copilot*" -or $login -eq "Copilot")) { return $true }
                    if ($type -eq "Bot" -and $login -like "*copilot*") { return $true }
                }
            }
        }

        # 2) Fallback: check PR review comments (inline comments). Copilot commonly shows up here.
        $owner = $null
        $name = $null
        try {
            $owner = (gh repo view --json owner -q .owner.login 2>$null).Trim()
            $name = (gh repo view --json name -q .name 2>$null).Trim()
        } catch { }

        if ($owner -and $name) {
            $commentsJson = gh api "repos/$owner/$name/pulls/$PRNumber/comments" 2>$null
            if ($LASTEXITCODE -eq 0 -and $commentsJson) {
                $comments = $commentsJson | ConvertFrom-Json
                foreach ($c in ($comments ?? @())) {
                    $login = $c.user.login
                    if ($login -and ($login -eq "Copilot" -or $login -like "*copilot*")) {
                        return $true
                    }
                }
            }
        }

        return $false
    } catch {
        return $false
    }
}

function Get-PRStatus {
    param([int]$PRNumber)
    
    try {
        # IMPORTANT: don't merge stderr into stdout when we plan to parse JSON
        $json = gh pr view $PRNumber --json reviewDecision,state,isDraft 2>$null
        if ($LASTEXITCODE -ne 0 -or -not $json) { return $null }

        $prData = $json | ConvertFrom-Json
        
        return @{
            ReviewDecision = $prData.reviewDecision
            State = $prData.state
            IsDraft = $prData.isDraft
        }
    } catch {
        Write-Warning "Could not get PR status: $($_.Exception.Message)"
        return $null
    }
}

function Request-PRReview {
    param(
        [int]$PRNumber,
        [string[]]$Reviewers
    )
    
    if ($Reviewers.Count -eq 0) {
        Write-Host "  ⚠️  No reviewers to request review from" -ForegroundColor Yellow
        return $false
    }
    
    $reviewersStr = $Reviewers -join ","
    
    try {
        Write-Host "  📬 Requesting review from: $($Reviewers -join ', ')" -ForegroundColor Cyan
        
        if ($DryRun) {
            Write-Host "  [DRY RUN] Would run: gh pr edit $PRNumber --add-reviewer $reviewersStr" -ForegroundColor Yellow
            return $true
        }
        
        $result = gh pr edit $PRNumber --add-reviewer $reviewersStr 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Review requested successfully" -ForegroundColor Green
            return $true
        } else {
            Write-Warning "Failed to request review: $result"
            return $false
        }
    } catch {
        Write-Warning "Error requesting review: $($_.Exception.Message)"
        return $false
    }
}

function Show-CopilotReReviewGuidance {
    param([int]$PRNumber)

    $prTool = $null
    try {
        $prTool = Join-Path $PSScriptRoot "pr.ps1"
    } catch { }

    Write-Host "  ℹ️  Copilot appears to be the reviewer for this PR." -ForegroundColor Gray
    Write-Host "     Copilot is a GitHub App/bot and can't be (re)requested via gh pr edit --add-reviewer." -ForegroundColor Gray
    Write-Host "     To trigger another Copilot review, use the GitHub UI (Copilot review) or push new commits (depending on your org settings)." -ForegroundColor Yellow

    if ($prTool -and (Test-Path $prTool)) {
        Write-Host ""
        Write-Host "     Helper: run this to open the PR + show the exact enablement guidance:" -ForegroundColor Gray
        Write-Host "       & `"$prTool`" -Action copilot -PRNumber $PRNumber -CopilotAction trigger-copilot-review" -ForegroundColor White
    }
}

# Main execution
Ensure-GhCli

Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "     Request PR Review" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "PR #$PRNumber" -ForegroundColor Cyan
Write-Host ""

# Get PR status
$prStatus = Get-PRStatus -PRNumber $PRNumber
if (-not $prStatus) {
    Write-Host "  ❌ Could not get PR status. PR may not exist." -ForegroundColor Red
    exit 1
}

Write-Host "  Status: $($prStatus.ReviewDecision)" -ForegroundColor Gray
Write-Host "  State: $($prStatus.State)" -ForegroundColor Gray
if ($prStatus.IsDraft) {
    Write-Host "  ⚠️  PR is in draft mode" -ForegroundColor Yellow
}

# Auto-detect if review should be requested
$shouldRequest = $false
if ($AutoDetect) {
    # Request review if PR has changes requested or is in review required state
    if ($prStatus.ReviewDecision -eq "CHANGES_REQUESTED" -or 
        $prStatus.ReviewDecision -eq "REVIEW_REQUIRED" -or
        $prStatus.State -eq "OPEN") {
        $shouldRequest = $true
        Write-Host "  ✅ Auto-detected: PR needs review" -ForegroundColor Green
    } else {
        Write-Host "  ℹ️  PR status: $($prStatus.ReviewDecision) - review may not be needed" -ForegroundColor Gray
    }
} else {
    $shouldRequest = $true
}

if (-not $shouldRequest) {
    Write-Host "  ⏭️  Skipping review request" -ForegroundColor Yellow
    exit 0
}

# Get reviewers
$reviewersToRequest = @()
if ($Reviewers.Count -gt 0) {
    $reviewersToRequest = $Reviewers
    Write-Host "  📋 Using specified reviewers: $($Reviewers -join ', ')" -ForegroundColor Cyan
} else {
    Write-Host "  🔍 Detecting previous reviewers..." -ForegroundColor Yellow
    $previousReviewers = Get-PRReviewers -PRNumber $PRNumber
    if ($previousReviewers.Count -gt 0) {
        $reviewersToRequest = $previousReviewers
        Write-Host "  ✅ Found $($previousReviewers.Count) reviewer(s): $($previousReviewers -join ', ')" -ForegroundColor Green
    } else {
        # If Copilot is the "reviewer", don't suggest --add-reviewer; Copilot is a bot/app.
        if (Test-HasCopilotReview -PRNumber $PRNumber) {
            Show-CopilotReReviewGuidance -PRNumber $PRNumber
            exit 0
        }

        Write-Host "  ⚠️  No previous reviewers found. Please specify reviewers with -Reviewers parameter." -ForegroundColor Yellow
        exit 0
    }
}

# Request review
Request-PRReview -PRNumber $PRNumber -Reviewers $reviewersToRequest

# If Copilot is involved on this PR, remind how to get a Copilot re-review (separate from human reviewer requests)
if (Test-HasCopilotReview -PRNumber $PRNumber) {
    Write-Host ""
    Show-CopilotReReviewGuidance -PRNumber $PRNumber
}

Write-Host ""
Write-Host "✅ Complete!" -ForegroundColor Green
Write-Host ""

