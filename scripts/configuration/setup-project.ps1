#!/usr/bin/env pwsh
# Project Setup Script - REQUIRED FIRST STEP
# Interactive wizard to configure GitHub organization, projects, and field mappings

param(
    [switch]$Force,
    [switch]$SkipValidation
)

Write-Host ""
Write-Host "===============================================" -ForegroundColor Blue
Write-Host "   GitHub Project Configuration Setup" -ForegroundColor Blue
Write-Host "===============================================" -ForegroundColor Blue
Write-Host ""
Write-Host "This script will configure your GitHub organization and projects" -ForegroundColor Yellow
Write-Host "for use with the issue management automation scripts." -ForegroundColor Yellow
Write-Host ""

# Check if config already exists
$configPath = Join-Path $PSScriptRoot "project-config.json"
if ((Test-Path $configPath) -and -not $Force) {
    Write-Host "Configuration file already exists: $configPath" -ForegroundColor Yellow
    $overwrite = Read-Host "Do you want to overwrite it? (y/N)"
    if ($overwrite -ne "y" -and $overwrite -ne "Y") {
        Write-Host "Setup cancelled." -ForegroundColor Gray
        exit 0
    }
}

# Test Prerequisites
Write-Host "Step 1: Checking prerequisites..." -ForegroundColor Cyan
Write-Host ""

# Check GitHub CLI
try {
    $ghVersion = gh --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "GitHub CLI not found"
    }
    Write-Host "  ✅ GitHub CLI installed" -ForegroundColor Green
} catch {
    Write-Host "  ❌ GitHub CLI not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install GitHub CLI:" -ForegroundColor Yellow
    Write-Host "  https://cli.github.com/" -ForegroundColor Cyan
    exit 1
}

# Check GitHub authentication
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        throw "Not authenticated"
    }
    Write-Host "  ✅ GitHub CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "  ❌ GitHub CLI not authenticated" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please authenticate:" -ForegroundColor Yellow
    Write-Host "  gh auth login" -ForegroundColor Cyan
    exit 1
}

Write-Host ""

# Ask about Git hooks for automatic status tracking
Write-Host "Optional: Automatic Issue Status Tracking" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Would you like to enable automatic issue status tracking?" -ForegroundColor Yellow
Write-Host "This will install Git hooks that automatically update GitHub project" -ForegroundColor Gray
Write-Host "board status when you:" -ForegroundColor Gray
Write-Host "  - Checkout an issue branch → Status: 'In progress' (from Backlog or Ready)" -ForegroundColor Gray
Write-Host "  - Commit changes → Status: 'In progress' (from Backlog)" -ForegroundColor Gray
Write-Host "  - Push code (PR exists) → Status: 'In review' (from In progress)" -ForegroundColor Gray
Write-Host ""
$installHooks = Read-Host "Enable automatic issue status tracking? (Y/n)"
if ($installHooks -eq "" -or $installHooks -eq "y" -or $installHooks -eq "Y") {
    $installHooks = $true
    Write-Host "  ✅ Will install Git hooks after configuration is saved" -ForegroundColor Green
} else {
    $installHooks = $false
    Write-Host "  ⚠️  Git hooks will not be installed" -ForegroundColor Yellow
}

Write-Host ""

# Detect Owner (Organization or User)
Write-Host "Step 2: Detecting owner (organization or user)..." -ForegroundColor Cyan
Write-Host ""

try {
    $repoInfo = gh repo view --json owner -q .owner.login 2>&1
    if ($LASTEXITCODE -eq 0 -and $repoInfo) {
        $detectedOwner = $repoInfo
        Write-Host "  Detected owner: $detectedOwner" -ForegroundColor Gray
        $useDetected = Read-Host "Use this owner? (Y/n)"
        if ($useDetected -eq "" -or $useDetected -eq "y" -or $useDetected -eq "Y") {
            $owner = $detectedOwner
        } else {
            $owner = Read-Host "Enter organization or username"
        }
    } else {
        $owner = Read-Host "Enter organization or username"
    }
} catch {
    $owner = Read-Host "Enter organization or username"
}

