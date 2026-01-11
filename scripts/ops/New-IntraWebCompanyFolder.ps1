# File: scripts\ops\New-IntraWebCompanyFolder.ps1

# Usage:

#   .\New-IntraWebCompanyFolder.ps1 -RootPath "D:\Company" -CompanyFolderName "IntraWeb-Technologies" -Products @("Workant","Tendril","Internal-Tools") -WhatIf

#   .\New-IntraWebCompanyFolder.ps1 -RootPath "D:\Company" -Products @("Workant","Tendril")



[CmdletBinding(SupportsShouldProcess=$true)]

param(

  [Parameter(Mandatory=$true)]

  [ValidateNotNullOrEmpty()]

  [string]$RootPath,



  [Parameter(Mandatory=$false)]

  [ValidateNotNullOrEmpty()]

  [string]$CompanyFolderName = "IntraWeb-Technologies",



  [Parameter(Mandatory=$false)]

  [string[]]$Products = @("Workant", "Tendril", "Internal-Tools")

)



Set-StrictMode -Version Latest

$ErrorActionPreference = "Stop"



# Statistics tracking

$script:Stats = @{

  DirectoriesCreated = 0

  FilesCreated = 0

  DirectoriesSkipped = 0

  FilesSkipped = 0

}



function Ensure-Directory {

  param(

    [Parameter(Mandatory=$true)][string]$Path

  )



  if (-not (Test-Path -LiteralPath $Path)) {

    if ($PSCmdlet.ShouldProcess($Path, "Create directory")) {

      New-Item -ItemType Directory -Path $Path -Force | Out-Null

      $script:Stats.DirectoriesCreated++

      Write-Verbose "Created directory: $Path"

    } else {

      Write-Verbose "Would create directory: $Path"

    }

  } else {

    $script:Stats.DirectoriesSkipped++

    Write-Verbose "Directory already exists: $Path"

  }

}



function New-PlaceholderFile {

  param(

    [Parameter(Mandatory=$true)][string]$Path,

    [Parameter(Mandatory=$false)][string]$Content = ""

  )



  if (-not (Test-Path -LiteralPath $Path)) {

    if ($PSCmdlet.ShouldProcess($Path, "Create file")) {

      $dir = Split-Path -Parent $Path

      Ensure-Directory -Path $dir

      Set-Content -LiteralPath $Path -Value $Content -Encoding UTF8

      $script:Stats.FilesCreated++

      Write-Verbose "Created file: $Path"

    } else {

      Write-Verbose "Would create file: $Path"

    }

  } else {

    $script:Stats.FilesSkipped++

    Write-Verbose "File already exists: $Path"

  }

}



# Validate RootPath exists

if (-not (Test-Path -LiteralPath $RootPath)) {

  throw "RootPath does not exist: $RootPath"

}



# Validate Product names (no spaces, no invalid characters)

function Test-ProductName {

  param([Parameter(Mandatory=$true)][string]$ProductName)

  

  if ($ProductName -match '\s') {

    throw "Product name '$ProductName' contains spaces. Use hyphens instead (e.g., 'Internal-Tools')."

  }

  

  $invalidChars = [System.IO.Path]::GetInvalidFileNameChars()

  foreach ($char in $invalidChars) {

    if ($ProductName.Contains($char)) {

      throw "Product name '$ProductName' contains invalid character: $char"

    }

  }

  

  return $true

}



# Validate all product names

foreach ($product in $Products) {

  Test-ProductName -ProductName $product

}



Write-Host "Creating company folder structure..." -ForegroundColor Cyan

Write-Host "  Root Path: $RootPath" -ForegroundColor Gray

Write-Host "  Company Folder: $CompanyFolderName" -ForegroundColor Gray

Write-Host "  Products: $($Products -join ', ')" -ForegroundColor Gray

Write-Host ""



$companyRoot = Join-Path $RootPath $CompanyFolderName

Write-Verbose "Company root: $companyRoot"

Ensure-Directory -Path $companyRoot



# Top-level folders

Write-Verbose "Creating top-level folders..."

$topLevel = @(

  "01_Admin-Legal",

  "02_Finance-Accounting",

  "03_Products",

  "04_Clients",

  "05_People",

  "06_Marketing-Brand",

  "07_Internal-Ops",

  "08_Archive"

)



foreach ($t in $topLevel) {

  Ensure-Directory -Path (Join-Path $companyRoot $t)

}



# 01_Admin-Legal

Write-Verbose "Setting up Admin-Legal structure..."

$adminRoot = Join-Path $companyRoot "01_Admin-Legal"

$adminFolders = @(

  "01_Company-Formation",

  "02_Legal-Agreements",

  "03_Compliance",

  "04_Insurance"

)

foreach ($f in $adminFolders) { Ensure-Directory -Path (Join-Path $adminRoot $f) }



