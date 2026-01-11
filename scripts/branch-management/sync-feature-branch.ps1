#requires -Version 7.0

param(
    [string]$Branch,

    [string]$Base = "develop",

    [ValidateSet("rebase","merge")]
    [string]$Strategy = "rebase",

    [switch]$Push,

    [switch]$Force,

    [switch]$ForceWithLease,

    [string]$TestCommand,

    [switch]$DryRun
)

Import-Module "$PSScriptRoot\branch-utils.psm1" -Force

$targetBranch = if ($Branch) { $Branch } else { Get-CurrentBranch }
if (-not $targetBranch) {
    throw "Unable to determine current branch. Please specify -Branch."
}

Write-ColorMessage "========================================" ([ConsoleColor]::Blue)
Write-ColorMessage "    Sync Feature Branch ($Strategy)" ([ConsoleColor]::Blue)
Write-ColorMessage "========================================" ([ConsoleColor]::Blue)
Write-ColorMessage "Branch: $targetBranch" ([ConsoleColor]::Gray)
Write-ColorMessage "Base: $Base" ([ConsoleColor]::Gray)

if (-not $Force -and -not (Test-WorkingTreeClean)) {
    throw "Working tree is dirty. Commit/stash changes or pass -Force."
}

Ensure-BaseBranch -Name $Base -PullLatest -Quiet

try {
    Invoke-Git @("rev-parse","--verify",$targetBranch) | Out-Null
} catch {
    throw "Branch '$targetBranch' does not exist locally."
}

if ($DryRun) {
    Write-ColorMessage "[DRY RUN] Would checkout $targetBranch, fetch $Base, and $Strategy onto origin/$Base." ([ConsoleColor]::Cyan)
    if ($Push) {
        Write-ColorMessage "[DRY RUN] Would push branch with $(if ($ForceWithLease) { '--force-with-lease' } else { '' })" ([ConsoleColor]::Cyan)
    }
    if ($TestCommand) {
        Write-ColorMessage "[DRY RUN] Would run tests: $TestCommand" ([ConsoleColor]::Cyan)
    }
    exit 0
}

$startTime = Get-Date

Invoke-Git @("checkout",$targetBranch) | Out-Null
Invoke-Git @("fetch","origin",$Base) | Out-Null

$syncSucceeded = $false
try {
    if ($Strategy -eq "rebase") {
        Write-ColorMessage "Rebasing $targetBranch onto origin/$Base..." ([ConsoleColor]::Yellow)
        Invoke-Git @("rebase","origin/$Base") | Out-Null
    } else {
        Write-ColorMessage "Merging origin/$Base into $targetBranch..." ([ConsoleColor]::Yellow)
        Invoke-Git @("merge","origin/$Base") | Out-Null
    }
    $syncSucceeded = $true
} catch {
    Write-ColorMessage "❌ Sync failed: $($_.Exception.Message)" ([ConsoleColor]::Red)
    Write-ColorMessage "Resolve conflicts, then rerun the script (git rebase --continue or git merge --continue)." ([ConsoleColor]::Yellow)
    exit 1
}

if ($TestCommand) {
    Write-ColorMessage "Running test command: $TestCommand" ([ConsoleColor]::Yellow)
    try {
        Invoke-Expression $TestCommand
    } catch {
        Write-ColorMessage "Tests failed: $($_.Exception.Message)" ([ConsoleColor]::Red)
        exit 1
    }
}

if ($Push) {
    $pushArgs = @("push","origin",$targetBranch)
    if ($Strategy -eq "rebase" -and $ForceWithLease) {
        $pushArgs = @("push","--force-with-lease","origin",$targetBranch)
    }

    try {
        Write-ColorMessage "Pushing branch to origin..." ([ConsoleColor]::Yellow)
        Invoke-Git -Arguments $pushArgs | Out-Null
        
        # Check if there's a PR for this branch and request review if needed
        try {
            $prData = gh pr list --head $targetBranch --json number,reviewDecision,state --limit 1 2>&1 | ConvertFrom-Json
            if ($prData -and $prData.Count -gt 0 -and $prData[0].state -eq "OPEN") {
                $prNumber = $prData[0].number
                Write-ColorMessage "PR #$prNumber found - requesting new review..." ([ConsoleColor]::Cyan)
                
                $requestReviewScript = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\pr-management\request-pr-review.ps1"
                if (Test-Path $requestReviewScript) {
                    & $requestReviewScript -PRNumber $prNumber -AutoDetect
                } else {
                    Write-ColorMessage "Review request script not found, skipping" ([ConsoleColor]::Yellow)
                }
            }
        } catch {
            # Silently fail - PR detection is optional
            Write-ColorMessage "Could not check for PR (this is okay)" ([ConsoleColor]::Gray)
        }
    } catch {
        Write-ColorMessage "Failed to push branch: $($_.Exception.Message)" ([ConsoleColor]::Red)
        exit 1
    }
}

$duration = (Get-Date) - $startTime
Write-ColorMessage "✅ Sync complete in $([math]::Round($duration.TotalSeconds,2))s." ([ConsoleColor]::Green)

$summary = [pscustomobject]@{
    Branch = $targetBranch
    Base   = $Base
    Strategy = $Strategy
    DurationSeconds = [math]::Round($duration.TotalSeconds,2)
    Tests = if ($TestCommand) { "Executed" } else { "Skipped" }
    Pushed = [bool]$Push
}

$summary | ConvertTo-Json -Depth 3

