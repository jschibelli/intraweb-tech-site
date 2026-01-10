# Issue Status Automation Module
# Provides functions for automatically updating GitHub project board status based on branch names and Git events

# Import project configuration utilities
$projectConfigPath = Join-Path $PSScriptRoot "..\configuration\project-config.ps1"
if (Test-Path $projectConfigPath) {
    . $projectConfigPath
}

function Get-RepoInfo {
    <#
    .SYNOPSIS
    Gets the current repository owner and name.
    
    .OUTPUTS
    PSCustomObject with Owner and Name properties
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

function Get-IssueNumberFromBranch {
    <#
    .SYNOPSIS
    Extracts issue number from branch name using multiple patterns.
    
    .PARAMETER BranchName
    The branch name to analyze
    
    .EXAMPLE
    $issueNumber = Get-IssueNumberFromBranch -BranchName "issue-250-add-feature"
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$BranchName
    )
    
    # Pattern 1: issue-{number}-*
    if ($BranchName -match '^issue-(\d+)') {
        return [int]$Matches[1]
    }
    
    # Pattern 2: feature/{number}-*, bugfix/{number}-*, hotfix/{number}-*, chore/{number}-*
    if ($BranchName -match '^(feature|bugfix|hotfix|chore)/(\d+)') {
        return [int]$Matches[2]
    }
    
    # Pattern 3: Any number in branch name (check if it's a valid issue)
    if ($BranchName -match '\b(\d{1,4})\b') {
        $potentialIssue = [int]$Matches[1]
        # Validate it's a reasonable issue number (1-9999)
        if ($potentialIssue -ge 1 -and $potentialIssue -le 9999) {
            # Try to verify it's a real issue
            try {
                $repoInfo = Get-RepoInfo
                if ($repoInfo) {
                    $issueCheck = gh issue view $potentialIssue --json number 2>&1
                    if ($LASTEXITCODE -eq 0) {
                        return $potentialIssue
                    }
                }
            } catch {
                # If we can't verify, still return it (might be valid)
                return $potentialIssue
            }
        }
    }
    
    return $null
}

function Get-CurrentIssueStatus {
    <#
    .SYNOPSIS
    Gets the current status of an issue in the project board.
    
    .PARAMETER IssueNumber
    The issue number
    
    .PARAMETER ProjectKey
    The project key (optional, uses default if not specified)
    
    .OUTPUTS
    String status name or null if not found
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [int]$IssueNumber,
        
        [Parameter(Mandatory=$false)]
        [string]$ProjectKey = $null
    )
    
    try {
        # Get default project if not specified
        if (-not $ProjectKey) {
            $config = Get-ProjectConfig
            if ($config -and $config.defaultProject) {
                $ProjectKey = $config.defaultProject
            } else {
                return $null
            }
        }
        
        $project = Get-ProjectById -ProjectKey $ProjectKey
        if (-not $project) {
            return $null
        }
        
        $repoInfo = Get-RepoInfo
        if (-not $repoInfo) {
            return $null
        }
        
        # Get project item for this issue
        $itemQuery = @"
query {
  repository(owner: "$($repoInfo.Owner)", name: "$($repoInfo.Name)") {
    issue(number: $IssueNumber) {
      projectItems(first: 10) {
        nodes {
          id
          project {
            id
          }
          fieldValues(first: 20) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue {
                field {
                  ... on ProjectV2FieldCommon {
                    name
                  }
                }
                name
              }
            }
          }
        }
      }
    }
  }
}
"@
        
        $itemResult = gh api graphql -f query=$itemQuery 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $itemResult) {
            return $null
        }
        
        $itemData = $itemResult | ConvertFrom-Json
        $projectItems = $itemData.data.repository.issue.projectItems.nodes
        
        # Find the item in our project
        foreach ($item in $projectItems) {
            if ($item.project.id -eq $project.projectId) {
                # Find Status field value
                foreach ($fieldValue in $item.fieldValues.nodes) {
                    if ($fieldValue.field.name -eq "Status") {
                        return $fieldValue.name
                    }
                }
            }
        }
        
        return $null
    } catch {
        return $null
    }
}

