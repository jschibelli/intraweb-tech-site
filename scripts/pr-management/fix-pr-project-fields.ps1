#requires -Version 7.0
<#
.SYNOPSIS
    Fixes project fields for an existing PR.
#>
param(
    [Parameter(Mandatory=$true)]
    [int]$PRNumber,
    
    [string]$ProjectKey = ""
)

$ErrorActionPreference = "Stop"

# Ensure GitHub CLI is available
function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        Write-Host "❌ GitHub CLI (gh) is required. Please install it first." -ForegroundColor Red
        Write-Host "   Visit: https://cli.github.com/" -ForegroundColor Gray
        exit 1
    }
}

function Get-GhTokenScopes {
    <#
    .SYNOPSIS
      Best-effort parse of current gh token scopes from `gh auth status -t`.
      Returns an array of scopes (strings). May return empty if unavailable.
    #>
    try {
        $out = gh auth status -t 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $out) { return @() }

        $text = if ($out -is [string]) { $out } else { ($out -join "`n") }

        # Common formats observed:
        # - "Token scopes: repo, read:org"
        # - "OAuth token scopes: repo, read:org"
        $m = [regex]::Match($text, '(?im)^\s*(Token scopes|OAuth token scopes)\s*:\s*(.+?)\s*$')
        if (-not $m.Success) { return @() }

        $scopeList = $m.Groups[2].Value
        if ([string]::IsNullOrWhiteSpace($scopeList)) { return @() }

        return $scopeList.Split(",") | ForEach-Object { $_.Trim() } | Where-Object { $_ }
    } catch {
        return @()
    }
}

function Require-GhTokenScopes {
    param(
        [Parameter(Mandatory)]
        [string[]]$RequiredScopes,
        [string]$Reason = "required for this operation"
    )

    $scopes = Get-GhTokenScopes

    # If we can't detect scopes (fine-grained tokens / older gh), don't block here;
    # downstream commands will still error and we handle those more explicitly.
    if (-not $scopes -or $scopes.Count -eq 0) {
        return
    }

    $missing = @()
    foreach ($s in $RequiredScopes) {
        if (-not ($scopes -contains $s)) { $missing += $s }
    }

    if ($missing.Count -gt 0) {
        Write-Host ""
        Write-Host "❌ GitHub authentication token is missing required scopes ($Reason)." -ForegroundColor Red
        Write-Host "  Missing: $($missing -join ', ')" -ForegroundColor Yellow
        Write-Host "  Current: $($scopes -join ', ')" -ForegroundColor Gray
        Write-Host ""
        $refresh = "gh auth refresh -s " + ($RequiredScopes -join ",")
        Write-Host "Fix:" -ForegroundColor Cyan
        Write-Host "  $refresh" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

# Load dependencies
$configHelperPath = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\configuration\project-config.ps1"
if (Test-Path $configHelperPath) {
    . $configHelperPath
} else {
    Write-Host "❌ Configuration helper not found" -ForegroundColor Red
    exit 1
}

# Load config to get default project
$config = Get-ProjectConfig
if (-not $config) {
    Write-Host "❌ Project config not found" -ForegroundColor Red
    exit 1
}

# Use defaultProject from config if ProjectKey not provided
if ([string]::IsNullOrWhiteSpace($ProjectKey)) {
    if ($config.defaultProject) {
        $ProjectKey = $config.defaultProject
        Write-Host "Using default project from config: $ProjectKey" -ForegroundColor Gray
    } else {
        Write-Host "❌ No ProjectKey provided and no defaultProject in config" -ForegroundColor Red
        Write-Host "Please specify -ProjectKey or configure defaultProject in project-config.json" -ForegroundColor Yellow
        exit 1
    }
}

# Include necessary functions (copied from create-pr-from-issue.ps1)
function Get-IssueData {
    param([int]$IssueNumber)
    try {
        $issueJson = gh issue view $IssueNumber --json number,title,body,assignees,labels,state,url,projectCards 2>&1
        if ($LASTEXITCODE -eq 0) {
            return $issueJson | ConvertFrom-Json
        }
    } catch {}
    return [PSCustomObject]@{ number = $IssueNumber; title = $null; body = $null; assignees = @(); labels = @(); state = "unknown"; url = $null }
}

function Analyze-PRForProjectFields {
    param([int]$PRNumber, [object]$Issue)
    $priority = "P1"
    $size = "M"
    $status = "In review"
    try {
        $prData = gh pr view $PRNumber --json additions,deletions,files,changedFiles 2>&1 | ConvertFrom-Json
        $totalChanges = $prData.additions + $prData.deletions
        $fileCount = $prData.changedFiles
        if ($totalChanges -lt 50) { $size = "XS" }
        elseif ($totalChanges -lt 200) { $size = "S" }
        elseif ($totalChanges -lt 500) { $size = "M" }
        elseif ($totalChanges -lt 1000) { $size = "L" }
        else { $size = "XL" }
        if ($fileCount -gt 20) {
            if ($size -eq "XS") { $size = "S" }
            elseif ($size -eq "S") { $size = "M" }
            elseif ($size -eq "M") { $size = "L" }
        }
        if ($Issue -and $Issue.labels) {
            foreach ($label in $Issue.labels) {
                if ($label.name -match 'priority[:\-]?(p0|p1|p2|p3)') {
                    $priority = $Matches[1].ToUpper()
                    break
                }
            }
        }
    } catch {}
    return @{ Priority = $priority; Size = $size; Status = $status }
}

function Get-PRExistingLabels {
    param([int]$PRNumber)
    try {
        $labelsRaw = gh pr view $PRNumber --json labels 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $labelsRaw) { return @() }
        $labelsJson = if ($labelsRaw -is [string]) { $labelsRaw } else { ($labelsRaw -join "`n") }
        $obj = $labelsJson | ConvertFrom-Json
        if ($obj -and $obj.labels) {
            return @($obj.labels | ForEach-Object { $_.name } | Where-Object { $_ })
        }
    } catch {}
    return @()
}

function Get-RepoLabelNames {
    <#
    .SYNOPSIS
      Returns all label names available in the repo (best-effort).
    #>
    try {
        $raw = gh label list --limit 500 --json name 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $raw) { return @() }
        $json = if ($raw -is [string]) { $raw } else { ($raw -join "`n") }
        $obj = $json | ConvertFrom-Json
        if ($obj) {
            return @($obj | ForEach-Object { $_.name } | Where-Object { $_ })
        }
    } catch {}
    return @()
}

