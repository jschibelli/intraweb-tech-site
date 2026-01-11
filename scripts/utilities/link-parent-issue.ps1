#!/usr/bin/env pwsh
# Link sub-issues to a parent issue in GitHub project

param(
    [Parameter(Mandatory)]
    [int]$ParentIssue,
    
    [Parameter(Mandatory)]
    [int[]]$SubIssues,
    
    [string]$ProjectId = "PVT_kwDOCobWKc4BKne5",
    [string]$ParentFieldId = "PVTF_lADOCobWKc4BKne5zg6bnkU"
)

$ErrorActionPreference = "Stop"

Write-Host "Linking sub-issues to parent issue #$ParentIssue..." -ForegroundColor Blue
Write-Host ""

# Get parent issue ID
$parentIssueId = gh issue view $ParentIssue --json id -q .id
if (-not $parentIssueId) {
    Write-Host "❌ Parent issue #$ParentIssue not found" -ForegroundColor Red
    exit 1
}

Write-Host "Parent issue ID: $parentIssueId" -ForegroundColor Gray
Write-Host ""

foreach ($subIssue in $SubIssues) {
    Write-Host "Processing issue #$subIssue..." -ForegroundColor Yellow
    
    # Get sub-issue ID
    $subIssueId = gh issue view $subIssue --json id -q .id
    if (-not $subIssueId) {
        Write-Host "  ⚠️  Issue #$subIssue not found, skipping" -ForegroundColor Yellow
        continue
    }
    
    # Get project item ID for sub-issue
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
    
    $response = gh api graphql -f query=$graphqlQuery -f issueId=$subIssueId | ConvertFrom-Json
    $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $ProjectId } | Select-Object -First 1
    
    if (-not $projectItem) {
        Write-Host "  ⚠️  Issue #$subIssue not found in project, skipping" -ForegroundColor Yellow
        continue
    }
    
    $projectItemId = $projectItem.id
    Write-Host "  Project item ID: $projectItemId" -ForegroundColor Gray
    
    # Link to parent using GraphQL mutation
    $mutation = @"
mutation(`$projectId: ID!, `$projectItemId: ID!, `$parentFieldId: ID!, `$parentIssueId: ID!) {
  updateProjectV2ItemFieldValue(
    input: {
      projectId: `$projectId
      itemId: `$projectItemId
      fieldId: `$parentFieldId
      value: {
        issueId: `$parentIssueId
      }
    }
  ) {
    projectV2Item {
      id
    }
  }
}
"@
    
    try {
        $result = gh api graphql -f query=$mutation `
            -f projectId=$ProjectId `
            -f projectItemId=$projectItemId `
            -f parentFieldId=$ParentFieldId `
            -f parentIssueId=$parentIssueId 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Linked issue #$subIssue to parent #$ParentIssue" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️  Failed to link: $result" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Error linking issue #$subIssue : $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

Write-Host "✅ Linking complete!" -ForegroundColor Green



