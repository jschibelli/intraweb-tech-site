#requires -Version 7.0
[CmdletBinding()]
param(
    [string]$PRNumber,
    [switch]$UpdateChangelog,
    [switch]$UpdateReadme,
    [switch]$GenerateDocs,
    [string]$OutputDir = "logs",
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Ensure-OutputDir {
    param($Path)
    if (-not (Test-Path $Path)) {
        New-Item -ItemType Directory -Path $Path | Out-Null
    }
}

function Get-PRSummary {
    if (-not $PRNumber) { return $null }
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Warning "GitHub CLI not available; skipping PR fetch."
        return $null
    }
    # gh does NOT support "permalink" for PRs; use "url".
    $json = gh pr view $PRNumber --json title,body,author,url,files
    return $json | ConvertFrom-Json
}

function Write-ChangelogEntry {
    param([object]$PRData)
    $changelogPath = "docs/CHANGELOG.md"
    $entry = @"
## $(Get-Date -Format "yyyy-MM-dd")
- PR #$PRNumber - $($PRData.title) (@$($PRData.author.login))
- Link: $($PRData.url)
"@
    if ($DryRun -or -not (Test-Path $changelogPath)) {
        Write-Host "[Changelog Preview]" -ForegroundColor Cyan
        Write-Host $entry
    } else {
        Add-Content -Path $changelogPath -Value $entry
    }
}

function Write-ReadmeSummary {
    param([object]$PRData)
    $logPath = Join-Path $OutputDir "docs-updates.log"
    $lines = @(
        "README update suggested for PR #$PRNumber",
        "Title: $($PRData.title)",
        "Files touched: $($PRData.files.path -join ", ")",
        "Notes: Ensure documentation reflects code changes."
    )
    if ($DryRun) {
        $lines | ForEach-Object { Write-Host $_ }
    } else {
        Ensure-OutputDir -Path $OutputDir
        $lines | Out-File -FilePath $logPath -Append
    }
}

function Generate-DocsChecklist {
    param([object]$PRData)
    $checklist = @"
# Documentation Checklist for PR #$PRNumber
- [ ] Update relevant MDX guides
- [ ] Verify script references in prompts
- [ ] Record changes in docs/CHANGELOG.md
"@
    $dest = Join-Path $OutputDir "docs-checklist-$PRNumber.md"
    if ($DryRun) {
        Write-Host $checklist
    } else {
        Ensure-OutputDir -Path $OutputDir
        $checklist | Out-File -FilePath $dest -Encoding utf8
    }
}

$prData = Get-PRSummary

if ($UpdateChangelog -and $prData) { Write-ChangelogEntry -PRData $prData }
if ($UpdateReadme -and $prData) { Write-ReadmeSummary -PRData $prData }
if ($GenerateDocs -and $prData) { Generate-DocsChecklist -PRData $prData }

if (-not ($UpdateChangelog -or $UpdateReadme -or $GenerateDocs)) {
    Write-Host "No actions specified. Use -UpdateChangelog, -UpdateReadme, or -GenerateDocs." -ForegroundColor Yellow
}