Ensure-Directory -Path (Join-Path $adminRoot "01_Company-Formation\State-Filings")



$legalAgreementsRoot = Join-Path $adminRoot "02_Legal-Agreements"

Ensure-Directory -Path (Join-Path $legalAgreementsRoot "Master-Service-Agreement")

Ensure-Directory -Path (Join-Path $legalAgreementsRoot "NDA")

Ensure-Directory -Path (Join-Path $legalAgreementsRoot "Contractor-Agreements")

Ensure-Directory -Path (Join-Path $legalAgreementsRoot "Client-Contracts")



$complianceRoot = Join-Path $adminRoot "03_Compliance"

Ensure-Directory -Path (Join-Path $complianceRoot "Privacy-Policy")

Ensure-Directory -Path (Join-Path $complianceRoot "Terms-of-Service")

Ensure-Directory -Path (Join-Path $complianceRoot "GDPR")

Ensure-Directory -Path (Join-Path $complianceRoot "Security-Policies")



$insuranceRoot = Join-Path $adminRoot "04_Insurance"

Ensure-Directory -Path (Join-Path $insuranceRoot "General-Liability")

Ensure-Directory -Path (Join-Path $insuranceRoot "Professional-Liability")

Ensure-Directory -Path (Join-Path $insuranceRoot "Certificates")



# 02_Finance-Accounting

Write-Verbose "Setting up Finance-Accounting structure..."

$financeRoot = Join-Path $companyRoot "02_Finance-Accounting"

$financeFolders = @(

  "01_Banking",

  "02_Taxes",

  "03_Invoices",

  "04_Expenses",

  "05_Financial-Reports"

)

foreach ($f in $financeFolders) { Ensure-Directory -Path (Join-Path $financeRoot $f) }



Ensure-Directory -Path (Join-Path $financeRoot "01_Banking\Account-Info")

Ensure-Directory -Path (Join-Path $financeRoot "01_Banking\Statements")



# Taxes years (current year +/- a bit)

$year = (Get-Date).Year

$taxYears = ($year - 2), ($year - 1), $year | ForEach-Object { "$_" }

foreach ($y in $taxYears) { Ensure-Directory -Path (Join-Path $financeRoot "02_Taxes\$y") }



Ensure-Directory -Path (Join-Path $financeRoot "03_Invoices\Sent")

Ensure-Directory -Path (Join-Path $financeRoot "03_Invoices\Paid")

Ensure-Directory -Path (Join-Path $financeRoot "03_Invoices\Overdue")



Ensure-Directory -Path (Join-Path $financeRoot "04_Expenses\Software")

Ensure-Directory -Path (Join-Path $financeRoot "04_Expenses\Hardware")

Ensure-Directory -Path (Join-Path $financeRoot "04_Expenses\Subscriptions")

Ensure-Directory -Path (Join-Path $financeRoot "04_Expenses\Reimbursements")



Ensure-Directory -Path (Join-Path $financeRoot "05_Financial-Reports\Profit-Loss")

Ensure-Directory -Path (Join-Path $financeRoot "05_Financial-Reports\Balance-Sheets")

Ensure-Directory -Path (Join-Path $financeRoot "05_Financial-Reports\Cash-Flow")



# 03_Products

Write-Verbose "Setting up Products structure..."

$productsRoot = Join-Path $companyRoot "03_Products"



function New-ProductStructure {

  param([Parameter(Mandatory=$true)][string]$ProductName)



  Write-Verbose "Creating structure for product: $ProductName"

  $pRoot = Join-Path $productsRoot $ProductName

  Ensure-Directory -Path $pRoot



  $sub = @(

    "01_Product-Overview",

    "02_Architecture",

    "03_Design",

    "04_Source-Links",

    "05_Docs",

    "06_Legal",

    "07_Releases"

  )



  foreach ($s in $sub) {

    Ensure-Directory -Path (Join-Path $pRoot $s)

  }



  # Helpful placeholder files (optional but nice)

  New-PlaceholderFile -Path (Join-Path $pRoot "01_Product-Overview\README.md") -Content "# $ProductName`n"

  New-PlaceholderFile -Path (Join-Path $pRoot "04_Source-Links\Links.md") -Content "# $ProductName source links`n"

}



foreach ($p in $Products) {

  New-ProductStructure -ProductName $p

}



# 04_Clients

Write-Verbose "Setting up Clients structure..."

$clientsRoot = Join-Path $companyRoot "04_Clients"

Ensure-Directory -Path (Join-Path $clientsRoot "Active")

Ensure-Directory -Path (Join-Path $clientsRoot "Completed")

Ensure-Directory -Path (Join-Path $clientsRoot "Prospects")



# Optional template to copy when creating a new client folder

$clientTemplateRoot = Join-Path $clientsRoot "_TEMPLATE_ClientName"

Ensure-Directory -Path $clientTemplateRoot

