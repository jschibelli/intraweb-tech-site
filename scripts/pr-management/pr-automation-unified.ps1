#requires -Version 7.0
<#
.SYNOPSIS
  Legacy compatibility wrapper for PR automation.

.DESCRIPTION
  The active implementation lives in `scripts/automation/pr-automation-unified.ps1`.
  This wrapper remains so existing commands (and `pr.ps1`) can continue to work.
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
    $target = Join-Path $scriptsDir "automation\pr-automation-unified.ps1"

    if (-not (Test-Path $target)) {
        throw "Target script not found: $target"
    }

    Write-Host "ℹ️  Forwarding to: scripts/automation/pr-automation-unified.ps1" -ForegroundColor Gray
    & $target @RemainingArgs
    exit $LASTEXITCODE
} catch {
    Write-Host "❌ Failed to run pr-automation-unified wrapper: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

function Get-CopilotInstructionsPath {
    $repoRoot = Get-RepoRoot
    return (Join-Path $repoRoot ".github\copilot-instructions.md")
}

function Get-CopilotPromptsDirectory {
    $repoRoot = Get-RepoRoot
    return (Join-Path $repoRoot ".github\prompts")
}

function Open-Path {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$PathToOpen
    )

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

function Copy-TextToClipboard {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Text
    )

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

function New-PRBodyTemplate {
    [CmdletBinding()]
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

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required."
    }
}

function Get-ReviewThreadIdForComment {
    <#
    .SYNOPSIS
    Finds the review thread node ID for a given pull request review comment node ID.

    .NOTES
    This uses GitHub GraphQL directly (not `gh pr view --json reviewThreads`), because some gh versions
    don't expose reviewThreads in `gh pr view`.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$PullRequestId,
        [Parameter(Mandatory)]
        [string]$CommentNodeId
    )

    Ensure-GhCli

    $after = $null
    while ($true) {
        $q = @"
query(`$pr: ID!, `$after: String) {
  node(id: `$pr) {
    ... on PullRequest {
      reviewThreads(first: 100, after: `$after) {
        pageInfo { hasNextPage endCursor }
        nodes {
          id
          comments(first: 50) { nodes { id } }
        }
      }
    }
  }
}
"@

        $resp = gh api graphql -f query=$q -f pr=$PullRequestId -f after=$after 2>&1
        if ($LASTEXITCODE -ne 0) { return $null }

        $data = $resp | ConvertFrom-Json
        $rt = $data.data.node.reviewThreads

        foreach ($t in ($rt.nodes ?? @())) {
            $ids = @($t.comments.nodes | ForEach-Object { $_.id })
            if ($ids -contains $CommentNodeId) {
                return [string]$t.id
            }
        }

        if (-not $rt.pageInfo.hasNextPage) { break }
        $after = $rt.pageInfo.endCursor
    }

    return $null
}

function Resolve-ReviewThread {
    <#
    .SYNOPSIS
    Resolves a PR review thread (marks it as resolved) by thread node ID.
    #>
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$ThreadId
    )

    Ensure-GhCli

    $m = @"
mutation(`$threadId: ID!) {
  resolveReviewThread(input: {threadId: `$threadId}) {
    thread { id isResolved }
  }
}
"@

    $resp = gh api graphql -f query=$m -f threadId=$ThreadId 2>&1
    if ($LASTEXITCODE -ne 0) { return $false }

    try {
        $j = $resp | ConvertFrom-Json
        return [bool]$j.data.resolveReviewThread.thread.isResolved
    } catch {
        # If we can't parse, assume success since the mutation returned 0 exit code.
        return $true
    }
}

function Get-PRData {
    Ensure-GhCli
    # Include `id` (GraphQL node id) so we can post true threaded replies via GraphQL mutations.
    $json = gh pr view $PRNumber --json id,title,body,baseRefName,headRefName,state,url,files,additions,deletions,statusCheckRollup
    return $json | ConvertFrom-Json
}

function Fix-PRBaseBranch {
    <#
    .SYNOPSIS
    Automatically fixes PR base branch to 'develop' if it's set to 'main'.
    #>
    
    $pr = Get-PRData
    
    if ($pr.baseRefName -eq "main") {
        Write-Host "`n⚠️  PR base branch is 'main', changing to 'develop'..." -ForegroundColor Yellow
        
        if ($DryRun) {
            Write-Host "[DryRun] Would change base branch from 'main' to 'develop'" -ForegroundColor Yellow
            return
        }
        
        try {
            gh pr edit $PRNumber --base develop 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Base branch changed to 'develop'" -ForegroundColor Green
            } else {
                Write-Warning "Failed to change base branch"
            }
        } catch {
            Write-Warning "Could not change base branch: $($_.Exception.Message)"
        }
    } elseif ($pr.baseRefName -ne "develop") {
        Write-Host "`n⚠️  PR base branch is '$($pr.baseRefName)', expected 'develop'" -ForegroundColor Yellow
        Write-Host "   Use -AutoFix to automatically change it" -ForegroundColor Gray
    } else {
        Write-Host "`n✅ PR base branch is correctly set to 'develop'" -ForegroundColor Green
    }
}

function Import-AIServices {
    $scriptDir = Get-ScriptDirectory
    $repoRoot = Get-RepoRoot
    
    # Try multiple possible paths for ai-services.ps1
    $possiblePaths = @(
        (Join-Path $repoRoot "scripts\automation\core-utilities\ai-services.ps1")
        (Join-Path $repoRoot "scripts\core-utilities\ai-services.ps1")
        (Join-Path (Split-Path -Parent $scriptDir) "..\automation\core-utilities\ai-services.ps1")
        (Join-Path (Split-Path -Parent $scriptDir) "..\core-utilities\ai-services.ps1")
    )
    
    foreach ($modulePath in $possiblePaths) {
        if (Test-Path $modulePath) {
            try {
                # Load into a real module scope so Export-ModuleMember works even if the file is a .ps1
                $moduleName = "Workant.AIServices"
                $dynamicModule = New-Module -Name $moduleName -ScriptBlock {
                    param([string]$PathToDotSource)
                    . $PathToDotSource
                } -ArgumentList $modulePath
                Import-Module -ModuleInfo $dynamicModule -Force -ErrorAction Stop
                Write-Host "✅ Imported AI services module from: $modulePath" -ForegroundColor Green
                return $true
            } catch {
                # Fallback: dot-source if module import fails (for plain helper scripts)
                try {
                    . $modulePath
                    Write-Host "✅ Loaded AI services from: $modulePath" -ForegroundColor Green
                    return $true
                } catch {
                    Write-Warning "Failed to load AI services from $modulePath : $($_.Exception.Message)"
                }
            }
        }
    }
    
    Write-Warning "AI services module not found. Searched in: $($possiblePaths -join ', ')"
    return $false
}

