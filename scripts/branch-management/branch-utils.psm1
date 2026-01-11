<#
.SYNOPSIS
Shared helpers for Portfolio OS branch automation scripts.

.NOTES
PowerShell 7+, requires git and gh CLI in PATH.
#>

Set-StrictMode -Version Latest

function Write-ColorMessage {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [AllowEmptyString()]
        [string]$Message,

        [ConsoleColor]$Color = [ConsoleColor]::Gray,

        [switch]$NoNewline
    )

    if ([string]::IsNullOrEmpty($Message)) {
        if ($NoNewline) {
            Write-Host "" -NoNewline
        } else {
            Write-Host ""
        }
        return
    }

    if ($NoNewline) {
        Write-Host $Message -ForegroundColor $Color -NoNewline
    } else {
        Write-Host $Message -ForegroundColor $Color
    }
}

function Invoke-Git {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true, ValueFromRemainingArguments=$true)]
        [string[]]$Arguments,

        [switch]$PassThru
    )

    $output = & git @Arguments 2>&1
    $exitCode = $LASTEXITCODE

    $result = [pscustomobject]@{
        Arguments = $Arguments -join ' '
        Output    = $output
        ExitCode  = $exitCode
    }

    if ($exitCode -ne 0) {
        throw "Git command failed ($($result.Arguments)): $output"
    }

    if ($PassThru) {
        return $result
    }

    return $output
}

function Get-CurrentBranch {
    try {
        $branch = Invoke-Git @("branch","--show-current")
        return ($branch | Select-Object -First 1).Trim()
    } catch {
        return $null
    }
}

function Test-WorkingTreeClean {
    [CmdletBinding()]
    param()

    $status = Invoke-Git @("status","--porcelain")
    return [string]::IsNullOrWhiteSpace(($status -join '').Trim())
}

function Ensure-BaseBranch {
    [CmdletBinding()]
    param(
        [string]$Name = "develop",
        [switch]$Checkout,
        [switch]$PullLatest,
        [switch]$Quiet
    )

    $currentBranch = Get-CurrentBranch
    $returnBranch = $currentBranch

    try {
        Invoke-Git @("rev-parse","--verify",$Name) | Out-Null
    } catch {
        throw "Base branch '$Name' does not exist locally."
    }

    $needsCheckout = $Checkout -or ($PullLatest -and $currentBranch -ne $Name)

    if ($needsCheckout -and $currentBranch -ne $Name) {
        Invoke-Git @("checkout",$Name) | Out-Null
    }

    if ($Checkout) {
        $returnBranch = $Name
    }

    if ($PullLatest) {
        Invoke-Git @("pull","origin",$Name) | Out-Null
    }

    if ($needsCheckout -and -not $Checkout -and $returnBranch -and $returnBranch -ne $Name) {
        Invoke-Git @("checkout",$returnBranch) | Out-Null
    }

    if (-not $Quiet) {
        Write-ColorMessage "✅ Ensured base branch '$Name'" ([ConsoleColor]::Green)
    }
}

function Get-IssueTitle {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [int]$IssueNumber
    )

    try {
        $title = gh issue view $IssueNumber --json title -q .title
        if (-not $title) {
            throw "Empty response"
        }
        return $title
    } catch {
        Write-ColorMessage "⚠️  Unable to fetch issue #$IssueNumber title via gh CLI. Using fallback." ([ConsoleColor]::Yellow)
        return "issue-$IssueNumber"
    }
}

function Sanitize-BranchSegment {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$Value
    )

    $clean = $Value.ToLower()
    $clean = $clean -replace '[^a-z0-9\-_/]', '-'
    $clean = $clean -replace '\s+', '-'
    $clean = $clean -replace '-{2,}', '-'
    $clean = $clean.Trim('-','/')
    if (-not $clean) {
        return "branch"
    }
    return $clean
}

function Generate-BranchName {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [int]$IssueNumber,

        [Parameter(Mandatory=$true)]
        [string]$IssueTitle,

        [string]$Type = "feature",

        [string]$Pattern = "feature/{issue-number}-{title}"
    )

    $map = @{
        "type"          = Sanitize-BranchSegment -Value $Type
        "issue-number"  = $IssueNumber
        "title"         = Sanitize-BranchSegment -Value $IssueTitle
    }

    $branchName = $Pattern
    foreach ($key in $map.Keys) {
        $patternToken = "\{$key\}"
        $branchName = $branchName -replace $patternToken, [string]$map[$key]
    }

    return Sanitize-BranchSegment -Value $branchName
}