function Update-IssueStatus {
    <#
    .SYNOPSIS
    Updates the status of an issue in the GitHub project board.
    
    .PARAMETER IssueNumber
    The issue number
    
    .PARAMETER NewStatus
    The new status value (e.g., "In progress", "Ready", "Done")
    
    .PARAMETER ProjectKey
    The project key (optional, uses default if not specified)
    
    .PARAMETER Silent
    If true, suppresses output (for use in Git hooks)
    
    .EXAMPLE
    Update-IssueStatus -IssueNumber 250 -NewStatus "In progress"
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [int]$IssueNumber,
        
        [Parameter(Mandatory=$true)]
        [string]$NewStatus,
        
        [Parameter(Mandatory=$false)]
        [string]$ProjectKey = $null,
        
        [Parameter(Mandatory=$false)]
        [switch]$Silent
    )
    
    try {
        # Get default project if not specified
        if (-not $ProjectKey) {
            $config = Get-ProjectConfig
            if ($config -and $config.defaultProject) {
                $ProjectKey = $config.defaultProject
            } else {
                if (-not $Silent) {
                    Write-Host "No project configuration found" -ForegroundColor Red
                }
                return $false
            }
        }
        
        $project = Get-ProjectById -ProjectKey $ProjectKey
        if (-not $project) {
            if (-not $Silent) {
                Write-Host "Project '$ProjectKey' not found" -ForegroundColor Red
            }
            return $false
        }
        
        # Get status field and option IDs
        $statusFieldId = Get-ProjectFieldId -ProjectKey $ProjectKey -FieldName "Status"
        $statusOptionId = Get-ProjectOptionId -ProjectKey $ProjectKey -FieldName "Status" -OptionName $NewStatus
        
        if (-not $statusFieldId -or -not $statusOptionId) {
            if (-not $Silent) {
                Write-Host "Status field or option not found for '$NewStatus'" -ForegroundColor Red
            }
            return $false
        }
        
        $repoInfo = Get-RepoInfo
        if (-not $repoInfo) {
            if (-not $Silent) {
                Write-Host "Could not determine repository information" -ForegroundColor Red
            }
            return $false
        }
        
        # Get the project item ID for this issue
        $itemQuery = @"
query {
  repository(owner: "$($repoInfo.Owner)", name: "$($repoInfo.Name)") {
    issue(number: $IssueNumber) {
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
        
        $itemResult = gh api graphql -f query=$itemQuery 2>&1
        if ($LASTEXITCODE -ne 0 -or -not $itemResult) {
            if (-not $Silent) {
                Write-Host "Failed to get project item for issue #$IssueNumber" -ForegroundColor Red
            }
            return $false
        }
        
        $itemData = $itemResult | ConvertFrom-Json
        $projectItems = $itemData.data.repository.issue.projectItems.nodes
        $projectItem = $projectItems | Where-Object { $_.project.id -eq $project.projectId }
        
        if (-not $projectItem) {
            # Issue not in project board - this is okay, just skip
            return $false
        }
        
        # Update the project item status
        $updateMutation = @"
mutation {
  updateProjectV2ItemFieldValue(input: {
    projectId: "$($project.projectId)"
    itemId: "$($projectItem.id)"
    fieldId: "$statusFieldId"
    value: {
      singleSelectOptionId: "$statusOptionId"
    }
  }) {
    projectV2Item {
      id
    }
  }
}
"@
        
        $updateResult = gh api graphql -f query=$updateMutation 2>&1
        if ($LASTEXITCODE -eq 0 -and $updateResult) {
            if (-not $Silent) {
                Write-Host "Updated issue #$IssueNumber status to '$NewStatus'" -ForegroundColor Green
            }
            return $true
        } else {
            if (-not $Silent) {
                Write-Host "Failed to update project status" -ForegroundColor Red
            }
            return $false
        }
        
    } catch {
        if (-not $Silent) {
            Write-Host "Error updating project status: $($_.Exception.Message)" -ForegroundColor Red
        }
        return $false
    }
}

function Get-DefaultProjectKey {
    <#
    .SYNOPSIS
    Gets the default project key from configuration.
    
    .OUTPUTS
    String project key or null
    #>
    
    $config = Get-ProjectConfig
    if ($config -and $config.defaultProject) {
        return $config.defaultProject
    }
    
    return $null
}