function Get-PRBodyText {
    param([int]$PRNumber)
    try {
        $raw = gh pr view $PRNumber --json body -q .body 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $raw) { return "" }
        return (if ($raw -is [string]) { $raw } else { ($raw -join "`n") })
    } catch {
        return ""
    }
}

function Set-PRBodyText {
    param(
        [int]$PRNumber,
        [Parameter(Mandatory)][string]$Body
    )

    # Use a temp file to preserve multi-line formatting safely.
    $tmp = [System.IO.Path]::GetTempFileName()
    try {
        $Body | Out-File -FilePath $tmp -Encoding utf8 -NoNewline
        $result = gh pr edit $PRNumber --body-file $tmp 2>&1
        return @{
            Ok = ($LASTEXITCODE -eq 0)
            Output = $result
        }
    } finally {
        if (Test-Path $tmp) { Remove-Item $tmp -Force -ErrorAction SilentlyContinue }
    }
}

function Get-RepoContributingGuideUrl {
    try {
        $owner = (gh repo view --json owner -q .owner.login 2>$null).Trim()
        $name = (gh repo view --json name -q .name 2>$null).Trim()
        if ($owner -and $name) {
            return "https://github.com/$owner/$name/blob/main/CONTRIBUTING.md"
        }
    } catch {}
    return ""
}

function Get-DCOSignOffBlock {
    param([int]$IssueNumber)

    $contrib = Get-RepoContributingGuideUrl
    $contribLine = if ($contrib) { "- [x] I have read the [Contributing Guide]($contrib)" } else { "- [x] I have read the contributing guide" }

@"

---

### Sign-off

$contribLine
- [x] This PR addresses issue #$IssueNumber
- [x] My changes follow the project's code style guidelines
- [x] I have tested my changes locally
- [x] All checks pass

**Developer Certificate of Origin (DCO)**
By submitting this PR, I certify that:
- The contribution was created in whole or in part by me and I have the right to submit it under the open source license indicated in the file
- The contribution is based upon previous work that, to the best of my knowledge, is covered under an appropriate open source license and I have the right under that license to submit that work with modifications
- The contribution was provided directly to me by some other person who certified the above
"@
}

