#!/usr/bin/env pwsh
# Configure project cards for all created issues using automation

param(
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

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "  Configuring Project Cards for Issues" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

# Issue configurations
$issueConfigs = @{
    8 = @{
        Priority = "P1"
        Size = "L"
        Status = "Ready"
        Description = "Parent epic - Complete Core Automation to 100%"
    }
    9 = @{
        Priority = "P1"
        Size = "M"
        Status = "Ready"
        Description = "Implement PR Automation Response Posting"
    }
    10 = @{
        Priority = "P1"
        Size = "L"
        Status = "Ready"
        Description = "Enhance Continuous Issue Pipeline"
    }
    11 = @{
        Priority = "P2"
        Size = "S"
        Status = "Ready"
        Description = "Clean Up Configuration TODOs"
    }
    12 = @{
        Priority = "P1"
        Size = "M"
        Status = "Ready"
        Description = "Implement Issue Pipeline Placeholder"
    }
}

foreach ($issueNum in $issueConfigs.Keys | Sort-Object) {
    $issueConfig = $issueConfigs[$issueNum]
    
    Write-Host "Configuring issue #$issueNum : $($issueConfig.Description)" -ForegroundColor Cyan
    Write-Host "  Priority: $($issueConfig.Priority), Size: $($issueConfig.Size), Status: $($issueConfig.Status)" -ForegroundColor Gray
    
    try {
        # Get issue ID
        $issueId = gh issue view $issueNum --json id -q .id
        if (-not $issueId) {
            Write-Host "  ⚠️  Issue #$issueNum not found, skipping" -ForegroundColor Yellow
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
        $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $projectConfig.projectId } | Select-Object -First 1
        
        if (-not $projectItem) {
            Write-Host "  ⚠️  Issue #$issueNum not in project, adding..." -ForegroundColor Yellow
            $repoOwner = gh repo view --json owner -q .owner.login
            $repoName = gh repo view --json name -q .name
            $issueUrl = "https://github.com/$repoOwner/$repoName/issues/$issueNum"
            gh project item-add $projectConfig.projectNumber --owner $config.organization --url $issueUrl 2>&1 | Out-Null
            
            # Re-fetch project item ID
            $response = gh api graphql -f query=$graphqlQuery -f issueId=$issueId | ConvertFrom-Json
            $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $projectConfig.projectId } | Select-Object -First 1
        }
        
        if (-not $projectItem) {
            Write-Host "  ❌ Failed to get project item for issue #$issueNum" -ForegroundColor Red
            continue
        }
        
        $projectItemId = $projectItem.id
        
        # Set Status
        if ($issueConfig.Status) {
            $statusFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Status"
            $statusOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Status" -OptionName $issueConfig.Status
            if ($statusFieldId -and $statusOptionId) {
                gh project item-edit --id $projectItemId --field-id $statusFieldId --project-id $projectConfig.projectId --single-select-option-id $statusOptionId 2>&1 | Out-Null
                Write-Host "  ✅ Status: $($issueConfig.Status)" -ForegroundColor Green
            }
        }
        
        # Set Priority
        if ($issueConfig.Priority) {
            $priorityFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Priority"
            $priorityOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Priority" -OptionName $issueConfig.Priority
            if ($priorityFieldId -and $priorityOptionId) {
                gh project item-edit --id $projectItemId --field-id $priorityFieldId --project-id $projectConfig.projectId --single-select-option-id $priorityOptionId 2>&1 | Out-Null
                Write-Host "  ✅ Priority: $($issueConfig.Priority)" -ForegroundColor Green
            }
        }
        
        # Set Size
        if ($issueConfig.Size) {
            $sizeFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Size"
            $sizeOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Size" -OptionName $issueConfig.Size
            if ($sizeFieldId -and $sizeOptionId) {
                gh project item-edit --id $projectItemId --field-id $sizeFieldId --project-id $projectConfig.projectId --single-select-option-id $sizeOptionId 2>&1 | Out-Null
                Write-Host "  ✅ Size: $($issueConfig.Size)" -ForegroundColor Green
            }
        }
        
        Write-Host "  ✅ Issue #$issueNum configured successfully" -ForegroundColor Green
        
    } catch {
        Write-Host "  ❌ Error configuring issue #$issueNum : $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "  ✅ All project cards configured!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Blue

