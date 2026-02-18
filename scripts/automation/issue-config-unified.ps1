#requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int]$IssueNumber,
    [ValidateSet("blog", "dashboard", "docs", "infra", "custom")]
    [string]$Preset = "blog",
    [string]$Priority,
    [string]$Size,
    [string]$App,
    [string]$Area,
    [string[]]$Labels,
    [string]$Milestone,
    [int]$Estimate,
    [switch]$AddToProject,
    [switch]$UseAI,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-RepoRoot {
    $current = Split-Path -Parent $MyInvocation.MyCommand.Path
    return (Resolve-Path (Join-Path $current "..\..")).Path
}

function Import-AIServices {
    $modulePath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "core-utilities\ai-services.ps1"
    if (Test-Path $modulePath) {
        . $modulePath
        return $true
    }
    Write-Verbose "AI services module not found at $modulePath"
    return $false
}

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required but not installed or not available in PATH."
    }
}

function Resolve-Preset {
    param([string]$PresetName)
    switch ($PresetName) {
        "blog" {
            return @{
                Priority = "P1"; Size = "M"; App = "Portfolio Site"; Area = "Frontend";
                Labels   = @("ready-to-implement", "area: functionality", "priority: high")
            }
        }
        "dashboard" {
            return @{
                Priority = "P1"; Size = "M"; App = "Dashboard"; Area = "Frontend";
                Labels   = @("ready-to-implement", "area: functionality")
            }
        }
        "docs" {
            return @{
                Priority = "P2"; Size = "S"; App = "Docs"; Area = "Content";
                Labels   = @("ready-to-implement", "priority: medium", "area: content")
            }
        }
        "infra" {
            return @{
                Priority = "P1"; Size = "L"; App = "Portfolio Site"; Area = "Infra";
                Labels   = @("ready-to-implement", "area: infra")
            }
        }
        Default { return @{} }
    }
}

function Get-IssueData {
    Ensure-GhCli
    $json = gh issue view $IssueNumber --json number,title,body,labels,assignees,projectItems,state --jq .
    if (-not $json) { throw "Unable to fetch issue #$IssueNumber." }
    return $json | ConvertFrom-Json
}

function Get-AIConfiguration {
    if (-not (Import-AIServices)) { return $null }
    try {
        $templatePath = Join-Path (Get-RepoRoot) "prompts\automation\issue-analysis-prompt-template.md"
        $template = Get-Content $templatePath -Raw
        $issue = Get-IssueData
        $prompt = $template.Replace("{ISSUE_NUMBER}", $IssueNumber).
            Replace("{ISSUE_TITLE}", $issue.title).
            Replace("{ISSUE_BODY}", ($issue.body ?? "No description")).
            Replace("{CURRENT_LABELS}", (($issue.labels.name) -join ", ")).
            Replace("{CURRENT_ASSIGNEE}", (($issue.assignees.login) -join ", ")).
            Replace("{CREATED_DATE}", (Get-Date -Format "yyyy-MM-dd")).
            Replace("{UPDATED_DATE}", (Get-Date -Format "yyyy-MM-dd"))
        $response = Invoke-AICompletion -Prompt $prompt -ResponseFormat json
        if ($response) {
            return $response | ConvertFrom-Json
        }
    } catch {
        Write-Warning "AI analysis failed: $($_.Exception.Message)"
    }
    return $null
}

function Merge-Configuration {
    param(
        [hashtable]$Defaults,
        [hashtable]$Overrides
    )
    $result = @{}
    foreach ($key in @("Priority", "Size", "App", "Area", "Labels", "Milestone", "Estimate")) {
        if ($Overrides.ContainsKey($key) -and $Overrides[$key]) {
            $result[$key] = $Overrides[$key]
        } elseif ($Defaults.ContainsKey($key)) {
            $result[$key] = $Defaults[$key]
        }
    }
    return $result
}

function Apply-IssueUpdates {
    param([hashtable]$Config)

    Ensure-GhCli

    Write-Host "Configuring issue #$IssueNumber with $($Config | ConvertTo-Json -Compress)" -ForegroundColor Cyan

    if ($DryRun) {
        Write-Host "[DryRun] Skipping gh issue edit/label/project updates."
        return
    }

    $labelArgs = @()
    if ($Config.Labels) {
        $labelArgs += "--add-label"
        $labelArgs += ($Config.Labels -join ",")
    }

    $milestoneArgs = @()
    if ($Config.Milestone) {
        $milestoneArgs += "--milestone"
        $milestoneArgs += $Config.Milestone
    }

    gh issue edit $IssueNumber @labelArgs @milestoneArgs | Out-Null

    if ($AddToProject) {
        gh project item-add --project "PVT_kwHOAEnMVc4BCu-c" --content-id $(gh issue view $IssueNumber --json id -q .id) | Out-Null
    }
}

$defaults = Resolve-Preset -PresetName $Preset
$overrides = @{
    Priority = $Priority; Size = $Size; App = $App; Area = $Area;
    Labels = if ($Labels) { $Labels } else { $null }
    Milestone = $Milestone; Estimate = $Estimate
}

if ($UseAI) {
    $aiConfig = Get-AIConfiguration
    if ($aiConfig) {
        $overrides.Priority = $aiConfig.priority
        $overrides.Size = $aiConfig.size
        $overrides.App = $aiConfig.app
        $overrides.Area = $aiConfig.area
        $overrides.Labels = $aiConfig.labels
        $overrides.Milestone = $aiConfig.milestone
        $overrides.Estimate = $aiConfig.estimate
    }
}

$finalConfig = Merge-Configuration -Defaults $defaults -Overrides $overrides
Apply-IssueUpdates -Config $finalConfig

Write-Host "Issue configuration complete." -ForegroundColor Green

