# Test SYS 01 — Website Form Lead Intake webhook (same path Vercel uses after HubSpot sync).
# Prerequisites on n8n host:
#   - Workflow "SYS 01 — Website Form Lead Intake" active
#   - CONFIG — Global Settings active, Execute Workflow Trigger = passthrough, and either
#     N8N_BLOCK_ENV_ACCESS_IN_NODE unset/false OR "Secrets from env" must not use $env
#
# Usage:
#   .\scripts\test-n8n-website-intake.ps1
#   $env:N8N_WEBHOOK_URL = "https://n8n.example.com/webhook/hubspot-website-form-lead"; .\scripts\test-n8n-website-intake.ps1 -ContactId "12345"
#   .\scripts\test-n8n-website-intake.ps1 -NoContactId   # exercises upsert branch (creates/updates CRM via n8n)

param(
    [string] $WebhookUrl = $env:N8N_CONTACT_WEBHOOK_URL,
    [string] $Secret = $env:N8N_WEBHOOK_SECRET,
    [string] $SecretHeader = $(if ($env:N8N_WEBHOOK_SECRET_HEADER) { $env:N8N_WEBHOOK_SECRET_HEADER } else { "X-Intraweb-Website-Intake-Secret" }),
    [string] $ContactId = "",
    [switch] $NoContactId
)

$WebhookUrl = if ($WebhookUrl) { $WebhookUrl } else { "https://n8n.intrawebtech.com/webhook/hubspot-website-form-lead" }

$body = if ($NoContactId -or -not $ContactId) {
    @{
        contact      = @{
            firstName   = "Script"
            lastName    = "Test"
            email       = "n8n-script-test+$([guid]::NewGuid().ToString('N').Substring(0,8))@example.com"
            phone       = ""
            company     = "n8n webhook test"
            industry    = "Other"
        }
        createDeal   = $false
        dealStage    = "qualifiedtobuy"
        tier         = "starter"
        painOverride = "PowerShell test payload (safe to delete)"
        intake       = @{ contact = @{ businessName = "n8n webhook test" } }
    }
} else {
    @{
        contactId    = $ContactId
        createDeal   = $false
        dealStage    = "qualifiedtobuy"
        tier         = "starter"
        painOverride = "PowerShell test with existing HubSpot contact id"
    }
}

$json = $body | ConvertTo-Json -Depth 6
$headers = @{ "Content-Type" = "application/json" }
if ($Secret) { $headers[$SecretHeader] = $Secret }

Write-Host "POST $WebhookUrl"
try {
    $response = Invoke-WebRequest -Uri $WebhookUrl -Method POST -Headers $headers -Body $json -UseBasicParsing -TimeoutSec 120
    Write-Host "Status:" $response.StatusCode
    Write-Host $response.Content
} catch {
    Write-Host "Request failed:" $_.Exception.Message
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        Write-Host $reader.ReadToEnd()
    }
    exit 1
}