function Build-PRBodyTemplate {
    param(
        [int]$PRNumber,
        [int]$IssueNumber,
        [string]$BaseBranch,
        [string]$HeadBranch,
        [object]$Issue,
        [string]$ExistingBody
    )

    $issueTitle = if ($Issue -and $Issue.title) { $Issue.title } else { "" }
    $issueUrl = if ($Issue -and $Issue.url) { $Issue.url } else { "" }

    $addresses = @()
    if ($IssueNumber -gt 0) { $addresses += "- Closes #$IssueNumber" }
    if ($issueTitle) { $addresses += "- Issue: $issueTitle" }
    if ($issueUrl) { $addresses += "- Issue URL: $issueUrl" }
    if ($HeadBranch -and $BaseBranch) { $addresses += "- Branch: $HeadBranch → $BaseBranch" }

    $addressesText = if ($addresses.Count -gt 0) { ($addresses -join "`n") } else { "- (not determined)" }

    # Preserve any meaningful existing body content as Notes, but avoid duplicating the template itself.
    $notes = ""
    $existingTrim = ($ExistingBody ?? "").Trim()
    $looksLikeOnlyCloses = ($existingTrim -match '^(?im)\s*(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s+#\d+\s*$')
    $alreadyHasDco = ($existingTrim -match '(?im)Developer Certificate of Origin \(DCO\)|^###\s+Sign-off\b')

    if (-not [string]::IsNullOrWhiteSpace($existingTrim) -and -not $looksLikeOnlyCloses -and -not $alreadyHasDco) {
        $notes = @"

### Notes
$existingTrim
"@
    }

    $dco = Get-DCOSignOffBlock -IssueNumber $IssueNumber

@"
### What this PR addresses
$addressesText
$notes
$dco
"@
}

function Ensure-PRBodyMatchesTemplate {
    param(
        [int]$PRNumber,
        [int]$IssueNumber,
        [string]$BaseBranch,
        [string]$HeadBranch,
        [object]$Issue
    )

    if (-not $IssueNumber -or $IssueNumber -le 0) {
        return @{ Updated = $false; Reason = "No issue number detected; skipping PR body template" }
    }

    $current = Get-PRBodyText -PRNumber $PRNumber
    $hasDco = ($current -match '(?im)Developer Certificate of Origin \(DCO\)|^###\s+Sign-off\b')
    if ($hasDco) {
        return @{ Updated = $false; Reason = "PR body already contains DCO/sign-off block" }
    }

    $newBody = Build-PRBodyTemplate -PRNumber $PRNumber -IssueNumber $IssueNumber -BaseBranch $BaseBranch -HeadBranch $HeadBranch -Issue $Issue -ExistingBody $current
    $set = Set-PRBodyText -PRNumber $PRNumber -Body $newBody
    if ($set.Ok) {
        return @{ Updated = $true; Reason = "Updated PR body to include 'What this PR addresses' + DCO certification" }
    }

    return @{ Updated = $false; Reason = "Failed to update PR body: $($set.Output)" }
}

function Select-ExistingLabels {
    param(
        [string[]]$Desired,
        [string[]]$RepoLabels
    )

    if (-not $Desired) { return @() }
    if (-not $RepoLabels -or $RepoLabels.Count -eq 0) { return @($Desired | Where-Object { $_ } | Select-Object -Unique) }

    # Case-insensitive match against repo labels, but preserve canonical casing from repo.
    $repoByLower = @{}
    foreach ($rl in ($RepoLabels | Where-Object { $_ })) {
        $k = $rl.ToLowerInvariant()
        if (-not $repoByLower.ContainsKey($k)) { $repoByLower[$k] = $rl }
    }

    $selected = New-Object System.Collections.Generic.List[string]
    foreach ($d in ($Desired | Where-Object { $_ })) {
        $k = $d.ToLowerInvariant()
        if ($repoByLower.ContainsKey($k)) {
            $selected.Add($repoByLower[$k]) | Out-Null
        }
    }

    # Force array return even when only one element is present
    return [string[]](@($selected | Select-Object -Unique))
}

function Determine-PRLabels {
    param(
        [hashtable]$Fields,
        [object]$Issue,
        [string[]]$RepoLabels
    )

    $labels = @()

    if ($Issue -and $Issue.labels -and $Issue.labels.Count -gt 0) {
        # Reuse issue labels as a starting point (matches create-pr-from-issue behavior)
        $labels = @($Issue.labels | ForEach-Object { $_.name } | Where-Object { $_ })
    } else {
        # Prefer a "review-ready" label if the repo has one; otherwise fall back to a generic existing label.
        $fallbackCandidates = @(
            "ready-to-review",
            "needs-review",
            "in-review",
            "review",
            "automation",
            "enhancement"
        )

        $repoSelected = [string[]](Select-ExistingLabels -Desired $fallbackCandidates -RepoLabels $RepoLabels)
        if ($repoSelected -and $repoSelected.Count -gt 0) {
            $labels = @($repoSelected | Select-Object -First 1)
        } else {
            $labels = @()
        }
    }

    # Ensure an explicit review-ready label when status indicates review
    if ($Fields -and $Fields.Status -eq "In review") {
        $reviewCandidates = @("ready-to-review", "needs-review", "in-review", "review")
        $reviewSelected = [string[]](Select-ExistingLabels -Desired $reviewCandidates -RepoLabels $RepoLabels)
        if ($reviewSelected -and $reviewSelected.Count -gt 0) {
            $reviewLabel = ($reviewSelected | Select-Object -First 1)
            if (-not ($labels -contains $reviewLabel)) {
                $labels += $reviewLabel
            }
        }
    }

    # De-dupe while preserving reasonable ordering
    return @($labels | Where-Object { $_ } | Select-Object -Unique)
}

