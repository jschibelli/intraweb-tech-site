#requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int]$IssueNumber,
    [string]$Priority,
    [string]$Size,
    [string]$App,
    [string]$Area,
    [string[]]$Labels,
    [int]$Estimate,
    [string]$Milestone,
    [switch]$AddToProject,
    [switch]$DryRun
)

$scriptPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "issue-config-unified.ps1"
if (-not (Test-Path $scriptPath)) {
    throw "issue-config-unified.ps1 not found at $scriptPath"
}

& $scriptPath `
    -IssueNumber $IssueNumber `
    -Preset "custom" `
    -Priority $Priority `
    -Size $Size `
    -App $App `
    -Area $Area `
    -Labels $Labels `
    -Estimate $Estimate `
    -Milestone $Milestone `
    -AddToProject:$AddToProject `
    -DryRun:$DryRun

