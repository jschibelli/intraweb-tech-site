#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Updates Phase 2 documentation files with proper UI components and styling

.DESCRIPTION
    This script applies consistent UI components, mermaid styling, and UTF-8 encoding
    to all Phase 2 documentation pages.

.PARAMETER FilePath
    Path to the MDX file to update. If not provided, updates all Phase 2 files.

.PARAMETER DryRun
    Preview changes without applying them

.EXAMPLE
    .\update-docs-ui-components.ps1 -FilePath "apps/docs/contents/docs/testing/index.mdx"
    
.EXAMPLE
    .\update-docs-ui-components.ps1 -DryRun
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$FilePath,
    
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

# Color output functions
function Write-Info { param($msg) Write-Host "ℹ️  $msg" -ForegroundColor Cyan }
function Write-Success { param($msg) Write-Host "✅ $msg" -ForegroundColor Green }
function Write-Warning { param($msg) Write-Host "⚠️  $msg" -ForegroundColor Yellow }
function Write-Error { param($msg) Write-Host "❌ $msg" -ForegroundColor Red }

# Phase 2 documentation files
$Phase2Files = @(
    "apps/docs/contents/docs/testing/index.mdx",
    "apps/docs/contents/docs/reference/configuration/index.mdx",
    "apps/docs/contents/docs/frontend/automation/index.mdx",
    "apps/docs/contents/docs/troubleshooting/automation/index.mdx",
    "apps/docs/contents/docs/scripts-reference/complete-guide/index.mdx",
    "apps/docs/contents/docs/workflows/diagrams/index.mdx",
    "apps/docs/contents/docs/guides/migration/index.mdx"
)

function Add-MermaidStyling {
    param([string]$Content)
    
    Write-Info "Adding mermaid diagram styling..."
    
    # Add styling to mermaid diagrams that don't have it
    $mermaidPattern = '```mermaid\s+graph\s+(TB|LR|TD|RL)\s+([\s\S]+?)```'
    
    $Content = $Content -replace $mermaidPattern, {
        param($match)
        $diagram = $match.Groups[0].Value
        
        # Check if already has styling
        if ($diagram -notmatch 'style\s+\w+\s+fill') {
            # Add basic blue theme styling
            $styled = $diagram -replace '```$', @"
    
    style A fill:#e3f2fd
    style B fill:#90caf9
    style C fill:#2196f3
```
"@
            return $styled
        }
        
        return $diagram
    }
    
    return $Content
}

function Add-NoteComponents {
    param([string]$Content)
    
    Write-Info "Adding Note components..."
    
    # Convert strong warnings to Note components
    $Content = $Content -replace '\*\*Never commit `.env.local` files to Git!\*\*([^\r\n]*)', @'
<Note type="warning">
**Never commit `.env.local` files to Git!** They are automatically ignored via `.gitignore` to protect sensitive credentials.
</Note>
'@
    
    # Convert "Important:" to Note components
    $Content = $Content -replace '\*\*Important:\*\*\s*([^\r\n]+)', @'
<Note type="warning">
$1
</Note>
'@
    
    # Convert "Note:" to Note components
    $Content = $Content -replace '\*\*Note:\*\*\s*([^\r\n]+)', @'
<Note type="info">
$1
</Note>
'@
    
    return $Content
}

function Ensure-UTF8Encoding {
    param([string]$Path)
    
    Write-Info "Ensuring UTF-8 encoding for: $Path"
    
    # Read file content
    $content = Get-Content $Path -Raw
    
    # Write back with UTF-8 encoding (with BOM)
    [System.IO.File]::WriteAllText($Path, $content, [System.Text.UTF8Encoding]::new($true))
    
    Write-Success "UTF-8 encoding applied"
}

function Update-DocumentFile {
    param([string]$Path)
    
    Write-Info "`n📄 Processing: $Path"
    
    if (-not (Test-Path $Path)) {
        Write-Error "File not found: $Path"
        return
    }
    
    # Read file content
    $content = Get-Content $Path -Raw -Encoding UTF8
    
    # Store original for comparison
    $originalContent = $content
    
    # Apply transformations
    $content = Add-MermaidStyling $content
    $content = Add-NoteComponents $content
    
    # Check if changes were made
    if ($content -ne $originalContent) {
        if ($DryRun) {
            Write-Warning "Would update: $Path"
            Write-Host "Changes summary:" -ForegroundColor Yellow
            Write-Host "  - Mermaid styling added"
            Write-Host "  - Note components added"
        } else {
            # Write changes
            Set-Content $Path -Value $content -Encoding UTF8 -NoNewline
            
            # Ensure UTF-8 encoding
            Ensure-UTF8Encoding $Path
            
            Write-Success "Updated successfully"
        }
    } else {
        Write-Info "No changes needed"
    }
}

# Main execution
Write-Host "`n🚀 Phase 2 Documentation UI Updater`n" -ForegroundColor Cyan

if ($FilePath) {
    # Update single file
    Update-DocumentFile $FilePath
} else {
    # Update all Phase 2 files
    Write-Info "Updating all Phase 2 documentation files..."
    
    foreach ($file in $Phase2Files) {
        Update-DocumentFile $file
    }
}

Write-Host "`n✨ Update complete!`n" -ForegroundColor Green

if ($DryRun) {
    Write-Warning "This was a dry run. Run without -DryRun to apply changes."
}

Write-Host @"

Next steps:
1. Build docs site: pnpm --filter @portfolio/docs build
2. Test locally: pnpm --filter @portfolio/docs dev
3. Review changes: git diff apps/docs/
4. Commit if satisfied: git add apps/docs/ && git commit -m "feat(docs): add UI components to Phase 2 docs"

"@ -ForegroundColor Cyan


