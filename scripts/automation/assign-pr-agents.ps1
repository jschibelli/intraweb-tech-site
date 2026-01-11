#requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int]$PRNumber,
    [string[]]$Agents = @("agent-1-chris", "agent-2-jason"),
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required."
    }
}

Ensure-GhCli

$assignees = $Agents | ForEach-Object {
    switch ($_) {
        "agent-1-chris" { "jschibelli" }
        "agent-2-jason" { "jschibelli" }
        default { $_ }
    }
}

Write-Host "Assigning PR #$PRNumber to agents: $($assignees -join ', ')" -ForegroundColor Cyan

if (-not $DryRun) {
    gh pr edit $PRNumber --add-assignee ($assignees -join ",") | Out-Null
}

