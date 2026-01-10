#!/usr/bin/env pwsh
<#
.SYNOPSIS
  One-off helper to set GitHub Project fields for a known set of issues.

.DESCRIPTION
  This script intentionally lives under scripts/utilities/one-off/ because it
  contains repo/project-specific IDs and (by default) a hardcoded issue map.
  To make it more reusable, you can pass -ConfigPath with a JSON file that
  provides project/field IDs and issue mappings.
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int[]]$IssueNumbers,

    # Optional: JSON file to drive the mapping instead of hardcoding values.
    # Shape:
    # {
    #   "projectId": "...",
    #   "statusFieldId": "...",
    #   "priorityFieldId": "...",
    #   "sizeFieldId": "...",
    #   "statusOptions": { "Ready": "..." },
    #   "priorityOptions": { "P1": "..." },
    #   "sizeOptions": { "M": "..." },
    #   "issueConfigs": { "8": { "Priority": "P1", "Size": "L", "Status": "Ready" } }
    # }
    [string]$ConfigPath
)

$ErrorActionPreference = "Stop"

# Defaults (repo/project specific). Override via -ConfigPath.
$projectId = "PVT_kwDOCobWKc4BKne5"
$statusFieldId = "PVTSSF_lADOCobWKc4BKne5zg6bnj4"
$priorityFieldId = "PVTSSF_lADOCobWKc4BKne5zg6bnyY"
$sizeFieldId = "PVTSSF_lADOCobWKc4BKne5zg6bnyc"

$statusOptions = @{
    "Ready"       = "61e4505c"
    "In progress" = "47fc9ee4"
    "Backlog"     = "f75ad846"
    "Done"        = "98236657"
    "In review"   = "df73e18b"
}

$priorityOptions = @{
    "P0" = "79628723"
    "P1" = "0a877460"
    "P2" = "da944a9c"
}

$sizeOptions = @{
    "XS" = "6c6483d2"
    "S"  = "f784b110"
    "M"  = "7515a9f1"
    "L"  = "817d0097"
    "XL" = "db339eb2"
}

$issueConfigs = @{
    8  = @{ Priority = "P1"; Size = "L"; Status = "Ready" }
    9  = @{ Priority = "P1"; Size = "M"; Status = "Ready" }
    10 = @{ Priority = "P1"; Size = "L"; Status = "Ready" }
    11 = @{ Priority = "P2"; Size = "S"; Status = "Ready" }
    12 = @{ Priority = "P1"; Size = "M"; Status = "Ready" }
}

if ($ConfigPath) {
    if (-not (Test-Path $ConfigPath)) {
        throw "Config file not found: $ConfigPath"
    }
    $cfg = Get-Content -Path $ConfigPath -Raw | ConvertFrom-Json

    if ($cfg.projectId) { $projectId = [string]$cfg.projectId }
    if ($cfg.statusFieldId) { $statusFieldId = [string]$cfg.statusFieldId }
    if ($cfg.priorityFieldId) { $priorityFieldId = [string]$cfg.priorityFieldId }
    if ($cfg.sizeFieldId) { $sizeFieldId = [string]$cfg.sizeFieldId }

    if ($cfg.statusOptions) {
        $statusOptions = @{}
        foreach ($p in $cfg.statusOptions.PSObject.Properties) { $statusOptions[$p.Name] = [string]$p.Value }
    }
    if ($cfg.priorityOptions) {
        $priorityOptions = @{}
        foreach ($p in $cfg.priorityOptions.PSObject.Properties) { $priorityOptions[$p.Name] = [string]$p.Value }
    }
    if ($cfg.sizeOptions) {
        $sizeOptions = @{}
        foreach ($p in $cfg.sizeOptions.PSObject.Properties) { $sizeOptions[$p.Name] = [string]$p.Value }
    }
    if ($cfg.issueConfigs) {
        $issueConfigs = @{}
        foreach ($p in $cfg.issueConfigs.PSObject.Properties) {
            $num = [int]$p.Name
            $issueConfigs[$num] = $p.Value
        }
    }
}

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "  Setting Project Fields Directly" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

foreach ($issueNum in $IssueNumbers) {
    Write-Host "Processing issue #$issueNum..." -ForegroundColor Cyan
    
    $issueConfig = $issueConfigs[$issueNum]
    if (-not $issueConfig) {
        Write-Host "  ⚠️  No configuration for issue #$issueNum" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Get issue ID
        $issueId = gh issue view $issueNum --json id -q .id
        if (-not $issueId) {
            Write-Host "  ❌ Issue not found" -ForegroundColor Red
            continue
        }
        
        # Get project item ID
        $graphqlQuery = @"
query(`$issueId: ID!) {
  node(id: `$issueId) {
    ... on Issue {
      projectItems(first: 10) {
        nodes {
          id
          project {
            id
          }
        }
      }
    }
  }
}
"@
        
        $response = gh api graphql -f query=$graphqlQuery -f issueId=$issueId | ConvertFrom-Json
        $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $projectId } | Select-Object -First 1
        
        if (-not $projectItem) {
            Write-Host "  ⚠️  Issue not in project" -ForegroundColor Yellow
            continue
        }
        
        $projectItemId = $projectItem.id
        Write-Host "  Project Item ID: $projectItemId" -ForegroundColor Gray
        
        $successCount = 0
        
        # Set Status
        if ($issueConfig.Status -and $statusOptions.ContainsKey($issueConfig.Status)) {
            $statusOptionId = $statusOptions[$issueConfig.Status]
            $result = gh project item-edit --id $projectItemId --field-id $statusFieldId --project-id $projectId --single-select-option-id $statusOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Status: $($issueConfig.Status)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  ❌ Status failed: $result" -ForegroundColor Red
            }
        }
        
        # Set Priority
        if ($issueConfig.Priority -and $priorityOptions.ContainsKey($issueConfig.Priority)) {
            $priorityOptionId = $priorityOptions[$issueConfig.Priority]
            $result = gh project item-edit --id $projectItemId --field-id $priorityFieldId --project-id $projectId --single-select-option-id $priorityOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Priority: $($issueConfig.Priority)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  ❌ Priority failed: $result" -ForegroundColor Red
            }
        }
        
        # Set Size
        if ($issueConfig.Size -and $sizeOptions.ContainsKey($issueConfig.Size)) {
            $sizeOptionId = $sizeOptions[$issueConfig.Size]
            $result = gh project item-edit --id $projectItemId --field-id $sizeFieldId --project-id $projectId --single-select-option-id $sizeOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Size: $($issueConfig.Size)" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "  ❌ Size failed: $result" -ForegroundColor Red
            }
        }
        
        Write-Host "  ✅ Set $successCount/3 fields for issue #$issueNum" -ForegroundColor $(if ($successCount -eq 3) { "Green" } else { "Yellow" })
        Write-Host ""
        
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "✅ Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Blue



