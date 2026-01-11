#requires -Version 7.0
[CmdletBinding()]
param(
    [ValidateSet("status", "assign", "backfill")]
    [string]$Operation = "status",
    [string]$Preset = "default",
    [string]$Priority = "P1",
    [string]$Area = "Frontend",
    [string]$App = "Portfolio Site",
    [int[]]$Issues,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required."
    }
}

function Show-ProjectStatus {
    Ensure-GhCli
    $items = gh project item-list 20 --limit 20 --format json | ConvertFrom-Json
    $summary = $items | Group-Object { $_.Status } | ForEach-Object {
        [pscustomobject]@{ Status = $_.Name; Count = $_.Count }
    }
    $summary | Format-Table
}

function Assign-Issues {
    if (-not $Issues) { throw "Specify -Issues for assign operation." }
    Ensure-GhCli
    foreach ($issue in $Issues) {
        Write-Host "Assigning issue #$issue (Priority=$Priority, Area=$Area, App=$App)" -ForegroundColor Cyan
        if ($DryRun) { continue }
        gh issue edit $issue --add-label "priority: $Priority" --add-label "area: $Area" --add-label "app: $App" --add-assignee jschibelli | Out-Null
    }
}

function Backfill-Fields {
    Ensure-GhCli
    $issues = gh issue list --state open --label "ready-to-implement" --limit 20 --json number,title
    foreach ($issue in ($issues | ConvertFrom-Json)) {
        Write-Host "Backfilling #$($issue.number) - $($issue.title)"
        if (-not $DryRun) {
            gh issue edit $issue.number --add-label "priority: $Priority" | Out-Null
        }
    }
}

switch ($Operation) {
    "status" { Show-ProjectStatus }
    "assign" { Assign-Issues }
    "backfill" { Backfill-Fields }
}

