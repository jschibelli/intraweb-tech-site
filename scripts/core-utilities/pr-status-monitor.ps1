# PR Status Monitor Module
# Provides functions for detecting and monitoring pull requests related to issues

function Get-RepoInfo {
    <#
    .SYNOPSIS
    Gets the current repository owner and name.
    #>
    
    $script:repoInfo = $null
    
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

function Get-PRForBranch {
    <#
    .SYNOPSIS
    Finds a pull request associated with a branch name.
    
    .PARAMETER BranchName
    The branch name to search for
    
    .OUTPUTS
    PSCustomObject with PR number and details, or null if not found
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$BranchName
    )
    
    try {
        $repoInfo = Get-RepoInfo
        if (-not $repoInfo) {
            return $null
        }
        
        # Search for PRs with this branch as head
        $prs = gh pr list --head $BranchName --json number,title,state,headRefName,baseRefName,merged 2>&1
        if ($LASTEXITCODE -eq 0 -and $prs) {
            $prData = $prs | ConvertFrom-Json
            if ($prData -and $prData.Count -gt 0) {
                return $prData[0]
            }
        }
        
        return $null
    } catch {
        return $null
    }
}

function Get-PRForIssue {
    <#
    .SYNOPSIS
    Finds a pull request that closes or references an issue.
    
    .PARAMETER IssueNumber
    The issue number to search for
    
    .OUTPUTS
    PSCustomObject with PR number and details, or null if not found
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [int]$IssueNumber
    )
    
    try {
        $repoInfo = Get-RepoInfo
        if (-not $repoInfo) {
            return $null
        }
        
        # Search for PRs that reference this issue
        $prs = gh pr list --search "is:pr $IssueNumber" --json number,title,state,headRefName,baseRefName,merged,body 2>&1
        if ($LASTEXITCODE -eq 0 -and $prs) {
            $prData = $prs | ConvertFrom-Json
            
            # Filter for PRs that actually close/reference the issue
            foreach ($pr in $prData) {
                # Check if PR body or title mentions the issue
                if ($pr.body -match "#$IssueNumber" -or $pr.title -match "#$IssueNumber" -or $pr.body -match "closes.*#$IssueNumber" -or $pr.body -match "fixes.*#$IssueNumber") {
                    return $pr
                }
            }
            
            # If no explicit mention, return first result if any
            if ($prData.Count -gt 0) {
                return $prData[0]
            }
        }
        
        return $null
    } catch {
        return $null
    }
}

function Test-PRMerged {
    <#
    .SYNOPSIS
    Checks if a pull request is merged.
    
    .PARAMETER PRNumber
    The pull request number
    
    .OUTPUTS
    Boolean indicating if PR is merged
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [int]$PRNumber
    )
    
    try {
        $pr = gh pr view $PRNumber --json merged,state 2>&1
        if ($LASTEXITCODE -eq 0 -and $pr) {
            $prData = $pr | ConvertFrom-Json
            return $prData.merged -eq $true -or $prData.state -eq "MERGED"
        }
        
        return $false
    } catch {
        return $false
    }
}

function Test-PRExists {
    <#
    .SYNOPSIS
    Checks if a pull request exists for a branch.
    
    .PARAMETER BranchName
    The branch name to check
    
    .OUTPUTS
    Boolean indicating if PR exists
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$BranchName
    )
    
    $pr = Get-PRForBranch -BranchName $BranchName
    return $null -ne $pr
}

function Update-IssueOnPRMerge {
    <#
    .SYNOPSIS
    Updates issue status to "Done" when a PR is merged.
    
    .PARAMETER PRNumber
    The pull request number
    
    .PARAMETER ProjectKey
    Optional project key (uses default if not specified)
    
    .PARAMETER Silent
    If true, suppresses output
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [int]$PRNumber,
        
        [Parameter(Mandatory=$false)]
        [string]$ProjectKey = $null,
        
        [Parameter(Mandatory=$false)]
        [switch]$Silent
    )
    
    try {
        # Import issue status automation module
        $issueStatusPath = Join-Path $PSScriptRoot "issue-status-automation.ps1"
        if (-not (Test-Path $issueStatusPath)) {
            if (-not $Silent) {
                Write-Host "Issue status automation module not found" -ForegroundColor Red
            }
            return $false
        }
        
        # Load the module (dot source it)
        . $issueStatusPath
        
        # Get PR details to find associated issue
        $pr = gh pr view $PRNumber --json number,title,body,headRefName 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $pr) {
            if (-not $Silent) {
                Write-Host "Could not get PR #$PRNumber" -ForegroundColor Red
            }
            return $false
        }
        
        $prData = $pr | ConvertFrom-Json
        
        # Try to extract issue number from PR body/title
        $issueNumber = $null
        
        # Check PR body for issue references
        if ($prData.body -match '#(\d+)') {
            $issueNumber = [int]$Matches[1]
        } elseif ($prData.title -match '#(\d+)') {
            $issueNumber = [int]$Matches[1]
        } else {
            # Try to get issue number from branch name
            $branchName = $prData.headRefName
            $issueNumber = Get-IssueNumberFromBranch -BranchName $branchName
        }
        
        if ($issueNumber) {
            # Update issue status to "Done"
            return Update-IssueStatus -IssueNumber $issueNumber -NewStatus "Done" -ProjectKey $ProjectKey -Silent:$Silent
        } else {
            if (-not $Silent) {
                Write-Host "Could not determine issue number from PR #$PRNumber" -ForegroundColor Yellow
            }
            return $false
        }
        
    } catch {
        if (-not $Silent) {
            Write-Host "Error updating issue on PR merge: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