function Invoke-PRPrompt {
    param([object]$PRData)

    if (-not (Import-AIServices)) {
        Write-Warning "AI services not available. Please configure OPENAI_API_KEY environment variable."
        return "[AI unavailable] Summary: $($PRData.title)"
    }

    # Check if OpenAI API key is configured
    $config = Get-AIServiceConfig
    
    # Ensure API key is set in config (from environment if not already set)
    if (-not $config.ApiKey -and $env:OPENAI_API_KEY) {
        Set-AIServiceConfig -ApiKey $env:OPENAI_API_KEY
        if ($env:OPENAI_ORG_ID) {
            Set-AIServiceConfig -Organization $env:OPENAI_ORG_ID
        }
        $envModel =
            $env:OPENAI_MODEL ??
            $env:OPENAI_ROUTER_MODEL_RESPONSES ??
            $env:OPENAI_ROUTER_MODEL_SMALL ??
            $env:OPENAI_CHAT_MODEL ??
            $env:OPENAI_DEFAULT_MODEL ??
            $env:WORKANT_OPENAI_MODEL
        if ($envModel) {
            Set-AIServiceConfig -Model $envModel
        }
        $config = Get-AIServiceConfig
    }
    
    if (-not $config.ApiKey) {
        Write-Warning "OpenAI API key not configured. Set OPENAI_API_KEY in .env.local or use Set-AIServiceConfig."
        return "[AI unavailable] Summary: $($PRData.title)"
    }
    
    # Confirm the key is present without printing any part of the secret
    Write-Host "🔑 OpenAI API key detected (masked)" -ForegroundColor Gray

    $templatePath = Join-Path (Get-RepoRoot) "prompts\automation\pr-automation-prompt-template.md"
    if (-not (Test-Path $templatePath)) {
        Write-Warning "PR automation prompt template not found at: $templatePath"
        return "[AI unavailable] Template not found"
    }
    
    $template = Get-Content $templatePath -Raw
    $changedFiles = $PRData.files.path -join ", "
    
    # Get automated review comments (CR-GPT, Copilot, etc.) for the prompt
    $automatedComments = Get-AutomatedReviewComments -PRNumber $PRNumber
    $commentsJson = "[]"
    if ($automatedComments -and $automatedComments.Count -gt 0) {
        $commentsJson = ($automatedComments | ConvertTo-Json -Depth 5 -Compress)
    }

    # Get human review comments if available
    $humanComments = Get-HumanReviewComments -PRNumber $PRNumber
    $humanCommentsJson = "[]"
    if ($humanComments -and $humanComments.Count -gt 0) {
        $humanCommentsJson = ($humanComments | ConvertTo-Json -Depth 5 -Compress)
    }

    $prompt = $template.
        Replace("{PR_NUMBER}", $PRNumber).
        Replace("{PR_TITLE}", $PRData.title).
        Replace("{PR_DESCRIPTION}", ($PRData.body ?? "No description")).
        Replace("{BASE_BRANCH}", $PRData.baseRefName).
        Replace("{CHANGED_FILES}", $changedFiles).
        Replace("{LINES_CHANGED}", "Additions: $($PRData.additions) / Deletions: $($PRData.deletions)").
        Replace("{CI_STATUS}", ($PRData.statusCheckRollup.state ?? "unknown")).
        Replace("{REVIEW_STATUS}", $PRData.state).
        Replace("{CR_GPT_COMMENTS}", $commentsJson)

    # Add human comments if the template supports it
    if ($template -match "\{HUMAN_REVIEW_COMMENTS\}") {
        $prompt = $prompt.Replace("{HUMAN_REVIEW_COMMENTS}", $humanCommentsJson)
    }

    try {
        Write-Host "🤖 Calling OpenAI API with model: $($config.Model)..." -ForegroundColor Cyan
        $response = Invoke-AICompletion -Prompt $prompt -ResponseFormat json
        Write-Host "✅ OpenAI API call successful" -ForegroundColor Green
        return $response
    } catch {
        Write-Warning "OpenAI API call failed: $($_.Exception.Message)"
        if ($_.Exception.Message -like "*401*" -or $_.Exception.Message -like "*unauthorized*") {
            Write-Host "💡 Tip: Check that your OPENAI_API_KEY in .env.local is correct and has not expired." -ForegroundColor Yellow
        }
        return "[AI unavailable] API Error: $($_.Exception.Message)"
    }
}

function Show-MonitorStatus {
    $pr = Get-PRData
    $status = [pscustomobject]@{
        Title      = $pr.title
        URL        = $pr.url
        BaseBranch = $pr.baseRefName
        Checks     = $pr.statusCheckRollup.state
        Files      = $pr.files.Count
        Additions  = $pr.additions
        Deletions  = $pr.deletions
    }
    $status | Format-List
}

