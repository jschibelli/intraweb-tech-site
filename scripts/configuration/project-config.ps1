# Project Configuration Helper Module
# Provides functions for loading and accessing project configuration

# NOTE: this script is dot-sourced by other scripts.
# Using $script: variables means "the caller script scope", so names MUST be unique
# to avoid colliding with caller variables like $projectConfig.
$script:__iwProjectConfigCache = $null
$script:__iwProjectConfigPath = Join-Path $PSScriptRoot "project-config.json"

function Get-ProjectConfig {
    <#
    .SYNOPSIS
    Loads and validates the project configuration file.
    
    .DESCRIPTION
    Loads the project configuration from project-config.json. Returns the configuration
    object or null if not found/invalid.
    
    .EXAMPLE
    $config = Get-ProjectConfig
    #>
    
    if ($script:__iwProjectConfigCache) {
        return $script:__iwProjectConfigCache
    }
    
    if (-not (Test-Path $script:__iwProjectConfigPath)) {
        return $null
    }
    
    try {
        $config = Get-Content $script:__iwProjectConfigPath -Raw | ConvertFrom-Json
        $script:__iwProjectConfigCache = $config
        return $config
    }
    catch {
        Write-Error "Failed to load project configuration: $($_.Exception.Message)"
        return $null
    }
}

function Require-ProjectConfig {
    <#
    .SYNOPSIS
    Ensures project configuration exists, prompts user to run setup if missing.
    
    .DESCRIPTION
    Checks if project configuration exists. If not, displays a friendly error
    message with instructions to run the setup script.
    
    .EXAMPLE
    Require-ProjectConfig
    #>
    
    $config = Get-ProjectConfig
    if (-not $config) {
        Write-Host ""
        Write-Host "===============================================" -ForegroundColor Red
        Write-Host "  Project Configuration Not Found" -ForegroundColor Red
        Write-Host "===============================================" -ForegroundColor Red
        Write-Host ""
        Write-Host "This script requires project configuration." -ForegroundColor Yellow
        Write-Host "Please run the setup script first:" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "  .\scripts\configuration\setup-project.ps1" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "The setup script will configure your GitHub organization," -ForegroundColor Gray
        Write-Host "projects, and field mappings." -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
    
    return $config
}

function Get-ProjectFieldId {
    <#
    .SYNOPSIS
    Gets the field ID for a specific project and field name.
    
    .PARAMETER ProjectKey
    The project key (e.g., "workant") or project number
    
    .PARAMETER FieldName
    The field name (e.g., "Status", "Priority", "Size", "Estimate")
    
    .EXAMPLE
    $fieldId = Get-ProjectFieldId -ProjectKey "workant" -FieldName "Status"
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectKey,
        
        [Parameter(Mandatory=$true)]
        [string]$FieldName
    )
    
    $config = Get-ProjectConfig
    if (-not $config) {
        return $null
    }
    
    $project = Get-ProjectById -ProjectKey $ProjectKey
    if (-not $project) {
        return $null
    }
    
    if (-not $project.fieldIds) {
        return $null
    }
    
    # Try multiple access methods for maximum compatibility
    # Method 1: Direct indexer access (most reliable)
    if ($project.fieldIds.PSObject.Properties[$FieldName]) {
        return $project.fieldIds.PSObject.Properties[$FieldName].Value
    }
    
    # Method 2: Where-Object filter
    $fieldProp = $project.fieldIds.PSObject.Properties | Where-Object { $_.Name -eq $FieldName } | Select-Object -First 1
    if ($fieldProp) {
        return $fieldProp.Value
    }
    
    # Method 3: Direct property access with variable
    if ($project.fieldIds.$FieldName) {
        return $project.fieldIds.$FieldName
    }
    
    return $null
}

