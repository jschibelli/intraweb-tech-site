#requires -Version 7.0
<#
.SYNOPSIS
    Unified PR Management Tool - Interactive and command-line interface for all PR operations.

.DESCRIPTION
    A consolidated, user-friendly interface for all PR management operations including:
    - Creating PRs from issues
    - Monitoring PR status
    - Quality checking
    - Requesting reviews
    - Configuring project fields
    - And more...

.PARAMETER Action
    Action to perform. If not specified, launches interactive menu.
    Options: create, monitor, quality, review, configure, analyze, respond, copilot, all

.PARAMETER PRNumber
    Pull request number (required for most actions)

.PARAMETER IssueNumber
    Issue number (required for create action)

.PARAMETER NonInteractive
    Skip interactive prompts and use defaults

.EXAMPLE
    .\pr.ps1
    Launches interactive menu

.EXAMPLE
    .\pr.ps1 -Action create -IssueNumber 250
    Creates a PR from issue #250

.EXAMPLE
    .\pr.ps1 -Action monitor -PRNumber 150
    Monitors PR #150
#>
[CmdletBinding()]
param(
    [Parameter(Mandatory=$false)]
    [ValidateSet("create", "monitor", "quality", "review", "configure", "analyze", "respond", "respond-human", "respond-ai", "copilot", "all", "menu")]
    [string]$Action = "menu",
    
    [Parameter(Mandatory=$false)]
    [int]$PRNumber = 0,
    
    [Parameter(Mandatory=$false)]
    [int]$IssueNumber = 0,
    
    [Parameter(Mandatory=$false)]
    [switch]$NonInteractive,
    
    [Parameter(Mandatory=$false)]
    [string]$BaseBranch = "develop",

    # Copilot helper sub-actions (only used when -Action copilot)
    [Parameter(Mandatory=$false)]
    [ValidateSet("menu", "copilot-instructions", "copilot-prompts", "generate-pr-body", "trigger-copilot-review")]
    [string]$CopilotAction = "menu",
    
    [Parameter(Mandatory=$false)]
    [switch]$AutoFix,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Get script directory - ensure it's a single string value
$myPath = $MyInvocation.MyCommand.Path
if ($myPath -is [array]) {
    $myPath = $myPath[0]
}
$scriptDir = [string](Split-Path -Parent $myPath)
$rootDir = [string](Split-Path -Parent $scriptDir)

function Load-EnvFile {
    <#
    .SYNOPSIS
    Loads environment variables from .env.local file.
    #>
    param(
        [string]$EnvFilePath = ".env.local"
    )
    
    $fullPath = if ([System.IO.Path]::IsPathRooted($EnvFilePath)) {
        $EnvFilePath
    } else {
        # Try repo root first
        $repoPath = Join-Path $rootDir $EnvFilePath
        if (Test-Path $repoPath) {
            $repoPath
        } elseif (Test-Path $EnvFilePath) {
            $EnvFilePath
        } else {
            return $false
        }
    }
    
    if (-not (Test-Path $fullPath)) {
        return $false
    }
    
    Write-Host "📄 Loading environment variables from: $fullPath" -ForegroundColor Gray
    
    $loadedCount = 0
    $loadedKeys = New-Object System.Collections.Generic.List[string]
    $content = Get-Content $fullPath -ErrorAction SilentlyContinue
    
    if (-not $content) {
        return $false
    }
    
    foreach ($line in $content) {
        # Skip empty lines and comments
        if ([string]::IsNullOrWhiteSpace($line) -or $line.Trim().StartsWith("#")) {
            continue
        }
        
        $workingLine = $line.Trim()

        # Support "export KEY=VALUE" syntax
        if ($workingLine -match '^\s*export\s+') {
            $workingLine = $workingLine -replace '^\s*export\s+', ''
        }

        # Match KEY=VALUE or KEY:VALUE patterns (with optional quotes)
        # Allow common characters in env var keys (letters/numbers/underscore/dot/dash)
        if ($workingLine -match '^\s*([A-Za-z_][A-Za-z0-9_.-]*)\s*(=|:)\s*(.*?)\s*$') {
            $key = $matches[1].Trim()
            $rawValue = $matches[3]
            $value = $rawValue.Trim()
            
            # Remove surrounding quotes if present
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }

            # Remove inline comments for unquoted values: KEY=value # comment
            $rawTrimmed = $rawValue.TrimStart()
            $isQuoted = $rawTrimmed.StartsWith('"') -or $rawTrimmed.StartsWith("'")
            if (-not $isQuoted) {
                $hashIndex = $value.IndexOf("#")
                if ($hashIndex -ge 0) {
                    $value = $value.Substring(0, $hashIndex).Trim()
                }
            }
            
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
            $loadedCount++
            $loadedKeys.Add($key) | Out-Null
        }
    }
    
    if ($loadedCount -gt 0) {
        Write-Host "✅ Loaded $loadedCount environment variable(s)" -ForegroundColor Green

        # Helpful non-secret confirmation: show what keys were loaded (mask secrets)
        $safeKeys = $loadedKeys |
            Where-Object { $_ } |
            Sort-Object -Unique |
            Where-Object { $_ -notmatch '(?i)(key|token|secret|password|pat)' }
        if ($safeKeys.Count -gt 0) {
            Write-Host ("🔎 Loaded keys: " + ($safeKeys -join ", ")) -ForegroundColor Gray
        }

        # Helpful non-secret confirmation: show which model is configured (if any)
        $envModel =
            $env:OPENAI_MODEL ??
            $env:OPENAI_ROUTER_MODEL_RESPONSES ??
            $env:OPENAI_ROUTER_MODEL_SMALL ??
            $env:OPENAI_CHAT_MODEL ??
            $env:OPENAI_DEFAULT_MODEL ??
            $env:WORKANT_OPENAI_MODEL ??
            $env:AI_MODEL ??
            $env:MODEL
        if ($envModel) {
            Write-Host "🧠 OpenAI model from env: $envModel" -ForegroundColor Gray
        }

        return $true
    }
    
    return $false
}