function Invoke-Analysis {
    <#
    .SYNOPSIS
    Analyzes the PR and returns JSON analysis.
    #>
    $pr = Get-PRData
    $analysis = Invoke-PRPrompt -PRData $pr
    if ($analysis) {
        try {
            # If AI is unavailable, the prompt function returns a plain text marker
            if (($analysis -is [string]) -and $analysis.Contains("[AI unavailable]")) {
                Write-Warning "AI analysis unavailable. Cannot generate responses without AI analysis."
                Write-Host "Raw analysis output:" -ForegroundColor Yellow
                Write-Host $analysis
                return $null
            }

            # Attempt to parse JSON directly (don't rely on prefix heuristics; some models wrap output)
            $trimmed = $analysis.Trim()
            if ($trimmed.StartsWith('```')) {
                # Strip fenced code blocks if present
                $trimmed = ($trimmed -replace '^\s*```[a-zA-Z]*\s*', '') -replace '\s*```\s*$', ''
            }

            # If it's already JSON, parse and re-serialize to ensure valid JSON
            $parsed = $trimmed | ConvertFrom-Json
            return ($parsed | ConvertTo-Json -Depth 10 -Compress)
        } catch {
            Write-Warning "Failed to parse analysis JSON: $($_.Exception.Message)"
            Write-Host "Raw analysis output:" -ForegroundColor Yellow
            Write-Host $analysis
            return $null
        }
    }
    return $null
}

function Invoke-QualityChecks {
    if ($DryRun) {
        Write-Host "[DryRun] Would run pnpm lint && pnpm test" -ForegroundColor Yellow
        return
    }

    Write-Host "`n🔍 Running Quality Checks..." -ForegroundColor Cyan
    
    function Get-PackageScripts {
        if (-not (Test-Path "package.json")) { return @{} }
        try {
            $pkg = Get-Content -Path "package.json" -Raw | ConvertFrom-Json
            if ($pkg.scripts) {
                # Convert PSCustomObject -> Hashtable for reliable key lookup / parameter typing
                if ($pkg.scripts -is [hashtable]) { return $pkg.scripts }
                $ht = @{}
                foreach ($p in $pkg.scripts.PSObject.Properties) {
                    $ht[$p.Name] = [string]$p.Value
                }
                return $ht
            }
        } catch {
            Write-Warning "Failed to parse package.json: $($_.Exception.Message)"
        }
        return @{}
    }

    function Has-Script {
        param(
            [Parameter(Mandatory)][hashtable]$Scripts,
            [Parameter(Mandatory)][string]$Name
        )
        return ($Scripts.ContainsKey($Name) -and -not [string]::IsNullOrWhiteSpace([string]$Scripts[$Name]))
    }

    $scripts = Get-PackageScripts

    if (Test-Path "pnpm-lock.yaml") {
        if (Has-Script -Scripts $scripts -Name "lint") {
            Write-Host "Running pnpm run lint..." -ForegroundColor Gray
            $null = pnpm run lint 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Linting failed"
            } else {
                Write-Host "✅ Linting passed" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  No lint script found in package.json; skipping lint." -ForegroundColor Yellow
        }

        if (Has-Script -Scripts $scripts -Name "test") {
            Write-Host "Running pnpm run test..." -ForegroundColor Gray
            $null = pnpm run test -- --watch=false 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Tests failed"
            } else {
                Write-Host "✅ Tests passed" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  No test script found in package.json; skipping tests." -ForegroundColor Yellow
        }
    } elseif (Test-Path "package-lock.json") {
        if (Has-Script -Scripts $scripts -Name "lint") {
            Write-Host "Running npm run lint..." -ForegroundColor Gray
            $null = npm run lint 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Linting failed"
            } else {
                Write-Host "✅ Linting passed" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  No lint script found in package.json; skipping lint." -ForegroundColor Yellow
        }

        if (Has-Script -Scripts $scripts -Name "test") {
            Write-Host "Running npm test..." -ForegroundColor Gray
            $null = npm test -- --watch=false 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Tests failed"
            } else {
                Write-Host "✅ Tests passed" -ForegroundColor Green
            }
        } else {
            Write-Host "⚠️  No test script found in package.json; skipping tests." -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  No JS package manager lock file found; skipping quality checks." -ForegroundColor Yellow
    }
}

function Invoke-DocsUpdate {
    $scriptDir = Get-ScriptDirectory
    $repoRoot = Get-RepoRoot

    # docs-updater.ps1 may live in different locations depending on repo layout.
    # Prefer the canonical automation location, then fall back to core-utilities, then local.
    $candidates = @(
        (Join-Path $repoRoot "scripts\automation\docs-updater.ps1")
        (Join-Path $repoRoot "scripts\core-utilities\docs-updater.ps1")
        (Join-Path $scriptDir "docs-updater.ps1")
    )

    $scriptPath = $candidates | Where-Object { $_ -and (Test-Path $_) } | Select-Object -First 1
    if (-not $scriptPath) {
        Write-Warning "docs-updater.ps1 not found. Searched: $($candidates -join ', ')"
        return
    }

    if ($DryRun) {
        & $scriptPath -PRNumber $PRNumber -UpdateChangelog -UpdateReadme -DryRun
    } else {
        & $scriptPath -PRNumber $PRNumber -UpdateChangelog -UpdateReadme
    }
}

function Get-RepoInfo {
    <#
    .SYNOPSIS
    Gets the current repository owner and name.
    #>
    
    if (-not $script:repoInfo) {
        try {
            $owner = gh repo view --json owner -q .owner.login 2>&1
            $name = gh repo view --json name -q .name 2>&1
            
            if ($LASTEXITCODE -eq 0 -and $owner -and $name) {
                $script:repoInfo = @{
                    Owner = $owner.Trim()
                    Name = $name.Trim()
                }
            } else {
                return $null
            }
        } catch {
            return $null
        }
    }
    
    return $script:repoInfo
}