if ([string]::IsNullOrWhiteSpace($owner)) {
    Write-Host "  ❌ Owner name is required" -ForegroundColor Red
    exit 1
}

# Detect if owner is an organization or user
Write-Host "  Detecting account type..." -ForegroundColor Gray
$isOrganization = $null
$userData = $null

try {
    # Try to query as organization first
    $testOrgQuery = @'
query($login: String!) {
  organization(login: $login) {
    id
    name
  }
}
'@
    $orgTestOutput = gh api graphql -f query=$testOrgQuery -f login=$owner 2>&1
    $orgExitCode = $LASTEXITCODE
    
    if ($orgExitCode -eq 0 -and $orgTestOutput) {
        try {
            $orgData = $orgTestOutput | ConvertFrom-Json
            
            # Check for GraphQL errors first
            if ($orgData.errors) {
                # GraphQL returned errors, so it's not an organization
            } elseif ($orgData.data -and $orgData.data.organization -and $orgData.data.organization.id) {
                $isOrganization = $true
                $orgName = if ($orgData.data.organization.name) { $orgData.data.organization.name } else { $owner }
                Write-Host "  ✅ Detected as organization: $orgName" -ForegroundColor Green
            }
        } catch {
            # JSON parsing failed, continue to try user query
        }
    }
    
    # If organization query didn't work, try as user
    if ($isOrganization -ne $true) {
        $testUserQuery = @'
query($login: String!) {
  user(login: $login) {
    id
    name
    login
  }
}
'@
        $userTestOutput = gh api graphql -f query=$testUserQuery -f login=$owner 2>&1
        $userExitCode = $LASTEXITCODE
        
        if ($userExitCode -eq 0 -and $userTestOutput) {
            try {
                $userData = $userTestOutput | ConvertFrom-Json
                
                # Check for GraphQL errors first
                if ($userData.errors) {
                    # GraphQL returned errors, so it's not a user
                } elseif ($userData.data -and $userData.data.user -and $userData.data.user.id) {
                    $isOrganization = $false
                    $userLogin = if ($userData.data.user.login) { $userData.data.user.login } else { $owner }
                    Write-Host "  ✅ Detected as personal account: $userLogin" -ForegroundColor Green
                }
            } catch {
                # JSON parsing failed
            }
        }
    }
    
    # If neither worked, analyze errors silently and auto-detect when possible
    if ($isOrganization -eq $null) {
        $orgHasScopeError = $false
        $userNotFound = $false
        
        # Analyze organization query error silently
        if ($orgTestOutput) {
            $orgOutputStr = ""
            if ($orgTestOutput -is [string]) {
                $orgOutputStr = $orgTestOutput
            } elseif ($orgTestOutput -is [System.Array]) {
                $orgOutputStr = $orgTestOutput -join "`n"
            } else {
                $orgOutputStr = $orgTestOutput | Out-String -Width 200
            }
            
            if ($orgOutputStr -match "read:org|required scopes") {
                $orgHasScopeError = $true
            }
        }
        
        # Analyze user query error silently
        if ($userTestOutput) {
            $userOutputStr = ""
            if ($userTestOutput -is [string]) {
                $userOutputStr = $userTestOutput
            } elseif ($userTestOutput -is [System.Array]) {
                $userOutputStr = $userTestOutput -join "`n"
            } else {
                $userOutputStr = $userTestOutput | Out-String -Width 200
            }
            
            if ($userOutputStr -match "Could not resolve to a User") {
                $userNotFound = $true
            }
        }
        
        # Auto-detect based on error patterns (silent, no prompts)
        if ($orgHasScopeError -and $userNotFound) {
            # Clear pattern: organization exists but we lack scope to verify it
            $isOrganization = $true
            Write-Host "  ✅ Detected as organization" -ForegroundColor Green
        } elseif ($userNotFound -and -not $orgHasScopeError) {
            # User doesn't exist, but org query didn't fail due to scope - might be org
            $isOrganization = $true
            Write-Host "  ✅ Detected as organization" -ForegroundColor Green
        } else {
            # Can't determine - ask user (only when truly ambiguous)
            Write-Host "  ⚠️  Could not determine account type" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "  Please specify:" -ForegroundColor Cyan
            Write-Host "    1. Organization" -ForegroundColor White
            Write-Host "    2. Personal Account (User)" -ForegroundColor White
            Write-Host ""
            $accountType = Read-Host "Select account type (1 or 2)"
            
            if ($accountType -eq "2") {
                $isOrganization = $false
            } else {
                $isOrganization = $true
            }
            Write-Host "  ✅ Set as $(if ($isOrganization) { 'organization' } else { 'personal account' })" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "  ⚠️  Error detecting account type: $_" -ForegroundColor Yellow
    Write-Host "  Assuming organization..." -ForegroundColor Gray
    $isOrganization = $true
}

Write-Host "  ✅ Owner: $owner ($(if ($isOrganization) { 'Organization' } else { 'Personal Account' }))" -ForegroundColor Green
Write-Host ""

# Detect Issue Types (only available for organizations)
Write-Host "Step 3: Detecting issue types..." -ForegroundColor Cyan
Write-Host ""

$issueTypes = @{}

if ($isOrganization) {
    try {
        $issueTypesQuery = @'
query($org: String!) {
  organization(login: $org) {
    issueTypes(first: 20) {
      edges {
        node {
          id
          name
          isEnabled
          description
        }
      }
    }
  }
}
'@
        
        $issueTypesResult = gh api graphql -f query=$issueTypesQuery -f org=$owner | ConvertFrom-Json
        
        if ($issueTypesResult.data.organization.issueTypes.edges) {
            foreach ($edge in $issueTypesResult.data.organization.issueTypes.edges) {
                $node = $edge.node
                if ($node.isEnabled) {
                    $issueTypes[$node.name] = $node.id
                    Write-Host "  ✅ Found issue type: $($node.name)" -ForegroundColor Green
                }
            }
        }
        
        if ($issueTypes.Count -eq 0) {
            Write-Host "  ⚠️  No issue types found (this is okay)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ⚠️  Could not detect issue types: $_" -ForegroundColor Yellow
        Write-Host "  You can add them manually later" -ForegroundColor Gray
    }
} else {
    Write-Host "  ℹ️  Issue types are only available for organizations in GitHub" -ForegroundColor Gray
    Write-Host "  Personal accounts cannot use custom issue types via the API" -ForegroundColor Gray
    Write-Host "  This is a GitHub limitation, not a script limitation" -ForegroundColor Gray
}

Write-Host ""

# Get Projects
Write-Host "Step 4: Configuring projects..." -ForegroundColor Cyan
Write-Host ""

$projects = @{}
$projectKeys = @()
$continue = $true

while ($continue) {
    Write-Host "  Enter project number (or 'done' to finish): " -NoNewline -ForegroundColor Yellow
    $projectInput = Read-Host
    
    if ($projectInput -eq "done" -or $projectInput -eq "") {
        $continue = $false
        break
    }
    
    if (-not ($projectInput -match '^\d+$')) {
        Write-Host "  ⚠️  Invalid project number" -ForegroundColor Yellow
        continue
    }
    
    $projectNumber = [int]$projectInput
    
    Write-Host "  Detecting project #$projectNumber..." -ForegroundColor Gray
    
    try {
        # Get project info - use appropriate query based on account type
        # Query ALL field types: single-select, number, text, date, iteration, user
        if ($isOrganization) {
            $projectQuery = @'
query($org: String!, $number: Int!) {
  organization(login: $org) {
    projectV2(number: $number) {
      id
      title
      fields(first: 50) {
        nodes {
          ... on ProjectV2FieldCommon {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
            options {
              id
              name
            }
          }
          ... on ProjectV2IterationField {
            id
            name
            dataType
            configuration {
              iterations {
                id
                title
                duration
              }
            }
          }
          ... on ProjectV2Field {
            id
            name
            dataType
          }
        }
      }
    }
  }
}
'@
            $projectResult = gh api graphql -f query=$projectQuery -f org=$owner -F number=$projectNumber | ConvertFrom-Json
            $project = $projectResult.data.organization.projectV2
        } else {
            $projectQuery = @'
query($user: String!, $number: Int!) {
  user(login: $user) {
    projectV2(number: $number) {
      id
      title
      fields(first: 50) {
        nodes {
          ... on ProjectV2FieldCommon {
            id
            name
            dataType
          }
          ... on ProjectV2SingleSelectField {
            id
            name
            dataType
            options {
              id
              name
            }
          }
          ... on ProjectV2IterationField {
            id
            name
            dataType
            configuration {
              iterations {
                id
                title
                duration
              }
            }
          }
          ... on ProjectV2Field {
            id
            name
            dataType
          }
        }
      }
    }
  }
}
'@
            $projectResult = gh api graphql -f query=$projectQuery -f user=$owner -F number=$projectNumber | ConvertFrom-Json
            $project = $projectResult.data.user.projectV2
        }
        
        if (-not $project) {
            Write-Host "  ❌ Project #$projectNumber not found" -ForegroundColor Red
            continue
        }
        
        $projectId = $project.id
        $projectTitle = $project.title
        
        Write-Host "  ✅ Found project: $projectTitle" -ForegroundColor Green
        
        # Generate project key from title
        $projectKey = $projectTitle -replace '@', '' -replace '[^\w]', '' -replace '\s+', '' | ForEach-Object { $_.ToLower() }
        if ([string]::IsNullOrWhiteSpace($projectKey)) {
            $projectKey = "project$projectNumber"
        }
        
        # Detect ALL fields and their types
        $allFields = @()
        $fieldIds = @{}
        $options = @{}
        
        foreach ($field in $project.fields.nodes) {
            $fieldName = $field.name
            $fieldType = if ($field.dataType) { $field.dataType } else { "UNKNOWN" }
            $fieldId = $field.id
            
            # Determine field type
            $displayType = "Unknown"
            $hasOptions = $false
            $fieldOptionsData = $null
            
            if ($field.options) {
                $displayType = "Single-Select"
                $hasOptions = $true
                $fieldOptionsData = $field.options
            } elseif ($fieldType -eq "ITERATION" -or ($field.configuration -and $field.configuration.iterations)) {
                $displayType = "Iteration"
                $hasOptions = $true
                # Iteration fields use configuration.iterations instead of options
                if ($field.configuration -and $field.configuration.iterations) {
                    $fieldOptionsData = $field.configuration.iterations
                }
            } elseif ($fieldType -eq "NUMBER") {
                $displayType = "Number"
            } elseif ($fieldType -eq "TEXT") {
                $displayType = "Text"
            } elseif ($fieldType -eq "DATE") {
                $displayType = "Date"
            } elseif ($fieldType -eq "USER") {
                $displayType = "User"
            } else {
                $displayType = if ($fieldType -ne "UNKNOWN") { $fieldType } else { "Unknown" }
            }
            
            $allFields += [PSCustomObject]@{
                Name = $fieldName
                Type = $displayType
                Id = $fieldId
                HasOptions = $hasOptions
                Options = $fieldOptionsData
                DataType = $fieldType
            }
            
            # Store field ID for all fields
            $fieldIds[$fieldName] = $fieldId
            
            # Extract options for single-select fields
            if ($field.options) {
                $fieldOptions = @{}
                foreach ($option in $field.options) {
                    $fieldOptions[$option.name] = $option.id
                }
                $options[$fieldName] = $fieldOptions
            }
            # Extract iterations for iteration fields
            elseif ($fieldType -eq "ITERATION" -and $field.configuration -and $field.configuration.iterations) {
                $iterationOptions = @{}
                foreach ($iteration in $field.configuration.iterations) {
                    $iterationOptions[$iteration.title] = $iteration.id
                }
                $options[$fieldName] = $iterationOptions
            }
        }
        
        # Show all detected fields
        Write-Host ""
        Write-Host "  Detected fields ($($allFields.Count) total):" -ForegroundColor Cyan
        Write-Host ""
        
        # Group by type for better display
        $groupedFields = $allFields | Group-Object -Property Type | Sort-Object Name
        
        foreach ($group in $groupedFields) {
            Write-Host "    $($group.Name) Fields:" -ForegroundColor Yellow
            foreach ($field in $group.Group) {
                $optionCount = if ($field.HasOptions) { " ($($field.Options.Count) options)" } else { "" }
                Write-Host "      - $($field.Name)$optionCount" -ForegroundColor White
            }
            Write-Host ""
        }
        
        # Let user select which fields to configure
        Write-Host "  Which fields would you like to configure?" -ForegroundColor Cyan
        Write-Host "  (Common fields: Status, Priority, Size, Estimate, App, Area)" -ForegroundColor Gray
        Write-Host ""
        Write-Host "  Options:" -ForegroundColor Yellow
        Write-Host "    1. Configure all fields" -ForegroundColor White
        Write-Host "    2. Configure common fields only (Status, Priority, Size, Estimate)" -ForegroundColor White
        Write-Host "    3. Select fields manually" -ForegroundColor White
        Write-Host "    4. Skip field configuration" -ForegroundColor White
        Write-Host ""
        $fieldChoice = Read-Host "  Select option (1-4)"
        
        $fieldsToConfigure = @{}
        $optionsToConfigure = @{}
        
        if ($fieldChoice -eq "1") {
            # Configure all fields
            $fieldsToConfigure = $fieldIds
            $optionsToConfigure = $options
            Write-Host "  ✅ Will configure all $($allFields.Count) fields" -ForegroundColor Green
        } elseif ($fieldChoice -eq "2") {
            # Configure common fields only
            $commonFields = @("Status", "Priority", "Size", "Estimate")
            foreach ($fieldName in $commonFields) {
                if ($fieldIds.ContainsKey($fieldName)) {
                    $fieldsToConfigure[$fieldName] = $fieldIds[$fieldName]
                    if ($options.ContainsKey($fieldName)) {
                        $optionsToConfigure[$fieldName] = $options[$fieldName]
                    }
                }
            }
            Write-Host "  ✅ Will configure common fields: $($fieldsToConfigure.Keys -join ', ')" -ForegroundColor Green
        } elseif ($fieldChoice -eq "3") {
            # Manual selection
            Write-Host ""
            Write-Host "  Available fields:" -ForegroundColor Cyan
            for ($i = 0; $i -lt $allFields.Count; $i++) {
                $field = $allFields[$i]
                $optionCount = if ($field.HasOptions) { " ($($field.Options.Count) options)" } else { "" }
                Write-Host "    $($i + 1). $($field.Name) [$($field.Type)]$optionCount" -ForegroundColor White
            }
            Write-Host ""
            $selectedFields = Read-Host "  Enter field numbers (comma-separated, e.g., 1,2,3,4)"
            
            $fieldNumbers = $selectedFields -split ',' | ForEach-Object { [int]$_.Trim() }
            foreach ($num in $fieldNumbers) {
                if ($num -ge 1 -and $num -le $allFields.Count) {
                    $field = $allFields[$num - 1]
                    $fieldsToConfigure[$field.Name] = $field.Id
                    if ($field.HasOptions) {
                        $fieldOptions = @{}
                        foreach ($option in $field.Options) {
                            $fieldOptions[$option.name] = $option.id
                        }
                        $optionsToConfigure[$field.Name] = $fieldOptions
                    }
                }
            }
            Write-Host "  ✅ Will configure: $($fieldsToConfigure.Keys -join ', ')" -ForegroundColor Green
        } else {
            # Skip field configuration
            Write-Host "  ⚠️  Skipping field configuration" -ForegroundColor Yellow
            Write-Host "  You can configure fields later by editing project-config.json" -ForegroundColor Gray
        }
        
        Write-Host ""
        $confirm = Read-Host "  Confirm this project configuration? (Y/n)"
        if ($confirm -eq "" -or $confirm -eq "y" -or $confirm -eq "Y") {
            # If no fields selected, still save project but with empty field configuration
            if ($fieldsToConfigure.Count -eq 0) {
                Write-Host "  ⚠️  No fields selected - project will be saved without field configuration" -ForegroundColor Yellow
                Write-Host "  You can add fields later by editing project-config.json or re-running setup" -ForegroundColor Gray
            }
            # Build defaults object based on configured fields
            $defaults = @{}
            
            # Set sensible defaults for common fields
            if ($fieldsToConfigure.ContainsKey("Status") -and $optionsToConfigure.ContainsKey("Status")) {
                $statusOptions = $optionsToConfigure.Status.Keys
                if ($statusOptions -contains "Backlog") {
                    $defaults.Status = "Backlog"
                } elseif ($statusOptions.Count -gt 0) {
                    $defaults.Status = $statusOptions[0]
                }
            }
            
            if ($fieldsToConfigure.ContainsKey("Priority") -and $optionsToConfigure.ContainsKey("Priority")) {
                $priorityOptions = $optionsToConfigure.Priority.Keys
                if ($priorityOptions -contains "P1") {
                    $defaults.Priority = "P1"
                } elseif ($priorityOptions -contains "P0") {
                    $defaults.Priority = "P0"
                } elseif ($priorityOptions.Count -gt 0) {
                    $defaults.Priority = $priorityOptions[0]
                }
            }
            
            if ($fieldsToConfigure.ContainsKey("Size") -and $optionsToConfigure.ContainsKey("Size")) {
                $sizeOptions = $optionsToConfigure.Size.Keys
                if ($sizeOptions -contains "M") {
                    $defaults.Size = "M"
                } elseif ($sizeOptions.Count -gt 0) {
                    $defaults.Size = $sizeOptions[0]
                } else {
                    $defaults.Size = ""
                }
            } else {
                $defaults.Size = ""
            }
            
            if ($fieldsToConfigure.ContainsKey("Estimate")) {
                $defaults.Estimate = 0
            }
            
            $projects[$projectKey] = @{
                name = $projectTitle
                projectId = $projectId
                projectNumber = $projectNumber
                fieldIds = $fieldsToConfigure
                options = $optionsToConfigure
                defaults = $defaults
            }
            
            # Avoid duplicate entries in the selection list (can happen if the same project is entered twice)
            if (-not ($projectKeys -contains $projectKey)) {
                $projectKeys += $projectKey
            }
            Write-Host "  ✅ Project '$projectKey' added" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ❌ Error detecting project: $_" -ForegroundColor Red
    }
    
    Write-Host ""
}

if ($projects.Count -eq 0) {
    Write-Host "  ❌ No projects configured" -ForegroundColor Red
    exit 1
}

# Set Default Project
Write-Host ""
Write-Host "Step 5: Setting default project..." -ForegroundColor Cyan
Write-Host ""

# Ensure we don't show duplicates in the selection list
$projectKeys = @($projectKeys | Select-Object -Unique)

if ($projectKeys.Count -eq 1) {
    $defaultProject = $projectKeys[0]
    Write-Host "  ✅ Default project: $defaultProject (only one configured)" -ForegroundColor Green
} else {
    Write-Host "  Available projects:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $projectKeys.Count; $i++) {
        Write-Host "    $($i + 1). $($projectKeys[$i]) - $($projects[$projectKeys[$i]].name)" -ForegroundColor White
    }
    $selection = Read-Host "  Select default project (1-$($projectKeys.Count))"
    if ($selection -match '^\d+$' -and [int]$selection -ge 1 -and [int]$selection -le $projectKeys.Count) {
        $defaultProject = $projectKeys[[int]$selection - 1]
        Write-Host "  ✅ Default project: $defaultProject" -ForegroundColor Green
    } else {
        $defaultProject = $projectKeys[0]
        Write-Host "  ⚠️  Invalid selection, using first project: $defaultProject" -ForegroundColor Yellow
    }
}

Write-Host ""

# Build Configuration Object
$config = @{
    version = "1.0"
    organization = $owner
    isOrganization = $isOrganization
    setupDate = (Get-Date -Format "yyyy-MM-dd")
    projects = $projects
    issueTypes = $issueTypes
    defaultProject = $defaultProject
}

# Save Configuration
Write-Host "Step 6: Saving configuration..." -ForegroundColor Cyan
Write-Host ""

try {
    $configDir = Split-Path $configPath -Parent
    if (-not (Test-Path $configDir)) {
        New-Item -ItemType Directory -Path $configDir -Force | Out-Null
    }
    
    $config | ConvertTo-Json -Depth 10 | Set-Content -Path $configPath -Encoding UTF8
    Write-Host "  ✅ Configuration saved to: $configPath" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Failed to save configuration: $_" -ForegroundColor Red
    exit 1
}

# Validate Configuration
if (-not $SkipValidation) {
    Write-Host ""
    Write-Host "Step 7: Validating configuration..." -ForegroundColor Cyan
    Write-Host ""
    
    try {
        # Test loading config
        $testConfig = Get-Content $configPath | ConvertFrom-Json
        Write-Host "  ✅ Configuration file is valid JSON" -ForegroundColor Green
        
        # Test project access
        foreach ($key in $testConfig.projects.PSObject.Properties.Name) {
            $proj = $testConfig.projects.$key
            Write-Host "  ✅ Project '$key' configured (ID: $($proj.projectId))" -ForegroundColor Green
        }
        
        Write-Host "  ✅ Issue types configured: $($testConfig.issueTypes.PSObject.Properties.Name.Count)" -ForegroundColor Green
    } catch {
        Write-Host "  ⚠️  Validation warning: $_" -ForegroundColor Yellow
    }
}

# Install Git Hooks (if user opted in)
if ($installHooks) {
    Write-Host ""
    Write-Host "Step 8: Installing Git Hooks" -ForegroundColor Cyan
    Write-Host "===============================================" -ForegroundColor Cyan
    Write-Host ""
    
    try {
        $hooksSetupScript = Join-Path $PSScriptRoot "setup-git-hooks.ps1"
        if (Test-Path $hooksSetupScript) {
            Write-Host "Installing Git hooks for automatic status tracking..." -ForegroundColor Yellow
            
            # Run the setup script with full path and proper error handling
            $scriptPath = Resolve-Path $hooksSetupScript
            & $scriptPath -Enable
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host ""
                Write-Host "  ✅ Git hooks installed successfully!" -ForegroundColor Green
                Write-Host ""
                Write-Host "Hooks will now automatically update issue status as you work." -ForegroundColor Cyan
                Write-Host "You can disable hooks anytime by running:" -ForegroundColor Gray
                Write-Host "  .\scripts\setup-git-hooks.ps1 -Disable" -ForegroundColor Gray
            } else {
                Write-Host ""
                Write-Host "  ⚠️  Hook installation completed with warnings" -ForegroundColor Yellow
                Write-Host "  You can install hooks manually later by running:" -ForegroundColor Gray
                Write-Host "    .\scripts\setup-git-hooks.ps1 -Enable" -ForegroundColor Gray
            }
        } else {
            Write-Host "  ⚠️  Git hooks setup script not found" -ForegroundColor Yellow
            Write-Host "  You can install hooks manually later by running:" -ForegroundColor Gray
            Write-Host "    .\scripts\setup-git-hooks.ps1 -Enable" -ForegroundColor Gray
        }
    } catch {
        Write-Host "  ⚠️  Error installing Git hooks: $_" -ForegroundColor Yellow
        Write-Host "  You can install hooks manually later by running:" -ForegroundColor Gray
        Write-Host "    .\scripts\setup-git-hooks.ps1 -Enable" -ForegroundColor Gray
    }
}

# Success Message
Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""
Write-Host "Your project configuration has been saved." -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Create issues using:" -ForegroundColor White
Write-Host "     .\scripts\issue-management\create-issue-enhanced.ps1 -Title '...' -Body '...'" -ForegroundColor Gray
Write-Host ""
Write-Host "  2. Configuration file location:" -ForegroundColor White
Write-Host "     $configPath" -ForegroundColor Gray
Write-Host ""
Write-Host "  3. To update configuration, run this script again with -Force" -ForegroundColor White
Write-Host ""
Write-Host "✅ Ready to use!" -ForegroundColor Green
Write-Host ""