# Load environment variables from .env.local early
Load-EnvFile | Out-Null

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "❌ GitHub CLI (gh) is required. Please install it first." -ForegroundColor Red
        Write-Host "   Visit: https://cli.github.com/" -ForegroundColor Gray
        exit 1
    }
}

function Show-Header {
    Write-Host ""
    Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║         PR Management Tool - Unified Interface         ║" -ForegroundColor Cyan
    Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Menu {
    Show-Header
    
    Write-Host "Available Actions:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  1. Create PR from Issue" -ForegroundColor White
    Write-Host "     Create a new pull request from an issue with full configuration"
    Write-Host ""
    Write-Host "  2. Monitor PR Status" -ForegroundColor White
    Write-Host "     View PR status, checks, and progress"
    Write-Host ""
    Write-Host "  3. Quality Check" -ForegroundColor White
    Write-Host "     Run linting, formatting, security, and other quality checks"
    Write-Host ""
    Write-Host "  4. Request Review" -ForegroundColor White
    Write-Host "     Request or re-request reviews on a PR"
    Write-Host ""
    Write-Host "  5. Configure PR" -ForegroundColor White
    Write-Host "     Set project fields, labels, assignees, and metadata"
    Write-Host ""
    Write-Host "  6. Analyze PR" -ForegroundColor White
    Write-Host "     Get AI-powered analysis of PR changes"
    Write-Host ""
    Write-Host "  7. Respond to Reviews" -ForegroundColor White
    Write-Host "     Generate and post responses to review comments (human or AI)"
    Write-Host ""
    Write-Host "  8. Run All Checks" -ForegroundColor White
    Write-Host "     Execute complete PR workflow (monitor, analyze, quality, respond)"
    Write-Host ""
    Write-Host "  9. Copilot Tools" -ForegroundColor White
    Write-Host "     Open repo Copilot instructions/prompts, generate templates, trigger Copilot review"
    Write-Host ""
    Write-Host "  10. Exit" -ForegroundColor Gray
    Write-Host ""
}

function Get-RepoRootForTools {
    # pr.ps1 lives at scripts/pr-management/pr.ps1; repo root is two levels up from this directory.
    try {
        return (Resolve-Path (Join-Path $scriptDir "..\..")).Path
    } catch {
        return (Get-Location).Path
    }
}

function Open-Path {
    param([Parameter(Mandatory)][string]$PathToOpen)

    if (-not (Test-Path $PathToOpen)) {
        Write-Host "❌ Path not found: $PathToOpen" -ForegroundColor Red
        return $false
    }

    try {
        if ($IsWindows) {
            Start-Process -FilePath $PathToOpen | Out-Null
        } elseif ($IsMacOS) {
            & open $PathToOpen | Out-Null
        } elseif ($IsLinux) {
            & xdg-open $PathToOpen | Out-Null
        } else {
            Write-Host "Path: $PathToOpen" -ForegroundColor Gray
        }
        return $true
    } catch {
        Write-Host "⚠️  Could not open path automatically. Path: $PathToOpen" -ForegroundColor Yellow
        return $false
    }
}

function Copy-ToClipboard {
    param([Parameter(Mandatory)][string]$Text)

    try {
        if (Get-Command Set-Clipboard -ErrorAction SilentlyContinue) {
            Set-Clipboard -Value $Text
            return $true
        }
        if ($IsWindows) {
            $Text | clip.exe
            return $true
        }
        return $false
    } catch {
        return $false
    }
}

function Get-PRBodyTemplate {
    param(
        [int]$PRNumber = 0,
        [int]$IssueNumber = 0,
        [string]$BaseBranch = "develop"
    )

    $issueLine = if ($IssueNumber -gt 0) { "Closes #$IssueNumber" } else { "Closes #<issue-number>" }
    $prLine = if ($PRNumber -gt 0) { "PR: #$PRNumber" } else { "PR: #<pr-number>" }

@"
### What
- ...

### Why
- ...

### How
- ...

### Testing
- [ ] Unit tests:
- [ ] Manual:
- [ ] Not tested (explain why):

### Risk / Rollback
- Risk:
- Rollback:

### Checklist
- [ ] Base branch is correct ($BaseBranch unless explicitly targeting release)
- [ ] Labels set (at least ready-to-review when applicable)
- [ ] Assignee set (issue assignee or default)
- [ ] Project added (if configured)
- [ ] DCO sign-off included (if required)

### References
- $prLine
- $issueLine

### DCO Sign-off
<include the repo’s standard sign-off block if required>
"@
}

function Invoke-CopilotTools {
    Write-Host ""
    Write-Host "🧩 Copilot Tools" -ForegroundColor Cyan
    Write-Host "================" -ForegroundColor Cyan
    Write-Host ""

    $repoRoot = Get-RepoRootForTools
    $instructionsPath = Join-Path $repoRoot ".github\copilot-instructions.md"
    $promptsDir = Join-Path $repoRoot ".github\prompts"

    if ($CopilotAction -eq "menu" -and -not $NonInteractive) {
        Write-Host "Copilot options:" -ForegroundColor Yellow
        Write-Host "  1. Open Copilot instructions (.github/copilot-instructions.md)" -ForegroundColor White
        Write-Host "  2. Open Copilot prompt files folder (.github/prompts)" -ForegroundColor White
        Write-Host "  3. Generate PR body template (copy to clipboard)" -ForegroundColor White
        Write-Host "  4. Trigger Copilot PR review (open PR in browser + guidance)" -ForegroundColor White
        Write-Host ""
        $choice = Read-Host "Select option (1-4, default: 1)"
        $CopilotAction = switch ($choice) {
            "2" { "copilot-prompts" }
            "3" { "generate-pr-body" }
            "4" { "trigger-copilot-review" }
            default { "copilot-instructions" }
        }
    }

    switch ($CopilotAction) {
        "copilot-instructions" {
            Write-Host "Opening: $instructionsPath" -ForegroundColor Gray
            Open-Path -PathToOpen $instructionsPath | Out-Null
        }
        "copilot-prompts" {
            Write-Host "Opening: $promptsDir" -ForegroundColor Gray
            Open-Path -PathToOpen $promptsDir | Out-Null

            if (Test-Path $promptsDir) {
                $promptFiles = Get-ChildItem -Path $promptsDir -Filter "*.prompt.md" -ErrorAction SilentlyContinue
                if ($promptFiles) {
                    Write-Host ""
                    Write-Host "Available prompt files:" -ForegroundColor Yellow
                    foreach ($p in $promptFiles) {
                        Write-Host "  - $($p.Name)" -ForegroundColor White
                    }
                }
            }
        }
        "generate-pr-body" {
            $prNum = if ($PRNumber -gt 0) { $PRNumber } else { 0 }
            $issueNum = if ($IssueNumber -gt 0) { $IssueNumber } else { 0 }
            $body = Get-PRBodyTemplate -PRNumber $prNum -IssueNumber $issueNum -BaseBranch $BaseBranch

            Write-Host ""
            Write-Host "Generated PR body template:" -ForegroundColor Yellow
            Write-Host "--------------------------" -ForegroundColor Yellow
            Write-Host $body
            Write-Host "--------------------------" -ForegroundColor Yellow

            if (Copy-ToClipboard -Text $body) {
                Write-Host "✅ Copied template to clipboard" -ForegroundColor Green
            } else {
                Write-Host "ℹ️  Could not copy to clipboard automatically" -ForegroundColor Gray
            }
        }
        "trigger-copilot-review" {
            $prNum = if ($PRNumber -gt 0) { $PRNumber } else { Get-PRNumber }

            Write-Host ""
            Write-Host "Opening PR in browser..." -ForegroundColor Yellow
            try {
                gh pr view $prNum --web | Out-Null
            } catch {
                Write-Host "⚠️  Could not open PR via gh. You can run: gh pr view $prNum --web" -ForegroundColor Yellow
            }

            Write-Host ""
            Write-Host "To ensure repo custom instructions are used:" -ForegroundColor Yellow
            Write-Host "  - GitHub: Settings → Copilot → Code review → enable “Use custom instructions when reviewing pull requests”" -ForegroundColor White
            Write-Host "  - IDE: ensure loading `.github/copilot-instructions.md` is enabled for Copilot Chat" -ForegroundColor White

            # Best-effort diagnostics: Copilot PR review may read repo instructions from the default branch.
            # If the instructions file only exists on the PR branch, Copilot may not apply it yet.
            try {
                $defaultBranch = (gh repo view --json defaultBranchRef -q .defaultBranchRef.name 2>$null).Trim()
                $owner = (gh repo view --json owner -q .owner.login 2>$null).Trim()
                $name = (gh repo view --json name -q .name 2>$null).Trim()

                if ($defaultBranch -and $owner -and $name) {
                    $path = ".github/copilot-instructions.md"
                    gh api "repos/$owner/$name/contents/$path?ref=$defaultBranch" 2>$null | Out-Null
                    if ($LASTEXITCODE -ne 0) {
                        Write-Host ""
                        Write-Host "⚠️  Repo instructions not found on default branch '$defaultBranch': $path" -ForegroundColor Yellow
                        Write-Host "     Copilot PR reviews may not use instructions until they exist on the default branch." -ForegroundColor Yellow
                        Write-Host "     Merge the PR that adds the instructions, then re-run Copilot review (push a commit or use the PR UI)." -ForegroundColor Gray
                    }
                }
            } catch {
                # Non-fatal diagnostics only
            }

            Write-Host ""
            Write-Host "Note: Copilot is a GitHub App/bot and usually cannot be re-requested via gh pr edit --add-reviewer." -ForegroundColor Gray
        }
        default {
            Write-Host "❌ Unknown CopilotAction: $CopilotAction" -ForegroundColor Red
        }
    }
}

function Get-UserChoice {
    param([int]$MaxChoice)
    
    while ($true) {
        $choice = Read-Host "Select an action (1-$MaxChoice)"
        $choiceNum = 0
        if ([int]::TryParse($choice, [ref]$choiceNum)) {
            if ($choiceNum -ge 1 -and $choiceNum -le $MaxChoice) {
                return $choiceNum
            }
        }
        Write-Host "Invalid choice. Please enter a number between 1 and $MaxChoice." -ForegroundColor Red
    }
}

function Get-PRNumber {
    param([string]$Prompt = "Enter PR number")
    
    while ($true) {
        $userInput = Read-Host $Prompt
        $num = 0
        if ([int]::TryParse($userInput, [ref]$num) -and $num -gt 0) {
            return $num
        }
        Write-Host "Invalid PR number. Please enter a positive integer." -ForegroundColor Red
    }
}

function Get-IssueNumber {
    param([string]$Prompt = "Enter issue number")
    
    while ($true) {
        $userInput = Read-Host $Prompt
        $num = 0
        if ([int]::TryParse($userInput, [ref]$num) -and $num -gt 0) {
            return $num
        }
        Write-Host "Invalid issue number. Please enter a positive integer." -ForegroundColor Red
    }
}

function Invoke-CreatePR {
    Write-Host ""
    Write-Host "📝 Creating PR from Issue" -ForegroundColor Cyan
    Write-Host "=========================" -ForegroundColor Cyan
    Write-Host ""
    
    $issueNum = if ($IssueNumber -gt 0) { $IssueNumber } else { Get-IssueNumber }
    
    $scriptPath = [string](Join-Path $scriptDir "create-pr-from-issue.ps1")
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ PR creation script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    # Use hashtable splatting so PowerShell binds named parameters correctly.
    $params = @{
        IssueNumber = $issueNum
        BaseBranch  = $BaseBranch
        SignOff     = $true
    }

    if ($DryRun) {
        $params.DryRun = $true
    }

    & $scriptPath @params
}

function Invoke-MonitorPR {
    Write-Host ""
    Write-Host "👀 Monitoring PR" -ForegroundColor Cyan
    Write-Host "================" -ForegroundColor Cyan
    Write-Host ""
    
    $scriptPath = [string](Join-Path $scriptDir "pr-monitor.ps1")
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ PR monitor script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    $showDetails = $false
    $includeCRGPT = $false
    
    if (-not $NonInteractive) {
        $showDetailsChoice = Read-Host "Show detailed information? (y/N)"
        $includeCRGPTChoice = Read-Host "Include CR-GPT comments? (y/N)"
        
        if ($showDetailsChoice -eq "y" -or $showDetailsChoice -eq "Y") {
            $showDetails = $true
        }
        
        if ($includeCRGPTChoice -eq "y" -or $includeCRGPTChoice -eq "Y") {
            $includeCRGPT = $true
        }
    }
    
    # Build parameters hashtable for splatting
    $params = @{
        Filter = "open"
    }
    
    if ($showDetails) {
        $params.ShowDetails = $true
    }
    
    if ($includeCRGPT) {
        $params.IncludeCRGPT = $true
    }
    
    & $scriptPath @params
}

function Invoke-QualityCheck {
    Write-Host ""
    Write-Host "🔍 Quality Check" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    Write-Host ""
    
    $prNum = if ($PRNumber -gt 0) { $PRNumber } else { Get-PRNumber }
    
    $scriptPath = [string](Join-Path $scriptDir "pr-quality-checker.ps1")
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Quality checker script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    if (-not $NonInteractive) {
        Write-Host "Check types:" -ForegroundColor Yellow
        Write-Host "  1. All checks" -ForegroundColor White
        Write-Host "  2. Linting only" -ForegroundColor White
        Write-Host "  3. Formatting only" -ForegroundColor White
        Write-Host "  4. Security only" -ForegroundColor White
        Write-Host "  5. Performance only" -ForegroundColor White
        Write-Host "  6. Documentation only" -ForegroundColor White
        Write-Host ""
        $checkChoice = Read-Host "Select check type (1-6, default: 1)"
        
        $checkType = switch ($checkChoice) {
            "2" { "linting" }
            "3" { "formatting" }
            "4" { "security" }
            "5" { "performance" }
            "6" { "documentation" }
            default { "all" }
        }
        
        $autoFixChoice = Read-Host "Auto-fix issues? (y/N)"
        $runTests = Read-Host "Run tests? (y/N)"
    } else {
        $checkType = "all"
    }
    
    # Use hashtable splatting so PowerShell binds named parameters correctly.
    $params = @{
        PRNumber = $prNum
        Checks   = $checkType
    }

    if ($AutoFix -or ($autoFixChoice -eq "y" -or $autoFixChoice -eq "Y")) {
        $params.AutoFix = $true
    }

    if ($runTests -eq "y" -or $runTests -eq "Y") {
        $params.RunTests = $true
    }

    & $scriptPath @params
}

function Invoke-RequestReview {
    Write-Host ""
    Write-Host "📬 Request Review" -ForegroundColor Cyan
    Write-Host "================" -ForegroundColor Cyan
    Write-Host ""
    
    $prNum = if ($PRNumber -gt 0) { $PRNumber } else { Get-PRNumber }
    
    $scriptPath = [string](Join-Path $scriptDir "request-pr-review.ps1")
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Request review script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    # Use hashtable splatting so PowerShell binds named parameters correctly.
    $params = @{
        PRNumber    = $prNum
        AutoDetect  = $true
    }

    if ($DryRun) {
        $params.DryRun = $true
    }

    & $scriptPath @params
}

function Invoke-ConfigurePR {
    Write-Host ""
    Write-Host "⚙️  Configure PR" -ForegroundColor Cyan
    Write-Host "===============" -ForegroundColor Cyan
    Write-Host ""
    
    $prNum = if ($PRNumber -gt 0) { $PRNumber } else { Get-PRNumber }
    
    Write-Host "This will configure project fields (Status, Priority, Size) for the PR." -ForegroundColor Yellow
    Write-Host ""
    
    $scriptPath = [string](Join-Path $scriptDir "fix-pr-project-fields.ps1")
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Configure PR script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    & $scriptPath -PRNumber $prNum
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ Configure PR failed (exit code: $LASTEXITCODE)" -ForegroundColor Red
        Write-Host "   See output above for details (commonly: missing gh auth scopes)." -ForegroundColor Yellow
    }
}

