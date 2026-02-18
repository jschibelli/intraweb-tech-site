# File: scripts\ops\New-IntraWebDevFolders.ps1



param(

  [Parameter(Mandatory=$false)]

  [string]$Root = "D:\Repos\IntraWeb"

)



$paths = @(

  "$Root\products",

  "$Root\shared",

  "$Root\infra",

  "$Root\ops",

  "$Root\_scratch"

)



foreach ($p in $paths) {

  New-Item -ItemType Directory -Force -Path $p | Out-Null

}



Write-Host "Created dev repo folders at: $Root"

