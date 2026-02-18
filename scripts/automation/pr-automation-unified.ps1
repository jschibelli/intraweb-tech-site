#requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int]$PRNumber,
    [ValidateSet("monitor", "analyze", "respond", "quality", "docs", "all")]
    [string]$Action = "all",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $PSCommandPath }

function Get-RepoRoot {
    # Prefer git to locate the true repository root (more robust than relative paths)
    try {
        $gitRoot = git rev-parse --show-toplevel 2>$null
        if ($LASTEXITCODE -eq 0 -and $gitRoot) {
            return $gitRoot.Trim()
        }
    } catch {
        # Ignore and fall back
    }

    # Fallback: this script lives at scripts/automation/; repo root is two levels up
    return (Resolve-Path (Join-Path $scriptDir "..\..")).Path
}

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required."
    }
}

function Get-PRData {
    Ensure-GhCli
    # Note: gh does NOT support "permalink" for PRs; use "url".
    $json = gh pr view $PRNumber --json title,body,baseRefName,headRefName,state,url,files,additions,deletions,statusCheckRollup
    return $json | ConvertFrom-Json
}

function Import-AIServices {
    # scripts/automation/ -> scripts/core-utilities/
    $modulePath = Join-Path $scriptDir "..\core-utilities\ai-services.ps1"
    if (Test-Path $modulePath) {
        . $modulePath
        return $true
    }
    return $false
}

function Invoke-PRPrompt {
    param([object]$PRData)

    if (-not (Import-AIServices)) {
        return "[AI unavailable] Summary: $($PRData.title)"
    }

    $templatePath = Join-Path (Get-RepoRoot) "prompts\automation\pr-automation-prompt-template.md"
    if (-not (Test-Path $templatePath)) {
        return "[AI unavailable] Prompt template not found: $templatePath"
    }

    $template = Get-Content -Path $templatePath -Raw
    $changedFiles = $PRData.files.path -join ", "

    $prompt = $template.
        Replace("{PR_NUMBER}", $PRNumber).
        Replace("{PR_TITLE}", $PRData.title).
        Replace("{PR_DESCRIPTION}", ($PRData.body ?? "No description")).
        Replace("{BASE_BRANCH}", $PRData.baseRefName).
        Replace("{CHANGED_FILES}", $changedFiles).
        Replace("{LINES_CHANGED}", "Additions: $($PRData.additions) / Deletions: $($PRData.deletions)").
        Replace("{CI_STATUS}", ($PRData.statusCheckRollup.state ?? "unknown")).
        Replace("{REVIEW_STATUS}", $PRData.state)

    return Invoke-AICompletion -Prompt $prompt -ResponseFormat json
}

function Show-MonitorStatus {
    $pr = Get-PRData
    $status = [pscustomobject]@{
        Title      = $pr.title
        URL        = $pr.url
        BaseBranch = $pr.baseRefName
        Checks     = $pr.statusCheckRollup.state
        Files      = $pr.files.Count
        Additions  = $pr.additions
        Deletions  = $pr.deletions
    }
    $status | Format-List
}

function Invoke-Analysis {
    $pr = Get-PRData
    $analysis = Invoke-PRPrompt -PRData $pr
    if ($analysis) {
        try {
            ($analysis | ConvertFrom-Json) | ConvertTo-Json -Depth 5
        } catch {
            Write-Output $analysis
        }
    }
}

function Invoke-QualityChecks {
    if ($DryRun) {
        Write-Host "[DryRun] Would run pnpm lint && pnpm test" -ForegroundColor Yellow
        return
    }

    function Get-PackageScripts {
        if (-not (Test-Path "package.json")) { return @{} }
        try {
            $pkg = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
            if ($pkg.scripts) {
                # Convert PSCustomObject -> Hashtable for reliable key lookup / parameter typing
                if ($pkg.scripts -is [hashtable]) { return $pkg.scripts }
                $ht = @{}
                foreach ($p in $pkg.scripts.PSObject.Properties) {
                    $ht[$p.Name] = [string]$p.Value
                }
                return $ht
            }
        } catch {
            Write-Warning "Failed to parse package.json: $($_.Exception.Message)"
        }
        return @{}
    }

    function Has-Script {
        param(
            [Parameter(Mandatory)][hashtable]$Scripts,
            [Parameter(Mandatory)][string]$Name
        )
        return ($Scripts.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace([string]$Scripts[$Name]))
    }

    $scripts = Get-PackageScripts

    if (Test-Path "pnpm-lock.yaml") {
        if (Has-Script -Scripts $scripts -Name "lint") {
            pnpm run lint
        } else {
            Write-Warning "No lint script found in package.json; skipping lint."
        }

        if (Has-Script -Scripts $scripts -Name "test") {
            pnpm run test -- --watch=false
        } else {
            Write-Warning "No test script found in package.json; skipping tests."
        }
    } elseif (Test-Path "package-lock.json") {
        if (Has-Script -Scripts $scripts -Name "lint") {
            npm run lint
        } else {
            Write-Warning "No lint script found in package.json; skipping lint."
        }

        if (Has-Script -Scripts $scripts -Name "test") {
            npm test -- --watch=false
        } else {
            Write-Warning "No test script found in package.json; skipping tests."
        }
    } else {
        Write-Warning "No JS package manager lock file found; skipping quality checks."
    }
}

function Invoke-DocsUpdate {
    # $MyInvocation.MyCommand.Path can be $null inside functions; prefer the script directory.
    $scriptPath = Join-Path $scriptDir "docs-updater.ps1"
    if (-not (Test-Path $scriptPath)) {
        Write-Warning "docs-updater.ps1 not found."
        return
    }
    & $scriptPath -PRNumber $PRNumber -UpdateChangelog -UpdateReadme -DryRun:$DryRun
}

function Handle-Responses {
    $analysis = Invoke-Analysis
    Write-Host "Generate responses based on analysis above. (Automated posting TBD)" -ForegroundColor Cyan
    if ($analysis) {
        Write-Host $analysis
    }
}

switch ($Action) {
    "monitor" { Show-MonitorStatus }
    "analyze" { Invoke-Analysis }
    "respond" { Handle-Responses }
    "quality" { Invoke-QualityChecks }
    "docs"    { Invoke-DocsUpdate }
    "all"     {
        Show-MonitorStatus
        Invoke-Analysis
        Handle-Responses
        Invoke-QualityChecks
        Invoke-DocsUpdate
    }
}