function Invoke-AnalyzePR {
    Write-Host ""
    Write-Host "🤖 Analyze PR" -ForegroundColor Cyan
    Write-Host "=============" -ForegroundColor Cyan
    Write-Host ""
    
    $prNum = if ($PRNumber -gt 0) { $PRNumber } else { Get-PRNumber }
    
    # Primary implementation lives in scripts/automation; pr-management script is a thin wrapper.
    $scriptPath = [string](Join-Path $rootDir "automation\pr-automation-unified.ps1")
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Automation script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    $params = @{
        PRNumber = $prNum
        Action   = "analyze"
    }
    if ($DryRun) {
        $params.DryRun = $true
    }
    
    & $scriptPath @params
}

function Invoke-RespondToReviews {
    param([string]$ResponseType = "all")
    
    Write-Host ""
    Write-Host "💬 Respond to Reviews" -ForegroundColor Cyan
    Write-Host "====================" -ForegroundColor Cyan
    Write-Host ""
    
    $prNum = if ($PRNumber -gt 0) { $PRNumber } else { Get-PRNumber }
    
    # Primary implementation lives in scripts/automation; pr-management script is a thin wrapper.
    $scriptPath = [string](Join-Path $rootDir "automation\pr-automation-unified.ps1")
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Automation script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    if (-not $NonInteractive -and $ResponseType -eq "all") {
        Write-Host "Response options:" -ForegroundColor Yellow
        Write-Host "  1. All reviews (human + AI)" -ForegroundColor White
        Write-Host "  2. Human reviews only" -ForegroundColor White
        Write-Host "  3. AI reviews only (Copilot, CR-GPT, etc.)" -ForegroundColor White
        Write-Host ""
        $choice = Read-Host "Select response type (1-3, default: 1)"
        
        $ResponseType = switch ($choice) {
            "2" { "human" }
            "3" { "ai" }
            default { "all" }
        }
    }
    
    $action = switch ($ResponseType) {
        "human" { "respond-human" }
        "ai" { "respond-ai" }
        default { "respond" }
    }
    
    $params = @{
        PRNumber = $prNum
        Action = $action
    }
    
    if ($DryRun) {
        $params.DryRun = $true
    }
    
    & $scriptPath @params
}

