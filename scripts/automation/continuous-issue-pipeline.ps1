#requires -Version 7.0
[CmdletBinding()]
param(
    [int]$MaxIssues = 5,
    [string]$Status,
    [string]$Priority,
    [string]$App,
    [string]$Area,
    [switch]$Watch,
    [int]$Interval = 60,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required."
    }
}

function Get-IssueFilterArgs {
    $args = @("--state", "open", "--limit", $MaxIssues)
    if ($Labels = @()) {
        if ($Priority) { $Labels += "priority: $Priority" }
        if ($App) { $Labels += "app: $App" }
        if ($Area) { $Labels += "area: $Area" }
        if ($Labels.Count -gt 0) {
            $args += "--label"
            $args += ($Labels -join ",")
        }
    }
    return $args
}

function Fetch-CandidateIssues {
    Ensure-GhCli
    $args = Get-IssueFilterArgs
    $json = gh issue list @args --json number,title,state,labels
    return $json | ConvertFrom-Json
}

function Invoke-IssueScript {
    param([int]$IssueNumber)
    $scriptPath = Join-Path (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)) "issue-management\configuration\configure-issues-unified.ps1"
    if (-not (Test-Path $scriptPath)) {
        throw "configure-issues-unified.ps1 not found at $scriptPath."
    }
    & $scriptPath -IssueNumber $IssueNumber -Preset blog -DryRun:$DryRun
}

function Process-Issues {
    $issues = Fetch-CandidateIssues
    if (-not $issues) {
        Write-Host "No issues matched filters." -ForegroundColor Yellow
        return
    }

    foreach ($issue in $issues) {
        Write-Host "Processing issue #$($issue.number) - $($issue.title)" -ForegroundColor Cyan
        Invoke-IssueScript -IssueNumber $issue.number
    }
}

do {
    Process-Issues
    if ($Watch) {
        Write-Host "Waiting $Interval seconds before next cycle..." -ForegroundColor Gray
        Start-Sleep -Seconds $Interval
    }
} while ($Watch)

