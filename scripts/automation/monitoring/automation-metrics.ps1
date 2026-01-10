#requires -Version 7.0
[CmdletBinding()]
param(
    [ValidateSet("status", "export")]
    [string]$Operation = "status",
    [string]$ExportTo,
    [int]$TimeRange = 7,
    [switch]$RealTime,
    [switch]$Detailed
)

$ErrorActionPreference = "Stop"
$logDir = "logs/automation"

if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

function Get-LogFiles {
    param([int]$Days)
    $cutoff = (Get-Date).AddDays(-$Days)
    return Get-ChildItem $logDir -Filter "*.log" -ErrorAction SilentlyContinue | Where-Object { $_.LastWriteTime -ge $cutoff }
}

function Parse-Metrics {
    param([System.IO.FileInfo[]]$Files)
    $stats = [ordered]@{
        IssuesProcessed = 0
        PRsAnalyzed     = 0
        Errors          = 0
    }
    foreach ($file in $Files) {
        Get-Content $file | ForEach-Object {
            if ($_ -match "ISSUE_PROCESSED") { $stats.IssuesProcessed++ }
            elseif ($_ -match "PR_ANALYZED") { $stats.PRsAnalyzed++ }
            elseif ($_ -match "ERROR") { $stats.Errors++ }
        }
    }
    return [pscustomobject]$stats
}

function Export-Metrics {
    param($Metrics, [string]$Path)
    $Metrics | ConvertTo-Json | Out-File -FilePath $Path -Encoding utf8
    Write-Host "Metrics exported to $Path" -ForegroundColor Green
}

do {
    $files = Get-LogFiles -Days $TimeRange
    $metrics = Parse-Metrics -Files $files

    if ($Operation -eq "status") {
        $metrics | Format-List
    } elseif ($Operation -eq "export") {
        if (-not $ExportTo) { throw "Specify -ExportTo when using export operation." }
        Export-Metrics -Metrics $metrics -Path $ExportTo
    }

    if ($RealTime) {
        Start-Sleep -Seconds 30
    }
} while ($RealTime)