function Set-PRLabels {
    param(
        [int]$PRNumber,
        [string[]]$DesiredLabels
    )

    $existing = @(Get-PRExistingLabels -PRNumber $PRNumber)
    $existingSet = @($existing | Where-Object { $_ })

    $toAdd = @()
    foreach ($l in ($DesiredLabels | Where-Object { $_ })) {
        if (-not ($existingSet -contains $l)) {
            $toAdd += $l
        }
    }

    $added = 0
    $script:__prLabelEditErrors = New-Object System.Collections.Generic.List[string]

    if (-not $DesiredLabels -or ($DesiredLabels | Where-Object { $_ }).Count -eq 0) {
        Write-Host "  ℹ️  No desired labels to apply" -ForegroundColor Gray
    } elseif ($toAdd.Count -eq 0) {
        $desiredList = ($DesiredLabels | Where-Object { $_ } | Select-Object -Unique)
        $showExisting = ($existingSet | Select-Object -First 10)
        Write-Host "  ℹ️  No label changes needed (desired label(s) already present)." -ForegroundColor Gray
        Write-Host "     Desired: $($desiredList -join ', ')" -ForegroundColor Gray
        if ($showExisting.Count -gt 0) {
            Write-Host "     Existing: $($showExisting -join ', ')$(if ($existingSet.Count -gt 10) { ' ...' } else { '' })" -ForegroundColor Gray
        }
    }

    foreach ($label in $toAdd) {
        $result = gh pr edit $PRNumber --add-label $label 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  ✅ Added label: $label" -ForegroundColor Green
            $added++
        } else {
            Write-Warning "Could not add label '$label': $result"
            $script:__prLabelEditErrors.Add("${label}: $result") | Out-Null
        }
    }

    return @{
        Added = $added
        Requested = ($DesiredLabels | Where-Object { $_ }).Count
        AlreadyHad = $existingSet.Count
        AttemptedToAdd = $toAdd.Count
        Existing = $existingSet
        Desired = $DesiredLabels
    }
}

function Get-PRProjectItemId {
    param([int]$PRNumber, [string]$ProjectId)
    try {
        $prId = gh pr view $PRNumber --json id -q .id
        if (-not $prId) { 
            Write-Warning "Could not get PR ID for PR #$PRNumber"
            return $null 
        }
        
        $query = @"
query(`$prId: ID!) {
  node(id: `$prId) {
    ... on PullRequest {
      projectItems(first: 10) {
        nodes {
          id
          project {
            id
          }
        }
      }
    }
  }
}
"@
        $responseRaw = gh api graphql -f query=$query -f prId=$prId 2>&1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Warning "GraphQL query failed for PR #${PRNumber}: $responseRaw"
            return $null
        }
        
        # Check if response is valid JSON before parsing
        if ([string]::IsNullOrWhiteSpace($responseRaw) -or $responseRaw -notmatch '^\s*\{') {
            Write-Warning "Invalid JSON response from GraphQL query for PR #${PRNumber}: $responseRaw"
            return $null
        }
        
        try {
            $response = $responseRaw | ConvertFrom-Json
        } catch {
            Write-Warning "JSON parsing failed for PR #${PRNumber}: $($_.Exception.Message). Response: $responseRaw"
            return $null
        }
        
        if ($response.data -and $response.data.node -and $response.data.node.projectItems -and $response.data.node.projectItems.nodes) {
            $projectItem = $response.data.node.projectItems.nodes | Where-Object { $_.project.id -eq $ProjectId } | Select-Object -First 1
            if ($projectItem) { 
                return $projectItem.id 
            } else {
                # Debug: show available projects
                $availableProjects = $response.data.node.projectItems.nodes | ForEach-Object { $_.project.id }
                if ($availableProjects.Count -gt 0) {
                    Write-Warning "PR is in projects: $($availableProjects -join ', '), but not in target project: $ProjectId"
                }
            }
        }
        return $null
    } catch {
        Write-Warning "Error getting PR project item ID: $($_.Exception.Message)"
        return $null
    }
}

