#requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int]$PRNumber,
    [string]$Status = "In progress",
    [string]$Priority = "P1",
    [string]$Size = "M",
    [string]$Area = "Frontend",
    [string]$App = "Portfolio Site",
    [int]$Estimate = 3,
    [string[]]$Labels = @("ready-to-review"),
    [string]$Assign = "jschibelli",
    [switch]$DryRun
)

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required."
    }
}

function Set-PRMetadata {
    Ensure-GhCli

    $labelArgs = @()
    if ($Labels) {
        $labelArgs += "--add-label"
        $labelArgs += ($Labels -join ",")
    }

    $assigneeArgs = @()
    if ($Assign) {
        $assigneeArgs += "--add-assignee"
        $assigneeArgs += $Assign
    }

    $body = @"
### Automation Metadata
- Status: $Status
- Priority: $Priority
- Size: $Size
- Estimate: $Estimate
- App: $App
- Area: $Area
"@

    if ($DryRun) {
        Write-Host "[DryRun] gh pr edit $PRNumber ..." -ForegroundColor Yellow
        Write-Host $body
        return
    }

    gh pr edit $PRNumber @labelArgs @assigneeArgs --body "$body" | Out-Null
    Write-Host "PR #$PRNumber metadata updated." -ForegroundColor Green
}

Set-PRMetadata

