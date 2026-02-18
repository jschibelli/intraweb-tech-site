#!/usr/bin/env pwsh
<#
.SYNOPSIS
  One-off script to fix an issue body formatting.

.DESCRIPTION
  This started as a one-time script for issue #8 and intentionally lives under
  scripts/utilities/one-off/. It can be re-used by passing -IssueNumber and/or
  -BodyFilePath, but the default content remains issue-8 specific.
#>

[CmdletBinding()]
param(
    [int]$IssueNumber = 8,
    [string]$BodyFilePath
)

$ErrorActionPreference = "Stop"

$formattedBody = @"
## Overview

Complete all remaining gaps in the core automation system to bring it from **85-90% to 100% completion**.

## Current Status

Core automation is **85-90% complete** with the following gaps:

1. **PR automation response posting** - TODO in `pr-automation-unified.ps1`
2. **Continuous pipeline enhancement** - Basic implementation needs improvement
3. **Configuration TODOs cleanup** - Several TODOs in configuration scripts
4. **Issue pipeline placeholder** - Placeholder implementation needs completion

## Goals

- ✅ Complete all identified gaps
- ✅ Remove all TODOs and placeholders
- ✅ Enhance continuous pipeline with better error handling and retry logic
- ✅ Add comprehensive testing for all automation scripts
- ✅ Improve documentation for completed features

## Success Criteria

- [ ] All TODOs resolved
- [ ] All placeholders implemented
- [ ] Continuous pipeline is production-ready
- [ ] All scripts have error handling
- [ ] Documentation updated
- [ ] Tests added for critical paths

## Sub-Issues

- [ ] #9 - Implement PR Automation Response Posting
- [ ] #10 - Enhance Continuous Issue Pipeline
- [ ] #11 - Clean Up Configuration TODOs
- [ ] #12 - Implement Issue Pipeline Placeholder

## Notes

This epic tracks the completion of core automation features to achieve 100% functionality.
"@

$bodyToApply = $formattedBody
if ($BodyFilePath) {
    if (-not (Test-Path $BodyFilePath)) {
        throw "Body file not found: $BodyFilePath"
    }
    $bodyToApply = Get-Content -Path $BodyFilePath -Raw
}

$tempFile = [System.IO.Path]::GetTempFileName()
$bodyToApply | Out-File -FilePath $tempFile -Encoding utf8 -NoNewline

Write-Host "Updating issue #$IssueNumber formatting..." -ForegroundColor Yellow
gh issue edit $IssueNumber --body-file $tempFile
Remove-Item $tempFile

Write-Host "✅ Issue #$IssueNumber formatting updated!" -ForegroundColor Green