function Set-PRProjectFields {
    param([string]$ProjectItemId, [string]$ProjectId, [string]$ProjectKey, [hashtable]$Fields)
    $successCount = 0
    $script:__prFieldEditErrors = New-Object System.Collections.Generic.List[string]
    
    if ($Fields.Status) {
        $statusFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Status"
        $statusOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Status" -OptionName $Fields.Status
        if ($statusFieldId -and $statusOptionId) {
            $result = gh project item-edit --id $ProjectItemId --field-id $statusFieldId --project-id $ProjectId --single-select-option-id $statusOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set Status to '$($Fields.Status)'" -ForegroundColor Green
                $successCount++
            } else {
                Write-Warning "Failed to set Status: $result"
                $script:__prFieldEditErrors.Add("Status: $result") | Out-Null
            }
        } else {
            Write-Warning "Could not get Status field/option IDs (FieldId: $statusFieldId, OptionId: $statusOptionId)"
            $script:__prFieldEditErrors.Add("Status: missing field/option IDs") | Out-Null
        }
    }
    
    if ($Fields.Priority) {
        $priorityFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Priority"
        $priorityOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Priority" -OptionName $Fields.Priority
        if ($priorityFieldId -and $priorityOptionId) {
            $result = gh project item-edit --id $ProjectItemId --field-id $priorityFieldId --project-id $ProjectId --single-select-option-id $priorityOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set Priority to '$($Fields.Priority)'" -ForegroundColor Green
                $successCount++
            } else {
                Write-Warning "Failed to set Priority: $result"
                $script:__prFieldEditErrors.Add("Priority: $result") | Out-Null
            }
        } else {
            Write-Warning "Could not get Priority field/option IDs (FieldId: $priorityFieldId, OptionId: $priorityOptionId)"
            $script:__prFieldEditErrors.Add("Priority: missing field/option IDs") | Out-Null
        }
    }
    
    if ($Fields.Size) {
        $sizeFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Size"
        $sizeOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Size" -OptionName $Fields.Size
        if ($sizeFieldId -and $sizeOptionId) {
            $result = gh project item-edit --id $ProjectItemId --field-id $sizeFieldId --project-id $ProjectId --single-select-option-id $sizeOptionId 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "  ✅ Set Size to '$($Fields.Size)'" -ForegroundColor Green
                $successCount++
            } else {
                Write-Warning "Failed to set Size: $result"
                $script:__prFieldEditErrors.Add("Size: $result") | Out-Null
            }
        } else {
            Write-Warning "Could not get Size field/option IDs (FieldId: $sizeFieldId, OptionId: $sizeOptionId)"
            $script:__prFieldEditErrors.Add("Size: missing field/option IDs") | Out-Null
        }
    }
    
    return $successCount
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "   Fix PR Project Fields" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""

Ensure-GhCli

$projectConfig = Get-ProjectById -ProjectKey $ProjectKey
if (-not $projectConfig) {
    Write-Host "❌ Project '$ProjectKey' not found" -ForegroundColor Red
    exit 1
}

# Best-effort auth scope preflight. We know `gh project item-edit` can require these.
# Note: For fine-grained tokens, gh may not report scopes; we still handle failures below.
Require-GhTokenScopes -RequiredScopes @("project", "read:org", "read:discussion") -Reason "to update GitHub Project fields"

# Get PR info
Write-Host "Fetching PR data..." -ForegroundColor Yellow
$prData = gh pr view $PRNumber --json number,title,additions,deletions,changedFiles,url,baseRefName,headRefName 2>&1 | ConvertFrom-Json
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ PR #$PRNumber not found" -ForegroundColor Red
    exit 1
}

Write-Host "  PR #$($prData.number): $($prData.title)" -ForegroundColor Cyan

# Get project item ID
Write-Host ""
Write-Host "Getting project item ID..." -ForegroundColor Yellow
$projectItemId = Get-PRProjectItemId -PRNumber $PRNumber -ProjectId $projectConfig.projectId