function Get-AllReviewComments {
    <#
    .SYNOPSIS
    Gets all review comments (both human and automated) from a pull request.
    
    .DESCRIPTION
    Fetches all comments including:
    - Human reviewer comments
    - CR-GPT comments
    - GitHub Copilot comments
    - Other automated review bots
    - Inline code review comments
    #>
    param(
        [int]$PRNumber
    )
    
    try {
        Ensure-GhCli
        
        # Get regular comments, review comments, and review threads
        # Note: reviewThreads might not be available in all GitHub CLI versions, so we'll try both
        $allCommentsJson = gh pr view $PRNumber --json comments,reviews,reviewThreads 2>&1
        if ($LASTEXITCODE -ne 0) {
            # Fallback: try without reviewThreads
            $allCommentsJson = gh pr view $PRNumber --json comments,reviews 2>&1
            if ($LASTEXITCODE -ne 0) {
                Write-Warning "Failed to fetch comments for PR #$PRNumber"
                return @()
            }
        }
        
        $prData = $allCommentsJson | ConvertFrom-Json
        $allComments = @()
        
        # Add regular PR comments (PR conversation comments)
        if ($prData.comments) {
            foreach ($comment in $prData.comments) {
                $commentUrl = $null
                try { if ($comment.PSObject.Properties["url"] -and $comment.url) { $commentUrl = [string]$comment.url } } catch { }
                $allComments += [PSCustomObject]@{
                    # In `gh pr view --json`, ids are GraphQL node IDs (strings).
                    id = [string]$comment.id
                    nodeId = [string]$comment.id
                    databaseId = $null
                    body = $comment.body
                    author = $comment.author
                    createdAt = $comment.createdAt
                    isReviewComment = $false
                    isInlineComment = $false
                    url = $commentUrl
                }
            }
        }
        
        # Add review comments (review body comments)
        if ($prData.reviews) {
            foreach ($review in $prData.reviews) {
                if ($review.body -and $review.body.Trim().Length -gt 0) {
                    $reviewUrl = $null
                    try { if ($review.PSObject.Properties["url"] -and $review.url) { $reviewUrl = [string]$review.url } } catch { }
                    $allComments += [PSCustomObject]@{
                        # Review objects are GraphQL node IDs; they are not inline review comments.
                        id = [string]$review.id
                        nodeId = [string]$review.id
                        databaseId = $null
                        body = $review.body
                        author = $review.author
                        createdAt = $review.submittedAt
                        isReviewComment = $true
                        isInlineComment = $false
                        reviewState = $review.state
                        authorType = if ($review.author.type) { $review.author.type } else { $null }
                        authorAssociation = if ($review.author.association) { $review.author.association } else { $null }
                        url = $reviewUrl
                    }
                }
            }
        }
        
        # Add inline code review comments (from review threads if available)
        if ($prData.reviewThreads) {
            foreach ($thread in $prData.reviewThreads) {
                if ($thread.comments) {
                    foreach ($comment in $thread.comments) {
                        $threadCommentUrl = $null
                        try { if ($comment.PSObject.Properties["url"] -and $comment.url) { $threadCommentUrl = [string]$comment.url } } catch { }
                        $allComments += [PSCustomObject]@{
                            id = [string]$comment.id
                            nodeId = [string]$comment.id
                            databaseId = $null
                            body = $comment.body
                            author = $comment.author
                            createdAt = $comment.createdAt
                            isReviewComment = $true
                            isInlineComment = $true
                            path = $thread.path
                            line = if ($comment.line) { $comment.line } else { $null }
                            url = $threadCommentUrl
                        }
                    }
                }
            }
        }
        
        # Also try to get review comments via separate API call if reviewThreads wasn't available
        if (-not $prData.reviewThreads) {
            try {
                $reviewCommentsJson = gh api repos/$(gh repo view --json owner,name -q '.owner.login + "/" + .name')/pulls/$PRNumber/comments 2>&1
                if ($LASTEXITCODE -eq 0) {
                    $reviewComments = $reviewCommentsJson | ConvertFrom-Json
                    foreach ($comment in $reviewComments) {
                        # Only add if not already in our list
                        $exists = $allComments | Where-Object {
                            ($_.nodeId -and $comment.node_id -and $_.nodeId -eq [string]$comment.node_id) -or
                            ($_.databaseId -and $comment.id -and $_.databaseId -eq $comment.id)
                        }
                        if (-not $exists) {
                            $allComments += [PSCustomObject]@{
                                # REST review comments provide both a numeric `id` and a GraphQL `node_id`.
                                # Use node_id as our primary id so it can be used with GraphQL reply mutations.
                                id = [string]$comment.node_id
                                nodeId = [string]$comment.node_id
                                databaseId = $comment.id
                                body = $comment.body
                                author = $comment.user
                                createdAt = $comment.created_at
                                isReviewComment = $true
                                isInlineComment = $true
                                path = $comment.path
                                line = $comment.line
                                url = if ($comment.html_url) { [string]$comment.html_url } else { $null }
                            }
                        }
                    }
                }
            } catch {
                # Ignore errors from this fallback
            }
        }
        
        return $allComments
    }
    catch {
        Write-Warning "Could not fetch review comments for PR #$PRNumber : $($_.Exception.Message)"
        return @()
    }
}

function Get-AutomatedReviewComments {
    <#
    .SYNOPSIS
    Gets all automated review comments (CR-GPT, GitHub Copilot, etc.) from a pull request.
    
    .DESCRIPTION
    Fetches comments from automated code review tools including:
    - CR-GPT (author: "cr-gpt")
    - GitHub Copilot (author: "github-actions[bot]" or contains "copilot" in body/author)
    - Other automated review bots (configurable via $AutomatedReviewAuthors)
    #>
    param(
        [int]$PRNumber,
        [string[]]$AutomatedReviewAuthors = @("cr-gpt", "github-actions[bot]")
    )
    
    try {
        # Get all comments first
        $allComments = Get-AllReviewComments -PRNumber $PRNumber
        
        if ($allComments.Count -eq 0) {
            return @()
        }
        
        # Filter for automated review comments
        $automatedComments = $allComments | Where-Object {
            $authorLogin = $_.author.login
            $authorType = if ($_.author.type) { $_.author.type } else { $null }
            $authorAssociation = if ($_.author.association) { $_.author.association } else { $null }
            $bodyText = if ($_.body) { $_.body } else { "" }
            $bodyLower = $bodyText.ToLower()
            $isAutomated = $false
            
            # Check if author matches known automated review tools
            foreach ($botAuthor in $AutomatedReviewAuthors) {
                if ($authorLogin -eq $botAuthor) {
                    $isAutomated = $true
                    break
                }
            }
            
            # Check for Copilot indicators
            if (-not $isAutomated) {
                # Check author login for Copilot patterns
                $copilotPatterns = @(
                    "*copilot*",
                    "*github-copilot*",
                    "github-actions[bot]",
                    "copilot[bot]"
                )
                
                foreach ($pattern in $copilotPatterns) {
                    if ($authorLogin -like $pattern) {
                        $isAutomated = $true
                        break
                    }
                }
                
                # Check author type (bots are usually "Bot" or "User")
                if (-not $isAutomated -and $authorType -eq "Bot") {
                    # If it's a bot, check if it's likely Copilot
                    if ($authorLogin -like "*copilot*" -or $authorLogin -like "*github-actions*") {
                        $isAutomated = $true
                    }
                }
                
                # Check author association
                if (-not $isAutomated -and $authorAssociation) {
                    if ($authorAssociation -eq "NONE" -and $authorLogin -like "*[bot]*") {
                        # Bot accounts often have NONE association
                        $isAutomated = $true
                    }
                }
                
                # Check comment body for Copilot signatures
                if (-not $isAutomated) {
                    $copilotBodyIndicators = @(
                        "copilot",
                        "github copilot",
                        "ai-generated",
                        "generated by copilot",
                        "<!-- copilot",
                        "copilot:"
                    )
                    
                    foreach ($indicator in $copilotBodyIndicators) {
                        if ($bodyLower -like "*$indicator*") {
                            $isAutomated = $true
                            break
                        }
                    }
                }
            }
            
            return $isAutomated
        }
        
        if ($automatedComments) {
            # Ensure we return an array
            if ($automatedComments -isnot [Array]) {
                return @($automatedComments)
            }
            return $automatedComments
        }
        
        return @()
    }
    catch {
        Write-Warning "Could not fetch automated review comments for PR #$PRNumber : $($_.Exception.Message)"
        return @()
    }
}