function Invoke-AllChecks {
    Write-Host ""
    Write-Host "🚀 Running All Checks" -ForegroundColor Cyan
    Write-Host "=====================" -ForegroundColor Cyan
    Write-Host ""
    
    $prNum = if ($PRNumber -gt 0) { $PRNumber } else { Get-PRNumber }
    
    # Ensure scriptDir is a string in this scope (defensive copy)
    $localScriptDir = [string]$scriptDir
    if ($localScriptDir -is [array]) {
        $localScriptDir = [string]$localScriptDir[0]
    }
    
    # Primary implementation lives in scripts/automation; pr-management script is a thin wrapper.
    $scriptPath = [string](Join-Path $rootDir "automation\pr-automation-unified.ps1")
    
    # Normalize the path
    $scriptPath = [System.IO.Path]::GetFullPath($scriptPath)
    
    if (-not (Test-Path $scriptPath)) {
        Write-Host "❌ Automation script not found: $scriptPath" -ForegroundColor Red
        return
    }
    
    # Build parameters hashtable for splatting
    $params = @{
        PRNumber = $prNum
        Action = "all"
    }
    
    if ($AutoFix) {
        $params.AutoFix = $true
    }
    
    if ($DryRun) {
        $params.DryRun = $true
    }
    
    # Call with the path - using .NET Path methods ensures it's a single string
    & $scriptPath @params
}

