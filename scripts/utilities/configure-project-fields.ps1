#!/usr/bin/env pwsh
# Configure project fields for issues

param(
    [Parameter(Mandatory)]
    [int[]]$IssueNumbers,
    
    [string]$ProjectKey = "workant",
    [string]$Status = "Ready",
    [string]$Priority = "",
    [string]$Size = ""
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

Write-Host "Configuring project fields..." -ForegroundColor Blue
Write-Host ""

foreach ($issueNum in $IssueNumbers) {
    Write-Host "Configuring issue #$issueNum..." -ForegroundColor Yellow
    
    try {
        $issueId = gh issue view $issueNum --json id -q .id
        $response = gh api graphql -f query='query($issueId: ID!) { node(id: $issueId) { ... on Issue { projectItems(first: 10) { nodes { id project { id } } } } } }' -f issueId=$issueId | ConvertFrom-Json
        $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $projectConfig.projectId } | Select-Object -First 1
        
        if (-not $projectItem) {
            Write-Host "  ⚠️  Issue not in project, skipping" -ForegroundColor Yellow
            continue
        }
        
        $projectItemId = $projectItem.id
        
        # Set Status
        if ($Status) {
            $statusFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Status"
            $statusOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Status" -OptionName $Status
            if ($statusFieldId -and $statusOptionId) {
                gh project item-edit --id $projectItemId --field-id $statusFieldId --project-id $projectConfig.projectId --single-select-option-id $statusOptionId 2>&1 | Out-Null
                Write-Host "  ✅ Status: $Status" -ForegroundColor Green
            }
        }
        
        # Set Priority if specified
        if ($Priority) {
            $priorityFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Priority"
            $priorityOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Priority" -OptionName $Priority
            if ($priorityFieldId -and $priorityOptionId) {
                gh project item-edit --id $projectItemId --field-id $priorityFieldId --project-id $projectConfig.projectId --single-select-option-id $priorityOptionId 2>&1 | Out-Null
                Write-Host "  ✅ Priority: $Priority" -ForegroundColor Green
            }
        }
        
        # Set Size if specified
        if ($Size) {
            $sizeFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Size"
            $sizeOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Size" -OptionName $Size
            if ($sizeFieldId -and $sizeOptionId) {
                gh project item-edit --id $projectItemId --field-id $sizeFieldId --project-id $projectConfig.projectId --single-select-option-id $sizeOptionId 2>&1 | Out-Null
                Write-Host "  ✅ Size: $Size" -ForegroundColor Green
            }
        }
        
    } catch {
        Write-Host "  ❌ Error: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "✅ Project fields configured!" -ForegroundColor Green



