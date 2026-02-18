#requires -Version 7.0

param(
    [ValidateSet("local","remote","all")]
    [string]$Scope = "local",

    [ValidateSet("table","json","csv")]
    [string]$OutputFormat = "table",

    [int]$MaxAgeDays = 14,

    [string]$ReportPath,

    [switch]$AutoFix,

    [switch]$DryRun,

    [string]$BaseBranch = "develop",

    [switch]$PruneRemote
)

Import-Module "$PSScriptRoot\branch-utils.psm1" -Force

Write-ColorMessage "========================================" ([ConsoleColor]::Blue)
Write-ColorMessage "      Portfolio OS Branch Health" ([ConsoleColor]::Blue)
Write-ColorMessage "========================================" ([ConsoleColor]::Blue)

Write-ColorMessage "Scope: $Scope" ([ConsoleColor]::Gray)
Write-ColorMessage "Max age (days): $MaxAgeDays" ([ConsoleColor]::Gray)

Write-ColorMessage "Fetching latest branch data..." ([ConsoleColor]::Yellow)
Invoke-Git @("fetch","--all","--prune") | Out-Null

function Get-BranchRows {
    param(
        [string]$RefsPath,
        [string]$Category
    )

    $raw = Invoke-Git @("for-each-ref","--format=%(refname:short)|%(upstream:short)|%(committerdate:iso8601)","$RefsPath")
    foreach ($line in $raw) {
        if (-not $line) { continue }
        $parts = $line -split '\|'
        $branchName = $parts[0]
        $upstream = if ($parts.Length -ge 2) { $parts[1] } else { "" }
        $commitDate = if ($parts.Length -ge 3 -and $parts[2]) { [datetime]::Parse($parts[2]) } else { [datetime]::UtcNow }

        $issues = @()
        $metrics = $null

        try {
            $metrics = Get-BranchMetrics -BranchName $branchName -Upstream $upstream
        } catch {
            $issues += "Unable to collect metrics: $($_.Exception.Message)"
            $metrics = [pscustomobject]@{
                CommitDate = $commitDate
                Ahead = 0
                Behind = 0
            }
        }

        $age = [math]::Round(([datetime]::UtcNow - $metrics.CommitDate).TotalDays,2)

        if ($age -gt $MaxAgeDays) {
            $issues += "Stale (> $MaxAgeDays days)"
        }
        if ($Category -eq "local" -and -not $upstream) {
            $issues += "No upstream tracking"
        }
        if ($Category -eq "local") {
            $validation = Validate-BranchName -BranchName $branchName
            if (-not $validation.IsValid) {
                $issues += $validation.Issues
            }
        }

        [pscustomobject]@{
            Branch    = $branchName
            Category  = $Category
            Upstream  = $upstream
            LastCommit = $metrics.CommitDate
            AgeDays   = $age
            Ahead     = $metrics.Ahead
            Behind    = $metrics.Behind
            Issues    = $issues
        }
    }
}

$rows = @()
if ($Scope -in @("local","all")) {
    $rows += Get-BranchRows -RefsPath "refs/heads" -Category "local"
}
if ($Scope -in @("remote","all")) {
    $rows += Get-BranchRows -RefsPath "refs/remotes/origin" -Category "remote"
}

if (-not $rows) {
    Write-ColorMessage "No branches found for scope '$Scope'." ([ConsoleColor]::Yellow)
    exit 0
}

$rows = $rows | Sort-Object -Property AgeDays -Descending

if ($OutputFormat -eq "table") {
    $rows | Select-Object Branch,Category,AgeDays,Ahead,Behind,@{n="Issues";e={ ($_?.Issues -join '; ') }} | Format-Table -AutoSize
} elseif ($OutputFormat -eq "json") {
    $rows | ConvertTo-Json -Depth 4
} elseif ($OutputFormat -eq "csv") {
    $csvPath = if ($ReportPath) { $ReportPath } else { "branch-health.csv" }
    $rows | Export-Csv -Path $csvPath -NoTypeInformation
}

if ($ReportPath) {
    Write-JsonReport -Data $rows -Path $ReportPath
}

if ($AutoFix -and $Scope -in @("local","all")) {
    Write-ColorMessage "" ([ConsoleColor]::Gray)
    Write-ColorMessage "Auto-fix enabled. Evaluating stale merged branches..." ([ConsoleColor]::Yellow)

    $merged = Invoke-Git @("branch","--merged","origin/$BaseBranch") | ForEach-Object { $_.Trim().Replace("* ","") }
    $candidates = $rows | Where-Object {
        $_.Category -eq "local" -and
        $_.Branch -ne $BaseBranch -and
        $_.Branch -ne "main" -and
        $_.Issues -match "Stale" -and
        $merged -contains $_.Branch
    }

    foreach ($candidate in $candidates) {
        if ($DryRun) {
            Write-ColorMessage "[DRY RUN] Would delete stale merged branch '$($candidate.Branch)'" ([ConsoleColor]::Cyan)
            continue
        }

        try {
            Invoke-Git @("branch","-d",$candidate.Branch) | Out-Null
            Write-ColorMessage "🧹 Deleted stale branch '$($candidate.Branch)'" ([ConsoleColor]::Green)
        } catch {
            Write-ColorMessage "Failed to delete $($candidate.Branch): $($_.Exception.Message)" ([ConsoleColor]::Red)
        }
    }
}

if ($AutoFix -and $PruneRemote -and $Scope -in @("remote","all")) {
    Write-ColorMessage "" ([ConsoleColor]::Gray)
    Write-ColorMessage "Remote prune enabled. Evaluating stale merged remote branches..." ([ConsoleColor]::Yellow)

    $mergedRemote = Invoke-Git @("branch","-r","--merged","origin/$BaseBranch") | ForEach-Object {
        $_.Trim() -replace '^\* ', ''
    }

    $remoteCandidates = $rows | Where-Object {
        $_.Category -eq "remote" -and
        $_.Branch -like "origin/*" -and
        $_.Branch -notin @("origin/main","origin/develop") -and
        $mergedRemote -contains $_.Branch -and
        ($_.Issues | Where-Object { $_ -like "Stale*" }).Count -gt 0
    }

    foreach ($candidate in $remoteCandidates) {
        $remoteBranch = $candidate.Branch -replace '^origin/', ''
        if ($DryRun) {
            Write-ColorMessage "[DRY RUN] Would delete remote stale branch '$remoteBranch'" ([ConsoleColor]::Cyan)
            continue
        }

        try {
            Invoke-Git @("push","origin","--delete",$remoteBranch) | Out-Null
            Write-ColorMessage "🧹 Deleted remote branch '$remoteBranch'" ([ConsoleColor]::Green)
        } catch {
            Write-ColorMessage "Failed to delete remote branch '$remoteBranch': $($_.Exception.Message)" ([ConsoleColor]::Red)
        }
    }
}

Write-ColorMessage "" ([ConsoleColor]::Gray)
Write-ColorMessage "Audit complete. Total branches analyzed: $($rows.Count)" ([ConsoleColor]::Green)

