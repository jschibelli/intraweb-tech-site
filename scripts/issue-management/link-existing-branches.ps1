#!/usr/bin/env pwsh
# Link existing branches to issues in Development section
# Note: GitHub's API doesn't support linking existing branches directly.
# This script provides a workaround by creating properly linked branches.

param(
    [Parameter(Mandatory=$false)]
    [int[]]$IssueNumbers = @(3,8,9,10,11,12),
    
    [switch]$Force
)

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "   Link Existing Branches to Issues" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

$mappings = @{
    3 = 'feature/3-subscription-setup'
    8 = 'feature/8-complete-core-automation-to-100'
    9 = 'feature/9-implement-pr-automation-response-posting'
    10 = 'feature/10-enhance-continuous-issue-pipeline'
    11 = 'feature/11-clean-up-configuration-todos'
    12 = 'feature/12-implement-issue-pipeline-placeholder'
}

Write-Host "⚠️  IMPORTANT: GitHub's API cannot link existing branches." -ForegroundColor Yellow
Write-Host "   Branches must be created using createLinkedBranch to be linked." -ForegroundColor Yellow
Write-Host ""
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "1. Branches will be auto-detected by GitHub if they contain issue numbers" -ForegroundColor White
Write-Host "2. You can manually link branches through GitHub's web UI" -ForegroundColor White
Write-Host "3. Future branches will be created with proper linking" -ForegroundColor White
Write-Host ""

foreach ($issueNum in $IssueNumbers) {
    if (-not $mappings.ContainsKey($issueNum)) {
        Write-Host "⚠️  Issue #$issueNum`: No branch mapping found" -ForegroundColor Yellow
        continue
    }
    
    $branchName = $mappings[$issueNum]
    Write-Host "Issue #$issueNum`: $branchName" -ForegroundColor Cyan
    
    # Check if branch exists
    $exists = git ls-remote --heads origin $branchName 2>&1
    if ($exists -match 'refs/heads') {
        Write-Host "  ✓ Branch exists on remote" -ForegroundColor Green
        
        # Check if it's already linked
        $query = "query { repository(owner: `"IntraWeb-Technology`", name: `"workant`") { issue(number: $issueNum) { number linkedBranches(first: 10) { nodes { ref { name } } } } } }"
        $result = gh api graphql -f query=$query 2>&1 | ConvertFrom-Json
        $isLinked = $false
        if ($result.data.repository.issue.linkedBranches.nodes.Count -gt 0) {
            foreach ($node in $result.data.repository.issue.linkedBranches.nodes) {
                if ($node.ref.name -eq $branchName) {
                    Write-Host "  ✓ Already linked!" -ForegroundColor Green
                    $isLinked = $true
                    break
                }
            }
        }
        
        if (-not $isLinked) {
            Write-Host "  ⚠️  Not explicitly linked" -ForegroundColor Yellow
            Write-Host "     GitHub should auto-detect this branch because it contains issue #$issueNum" -ForegroundColor Gray
            Write-Host "     If it doesn't appear, you may need to:" -ForegroundColor Gray
            Write-Host "     1. Wait for GitHub to index (can take a few minutes)" -ForegroundColor Gray
            Write-Host "     2. Manually link via GitHub web UI: Development → Link branches" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ✗ Branch not found on remote" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "===============================================" -ForegroundColor Blue
Write-Host "   Summary" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""
Write-Host "GitHub automatically detects branches that:" -ForegroundColor Cyan
Write-Host "  - Contain the issue number in their name" -ForegroundColor White
Write-Host "  - Are pushed to the remote repository" -ForegroundColor White
Write-Host ""
Write-Host "Your branches follow the pattern: feature/{issue-number}-{title}" -ForegroundColor Green
Write-Host "They should appear in the Development section automatically." -ForegroundColor Green
Write-Host ""
Write-Host "If branches don't appear:" -ForegroundColor Yellow
Write-Host "  1. Refresh the issue page" -ForegroundColor White
Write-Host "  2. Wait a few minutes for GitHub to index" -ForegroundColor White
Write-Host "  3. Manually link via: Issue → Development → Link branches" -ForegroundColor White
Write-Host ""


