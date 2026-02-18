#requires -Version 7.0
[CmdletBinding()]
param(
    [switch]$FailFast
)

$ErrorActionPreference = "Stop"
$repoRoot = Resolve-Path (Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\..")

$requiredKeys = @("title","owner","version","last_reviewed","linked_scripts","status")
$promptFiles = Get-ChildItem (Join-Path $repoRoot "prompts") -Recurse -Filter *.md

$failures = @()

foreach ($file in $promptFiles) {
    $content = Get-Content $file.FullName -Raw
    if ($content -notmatch "^---\s*(.*?)---") {
        $failures += "Missing front matter: $($file.FullName)"
        if ($FailFast) { break }
        continue
    }

    $yaml = $Matches[1]
    $doc = ConvertFrom-Yaml -Yaml $yaml
    foreach ($key in $requiredKeys) {
        if (-not $doc.ContainsKey($key)) {
            $failures += "Missing '$key' in $($file.FullName)"
            if ($FailFast) { break 2 }
        }
    }

    if ($doc.linked_scripts -is [array]) {
        foreach ($script in $doc.linked_scripts) {
            if (-not $script) { continue }
            $scriptPath = Join-Path $repoRoot $script
            if (-not (Test-Path $scriptPath)) {
                $failures += "Linked script missing ($script) referenced by $($file.FullName)"
                if ($FailFast) { break 2 }
            }
        }
    }
}

if ($failures.Count -gt 0) {
    Write-Host "Prompt contract failures detected:" -ForegroundColor Red
    $failures | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
    exit 1
}

Write-Host "All prompts passed contract validation." -ForegroundColor Green

