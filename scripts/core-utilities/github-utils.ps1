# GitHub utilities compatibility shim
#
# Some legacy scripts dot-source `scripts/core-utilities/github-utils.ps1`.
# The canonical implementation lives in `get-github-utilities.ps1`.
#
# This shim keeps older scripts working without duplicating logic.

$ErrorActionPreference = "Stop"

$here = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$impl = Join-Path $here "get-github-utilities.ps1"

if (-not (Test-Path $impl)) {
    throw "GitHub utilities implementation not found: $impl"
}

. $impl



