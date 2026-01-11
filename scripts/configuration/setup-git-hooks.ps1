# Git Hooks Setup Script
# Installs or removes Git hooks for automatic issue status tracking

param(
    [Parameter(Mandatory=$false)]
    [switch]$Disable,
    
    [Parameter(Mandatory=$false)]
    [switch]$Enable,
    
    [Parameter(Mandatory=$false)]
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Banner {
    Write-ColorOutput "===============================================" "Blue"
    Write-ColorOutput "     Git Hooks Setup for Issue Status Tracking" "Blue"
    Write-ColorOutput "===============================================" "Blue"
    Write-Host ""
}

function Test-GitRepository {
    try {
        $gitDir = git rev-parse --git-dir 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-GitHubCLI {
    try {
        $ghVersion = gh --version 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Test-GitHubAuth {
    try {
        $authStatus = gh auth status 2>&1
        return $LASTEXITCODE -eq 0
    } catch {
        return $false
    }
}

function Install-Hooks {
    Write-ColorOutput "Installing Git hooks..." "Yellow"
    
    # Get paths - handle both direct execution and dot-sourced execution
    if ($MyInvocation.MyCommand.Path) {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    } elseif ($PSScriptRoot) {
        $scriptDir = $PSScriptRoot
    } else {
        $scriptDir = Split-Path -Parent $PSCommandPath
    }
    
    if (-not $scriptDir) {
        Write-ColorOutput "  ❌ Could not determine script directory" "Red"
        return $false
    }
    
    $repoRoot = Split-Path -Parent $scriptDir
    $hooksDir = Join-Path $repoRoot ".git\hooks"
    
    if (-not (Test-Path $hooksDir)) {
        Write-ColorOutput "  ❌ Git hooks directory not found: $hooksDir" "Red"
        return $false
    }
    
    $hooks = @(
        @{ Name = "post-checkout"; BatFile = "post-checkout.bat"; Ps1File = "post-checkout.ps1" }
        @{ Name = "post-commit"; BatFile = "post-commit.bat"; Ps1File = "post-commit.ps1" }
        @{ Name = "pre-push"; BatFile = "pre-push.bat"; Ps1File = "pre-push.ps1" }
    )
    
    $allSuccess = $true
    
    foreach ($hook in $hooks) {
        $batPath = Join-Path $hooksDir $hook.BatFile
        $ps1Path = Join-Path $hooksDir $hook.Ps1File
        
        if ($DryRun) {
            Write-ColorOutput "  [DRY RUN] Would install: $($hook.Name) (.bat and .ps1)" "Cyan"
            continue
        }
        
        # Check if both files exist (Windows requires both)
        $batExists = Test-Path $batPath
        $ps1Exists = Test-Path $ps1Path
        
        if ($batExists -and $ps1Exists) {
            Write-ColorOutput "  ✅ Hook already exists: $($hook.Name)" "Green"
        } elseif ($batExists -or $ps1Exists) {
            Write-ColorOutput "  ⚠️  Hook partially installed: $($hook.Name) (missing $(if (-not $batExists) { '.bat' } else { '.ps1' }))" "Yellow"
            $allSuccess = $false
        } else {
            Write-ColorOutput "  ⚠️  Hook not found: $($hook.Name)" "Yellow"
            Write-ColorOutput "     Expected: $batPath and $ps1Path" "Gray"
            $allSuccess = $false
        }
        
        # Make hooks executable (Unix-like systems)
        if ($IsLinux -or $IsMacOS) {
            try {
                if ($batExists) { chmod +x $batPath 2>&1 | Out-Null }
                if ($ps1Exists) { chmod +x $ps1Path 2>&1 | Out-Null }
            } catch {
                # Ignore errors
            }
        }
    }
    
    return $allSuccess
}

function Remove-Hooks {
    Write-ColorOutput "Removing Git hooks..." "Yellow"
    
    # Get paths - handle both direct execution and dot-sourced execution
    if ($MyInvocation.MyCommand.Path) {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    } elseif ($PSScriptRoot) {
        $scriptDir = $PSScriptRoot
    } else {
        $scriptDir = Split-Path -Parent $PSCommandPath
    }
    
    if (-not $scriptDir) {
        Write-ColorOutput "  ❌ Could not determine script directory" "Red"
        return
    }
    
    $repoRoot = Split-Path -Parent $scriptDir
    $hooksDir = Join-Path $repoRoot ".git\hooks"
    
    $hooks = @(
        @{ Name = "post-checkout"; BatFile = "post-checkout.bat"; Ps1File = "post-checkout.ps1" }
        @{ Name = "post-commit"; BatFile = "post-commit.bat"; Ps1File = "post-commit.ps1" }
        @{ Name = "pre-push"; BatFile = "pre-push.bat"; Ps1File = "pre-push.ps1" }
    )
    
    foreach ($hook in $hooks) {
        $batPath = Join-Path $hooksDir $hook.BatFile
        $ps1Path = Join-Path $hooksDir $hook.Ps1File
        
        if ($DryRun) {
            Write-ColorOutput "  [DRY RUN] Would remove: $($hook.Name) (.bat and .ps1)" "Cyan"
            continue
        }
        
        $removed = $false
        if (Test-Path $batPath) {
            try {
                Remove-Item $batPath -Force
                Write-ColorOutput "  ✅ Removed: $($hook.BatFile)" "Green"
                $removed = $true
            } catch {
                Write-ColorOutput "  ❌ Failed to remove: $($hook.BatFile)" "Red"
            }
        }
        
        if (Test-Path $ps1Path) {
            try {
                Remove-Item $ps1Path -Force
                Write-ColorOutput "  ✅ Removed: $($hook.Ps1File)" "Green"
                $removed = $true
            } catch {
                Write-ColorOutput "  ❌ Failed to remove: $($hook.Ps1File)" "Red"
            }
        }
        
        if (-not $removed) {
            Write-ColorOutput "  ⚠️  Hook not found: $($hook.Name)" "Yellow"
        }
    }
}

function Test-Hooks {
    Write-ColorOutput "Testing hook installation..." "Yellow"
    
    # Get paths - handle both direct execution and dot-sourced execution
    if ($MyInvocation.MyCommand.Path) {
        $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
    } elseif ($PSScriptRoot) {
        $scriptDir = $PSScriptRoot
    } else {
        $scriptDir = Split-Path -Parent $PSCommandPath
    }
    
    if (-not $scriptDir) {
        Write-ColorOutput "  ❌ Could not determine script directory" "Red"
        return $false
    }
    
    $repoRoot = Split-Path -Parent $scriptDir
    $hooksDir = Join-Path $repoRoot ".git\hooks"
    
    $hooks = @(
        @{ Name = "post-checkout"; BatFile = "post-checkout.bat"; Ps1File = "post-checkout.ps1" }
        @{ Name = "post-commit"; BatFile = "post-commit.bat"; Ps1File = "post-commit.ps1" }
        @{ Name = "pre-push"; BatFile = "pre-push.bat"; Ps1File = "pre-push.ps1" }
    )
    $allExist = $true
    
    foreach ($hook in $hooks) {
        $batPath = Join-Path $hooksDir $hook.BatFile
        $ps1Path = Join-Path $hooksDir $hook.Ps1File
        
        $batExists = Test-Path $batPath
        $ps1Exists = Test-Path $ps1Path
        
        if ($batExists -and $ps1Exists) {
            Write-ColorOutput "  ✅ $($hook.Name) exists (.bat and .ps1)" "Green"
        } elseif ($batExists -or $ps1Exists) {
            Write-ColorOutput "  ⚠️  $($hook.Name) partially installed (missing $(if (-not $batExists) { '.bat' } else { '.ps1' }))" "Yellow"
            $allExist = $false
        } else {
            Write-ColorOutput "  ❌ $($hook.Name) missing" "Red"
            $allExist = $false
        }
    }
    
    return $allExist
}

# Main execution
Show-Banner

# Check if we're in a Git repository
if (-not (Test-GitRepository)) {
    Write-ColorOutput "❌ Not in a Git repository" "Red"
    Write-ColorOutput "Please run this script from within a Git repository." "Yellow"
    exit 1
}

# Check GitHub CLI
if (-not (Test-GitHubCLI)) {
    Write-ColorOutput "❌ GitHub CLI not found" "Red"
    Write-ColorOutput "Please install GitHub CLI: https://cli.github.com/" "Yellow"
    exit 1
}

# Check GitHub authentication
if (-not (Test-GitHubAuth)) {
    Write-ColorOutput "❌ GitHub CLI not authenticated" "Red"
    Write-ColorOutput "Please run: gh auth login" "Yellow"
    exit 1
}

# Check project configuration
if ($MyInvocation.MyCommand.Path) {
    $scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
} elseif ($PSScriptRoot) {
    $scriptDir = $PSScriptRoot
} else {
    $scriptDir = Split-Path -Parent $PSCommandPath
}

$configPath = Join-Path $scriptDir "project-config.json"
if (-not (Test-Path $configPath)) {
    Write-ColorOutput "⚠️  Project configuration not found" "Yellow"
    Write-ColorOutput "Please run setup-project.ps1 first to configure your project." "Yellow"
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/N)"
    if ($continue -ne "y" -and $continue -ne "Y") {
        exit 1
    }
}

# Determine action
if ($Disable) {
    Remove-Hooks
    Write-Host ""
    Write-ColorOutput "✅ Hooks disabled successfully!" "Green"
} elseif ($Enable) {
    $success = Install-Hooks
    if ($success) {
        Write-Host ""
        Write-ColorOutput "✅ Hooks enabled successfully!" "Green"
        Write-Host ""
        Write-ColorOutput "Hooks will now automatically:" "Cyan"
        Write-ColorOutput "  - Update status to 'In progress' when you checkout an issue branch (from Backlog or Ready)" "White"
        Write-ColorOutput "  - Update status to 'In progress' when you commit to an issue branch (from Backlog)" "White"
        Write-ColorOutput "  - Update status to 'In review' when you push and a PR exists (from In progress)" "White"
    } else {
        Write-Host ""
        Write-ColorOutput "⚠️  Some hooks may not be installed correctly" "Yellow"
        Write-ColorOutput "Please ensure hooks exist in .git/hooks/ directory" "Yellow"
    }
} else {
    # Default: test/install
    $hooksExist = Test-Hooks
    
    if ($hooksExist) {
        Write-Host ""
        Write-ColorOutput "✅ All hooks are installed and ready!" "Green"
    } else {
        Write-Host ""
        Write-ColorOutput "⚠️  Some hooks are missing" "Yellow"
        Write-ColorOutput "Run with -Enable to install hooks" "Yellow"
    }
}

Write-Host ""

