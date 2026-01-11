#!/usr/bin/env pwsh
# Triage issues: format, assign, label, and configure project fields

param(
    [Parameter(Mandatory)]
    [int[]]$IssueNumbers,
    
    [Parameter(Mandatory)]
    [string]$Assignee,
    
    [string[]]$Labels = @(),
    
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

Write-Host "Triaging issues..." -ForegroundColor Blue
Write-Host ""

foreach ($issueNum in $IssueNumbers) {
    Write-Host "Processing issue #$issueNum..." -ForegroundColor Yellow
    
    # Assign issue
    try {
        gh issue edit $issueNum --add-assignee $Assignee 2>&1 | Out-Null
        Write-Host "  ✅ Assigned to $Assignee" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Failed to assign: $_" -ForegroundColor Yellow
    }
    
    # Add labels
    if ($Labels.Count -gt 0) {
        try {
            $labelsStr = $Labels -join ","
            gh issue edit $issueNum --add-label $labelsStr 2>&1 | Out-Null
            Write-Host "  ✅ Added labels: $labelsStr" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Failed to add labels: $_" -ForegroundColor Yellow
        }
    }
    
    # Get project item ID and update fields
    try {
        $issueId = gh issue view $issueNum --json id -q .id
        $projectItemId = (gh api graphql -f query='query($issueId: ID!) { node(id: $issueId) { ... on Issue { projectItems(first: 10) { nodes { id project { id } } } } } }' -f issueId=$issueId | ConvertFrom-Json).data.node.projectItems.nodes | Where-Object { $_.project.id -eq $projectConfig.projectId } | Select-Object -First 1 -ExpandProperty id
        
        if ($projectItemId) {
            # Ensure Status is set to "Ready" if not already set
            $statusFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Status"
            $statusOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Status" -OptionName "Ready"
            if ($statusFieldId -and $statusOptionId) {
                gh project item-edit --id $projectItemId --field-id $statusFieldId --project-id $projectConfig.projectId --single-select-option-id $statusOptionId 2>&1 | Out-Null
                Write-Host "  ✅ Set Status to 'Ready'" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "  ⚠️  Failed to update project fields: $_" -ForegroundColor Yellow
    }
    
    Write-Host ""
}

Write-Host "✅ Triaging complete!" -ForegroundColor Green