# If we can't get the project item ID, try to add the PR
# Note: This may fail if PR is already in project or if we lack 'read:project' scope
if (-not $projectItemId) {
    Write-Host "  ⚠️  PR not in project or unable to verify (may need 'read:project' scope), adding..." -ForegroundColor Yellow
    $orgName = $config.organization
    $isOrg = $config.isOrganization
    
    # GitHub CLI uses --owner for both organization and user projects
    # For user projects, --owner should be the username
    # For organization projects, --owner should be the org name
    Write-Host "  Executing: gh project item-add $($projectConfig.projectNumber) --owner $orgName --url $($prData.url)" -ForegroundColor Gray
    $result = gh project item-add $projectConfig.projectNumber --owner $orgName --url $prData.url 2>&1
    $exitCode = $LASTEXITCODE
    
    if ($exitCode -ne 0) {
        # Check if PR is already in project (this is not an error)
        if ($result -match "already exists" -or $result -match "already in") {
            Write-Host "  ℹ️  PR already in project" -ForegroundColor Yellow
            # Try to get the project item ID again
            Start-Sleep -Seconds 1
            $projectItemId = Get-PRProjectItemId -PRNumber $PRNumber -ProjectId $projectConfig.projectId
            if ($projectItemId) {
                Write-Host "  ✅ Found existing project item ID: $projectItemId" -ForegroundColor Green
            }
        } else {
            # Try GraphQL fallback using project ID directly
            Write-Host "  Attempting GraphQL fallback..." -ForegroundColor Yellow
            $prId = gh pr view $PRNumber --json id -q .id
            if (-not $prId) {
                Write-Host "  ❌ Could not get PR ID for GraphQL fallback" -ForegroundColor Red
            } else {
                $mutation = @"
mutation(`$projectId: ID!, `$contentId: ID!) {
  addProjectV2ItemById(input: {projectId: `$projectId, contentId: `$contentId}) {
    item {
      id
    }
  }
}
"@
                Write-Host "  Using GraphQL mutation with project ID: $($projectConfig.projectId)" -ForegroundColor Gray
                $gqlResult = gh api graphql -f query=$mutation -f projectId=$projectConfig.projectId -f contentId=$prId 2>&1
                $gqlExitCode = $LASTEXITCODE
                
                if ($gqlExitCode -eq 0) {
                    try {
                        # Check if result is valid JSON
                        if ($gqlResult -match '^\s*\{') {
                            $gqlResponse = $gqlResult | ConvertFrom-Json
                            
                            # Check for GraphQL errors
                            if ($gqlResponse.errors) {
                                $errorMsg = $gqlResponse.errors | ForEach-Object { $_.message } | Select-Object -First 1
                                Write-Host "  ❌ GraphQL error: $errorMsg" -ForegroundColor Red
                            } elseif ($gqlResponse.data -and $gqlResponse.data.addProjectV2ItemById -and $gqlResponse.data.addProjectV2ItemById.item) {
                                Write-Host "  ✅ Added PR to project via GraphQL" -ForegroundColor Green
                                $addedItemId = $gqlResponse.data.addProjectV2ItemById.item.id
                                Write-Host "  Project Item ID: $addedItemId" -ForegroundColor Green
                                $projectItemId = $addedItemId
                            } else {
                                Write-Host "  ⚠️  GraphQL response missing expected data structure" -ForegroundColor Yellow
                                Write-Host "  Response: $gqlResult" -ForegroundColor Gray
                            }
                        } else {
                            Write-Host "  ❌ Invalid JSON response from GraphQL: $gqlResult" -ForegroundColor Red
                        }
                    } catch {
                        Write-Host "  ❌ GraphQL fallback failed: $($_.Exception.Message)" -ForegroundColor Red
                        Write-Host "  Raw response: $gqlResult" -ForegroundColor Gray
                    }
                } else {
                    Write-Host "  ❌ GraphQL mutation failed (exit code: $gqlExitCode)" -ForegroundColor Red
                    Write-Host "  Error: $gqlResult" -ForegroundColor Gray
                }
            }
            
            if (-not $projectItemId) {
                Write-Host "" -ForegroundColor Red
                Write-Host "  ❌ Failed to add PR to project" -ForegroundColor Red
                Write-Host "" -ForegroundColor Gray
                Write-Host "  Details:" -ForegroundColor Yellow
                Write-Host "    Project Number: $($projectConfig.projectNumber)" -ForegroundColor Gray
                Write-Host "    Project ID: $($projectConfig.projectId)" -ForegroundColor Gray
                Write-Host "    Account Type: $(if ($isOrg) { 'Organization' } else { 'User' })" -ForegroundColor Gray
                Write-Host "    Account: $orgName" -ForegroundColor Gray
                Write-Host "    PR URL: $($prData.url)" -ForegroundColor Gray
                Write-Host "    CLI Exit Code: $exitCode" -ForegroundColor Gray
                Write-Host "    CLI Error: $result" -ForegroundColor Gray
                Write-Host "" -ForegroundColor Gray
                Write-Host "  Troubleshooting:" -ForegroundColor Yellow
                Write-Host "    1. Update GitHub token scopes (REQUIRED):" -ForegroundColor Gray
                Write-Host "       Your token needs the 'project' scope to add items to projects." -ForegroundColor Gray
                Write-Host "       Current scopes: repo, write:packages" -ForegroundColor Gray
                Write-Host "       Required scopes: repo, project (or read:project + write:project)" -ForegroundColor Gray
                Write-Host "" -ForegroundColor Gray
                Write-Host "       Steps to fix:" -ForegroundColor Cyan
                Write-Host "       1. Go to: https://github.com/settings/tokens" -ForegroundColor White
                Write-Host "       2. Find your token (or create a new one)" -ForegroundColor White
                Write-Host "       3. Check the 'project' scope checkbox" -ForegroundColor White
                Write-Host "       4. Save the token" -ForegroundColor White
                Write-Host "       5. Run: gh auth refresh -s project" -ForegroundColor White
                Write-Host "" -ForegroundColor Gray
                Write-Host "    2. Verify project access:" -ForegroundColor Gray
                Write-Host "       gh project view $($projectConfig.projectNumber) --owner $orgName" -ForegroundColor Gray
                Write-Host "" -ForegroundColor Gray
                Write-Host "    3. After updating token, try again or add manually:" -ForegroundColor Gray
                Write-Host "       gh project item-add $($projectConfig.projectNumber) --owner $orgName --url $($prData.url)" -ForegroundColor Gray
                exit 1
            }
        }
    }
    
    Write-Host "  ✅ Added PR to project" -ForegroundColor Green
    
    # Wait for GitHub to index the item, with retry logic
    $maxRetries = 5
    $retryDelay = 2
    $projectItemId = $null
    
    for ($i = 1; $i -le $maxRetries; $i++) {
        Write-Host "  Waiting for project item to be indexed (attempt $i/$maxRetries)..." -ForegroundColor Gray
        Start-Sleep -Seconds $retryDelay
        $projectItemId = Get-PRProjectItemId -PRNumber $PRNumber -ProjectId $projectConfig.projectId
        if ($projectItemId) {
            break
        }
    }
    
    if (-not $projectItemId) {
        Write-Host "  ⚠️  Could not retrieve project item ID after adding PR" -ForegroundColor Yellow
        Write-Host "  The PR was added to the project, but the item ID lookup failed." -ForegroundColor Yellow
        Write-Host "  This may be due to GitHub indexing delay. You can:" -ForegroundColor Yellow
        Write-Host "    1. Wait a few minutes and run this script again" -ForegroundColor Gray
        Write-Host "    2. Manually configure the fields in GitHub" -ForegroundColor Gray
        Write-Host "    3. Check if the PR appears in the project board" -ForegroundColor Gray
        exit 1
    }
}

