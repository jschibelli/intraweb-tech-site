#!/usr/bin/env pwsh
# Update issue bodies to reference parent/child relationships

param(
    [Parameter(Mandatory)]
    [int]$ParentIssue,
    
    [Parameter(Mandatory)]
    [int[]]$SubIssues
)

$ErrorActionPreference = "Stop"

Write-Host "Updating issue references..." -ForegroundColor Blue
Write-Host ""

# Fetch parent title once so we can reference it consistently (and avoid hardcoding).
$parentTitle = gh issue view $ParentIssue --json title -q .title
if (-not $parentTitle) { $parentTitle = "(unknown title)" }

# Update parent issue with sub-issues list
Write-Host "Updating parent issue #$ParentIssue..." -ForegroundColor Yellow
$parentBody = gh issue view $ParentIssue --json body -q .body
$subIssuesList = @"
`n`n## Sub-Issues`n`n
"@
foreach ($subIssue in $SubIssues) {
    $subIssueTitle = gh issue view $subIssue --json title -q .title
    $subIssuesList += "- [ ] #$subIssue - $subIssueTitle`n"
}

if ($parentBody -match "(?im)^##\\s+Sub-Issues\\b") {
    Write-Host "  ⚠️  Parent issue already contains a Sub-Issues section; skipping parent update." -ForegroundColor Yellow
} else {
    $newParentBody = $parentBody + $subIssuesList
    $tempFile = [System.IO.Path]::GetTempFileName()
    $newParentBody | Out-File -FilePath $tempFile -Encoding utf8 -NoNewline
    gh issue edit $ParentIssue --body-file $tempFile
    Remove-Item $tempFile
    Write-Host "  ✅ Updated parent issue #$ParentIssue" -ForegroundColor Green
}
Write-Host ""

# Update each sub-issue with parent reference
foreach ($subIssue in $SubIssues) {
    Write-Host "Updating sub-issue #$subIssue..." -ForegroundColor Yellow
    $subBody = gh issue view $subIssue --json body -q .body
    
    $parentPattern = "(?im)\\*\\*Parent Issue:\\*\\*\\s*#${ParentIssue}\\b"
    if ($subBody -notmatch $parentPattern) {
        $parentRef = "`n`n---`n`n**Parent Issue:** #$ParentIssue - $parentTitle"
        $newSubBody = $subBody + $parentRef
        $tempFile = [System.IO.Path]::GetTempFileName()
        $newSubBody | Out-File -FilePath $tempFile -Encoding utf8 -NoNewline
        gh issue edit $subIssue --body-file $tempFile
        Remove-Item $tempFile
        Write-Host "  ✅ Updated sub-issue #$subIssue" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  Sub-issue #$subIssue already has parent reference" -ForegroundColor Yellow
    }
    Write-Host ""
}

Write-Host "✅ All issue references updated!" -ForegroundColor Green