# Main execution
Ensure-GhCli

# If action is specified and not "menu", execute directly
if ($Action -ne "menu") {
    switch ($Action) {
        "create" {
            if ($IssueNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ IssueNumber is required for create action" -ForegroundColor Red
                exit 1
            }
            Invoke-CreatePR
        }
        "monitor" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for monitor action" -ForegroundColor Red
                exit 1
            }
            Invoke-MonitorPR
        }
        "quality" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for quality action" -ForegroundColor Red
                exit 1
            }
            Invoke-QualityCheck
        }
        "review" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for review action" -ForegroundColor Red
                exit 1
            }
            Invoke-RequestReview
        }
        "configure" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for configure action" -ForegroundColor Red
                exit 1
            }
            Invoke-ConfigurePR
        }
        "analyze" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for analyze action" -ForegroundColor Red
                exit 1
            }
            Invoke-AnalyzePR
        }
        "respond" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for respond action" -ForegroundColor Red
                exit 1
            }
            Invoke-RespondToReviews -ResponseType "all"
        }
        "respond-human" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for respond-human action" -ForegroundColor Red
                exit 1
            }
            Invoke-RespondToReviews -ResponseType "human"
        }
        "respond-ai" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for respond-ai action" -ForegroundColor Red
                exit 1
            }
            Invoke-RespondToReviews -ResponseType "ai"
        }
        "copilot" {
            # Some sub-actions require PRNumber; only enforce in non-interactive mode.
            if ($NonInteractive -and $CopilotAction -eq "trigger-copilot-review" -and $PRNumber -eq 0) {
                Write-Host "❌ PRNumber is required for -Action copilot -CopilotAction trigger-copilot-review in NonInteractive mode" -ForegroundColor Red
                exit 1
            }
            Invoke-CopilotTools
        }
        "all" {
            if ($PRNumber -eq 0 -and $NonInteractive) {
                Write-Host "❌ PRNumber is required for all action" -ForegroundColor Red
                exit 1
            }
            Invoke-AllChecks
        }
    }
    exit 0
}

# Interactive menu mode
while ($true) {
    Show-Menu
    $choice = Get-UserChoice -MaxChoice 10
    
    switch ($choice) {
        1 { Invoke-CreatePR }
        2 { Invoke-MonitorPR }
        3 { Invoke-QualityCheck }
        4 { Invoke-RequestReview }
        5 { Invoke-ConfigurePR }
        6 { Invoke-AnalyzePR }
        7 { Invoke-RespondToReviews }
        8 { Invoke-AllChecks }
        9 { Invoke-CopilotTools }
        10 {
            Write-Host ""
            Write-Host "👋 Goodbye!" -ForegroundColor Cyan
            Write-Host ""
            exit 0
        }
    }
    
    Write-Host ""
    Write-Host "Press Enter to continue..." -ForegroundColor Gray
    Read-Host | Out-Null
}

