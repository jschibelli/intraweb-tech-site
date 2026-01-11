#requires -Version 7.0
[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [int]$IssueNumber,
    [switch]$GeneratePlan,
    [switch]$CreatePR,
    [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Ensure-GhCli {
    if (-not (Get-Command gh -ErrorAction SilentlyContinue)) {
        throw "GitHub CLI (gh) is required."
    }
}

function Get-IssueInfo {
    Ensure-GhCli
    $json = gh issue view $IssueNumber --json number,title,body,url,labels
    return $json | ConvertFrom-Json
}

function Write-ImplementationPlan {
    param([object]$Issue)
    $dir = "implementations/issue-$($Issue.number)"
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
    }
    $planPath = Join-Path $dir "plan.md"
    $plan = @"
# Implementation Plan for Issue #$($Issue.number) - $($Issue.title)

## Context
$($Issue.body)

## Tasks
- [ ] Analyze requirements
- [ ] Update code
- [ ] Write tests
- [ ] Update documentation
- [ ] Create PR and request review

Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
"@
    if ($DryRun) {
        Write-Host $plan
    } else {
        $plan | Out-File -FilePath $planPath -Encoding utf8
        Write-Host "Plan written to $planPath" -ForegroundColor Green
    }
}

function Create-PullRequest {
    param([object]$Issue)
    if ($DryRun) {
        Write-Host "[DryRun] Would create PR for issue #$($Issue.number)." -ForegroundColor Yellow
        return
    }
    $title = "Implement: $($Issue.title)"
    $body = "Closes #$($Issue.number)"
    gh pr create --title $title --body $body --base develop --head "issue-$($Issue.number)" | Out-Null
    Write-Host "PR created for issue #$($Issue.number)." -ForegroundColor Green
}

$issue = Get-IssueInfo

if ($GeneratePlan) { Write-ImplementationPlan -Issue $issue }
if ($CreatePR) { Create-PullRequest -Issue $issue }

if (-not ($GeneratePlan -or $CreatePR)) {
    Write-Host "No action specified. Use -GeneratePlan and/or -CreatePR." -ForegroundColor Yellow
}