function Get-HumanReviewComments {
    <#
    .SYNOPSIS
    Gets all human review comments from a pull request.
    
    .DESCRIPTION
    Fetches comments from human reviewers (excluding automated bots).
    #>
    param(
        [int]$PRNumber,
        [string[]]$AutomatedReviewAuthors = @("cr-gpt", "github-actions[bot]", "copilot[bot]", "github-copilot[bot]")
    )
    
    try {
        # Get all comments first
        $allComments = Get-AllReviewComments -PRNumber $PRNumber
        
        if ($allComments.Count -eq 0) {
            return @()
        }
        
        # Filter for human comments (exclude automated)
        # Use the same logic as Get-AutomatedReviewComments but invert the result
        $humanComments = $allComments | Where-Object {
            $authorLogin = $_.author.login
            $authorType = if ($_.author.type) { $_.author.type } else { $null }
            $authorAssociation = if ($_.author.association) { $_.author.association } else { $null }
            $bodyText = if ($_.body) { $_.body } else { "" }
            $bodyLower = $bodyText.ToLower()
            $isAutomated = $false
            
            # Check if author matches known automated review tools
            foreach ($botAuthor in $AutomatedReviewAuthors) {
                if ($authorLogin -eq $botAuthor) {
                    $isAutomated = $true
                    break
                }
            }
            
            # Check for Copilot indicators
            if (-not $isAutomated) {
                # Check author login for Copilot patterns
                $copilotPatterns = @(
                    "*copilot*",
                    "*github-copilot*",
                    "github-actions[bot]",
                    "copilot[bot]"
                )
                
                foreach ($pattern in $copilotPatterns) {
                    if ($authorLogin -like $pattern) {
                        $isAutomated = $true
                        break
                    }
                }
                
                # Check author type (bots are usually "Bot" or "User")
                if (-not $isAutomated -and $authorType -eq "Bot") {
                    # If it's a bot, check if it's likely Copilot
                    if ($authorLogin -like "*copilot*" -or $authorLogin -like "*github-actions*") {
                        $isAutomated = $true
                    }
                }
                
                # Check author association
                if (-not $isAutomated -and $authorAssociation) {
                    if ($authorAssociation -eq "NONE" -and $authorLogin -like "*[bot]*") {
                        # Bot accounts often have NONE association
                        $isAutomated = $true
                    }
                }
                
                # Check comment body for Copilot signatures
                if (-not $isAutomated) {
                    $copilotBodyIndicators = @(
                        "copilot",
                        "github copilot",
                        "ai-generated",
                        "generated by copilot",
                        "<!-- copilot",
                        "copilot:"
                    )
                    
                    foreach ($indicator in $copilotBodyIndicators) {
                        if ($bodyLower -like "*$indicator*") {
                            $isAutomated = $true
                            break
                        }
                    }
                }
            }
            
            return -not $isAutomated
        }
        
        if ($humanComments) {
            # Ensure we return an array
            if ($humanComments -isnot [Array]) {
                return @($humanComments)
            }
            return $humanComments
        }
        
        return @()
    }
    catch {
        Write-Warning "Could not fetch human review comments for PR #$PRNumber : $($_.Exception.Message)"
        return @()
    }
}

function Get-CRGPTComments {
    <#
    .SYNOPSIS
    Gets all CR-GPT comments from a pull request.
    .NOTES
    This is a convenience wrapper for Get-AutomatedReviewComments that filters specifically for CR-GPT.
    #>
    param([int]$PRNumber)
    
    $allAutomated = Get-AutomatedReviewComments -PRNumber $PRNumber
    return $allAutomated | Where-Object { $_.author.login -eq "cr-gpt" }
}

