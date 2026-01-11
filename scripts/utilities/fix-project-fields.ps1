#!/usr/bin/env pwsh
# Fix project fields for issues - with verbose output

param(
    [Parameter(Mandatory)]
    [int[]]$IssueNumbers,
    
    [string]$ProjectKey = "workant"
)

$ErrorActionPreference = "Stop"

# Load project configuration
$configPath = Join-Path $PSScriptRoot "..\configuration\project-config.ps1"
if (Test-Path $configPath) {
    . $configPath
} else {
    Write-Host "❌ Configuration helper not found" -ForegroundColor Red
    exit 1
}

$config = Require-ProjectConfig
if (-not $config) {
    exit 1
}

$projectConfig = Get-ProjectById -ProjectKey $ProjectKey
if (-not $projectConfig) {
    Write-Host "❌ Project '$ProjectKey' not found" -ForegroundColor Red
    exit 1
}

Write-Host "Project ID: $($projectConfig.projectId)" -ForegroundColor Cyan
Write-Host ""

# Issue configurations
$issueConfigs = @{
    8 = @{ Priority = "P1"; Size = "L"; Status = "Ready" }
    9 = @{ Priority = "P1"; Size = "M"; Status = "Ready" }
    10 = @{ Priority = "P1"; Size = "L"; Status = "Ready" }
    11 = @{ Priority = "P2"; Size = "S"; Status = "Ready" }
    12 = @{ Priority = "P1"; Size = "M"; Status = "Ready" }
}

foreach ($issueNum in $IssueNumbers) {
    Write-Host "========================================" -ForegroundColor Blue
    Write-Host "Processing issue #$issueNum" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Blue
    
    $issueConfig = $issueConfigs[$issueNum]
    if (-not $issueConfig) {
        Write-Host "  ⚠️  No configuration found for issue #$issueNum" -ForegroundColor Yellow
        continue
    }
    
    try {
        # Get issue ID
        $issueId = gh issue view $issueNum --json id -q .id
        if (-not $issueId) {
            Write-Host "  ❌ Issue #$issueNum not found" -ForegroundColor Red
            continue
        }
        Write-Host "  Issue ID: $issueId" -ForegroundColor Gray
        
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
            title
          }
        }
      }
    }
  }
}
"@
        
        $response = gh api graphql -f query=$graphqlQuery -f issueId=$issueId | ConvertFrom-Json
        $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $projectConfig.projectId } | Select-Object -First 1
        
        if (-not $projectItem) {
            Write-Host "  ⚠️  Issue not in project, adding..." -ForegroundColor Yellow
            $repoOwner = gh repo view --json owner -q .owner.login
            $repoName = gh repo view --json name -q .name
            $issueUrl = "https://github.com/$repoOwner/$repoName/issues/$issueNum"
            $addResult = gh project item-add $projectConfig.projectNumber --owner $config.organization --url $issueUrl 2>&1
            Write-Host "  Add result: $addResult" -ForegroundColor Gray
            
            # Wait a moment for the item to be added
            Start-Sleep -Seconds 2
            
            # Re-fetch project item ID
            $response = gh api graphql -f query=$graphqlQuery -f issueId=$issueId | ConvertFrom-Json
            $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $projectConfig.projectId } | Select-Object -First 1
        }
        
        if (-not $projectItem) {
            Write-Host "  ❌ Failed to get project item for issue #$issueNum" -ForegroundColor Red
            Write-Host "  Available projects:" -ForegroundColor Gray
            $response.data.node.projectItems.nodes | ForEach-Object { Write-Host "    - $($_.project.title) ($($_.project.id))" -ForegroundColor Gray }
            continue
        }
        
        $projectItemId = $projectItem.id
        Write-Host "  Project Item ID: $projectItemId" -ForegroundColor Gray
        Write-Host ""
        
        # Set Status
        if ($issueConfig.Status) {
            Write-Host "  Setting Status to: $($issueConfig.Status)" -ForegroundColor Yellow
            $statusFieldId = Get-ProjectFieldId -ProjectKey "workant" -FieldName "Status"
            $statusOptionId = Get-ProjectOptionId -ProjectKey "workant" -FieldName "Status" -OptionName $issueConfig.Status
            Write-Host "    Field ID: $statusFieldId" -ForegroundColor Gray
            Write-Host "    Option ID: $statusOptionId" -ForegroundColor Gray
            
            if ($statusFieldId -and $statusOptionId) {
                $result = gh project item-edit --id $projectItemId --field-id $statusFieldId --project-id $projectConfig.projectId --single-select-option-id $statusOptionId 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ Status set successfully" -ForegroundColor Green
                } else {
                    Write-Host "    ❌ Failed: $result" -ForegroundColor Red
                }
            } else {
                Write-Host "    ❌ Missing field or option ID" -ForegroundColor Red
            }
        }
        
        # Set Priority
        if ($issueConfig.Priority) {
            Write-Host "  Setting Priority to: $($issueConfig.Priority)" -ForegroundColor Yellow
            $priorityFieldId = Get-ProjectFieldId -ProjectKey "workant" -FieldName "Priority"
            $priorityOptionId = Get-ProjectOptionId -ProjectKey "workant" -FieldName "Priority" -OptionName $issueConfig.Priority
            Write-Host "    Field ID: $priorityFieldId" -ForegroundColor Gray
            Write-Host "    Option ID: $priorityOptionId" -ForegroundColor Gray
            
            if ($priorityFieldId -and $priorityOptionId) {
                $result = gh project item-edit --id $projectItemId --field-id $priorityFieldId --project-id $projectConfig.projectId --single-select-option-id $priorityOptionId 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ Priority set successfully" -ForegroundColor Green
                } else {
                    Write-Host "    ❌ Failed: $result" -ForegroundColor Red
                }
            } else {
                Write-Host "    ❌ Missing field or option ID" -ForegroundColor Red
            }
        }
        
        # Set Size
        if ($issueConfig.Size) {
            Write-Host "  Setting Size to: $($issueConfig.Size)" -ForegroundColor Yellow
            $sizeFieldId = Get-ProjectFieldId -ProjectKey "workant" -FieldName "Size"
            $sizeOptionId = Get-ProjectOptionId -ProjectKey "workant" -FieldName "Size" -OptionName $issueConfig.Size
            Write-Host "    Field ID: $sizeFieldId" -ForegroundColor Gray
            Write-Host "    Option ID: $sizeOptionId" -ForegroundColor Gray
            
            if ($sizeFieldId -and $sizeOptionId) {
                $result = gh project item-edit --id $projectItemId --field-id $sizeFieldId --project-id $projectConfig.projectId --single-select-option-id $sizeOptionId 2>&1
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "    ✅ Size set successfully" -ForegroundColor Green
                } else {
                    Write-Host "    ❌ Failed: $result" -ForegroundColor Red
                }
            } else {
                Write-Host "    ❌ Missing field or option ID" -ForegroundColor Red
            }
        }
        
        Write-Host ""
        Write-Host "  ✅ Issue #$issueNum configuration complete" -ForegroundColor Green
        Write-Host ""
        
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
        Write-Host ""
    }
}

Write-Host "========================================" -ForegroundColor Blue
Write-Host "✅ All issues processed!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Blue