function Validate-BranchName {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$BranchName,

        # Validation mode:
        # - Issue: require <type>/<issue-number>-<slug> (slug optional unless RequireSlug)
        # - Any: allow either Issue branches OR non-issue branches like release/<name>, docs/<name>, etc.
        [ValidateSet("Issue","Any")]
        [string]$Mode = "Issue",

        # Allowed issue type prefixes (first path segment) for Issue branches
        # Note: `feat` is accepted as an alias for `feature` (used by some automation flows).
        [string[]]$AllowedIssueTypes = @("feature", "feat", "bugfix", "hotfix", "chore"),

        # Allowed non-issue prefixes for Any mode (do NOT require issue number)
        # Note: `feat` is included because some worktree/agent flows use BranchPrefix like `feat/frontend`.
        [string[]]$AllowedNonIssuePrefixes = @("release", "spike", "docs", "experiment", "agent", "feat"),

        # If set, require a `-slug` after the issue number (recommended for readability)
        [switch]$RequireSlug
    )

    $issues = @()

    $bn = ($BranchName ?? "").Trim()
    if (-not $bn) {
        $issues += "Branch name is empty."
    } else {
        # 1) Validate against git's own ref rules (no spaces, no .., no @{}, etc.)
        try {
            & git check-ref-format --branch $bn 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) {
                $issues += "Not a valid git branch name (git check-ref-format failed)."
            }
        } catch {
            # If git isn't available here, we still validate convention below.
        }

        # 2) Enforce convention: type/<issue>-slug (slug optional unless RequireSlug)
        $issueTypesPattern = ($AllowedIssueTypes | ForEach-Object { [Regex]::Escape($_) }) -join "|"
        $nonIssuePattern = ($AllowedNonIssuePrefixes | ForEach-Object { [Regex]::Escape($_) }) -join "|"

        # Issue branches may include extra path segments (area/team), but must end with `<issue>-<slug>`.
        # Examples:
        # - feature/123-add-login
        # - feat/frontend/123-add-login
        # - bugfix/api/9-fix-typo
        $issueRx = if ($RequireSlug) {
            "^(?:$issueTypesPattern)(?:\/[a-z0-9][a-z0-9-]*)*\/\d+-[a-z0-9][a-z0-9-]*$"
        } else {
            "^(?:$issueTypesPattern)(?:\/[a-z0-9][a-z0-9-]*)*\/\d+(?:-[a-z0-9][a-z0-9-]*)?$"
        }

        # Non-issue branches: allow nested segments, but keep them simple and lowercase.
        # Examples:
        # - release/launch-2025-10-07
        # - docs/update-readme
        # - agent/agent-setup
        $nonIssueRx = if ($nonIssuePattern) {
            "^(?:$nonIssuePattern)\/[a-z0-9][a-z0-9-]*(?:\/[a-z0-9][a-z0-9-]*)*$"
        } else {
            $null
        }

        $matchesIssue = ($bn -match $issueRx)
        $matchesNonIssue = $false
        if ($Mode -eq "Any" -and $nonIssueRx) {
            $matchesNonIssue = ($bn -match $nonIssueRx)
        }

        if (-not $matchesIssue -and -not $matchesNonIssue) {
            if ($Mode -eq "Any") {
                $issues += "Does not match allowed conventions. Expected Issue: <type>/<issue-number>-<slug> (types: $($AllowedIssueTypes -join ', ')) OR Non-issue: <prefix>/<name> (prefixes: $($AllowedNonIssuePrefixes -join ', '))."
            } else {
                $issues += "Does not match required convention: <type>/<issue-number>-<slug> (types: $($AllowedIssueTypes -join ', '))."
            }

            # Helpful hints
            if ($bn -notmatch "^(?:$issueTypesPattern)\/" -and ($Mode -ne "Any" -or ($Mode -eq "Any" -and ($nonIssuePattern -and $bn -notmatch "^(?:$nonIssuePattern)\/")))) {
                if ($Mode -eq "Any") {
                    $issues += "Missing required prefix (issue types: $($AllowedIssueTypes -join ', ') OR non-issue prefixes: $($AllowedNonIssuePrefixes -join ', '))."
                } else {
                    $issues += "Missing required type prefix (one of: $($AllowedIssueTypes -join ', '))."
                }
            }
            if ($bn -match "^(?:$issueTypesPattern)\/" -and $bn -notmatch "^(?:$issueTypesPattern)\/\d+") {
                $issues += "Missing issue number immediately after type prefix (expected: <type>/<issue-number>)."
            }
            if ($RequireSlug -and $bn -match "^(?:$issueTypesPattern)\/\d+$") {
                $issues += "Missing slug after issue number (expected: <type>/<issue-number>-<slug>)."
            }
        }

        # 3) Style rules: lowercase only (avoid case-sensitive surprises)
        if ($bn -cmatch '[A-Z]') {
            $issues += "Contains uppercase characters; use lowercase only."
        }

        # 4) Disallow underscores (prefer hyphens)
        if ($bn -match '_') {
            $issues += "Contains underscores; use hyphens instead."
        }

        # 5) No consecutive slashes or trailing slash
        if ($bn -match '//' -or $bn.EndsWith('/')) {
            $issues += "Contains consecutive slashes or ends with '/'."
        }

        # 6) No consecutive hyphens in slug (usually accidental)
        if ($bn -match '--') {
            $issues += "Contains consecutive hyphens ('--'); normalize to single hyphens."
        }
    }

    return [pscustomobject]@{
        Branch = $bn
        IsValid = ($issues.Count -eq 0)
        Issues = $issues
    }
}

