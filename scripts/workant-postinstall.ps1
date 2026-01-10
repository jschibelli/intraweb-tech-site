# Postinstall script to copy scripts and prompts to root directory
# This script runs from node_modules/@intraweb-technology/workant
# We need to find the consuming repository root (go up from node_modules)

# Get the directory where this script is located
$scriptPath = if ($PSScriptRoot) { $PSScriptRoot } else { Split-Path -Parent $MyInvocation.MyCommand.Path }
$packagePath = $scriptPath

# Find the repository root by traversing up from the package location
# The package is at: node_modules/@intraweb-technology/workant
# So we need to go up 3 levels: workant -> @intraweb-technology -> node_modules -> root
$currentPath = $packagePath
$rootPath = $null

# Method 1: Look for node_modules directory and go up one level
while ($currentPath) {
    $parentPath = Split-Path $currentPath -Parent
    if (-not $parentPath) { break }
    
    $nodeModulesPath = Join-Path $parentPath "node_modules"
    if (Test-Path $nodeModulesPath) {
        $rootPath = $parentPath
        break
    }
    
    # Stop if we've reached the drive root
    if ($currentPath -eq $parentPath) { break }
    $currentPath = $parentPath
}

# Method 2: If we're in node_modules/@intraweb-technology/workant, go up 3 levels
if (-not $rootPath) {
    $testPath = $packagePath
    if ($testPath -match 'node_modules[\\/]@intraweb-technology[\\/]workant') {
        $rootPath = $testPath
        for ($i = 0; $i -lt 3; $i++) {
            $rootPath = Split-Path $rootPath -Parent
        }
    }
}

# Method 3: Use npm/pnpm environment variables if available
if (-not $rootPath -and $env:INIT_CWD) {
    $rootPath = $env:INIT_CWD
}

# Method 4: Fallback - assume current working directory
if (-not $rootPath) {
    $rootPath = Get-Location | Select-Object -ExpandProperty Path
}

if (-not $rootPath -or -not (Test-Path $rootPath)) {
    Write-Host "Error: Could not determine repository root path" -ForegroundColor Red
    exit 1
}

# Copy scripts folder
$scriptsSource = Join-Path $packagePath "scripts"
$scriptsDest = Join-Path $rootPath "scripts"
if (Test-Path $scriptsSource) {
    if (Test-Path $scriptsDest) {
        Write-Host "Removing existing scripts folder..." -ForegroundColor Yellow
        Remove-Item -Path $scriptsDest -Recurse -Force
    }
    Write-Host "Copying scripts folder to root..." -ForegroundColor Green
    Copy-Item -Path $scriptsSource -Destination $scriptsDest -Recurse -Force
} else {
    Write-Host "Scripts folder not found in package" -ForegroundColor Yellow
}

# Copy prompts folder
$promptsSource = Join-Path $packagePath "prompts"
$promptsDest = Join-Path $rootPath "prompts"
if (Test-Path $promptsSource) {
    if (Test-Path $promptsDest) {
        Write-Host "Removing existing prompts folder..." -ForegroundColor Yellow
        Remove-Item -Path $promptsDest -Recurse -Force
    }
    Write-Host "Copying prompts folder to root..." -ForegroundColor Green
    Copy-Item -Path $promptsSource -Destination $promptsDest -Recurse -Force
} else {
    Write-Host "Prompts folder not found in package" -ForegroundColor Yellow
}

Write-Host "Workant scripts and prompts installed successfully!" -ForegroundColor Green

