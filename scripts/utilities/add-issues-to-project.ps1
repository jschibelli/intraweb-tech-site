#!/usr/bin/env pwsh
# Add issues to project

param(
    [Parameter(Mandatory)]
    [int[]]$IssueNumbers,
    
    [int]$ProjectNumber = 6,
    [string]$Owner = "IntraWeb-Technology"
)

$ErrorActionPreference = "Stop"

Write-Host "Adding issues to project #$ProjectNumber..." -ForegroundColor Blue
Write-Host ""

foreach ($num in $IssueNumbers) {
    Write-Host "Adding issue #$num..." -ForegroundColor Yellow
    
    try {
        $repoOwner = gh repo view --json owner -q .owner.login
        $repoName = gh repo view --json name -q .name
        $issueUrl = "https://github.com/$repoOwner/$repoName/issues/$num"
        
        $result = gh project item-add $ProjectNumber --owner $Owner --url $issueUrl 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Added issue #$num to project" -ForegroundColor Green
        } else {
            if ($result -match "already exists") {
                Write-Host "  ⚠️  Issue #$num already in project" -ForegroundColor Yellow
            } else {
                Write-Host "  ⚠️  Issue #$num - $result" -ForegroundColor Yellow
            }
        }
    } catch {
        Write-Host "  ❌ Error adding issue #$num : $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "✅ Done!" -ForegroundColor Green

