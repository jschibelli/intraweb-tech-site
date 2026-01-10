#requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet("list", "status", "add", "process", "create", "clear")]
    [string]$Operation,
    [string]$Queue = "default",
    [int]$IssueNumber,
    [string]$Priority = "P1",
    [string]$App,
    [string]$Area,
    [int]$MaxConcurrent = 2,
    [switch]$DryRun
)

$queueDir = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "queues"
if (-not (Test-Path $queueDir)) {
    New-Item -ItemType Directory -Path $queueDir | Out-Null
}

function Get-QueuePath { Join-Path $queueDir "$Queue.json" }

function Read-Queue {
    $path = Get-QueuePath
    if (-not (Test-Path $path)) {
        return @{ metadata = @{ queue = $Queue; maxConcurrent = $MaxConcurrent }; items = @() }
    }
    return Get-Content $path | ConvertFrom-Json -Depth 4
}

function Write-Queue {
    param($Data)
    $Data | ConvertTo-Json -Depth 5 | Out-File (Get-QueuePath)
}

switch ($Operation) {
    "list" {
        Get-ChildItem $queueDir -Filter "*.json" | ForEach-Object { $_.BaseName } | ForEach-Object { Write-Host $_ }
    }
    "status" {
        $queue = Read-Queue
        Write-Host "Queue: $($queue.metadata.queue)" -ForegroundColor Cyan
        Write-Host "Items: $($queue.items.Count)"
    }
    "create" {
        Write-Queue -Data @{ metadata = @{ queue = $Queue; maxConcurrent = $MaxConcurrent }; items = @() }
        Write-Host "Queue '$Queue' created."
    }
    "add" {
        if (-not $IssueNumber) { throw "Specify IssueNumber when adding." }
        $queue = Read-Queue
        $queue.items += @{
            issueNumber = $IssueNumber
            priority    = $Priority
            app         = $App
            area        = $Area
            added       = Get-Date
        }
        Write-Queue -Data $queue
        Write-Host "Issue #$IssueNumber enqueued."
    }
    "process" {
        $queue = Read-Queue
        if ($queue.items.Count -eq 0) {
            Write-Host "Queue empty." -ForegroundColor Yellow
            break
        }
        $batch = $queue.items | Select-Object -First $MaxConcurrent
        $scriptPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "continuous-issue-pipeline.ps1"
        foreach ($item in $batch) {
            if ($DryRun) {
                Write-Host "[DryRun] Would process issue #$($item.issueNumber)"
            } else {
                & $scriptPath -MaxIssues 1 -DryRun:$true | Out-Null
            }
        }
        $queue.items = $queue.items | Where-Object { $batch -notcontains $_ }
        Write-Queue -Data $queue
    }
    "clear" {
        Remove-Item (Get-QueuePath) -ErrorAction SilentlyContinue
        Write-Host "Queue cleared."
    }
}