function Post-CommentResponse {
    <#
    .SYNOPSIS
    Posts a response comment to a GitHub comment using GraphQL API.
    #>
    param(
        # Accept the full comment so we can decide the correct reply mechanism.
        [Parameter(Mandatory)]
        [object]$Comment,
        [Parameter(Mandatory)]
        [string]$ResponseBody,
        [Parameter(Mandatory)]
        [int]$PRNumber,
        # GraphQL node id of the PR (from `gh pr view --json id`)
        [string]$PullRequestId,
        [switch]$DryRun
    )
    
    $commentNodeId = $null
    $commentDbId = $null
    try {
        if ($Comment.PSObject.Properties["nodeId"] -and $Comment.nodeId) { $commentNodeId = [string]$Comment.nodeId }
        elseif ($Comment.PSObject.Properties["id"] -and $Comment.id) { $commentNodeId = [string]$Comment.id }

        if ($Comment.PSObject.Properties["databaseId"] -and $Comment.databaseId) { $commentDbId = $Comment.databaseId }
    } catch {
        # ignore
    }

    if ($DryRun) {
        $idPreview = if ($commentNodeId) { $commentNodeId } else { "[unknown-id]" }
        Write-Host "[DryRun] Would post response to comment $($idPreview.Substring(0, [Math]::Min(20, $idPreview.Length)))..." -ForegroundColor Yellow
        Write-Host "[DryRun] Response preview: $($ResponseBody.Substring(0, [Math]::Min(100, $ResponseBody.Length)))..." -ForegroundColor Gray
        return $true
    }
    
    try {
        Ensure-GhCli

        $postConversationComment = {
            param([string]$Reason)

            $repoInfo = Get-RepoInfo
            if (-not $repoInfo) {
                Write-Warning "Could not determine repo info for posting PR comment"
                return $false
            }

            $contextLines = @()
            if ($Reason) { $contextLines += "*Note:* $Reason" }

            try {
                if ($Comment.PSObject.Properties["path"] -and $Comment.path) { $contextLines += ("*File:* " + [string]$Comment.path) }
                if ($Comment.PSObject.Properties["line"] -and $Comment.line) { $contextLines += ("*Line:* " + [string]$Comment.line) }
                if ($Comment.PSObject.Properties["url"] -and $Comment.url) { $contextLines += ("*Original comment:* " + [string]$Comment.url) }
            } catch { }

            $contextBlock = if ($contextLines.Count -gt 0) { ($contextLines -join "`n") } else { $null }

            $bodyToPost = $ResponseBody
            if ($contextBlock) {
                $bodyToPost = @"
$ResponseBody

---
$contextBlock
"@
            }

            $issueCommentResult = gh api repos/$($repoInfo.Owner)/$($repoInfo.Name)/issues/$PRNumber/comments -X POST -f body=$bodyToPost 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Posted PR conversation comment" -ForegroundColor Green
                return $true
            }

            Write-Warning "Failed to post PR conversation comment: $issueCommentResult"
            return $false
        }

        # Inline code review comments can be replied to (threaded) via GraphQL (or REST replies endpoint).
        $isInlineReviewComment = $false
        try {
            $isInlineReviewComment = [bool]($Comment.isReviewComment -and $Comment.isInlineComment)
        } catch {
            $isInlineReviewComment = $false
        }

        if ($isInlineReviewComment -and $commentNodeId) {
            # True threaded reply: create a PR review comment with `inReplyTo` set to the original review comment ID.
            # This works even when `reviewThreads` is not available in `gh pr view` output.
            $graphqlQuery = @"
mutation(`$pullRequestId: ID!, `$inReplyTo: ID!, `$body: String!) {
  addPullRequestReviewComment(input: {pullRequestId: `$pullRequestId, inReplyTo: `$inReplyTo, body: `$body}) {
    comment { id }
  }
}
"@

            if (-not $PullRequestId) {
                Write-Warning "Missing PullRequestId; cannot post true threaded reply. Falling back to PR conversation comment."
                return (& $postConversationComment "Missing pull request GraphQL id; cannot post threaded reply.")
            }

            $result = gh api graphql -f query=$graphqlQuery -f pullRequestId=$PullRequestId -f inReplyTo=$commentNodeId -f body=$ResponseBody 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Posted inline review comment reply" -ForegroundColor Green
                return $true
            }

            Write-Warning "GraphQL reply failed: $result"
            Write-Host "Threaded reply unavailable; posting to PR conversation instead..." -ForegroundColor Yellow
            return (& $postConversationComment "Unable to post as a threaded reply (GraphQL reply failed).")
        }

        # For non-inline items (PR conversation comments, review body comments), post a normal PR comment.
        # GitHub doesn't support true "replies" for these; we post to the PR conversation instead.
        return (& $postConversationComment $null)
    }
    catch {
        Write-Warning "Error posting response: $($_.Exception.Message)"
        return $false
    }
}

