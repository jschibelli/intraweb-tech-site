#requires -Version 7.0
<#
.SYNOPSIS
  Legacy compatibility wrapper for PR auto-configuration.

.DESCRIPTION
  The active implementation lives in `scripts/automation/auto-configure-pr.ps1`.
  This wrapper remains so existing docs/commands don't break.
#>
[CmdletBinding()]
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [object[]]$RemainingArgs
)

$ErrorActionPreference = "Stop"

try {
    $thisDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    $scriptsDir = Split-Path -Parent $thisDir
    $target = Join-Path $scriptsDir "automation\auto-configure-pr.ps1"

    if (-not (Test-Path $target)) {
        throw "Target script not found: $target"
    }

    Write-Host "ℹ️  Forwarding to: scripts/automation/auto-configure-pr.ps1" -ForegroundColor Gray
    & $target @RemainingArgs
    exit $LASTEXITCODE
} catch {
    Write-Host "❌ Failed to run auto-configure-pr wrapper: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