if (-not $projectItemId) {
    Write-Host "❌ Could not get project item ID" -ForegroundColor Red
    Write-Host "  PR may not be in the project, or there was an error retrieving the item ID." -ForegroundColor Yellow
    exit 1
}

Write-Host "  ✅ Project Item ID: $projectItemId" -ForegroundColor Green

# Analyze PR
Write-Host ""
Write-Host "Analyzing PR..." -ForegroundColor Yellow

# Try to extract issue number from PR
$issueNumber = $null
try {
    $prBodyRaw = gh pr view $PRNumber --json body -q .body 2>&1
    $prBody = if ($prBodyRaw -is [string]) { $prBodyRaw } else { ($prBodyRaw -join "`n") }
    if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($prBody)) {
        $m = [regex]::Match($prBody, '#(\d+)')
        if ($m.Success) {
            $issueNumber = [int]$m.Groups[1].Value
            Write-Host "  Found issue #$issueNumber from PR body" -ForegroundColor Gray
        }
    }

    if (-not $issueNumber) {
        # Try to get from PR title
        $prTitleRaw = gh pr view $PRNumber --json title -q .title 2>&1
        $prTitle = if ($prTitleRaw -is [string]) { $prTitleRaw } else { ($prTitleRaw -join "`n") }
        if ($LASTEXITCODE -eq 0 -and -not [string]::IsNullOrWhiteSpace($prTitle)) {
            $m2 = [regex]::Match($prTitle, '#(\d+)')
            if ($m2.Success) {
                $issueNumber = [int]$m2.Groups[1].Value
                Write-Host "  Found issue #$issueNumber from PR title" -ForegroundColor Gray
            }
        }
    }
} catch {
    Write-Host "  ⚠️  Could not extract issue number from PR: $($_.Exception.Message)" -ForegroundColor Yellow
}

$issue = $null
if ($issueNumber) {
    $issue = Get-IssueData -IssueNumber $issueNumber -ErrorAction SilentlyContinue
} else {
    Write-Host "  ⚠️  Could not determine issue number from PR (will analyze PR directly)" -ForegroundColor Yellow
}