function Handle-Responses {
    <#
    .SYNOPSIS
    Handles review responses (both human and automated) by parsing analysis and posting comments.
    
    .DESCRIPTION
    This function processes review comments from:
    - Human reviewers
    - CR-GPT code review comments
    - GitHub Copilot review comments
    - Other automated review bots
    
    It generates AI-powered responses and posts them as replies to the original comments.
    #>
    param(
        [bool]$IncludeHumanReviews = $false,
        [bool]$IncludeAutomatedReviews = $true
    )
    
    Write-Host "`n🔍 Analyzing PR and generating responses..." -ForegroundColor Cyan
    
    # Get PR data
    $pr = Get-PRData
    $allCommentsToRespond = @()
    
    # Get automated review comments if requested
    if ($IncludeAutomatedReviews) {
        $automatedComments = Get-AutomatedReviewComments -PRNumber $PRNumber
        if ($automatedComments.Count -gt 0) {
            $allCommentsToRespond += $automatedComments
        }
    }
    
    # Get human review comments if requested
    if ($IncludeHumanReviews) {
        $humanComments = Get-HumanReviewComments -PRNumber $PRNumber
        if ($humanComments.Count -gt 0) {
            $allCommentsToRespond += $humanComments
        }
    }
    
    # Debug: Show all comment authors for troubleshooting
    $prDebug = if ($env:PR_DEBUG) { $env:PR_DEBUG } else { $false }
    if ($VerbosePreference -eq "Continue" -or $prDebug -eq "true") {
        Write-Host ("`n📋 Debug: All comments found on PR #" + $PRNumber + ":") -ForegroundColor Gray
        $allComments = Get-AllReviewComments -PRNumber $PRNumber
        if ($allComments.Count -eq 0) {
            Write-Host "  No comments found at all" -ForegroundColor Yellow
        } else {
            foreach ($comment in $allComments) {
                $author = $comment.author.login
                $authorType = if ($comment.author.type) { $comment.author.type } else { "unknown" }
                $authorAssociation = if ($comment.author.association) { $comment.author.association } else { "unknown" }
                $bodyPreview = if ($comment.body) { ($comment.body.Substring(0, [Math]::Min(50, $comment.body.Length))).Replace("`n", " ") } else { "" }
                Write-Host "  - Author: $author (Type: $authorType, Association: $authorAssociation)" -ForegroundColor Gray
                Write-Host "    Preview: $bodyPreview..." -ForegroundColor DarkGray
            }
        }
    }
    
    if ($allCommentsToRespond.Count -eq 0) {
        $message = "No review comments found on PR #$PRNumber"
        if ($IncludeHumanReviews -and $IncludeAutomatedReviews) {
            $message += " (checked both human and automated reviews)"
        } elseif ($IncludeHumanReviews) {
            $message += " (checked human reviews only)"
        } else {
            $message += " (checked automated reviews only)"
        }
        Write-Host "ℹ️  $message. Nothing to respond to." -ForegroundColor Yellow
        
        # If verbose, show what we did find
        if ($VerbosePreference -eq "Continue" -or $env:PR_DEBUG -eq "true") {
            $allComments = Get-AllReviewComments -PRNumber $PRNumber
            if ($allComments.Count -gt 0) {
                Write-Host "`n💡 Tip: Found $($allComments.Count) total comment(s) but none matched the filter criteria." -ForegroundColor Yellow
                Write-Host "   Run with -Verbose to see all comment authors." -ForegroundColor Gray
            }
        }
        return
    }
    
    # Count by type for reporting
    $humanCount = if ($IncludeHumanReviews) { 
        ($allCommentsToRespond | Where-Object { 
            $author = $_.author.login
            $author -ne "cr-gpt" -and $author -notlike "*copilot*" -and $author -ne "github-actions[bot]" -and $author -notlike "*[bot]"
        }).Count 
    } else { 0 }
    
    $crgptCount = ($allCommentsToRespond | Where-Object { $_.author.login -eq "cr-gpt" }).Count
    
    # Count Copilot comments - check multiple patterns
    $copilotCount = ($allCommentsToRespond | Where-Object { 
        $author = $_.author.login
        $author -like "*copilot*" -or 
        $author -eq "github-actions[bot]" -or 
        $author -eq "copilot[bot]" -or
        $author -eq "github-copilot[bot]" -or
        ($_.body -and $_.body.ToLower() -like "*copilot*")
    }).Count
    
    $otherCount = $allCommentsToRespond.Count - $humanCount - $crgptCount - $copilotCount
    
    Write-Host "Found $($allCommentsToRespond.Count) review comment(s):" -ForegroundColor Green
    if ($humanCount -gt 0) { Write-Host "  - $humanCount human reviewer comment(s)" -ForegroundColor Cyan }
    if ($crgptCount -gt 0) { Write-Host "  - $crgptCount CR-GPT comment(s)" -ForegroundColor Cyan }
    if ($copilotCount -gt 0) { Write-Host "  - $copilotCount Copilot comment(s)" -ForegroundColor Cyan }
    if ($otherCount -gt 0) { Write-Host "  - $otherCount other automated comment(s)" -ForegroundColor Cyan }
    
    # Get AI analysis
    $analysisJson = Invoke-Analysis
    if (-not $analysisJson) {
        Write-Host "`n⚠️  AI analysis is unavailable. Cannot generate responses without AI analysis." -ForegroundColor Yellow
        Write-Host "   Please ensure AI services are configured correctly." -ForegroundColor Gray
        return
    }
    
    # Parse analysis JSON
    try {
        $analysis = $analysisJson | ConvertFrom-Json
    }
    catch {
        Write-Warning "Failed to parse analysis JSON: $($_.Exception.Message)"
        Write-Host "Raw analysis output:" -ForegroundColor Yellow
        Write-Host $analysisJson
        Write-Host "`n⚠️  Cannot generate responses without valid analysis JSON." -ForegroundColor Yellow
        return
    }
    
    # Extract review responses from analysis
    # Support multiple response formats: human_review_responses, automated_review_responses, cr_gpt_responses (legacy)
    $responses = @()
    if ($analysis.human_review_responses) {
        $responses += $analysis.human_review_responses
    }
    if ($analysis.automated_review_responses) {
        $responses += $analysis.automated_review_responses
    }
    if ($analysis.cr_gpt_responses -and $responses.Count -eq 0) {
        # Legacy format - only use if no new format responses found
        $responses = $analysis.cr_gpt_responses
    }
    
    if ($responses.Count -eq 0) {
        Write-Host "ℹ️  No responses generated in analysis. All comments may already be addressed." -ForegroundColor Yellow
        return
    }
    
    Write-Host "Generated $($responses.Count) response(s)" -ForegroundColor Green
    
    # Match responses to comments and post
    $postedCount = 0
    $skippedCount = 0
    
    foreach ($response in $responses) {
        if (-not $response.response -or [string]::IsNullOrWhiteSpace($response.response)) {
            Write-Warning "Skipping response with empty body"
            $skippedCount++
            continue
        }
        
        # Try to find matching comment by ID or body
        $targetComment = $null
        
        if ($response.comment_id) {
            # Try to find by comment ID (GraphQL node ID or numeric database id)
            $cid = $response.comment_id
            $cidNum = $null
            $hasCidNum = $false
            try {
                $tmp = [long]0
                $hasCidNum = [long]::TryParse([string]$cid, [ref]$tmp)
                if ($hasCidNum) { $cidNum = $tmp }
            } catch {
                $hasCidNum = $false
            }

            $targetComment = $allCommentsToRespond | Where-Object {
                ($_.id -and $cid -and $_.id -eq [string]$cid) -or
                ($_.nodeId -and $cid -and $_.nodeId -eq [string]$cid) -or
                ($_.databaseId -and $hasCidNum -and ([long]$_.databaseId -eq [long]$cidNum))
            } | Select-Object -First 1
        }
        
        if (-not $targetComment -and $response.comment_body) {
            # Fallback: try to match by comment body (first 100 chars)
            $bodyPrefix = $response.comment_body.Substring(0, [Math]::Min(100, $response.comment_body.Length))
            $targetComment = $allCommentsToRespond | Where-Object { 
                $_.body -and $_.body.StartsWith($bodyPrefix)
            } | Select-Object -First 1
        }
        
        if (-not $targetComment) {
            Write-Warning "Could not find matching comment for response. Comment ID: $($response.comment_id)"
            $skippedCount++
            continue
        }
        
        # Post the response
        if ($DryRun) {
            $success = Post-CommentResponse -Comment $targetComment -ResponseBody $response.response -PRNumber $PRNumber -PullRequestId $pr.id -DryRun
        } else {
            $success = Post-CommentResponse -Comment $targetComment -ResponseBody $response.response -PRNumber $PRNumber -PullRequestId $pr.id
        }
        
        if ($success) {
            $postedCount++

            # Auto-resolve inline review threads after replying (only applies to inline review comments).
            $autoResolve = ($env:PR_AUTO_RESOLVE_THREADS ?? "").Trim().ToLowerInvariant()
            if (-not $DryRun -and ($autoResolve -in @("1","true","yes","y","on"))) {
                try {
                    if ($targetComment.isReviewComment -and $targetComment.isInlineComment -and $pr.id -and $targetComment.nodeId) {
                        $threadId = Get-ReviewThreadIdForComment -PullRequestId $pr.id -CommentNodeId $targetComment.nodeId
                        if ($threadId) {
                            $resolved = Resolve-ReviewThread -ThreadId $threadId
                            if ($resolved) {
                                Write-Host "  ✓ Resolved review thread" -ForegroundColor Green
                            } else {
                                Write-Warning "Failed to resolve review thread (threadId=$threadId)"
                            }
                        } else {
                            Write-Warning "Could not find review thread for comment nodeId=$($targetComment.nodeId)"
                        }
                    }
                } catch {
                    Write-Warning "Auto-resolve failed: $($_.Exception.Message)"
                }
            }

            Write-Host "  ✓ Posted response to comment: $($targetComment.id.Substring(0, [Math]::Min(20, $targetComment.id.Length)))..." -ForegroundColor Green
        } else {
            $skippedCount++
        }
    }
    
    Write-Host "`n📊 Response Summary:" -ForegroundColor Cyan
    Write-Host "  Posted: $postedCount" -ForegroundColor Green
    Write-Host "  Skipped: $skippedCount" -ForegroundColor Yellow
    
    if ($DryRun) {
        Write-Host "`n⚠️  Dry-run mode: No comments were actually posted." -ForegroundColor Yellow
    }
}

