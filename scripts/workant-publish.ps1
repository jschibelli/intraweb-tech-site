# Load .env.local and publish to GitHub Packages (npm.pkg.github.com)
if (Test-Path .env.local) {
    Get-Content .env.local | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim().Trim('"').Trim("'")
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "Loaded environment variables from .env.local" -ForegroundColor Green
} else {
    Write-Host "Warning: .env.local not found" -ForegroundColor Yellow
}

function Get-NpmAuthKeyFromRegistryUrl {
    param([Parameter(Mandatory)][string]$RegistryUrl)

    # npmrc auth token lines use: //host/path/:_authToken=TOKEN
    $u = $RegistryUrl.Trim()
    if (-not $u.EndsWith("/")) { $u += "/" }
    $u = $u -replace '^https?:', ''
    if (-not $u.StartsWith("//")) { $u = "//" + $u.TrimStart("/") }
    return $u
}

# GitHub Packages registry
$registry = "https://npm.pkg.github.com"

# GitHub Packages auth token (prefer GITHUB_TOKEN; fall back to NODE_AUTH_TOKEN)
$token = $env:GITHUB_TOKEN ?? $env:NODE_AUTH_TOKEN
if (-not $token) {
    Write-Host "Error: GITHUB_TOKEN not found in .env.local" -ForegroundColor Red
    Write-Host "Please add GITHUB_TOKEN=your-token-here to .env.local" -ForegroundColor Yellow
    exit 1
}

# Detect package scope for scoped registry mapping (optional but helpful)
$pkgName = $null
try {
    $pkgName = (Get-Content -Raw -Path "package.json" | ConvertFrom-Json).name
} catch { }
$scope = $null
if ($pkgName -and $pkgName -match '^@([^/]+)/') {
    $scope = $matches[1]
}

$tmpNpmrc = Join-Path ([System.IO.Path]::GetTempPath()) ("workant-npmrc-" + [System.Guid]::NewGuid().ToString("N") + ".npmrc")
$authKey = Get-NpmAuthKeyFromRegistryUrl -RegistryUrl $registry

$npmrcLines = @()
$npmrcLines += "registry=$registry"
$npmrcLines += "always-auth=true"
if ($scope) {
    $npmrcLines += "@$scope:registry=$registry"
}
$npmrcLines += "$authKey" + ":_authToken=$token"

Set-Content -Path $tmpNpmrc -Value ($npmrcLines -join "`n") -Encoding UTF8

try {
    Write-Host "Publishing to GitHub Packages: $registry" -ForegroundColor Cyan
    $env:NPM_CONFIG_USERCONFIG = $tmpNpmrc

    # Use explicit registry to avoid global npm config drift
    npm publish --registry $registry
} finally {
    try { Remove-Item -Force $tmpNpmrc -ErrorAction SilentlyContinue } catch { }
    Remove-Item Env:\NPM_CONFIG_USERCONFIG -ErrorAction SilentlyContinue
}

