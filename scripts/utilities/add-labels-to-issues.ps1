#!/usr/bin/env pwsh
# Add labels to issues

param(
    [Parameter(Mandatory)]
    [int[]]$IssueNumbers,
    
    [Parameter(Mandatory)]
    [string[]]$Labels
)

$ErrorActionPreference = "Stop"

Write-Host "Adding labels to issues..." -ForegroundColor Blue
Write-Host ""

foreach ($issueNum in $IssueNumbers) {
    Write-Host "Processing issue #$issueNum..." -ForegroundColor Yellow
    
    foreach ($label in $Labels) {
        try {
            gh issue edit $issueNum --add-label $label 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Added label: $label" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️  Label '$label' may not exist or already added" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ⚠️  Failed to add label '$label': $_" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
}

Write-Host "✅ Labels added!" -ForegroundColor Green