function Get-ProjectOptionId {
    <#
    .SYNOPSIS
    Gets the option ID for a specific field value in a project.
    
    .PARAMETER ProjectKey
    The project key (e.g., "workant") or project number
    
    .PARAMETER FieldName
    The field name (e.g., "Status", "Priority", "Size")
    
    .PARAMETER OptionName
    The option name (e.g., "Backlog", "P1", "M")
    
    .EXAMPLE
    $optionId = Get-ProjectOptionId -ProjectKey "workant" -FieldName "Status" -OptionName "Backlog"
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectKey,
        
        [Parameter(Mandatory=$true)]
        [string]$FieldName,
        
        [Parameter(Mandatory=$true)]
        [string]$OptionName
    )
    
    $config = Get-ProjectConfig
    if (-not $config) {
        return $null
    }
    
    $project = Get-ProjectById -ProjectKey $ProjectKey
    if (-not $project) {
        return $null
    }
    
    if (-not $project.options) {
        return $null
    }
    
    # Try multiple access methods for maximum compatibility
    # Method 1: Direct indexer access (most reliable)
    $fieldProp = $project.options.PSObject.Properties[$FieldName]
    if ($fieldProp) {
        $optionValue = $fieldProp.Value
        if ($optionValue) {
            $optionProp = $optionValue.PSObject.Properties[$OptionName]
            if ($optionProp) {
                return $optionProp.Value
            }
        }
    }
    
    # Method 2: Where-Object filter
    $fieldProp = $project.options.PSObject.Properties | Where-Object { $_.Name -eq $FieldName } | Select-Object -First 1
    if ($fieldProp) {
        $optionValue = $fieldProp.Value
        if ($optionValue) {
            $optionProp = $optionValue.PSObject.Properties | Where-Object { $_.Name -eq $OptionName } | Select-Object -First 1
            if ($optionProp) {
                return $optionProp.Value
            }
        }
    }
    
    # Method 3: Direct property access
    if ($project.options.$FieldName) {
        $optionValue = $project.options.$FieldName
        if ($optionValue -and $optionValue.$OptionName) {
            return $optionValue.$OptionName
        }
    }
    
    return $null
}

function Get-IssueTypeId {
    <#
    .SYNOPSIS
    Gets the issue type ID for a specific issue type name.
    
    .PARAMETER IssueTypeName
    The issue type name (e.g., "Feature", "Bug", "Task")
    
    .EXAMPLE
    $typeId = Get-IssueTypeId -IssueTypeName "Feature"
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$IssueTypeName
    )
    
    $config = Get-ProjectConfig
    if (-not $config) {
        return $null
    }
    
    if (-not $config.issueTypes) {
        return $null
    }
    
    # Use PSObject.Properties for reliable dynamic property access
    $typeProp = $config.issueTypes.PSObject.Properties[$IssueTypeName]
    if ($typeProp) {
        return $typeProp.Value
    }
    
    # Fallback: try direct property access
    if ($config.issueTypes.$IssueTypeName) {
        return $config.issueTypes.$IssueTypeName
    }
    
    return $null
}

function Get-ProjectById {
    <#
    .SYNOPSIS
    Gets project configuration by project key or number.
    
    .PARAMETER ProjectKey
    The project key (e.g., "workant") or project number (e.g., "6")
    
    .EXAMPLE
    $project = Get-ProjectById -ProjectKey "workant"
    $project = Get-ProjectById -ProjectKey "6"
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectKey
    )
    
    $config = Get-ProjectConfig
    if (-not $config -or -not $config.projects) {
        return $null
    }
    
    # Try direct key lookup using PSObject.Properties (most reliable)
    $projectProp = $config.projects.PSObject.Properties[$ProjectKey]
    if ($projectProp) {
        return $projectProp.Value
    }
    
    # Fallback: try direct property access with variable
    if ($config.projects.$ProjectKey) {
        return $config.projects.$ProjectKey
    }
    
    # Try finding by project number
    foreach ($key in $config.projects.PSObject.Properties.Name) {
        $project = $config.projects.PSObject.Properties[$key].Value
        if ($project.projectNumber -and $project.projectNumber.ToString() -eq $ProjectKey) {
            return $project
        }
    }
    
    return $null
}

function Get-DefaultProject {
    <#
    .SYNOPSIS
    Gets the default project configuration.
    
    .EXAMPLE
    $project = Get-DefaultProject
    #>
    
    $config = Get-ProjectConfig
    if (-not $config -or -not $config.defaultProject) {
        return $null
    }
    
    return Get-ProjectById -ProjectKey $config.defaultProject
}

function Get-ProjectDefaults {
    <#
    .SYNOPSIS
    Gets default values for a project.
    
    .PARAMETER ProjectKey
    The project key or number
    
    .EXAMPLE
    $defaults = Get-ProjectDefaults -ProjectKey "workant"
    #>
    
    param(
        [Parameter(Mandatory=$true)]
        [string]$ProjectKey
    )
    
    $project = Get-ProjectById -ProjectKey $ProjectKey
    if (-not $project -or -not $project.defaults) {
        return @{
            Status = "Backlog"
            Priority = "P1"
            Size = ""
            Estimate = 0
        }
    }
    
    return $project.defaults
}