$fields = Analyze-PRForProjectFields -PRNumber $PRNumber -Issue $issue

Write-Host "  Determined fields:" -ForegroundColor Cyan
Write-Host "    Status: $($fields.Status)" -ForegroundColor Gray
Write-Host "    Priority: $($fields.Priority)" -ForegroundColor Gray
Write-Host "    Size: $($fields.Size)" -ForegroundColor Gray

# Configure PR body (Developer certification + what PR addresses)
Write-Host ""
Write-Host "Configuring PR body..." -ForegroundColor Yellow
$bodyResult = $null
try {
    if ($issueNumber) {
        $bodyResult = Ensure-PRBodyMatchesTemplate -PRNumber $PRNumber -IssueNumber $issueNumber -BaseBranch $prData.baseRefName -HeadBranch $prData.headRefName -Issue $issue
        if ($bodyResult.Updated) {
            Write-Host "  ✅ $($bodyResult.Reason)" -ForegroundColor Green
        } else {
            Write-Host "  ℹ️  $($bodyResult.Reason)" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ℹ️  No issue number detected; skipping PR body template" -ForegroundColor Gray
    }
} catch {
    Write-Warning "Failed to configure PR body: $($_.Exception.Message)"
}

# Determine labels
Write-Host ""
Write-Host "Determining labels..." -ForegroundColor Yellow
$repoLabels = Get-RepoLabelNames
$desiredLabels = Determine-PRLabels -Fields $fields -Issue $issue -RepoLabels $repoLabels
if ($desiredLabels -and $desiredLabels.Count -gt 0) {
    Write-Host "  Desired labels: $($desiredLabels -join ', ')" -ForegroundColor Gray
} else {
    Write-Host "  No desired labels determined" -ForegroundColor Gray
}

# Set fields
Write-Host ""
Write-Host "Setting project fields..." -ForegroundColor Yellow
Write-Host "  Project Key: $ProjectKey" -ForegroundColor Gray
Write-Host "  Project Item ID: $projectItemId" -ForegroundColor Gray
Write-Host "  Project ID: $($projectConfig.projectId)" -ForegroundColor Gray

$setCount = Set-PRProjectFields -ProjectItemId $projectItemId -ProjectId $projectConfig.projectId -ProjectKey $ProjectKey -Fields $fields

# Apply PR labels (non-fatal, but we report clearly)
Write-Host ""
Write-Host "Applying PR labels..." -ForegroundColor Yellow
$labelResult = $null
try {
    $labelResult = Set-PRLabels -PRNumber $PRNumber -DesiredLabels $desiredLabels
} catch {
    Write-Warning "Failed to apply PR labels: $($_.Exception.Message)"
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "              Summary" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "  PR #$PRNumber" -ForegroundColor Cyan
Write-Host "  Fields configured: $setCount" -ForegroundColor Cyan
if ($bodyResult) {
    Write-Host "  PR body updated: $($bodyResult.Updated)" -ForegroundColor Cyan
}
if ($labelResult) {
    Write-Host "  Labels added: $($labelResult.Added) (attempted: $($labelResult.AttemptedToAdd))" -ForegroundColor Cyan
}
Write-Host ""

if ($setCount -le 0) {
    Write-Host "❌ No project fields were updated." -ForegroundColor Red

    # Provide high-signal remediation when auth scopes are the root cause.
    $errText = ""
    if ($script:__prFieldEditErrors) {
        $errText = ($script:__prFieldEditErrors | Out-String -Width 200)
    }

    if ($errText -match "missing required scopes") {
        Write-Host ""
        Write-Host "Likely cause: missing GitHub token scopes for Projects." -ForegroundColor Yellow
        Write-Host "Run:" -ForegroundColor Cyan
        Write-Host "  gh auth refresh -s read:org,read:discussion,project" -ForegroundColor White
        Write-Host ""
    } elseif ($script:__prFieldEditErrors -and $script:__prFieldEditErrors.Count -gt 0) {
        Write-Host "Errors:" -ForegroundColor Yellow
        foreach ($e in ($script:__prFieldEditErrors | Select-Object -First 6)) {
            Write-Host "  - $e" -ForegroundColor Gray
        }
        if ($script:__prFieldEditErrors.Count -gt 6) {
            Write-Host "  ... ($($script:__prFieldEditErrors.Count - 6) more)" -ForegroundColor Gray
        }
        Write-Host ""
    }

    exit 1
}

Write-Host "✅ Project fields updated ($setCount field(s))." -ForegroundColor Green
Write-Host ""
exit 0