$clientTemplateSub = @(

  "01_Contract",

  "02_Scope",

  "03_Design",

  "04_Deliverables",

  "05_Invoices",

  "06_Communication"

)

foreach ($s in $clientTemplateSub) {

  Ensure-Directory -Path (Join-Path $clientTemplateRoot $s)

}

New-PlaceholderFile -Path (Join-Path $clientTemplateRoot "02_Scope\Scope.md") -Content "# Scope`n"



# 05_People

Write-Verbose "Setting up People structure..."

$peopleRoot = Join-Path $companyRoot "05_People"

Ensure-Directory -Path (Join-Path $peopleRoot "Founders\John-Schibelli")

Ensure-Directory -Path (Join-Path $peopleRoot "Contractors")

Ensure-Directory -Path (Join-Path $peopleRoot "Advisors")



# 06_Marketing-Brand

Write-Verbose "Setting up Marketing-Brand structure..."

$marketingRoot = Join-Path $companyRoot "06_Marketing-Brand"

Ensure-Directory -Path (Join-Path $marketingRoot "Brand-Assets\Logos")

Ensure-Directory -Path (Join-Path $marketingRoot "Brand-Assets\Colors")

Ensure-Directory -Path (Join-Path $marketingRoot "Brand-Assets\Typography")

Ensure-Directory -Path (Join-Path $marketingRoot "Brand-Assets\Usage-Guidelines")



Ensure-Directory -Path (Join-Path $marketingRoot "Website\Copy")

Ensure-Directory -Path (Join-Path $marketingRoot "Website\SEO")

Ensure-Directory -Path (Join-Path $marketingRoot "Website\Screenshots")



Ensure-Directory -Path (Join-Path $marketingRoot "Social\LinkedIn")

Ensure-Directory -Path (Join-Path $marketingRoot "Social\Facebook")

Ensure-Directory -Path (Join-Path $marketingRoot "Social\Campaigns")



Ensure-Directory -Path (Join-Path $marketingRoot "Press\Press-Kit")

Ensure-Directory -Path (Join-Path $marketingRoot "Press\Announcements")



# 07_Internal-Ops

Write-Verbose "Setting up Internal-Ops structure..."

$opsRoot = Join-Path $companyRoot "07_Internal-Ops"

Ensure-Directory -Path (Join-Path $opsRoot "SOPs")

Ensure-Directory -Path (Join-Path $opsRoot "Automation")

Ensure-Directory -Path (Join-Path $opsRoot "Templates")

Ensure-Directory -Path (Join-Path $opsRoot "Tools-Stack")

Ensure-Directory -Path (Join-Path $opsRoot "Roadmaps")



# 08_Archive

Write-Verbose "Setting up Archive structure..."

$archiveRoot = Join-Path $companyRoot "08_Archive"

Ensure-Directory -Path (Join-Path $archiveRoot "Old-Contracts")

Ensure-Directory -Path (Join-Path $archiveRoot "Deprecated-Products")

Ensure-Directory -Path (Join-Path $archiveRoot "Legacy-Clients")

Ensure-Directory -Path (Join-Path $archiveRoot "Misc")



# Root-level conventions file

Write-Verbose "Creating naming conventions file..."

New-PlaceholderFile -Path (Join-Path $companyRoot "00_README_Naming-Conventions.md") -Content @"

# IntraWeb Technologies - Folder Rules



- No spaces in folder names: use hyphens

- Dates are YYYY-MM-DD

- Contracts and signed documents should be stored as PDFs

- Do not rename executed/signed agreements after signing

- 04_Clients/_TEMPLATE_ClientName can be copied into Active/Prospects as needed

"@



# Summary

Write-Host ""

Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "Summary" -ForegroundColor Cyan

Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "Company structure location: $companyRoot" -ForegroundColor Green

Write-Host ""

if ($PSCmdlet.ShouldProcess("Summary", "Show statistics")) {

  Write-Host "Statistics:" -ForegroundColor Yellow

  Write-Host "  Directories created: $($script:Stats.DirectoriesCreated)" -ForegroundColor White

  Write-Host "  Files created: $($script:Stats.FilesCreated)" -ForegroundColor White

  if ($script:Stats.DirectoriesSkipped -gt 0) {

    Write-Host "  Directories skipped (already exist): $($script:Stats.DirectoriesSkipped)" -ForegroundColor Gray

  }

  if ($script:Stats.FilesSkipped -gt 0) {

    Write-Host "  Files skipped (already exist): $($script:Stats.FilesSkipped)" -ForegroundColor Gray

  }

} else {

  Write-Host "Preview mode (-WhatIf): No changes were made." -ForegroundColor Yellow

  Write-Host "Run without -WhatIf to create the structure." -ForegroundColor Yellow

}

Write-Host ""

Write-Host "Tip: Use -Verbose to see detailed progress." -ForegroundColor Gray