function Assert-BranchName {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$BranchName,
        [ValidateSet("Issue","Any")]
        [string]$Mode = "Issue",
        [string[]]$AllowedIssueTypes = @("feature", "feat", "bugfix", "hotfix", "chore"),
        [string[]]$AllowedNonIssuePrefixes = @("release", "spike", "docs", "experiment", "agent", "feat"),
        [switch]$RequireSlug
    )

    $result = Validate-BranchName -BranchName $BranchName -Mode $Mode -AllowedIssueTypes $AllowedIssueTypes -AllowedNonIssuePrefixes $AllowedNonIssuePrefixes -RequireSlug:$RequireSlug
    if (-not $result.IsValid) {
        $details = if ($result.Issues -and $result.Issues.Count -gt 0) {
            ($result.Issues | ForEach-Object { " - $_" }) -join "`n"
        } else {
            " - Invalid branch name."
        }
        $expected = if ($Mode -eq "Any") {
            "Expected: <type>/<issue-number>-<slug> (e.g. feature/123-add-login) OR <prefix>/<name> (e.g. release/launch-2025-10-07)"
        } else {
            "Expected: <type>/<issue-number>-<slug> (e.g. feature/123-add-login)"
        }
        throw ("Branch name is not allowed: '{0}'`n{1}`n{2}" -f $result.Branch, $details, $expected)
    }
    return $true
}

function Write-JsonReport {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [object]$Data,

        [Parameter(Mandatory=$true)]
        [string]$Path
    )

    $json = $Data | ConvertTo-Json -Depth 6
    $directory = Split-Path -Path $Path -Parent
    if ($directory -and -not (Test-Path $directory)) {
        New-Item -ItemType Directory -Path $directory -Force | Out-Null
    }
    Set-Content -Path $Path -Value $json -Encoding UTF8
    Write-ColorMessage "💾 Saved report to $Path" ([ConsoleColor]::Green)
}

function Get-BranchMetrics {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory=$true)]
        [string]$BranchName,

        [string]$Upstream
    )

    $commitDateRaw = Invoke-Git @("log","-1","--format=%cI",$BranchName)
    $status = if ($Upstream) {
        try {
            $aheadBehind = Invoke-Git @("rev-list","--left-right","--count","$BranchName...$Upstream")
            $parts = ($aheadBehind -join ' ').Trim() -split '\s+'
            [pscustomobject]@{
                Ahead  = if ($parts.Length -ge 1) { [int]$parts[0] } else { 0 }
                Behind = if ($parts.Length -ge 2) { [int]$parts[1] } else { 0 }
            }
        } catch {
            [pscustomobject]@{ Ahead = 0; Behind = 0 }
        }
    } else {
        [pscustomobject]@{ Ahead = 0; Behind = 0 }
    }

    return [pscustomobject]@{
        Branch     = $BranchName
        Upstream   = $Upstream
        CommitDate = [datetime]::Parse($commitDateRaw)
        Ahead      = $status.Ahead
        Behind     = $status.Behind
    }
}

Export-ModuleMember -Function `
    Write-ColorMessage, `
    Invoke-Git, `
    Get-CurrentBranch, `
    Test-WorkingTreeClean, `
    Ensure-BaseBranch, `
    Get-IssueTitle, `
    Sanitize-BranchSegment, `
    Generate-BranchName, `
    Validate-BranchName, `
    Assert-BranchName, `
    Write-JsonReport, `
    Get-BranchMetrics

