#requires -Version 7.0

param(
    [ValidateSet("custom","blog","dashboard","docs","infra")]
    [string]$Preset = "custom",

    [int[]]$Issues,

    [string]$ConfigPath,

    [string]$Source = "develop",

    [string]$Pattern = "{type}/{issue-number}-{title}",

    [string]$Type = "feature",

    [switch]$Push,

    [switch]$DryRun,

    [switch]$Force,

    [string]$ReportPath
)

Import-Module "$PSScriptRoot\branch-utils.psm1" -Force

$presetIssues = @{
    blog      = 196..208
    dashboard = 150..160
    docs      = 180..190
    infra     = 170..179
}

function Resolve-IssueItems {
    if ($ConfigPath) {
        if (-not (Test-Path $ConfigPath)) {
            throw "Config file '$ConfigPath' not found."
        }
        $content = Get-Content -Raw -Path $ConfigPath | ConvertFrom-Json
        return $content
    }
    if ($Preset -ne "custom") {
        return $presetIssues[$Preset]
    }
    if ($Issues) {
        return $Issues
    }
    throw "No issues specified. Provide -Issues, -ConfigPath, or -Preset."
}

$issueItemsRaw = Resolve-IssueItems

$issueItems = foreach ($item in $issueItemsRaw) {
    if ($item -is [int]) {
        [pscustomobject]@{ Number = $item; Type = $Type }
    } elseif ($item.PSObject.Properties.Match("number").Count -gt 0) {
        [pscustomobject]@{
            Number = [int]$item.number
            Type   = if ($item.type) { $item.type } else { $Type }
            Pattern = if ($item.pattern) { $item.pattern } else { $Pattern }
        }
    } else {
        throw "Invalid issue descriptor: $item"
    }
}

Write-ColorMessage "============================================" ([ConsoleColor]::Blue)
Write-ColorMessage "   Portfolio OS Batch Branch Orchestrator" ([ConsoleColor]::Blue)
Write-ColorMessage "============================================" ([ConsoleColor]::Blue)
Write-ColorMessage "Issues: $($issueItems.Count)" ([ConsoleColor]::Gray)
Write-ColorMessage "Source: $Source" ([ConsoleColor]::Gray)

if (-not $DryRun) {
    Ensure-BaseBranch -Name $Source -Checkout -PullLatest -Quiet
}

$results = @()
$startBranch = Get-CurrentBranch

foreach ($issue in $issueItems) {
    $issueNumber = $issue.Number
    $issueType = if ($issue.Type) { $issue.Type } else { $Type }
    $pattern = if ($issue.Pattern) { $issue.Pattern } else { $Pattern }

    Write-ColorMessage "Processing issue #$issueNumber..." ([ConsoleColor]::Yellow)

    $title = Get-IssueTitle -IssueNumber $issueNumber
    $branchName = Generate-BranchName -IssueNumber $issueNumber -IssueTitle $title -Type $issueType -Pattern $pattern

    # Enforce naming convention early so we never create invalid branches.
    $validation = Validate-BranchName -BranchName $branchName
    if (-not $validation.IsValid) {
        $msg = "Invalid branch name generated: '$branchName'`n" + (($validation.Issues | ForEach-Object { " - $_" }) -join "`n")
        throw $msg
    }

    $branchExists = & git branch --list $branchName
    $status = "Pending"
    $details = ""

    if ($branchExists -and -not $Force) {
        $status = "Skipped"
        $details = "Branch already exists."
        Write-ColorMessage "  ⚠️  Branch $branchName already exists. Use -Force to recreate." ([ConsoleColor]::Yellow)
        $results += [pscustomobject]@{ Issue=$issueNumber; Branch=$branchName; Status=$status; Details=$details }
        continue
    }

    if ($DryRun) {
        Write-ColorMessage "  [DRY RUN] Would create $branchName from $Source" ([ConsoleColor]::Cyan)
        if ($Push) {
            Write-ColorMessage "  [DRY RUN] Would push branch to origin" ([ConsoleColor]::Cyan)
        }
        $status = "DryRun"
        $results += [pscustomobject]@{ Issue=$issueNumber; Branch=$branchName; Status=$status; Details="Simulated" }
        continue
    }

    try {
        if ($branchExists -and $Force) {
            Invoke-Git @("branch","-D",$branchName) | Out-Null
        }

        Ensure-BaseBranch -Name $Source -Checkout -PullLatest -Quiet
        Invoke-Git @("checkout","-b",$branchName) | Out-Null

        if ($Push) {
            Invoke-Git @("push","-u","origin",$branchName) | Out-Null
        }

        Write-ColorMessage "  ✅ Created $branchName" ([ConsoleColor]::Green)
        $status = "Created"
        $details = "Created from $Source"
    } catch {
        Write-ColorMessage "  ❌ Failed to create $branchName: $($_.Exception.Message)" ([ConsoleColor]::Red)
        $status = "Failed"
        $details = $_.Exception.Message
    } finally {
        if ($Source -and (Get-CurrentBranch) -ne $Source) {
            Invoke-Git @("checkout",$Source) | Out-Null
        }
    }

    $results += [pscustomobject]@{
        Issue = $issueNumber
        Branch = $branchName
        Status = $status
        Details = $details
    }
}

if ($startBranch -and (Get-CurrentBranch) -ne $startBranch) {
    Invoke-Git @("checkout",$startBranch) | Out-Null
}

Write-ColorMessage "============================================" ([ConsoleColor]::Blue)
Write-ColorMessage "Batch complete. Success: $((($results | Where-Object { $_.Status -eq 'Created' }).Count)) / $($results.Count)" ([ConsoleColor]::Green)

if ($ReportPath) {
    Write-JsonReport -Data $results -Path $ReportPath
}

$results | ConvertTo-Json -Depth 4