function Invoke-PRCreation {
    <#
    .SYNOPSIS
    Creates a pull request from an issue using the create-pr-from-issue script.
    #>
    
    if ($IssueNumber -eq 0) {
        throw "IssueNumber is required for 'create' action. Use -IssueNumber <NUMBER>"
    }
    
    $scriptDir = Get-ScriptDirectory
    $createScriptPath = Join-Path $scriptDir "create-pr-from-issue.ps1"
    
    if (-not (Test-Path $createScriptPath)) {
        throw "PR creation script not found: $createScriptPath"
    }
    
    Write-Host "`n🚀 Creating PR from issue #$IssueNumber..." -ForegroundColor Cyan
    
    $scriptArgs = @(
        "-IssueNumber", $IssueNumber,
        "-BaseBranch", $BaseBranch,
        "-SignOff"
    )
    
    if ($DryRun) {
        $scriptArgs += "-DryRun"
    }
    
    & $createScriptPath @scriptArgs
    
    if ($LASTEXITCODE -ne 0) {
        throw "Failed to create PR from issue #$IssueNumber"
    }
}

function Invoke-RequestReview {
    <#
    .SYNOPSIS
    Requests a new review on the PR, typically after changes have been addressed.
    #>
    
    Write-Host "`n📬 Requesting new review for PR #$PRNumber..." -ForegroundColor Cyan
    
    $scriptDir = Get-ScriptDirectory
    $requestReviewScriptPath = Join-Path $scriptDir "request-pr-review.ps1"
    
    if (-not (Test-Path $requestReviewScriptPath)) {
        throw "Request review script not found: $requestReviewScriptPath"
    }
    
    $scriptArgs = @(
        "-PRNumber", $PRNumber,
        "-AutoDetect"
    )
    
    if ($DryRun) {
        $scriptArgs += "-DryRun"
    }
    
    & $requestReviewScriptPath @scriptArgs
    
    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed to request review for PR #$PRNumber (this may be okay if no reviewers found)"
    }
}

# Validate parameters based on action
if ($Action -eq "create") {
    if ($IssueNumber -eq 0) {
        throw "IssueNumber is required for 'create' action. Use -IssueNumber <NUMBER>"
    }
} elseif ($Action -ne "create" -and $Action -ne "request-review") {
    if ($PRNumber -eq 0) {
        throw "PRNumber is required for action '$Action'. Use -PRNumber <NUMBER>"
    }
} elseif ($Action -eq "request-review") {
    if ($PRNumber -eq 0) {
        throw "PRNumber is required for 'request-review' action. Use -PRNumber <NUMBER>"
    }
}

# Load environment variables from .env.local if it exists (before any actions)
Load-EnvFile | Out-Null

switch ($Action) {
    "create"         { Invoke-PRCreation }
    "monitor"        { Show-MonitorStatus }
    "analyze"        { Invoke-Analysis }
    "respond"        { Handle-Responses -IncludeHumanReviews $true -IncludeAutomatedReviews $true }
    "respond-human"  { Handle-Responses -IncludeHumanReviews $true -IncludeAutomatedReviews $false }
    "respond-ai"     { Handle-Responses -IncludeHumanReviews $false -IncludeAutomatedReviews $true }
    "quality"        { Invoke-QualityChecks }
    "docs"           { Invoke-DocsUpdate }
    "request-review" { Invoke-RequestReview }
    "all"            {
        if ($PRNumber -eq 0) {
            throw "PRNumber is required for 'all' action. Use -PRNumber <NUMBER>"
        }
        if ($AutoFix) {
            Fix-PRBaseBranch
        }
        Show-MonitorStatus
        Invoke-Analysis
        Handle-Responses -IncludeHumanReviews $true -IncludeAutomatedReviews $true
        Invoke-QualityChecks
        Invoke-DocsUpdate
    }
}

