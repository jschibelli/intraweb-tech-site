#requires -Version 7.0
<#
.SYNOPSIS
  Shared AI service helpers for automation scripts.

.DESCRIPTION
  Provides lightweight wrappers around external AI providers so that other
  scripts can call `Invoke-AICompletion` without duplicating HTTP logic or
  credential handling.
#>

if (-not $script:AutomationAIConfig) {
    $envModel =
        $env:OPENAI_MODEL ??
        $env:OPENAI_ROUTER_MODEL_RESPONSES ??
        $env:OPENAI_ROUTER_MODEL_SMALL ??
        $env:OPENAI_CHAT_MODEL ??
        $env:OPENAI_DEFAULT_MODEL ??
        $env:WORKANT_OPENAI_MODEL

    $script:AutomationAIConfig = @{
        Provider     = "openai"
        # Allow users to override via .env.local (loaded into process env), fallback to a sane default
        Model        = $(if ($envModel) { $envModel } else { "gpt-4o-mini" })
        # Default output budget (Responses API uses max_output_tokens, chat/completions uses max_tokens)
        MaxTokens    = 8000
        Temperature  = 0.2
        ApiKey       = $env:OPENAI_API_KEY
        Organization = $env:OPENAI_ORG_ID
    }
}

function Set-AIServiceConfig {
    [CmdletBinding()]
    param(
        [ValidateSet("openai", "local")]
        [string]$Provider,
        [string]$Model,
        [int]$MaxTokens,
        [double]$Temperature,
        [string]$ApiKey,
        [string]$Organization
    )

    foreach ($key in $PSBoundParameters.Keys) {
        $script:AutomationAIConfig[$key.Substring(0,1).ToUpper() + $key.Substring(1)] = $PSBoundParameters[$key]
    }
}

function Get-AIServiceConfig {
    [CmdletBinding()]
    param()
    $config = $script:AutomationAIConfig.Clone()

    # If the config model is still the default, allow env var to override at runtime.
    # This covers cases where env vars are loaded *after* this file is loaded.
    $envModel =
        $env:OPENAI_MODEL ??
        $env:OPENAI_ROUTER_MODEL_RESPONSES ??
        $env:OPENAI_ROUTER_MODEL_SMALL ??
        $env:OPENAI_CHAT_MODEL ??
        $env:OPENAI_DEFAULT_MODEL ??
        $env:WORKANT_OPENAI_MODEL

    if ($envModel) {
        $currentModel = [string]$config.Model
        if (-not $currentModel -or $currentModel -eq "gpt-4o-mini") {
            $config.Model = $envModel
        }
    }

    return $config
}

function Invoke-AICompletion {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Prompt,

        [string]$Model,
        [double]$Temperature,
        [int]$MaxTokens,
        [ValidateSet("text", "json")]
        [string]$ResponseFormat = "text"
    )

    $config = Get-AIServiceConfig
    if ($PSBoundParameters.ContainsKey("Model")) { $config.Model = $Model }
    if ($PSBoundParameters.ContainsKey("Temperature")) { $config.Temperature = $Temperature }
    if ($PSBoundParameters.ContainsKey("MaxTokens")) { $config.MaxTokens = $MaxTokens }

    switch ($config.Provider) {
        "openai" { return Invoke-OpenAICompletion -Prompt $Prompt -Config $config -ResponseFormat $ResponseFormat }
        "local"  { return "[Local AI disabled] $Prompt" }
        default  { throw "Unsupported AI provider '$($config.Provider)'" }
    }
}

function Invoke-OpenAICompletion {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Prompt,
        [Parameter(Mandatory)]
        [hashtable]$Config,
        [ValidateSet("text", "json")]
        [string]$ResponseFormat = "text"
    )

    if (-not $Config.ApiKey) {
        throw "OPENAI_API_KEY is not set. Configure it via environment variable or Set-AIServiceConfig."
    }

    # gpt-5* models (and some routed configurations) are best served by the Responses API.
    $useResponsesApi = $false
    try {
        $model = [string]$Config.Model
        if ($model -like "gpt-5*") {
            $useResponsesApi = $true
        }
        $flag = [string]$env:OPENAI_USE_RESPONSES_API
        if ($flag) {
            $flag = $flag.Trim().ToLowerInvariant()
            if ($flag -in @("1","true","yes","y","on")) {
                $useResponsesApi = $true
            }
        }
    } catch {
        # ignore
    }

    $headers = @{
        "Authorization" = "Bearer $($Config.ApiKey)"
        "Content-Type"  = "application/json"
    }
    if ($Config.Organization) {
        $headers["OpenAI-Organization"] = $Config.Organization
    }

    if ($useResponsesApi) {
        return Invoke-OpenAIResponses -Prompt $Prompt -Headers $headers -Config $Config -ResponseFormat $ResponseFormat
    }

    # Default: Chat Completions API (legacy, but still valid for many models)
    $body = @{
        model       = $Config.Model
        messages    = @(@{ role = "user"; content = $Prompt })
        max_tokens  = $Config.MaxTokens
        temperature = $Config.Temperature
    }
    if ($ResponseFormat -eq "json") {
        $body.response_format = @{ type = "json_object" }
    }

    $json = $body | ConvertTo-Json -Depth 6
    try {
        $resp = Invoke-RestMethod -Uri "https://api.openai.com/v1/chat/completions" -Method Post -Headers $headers -Body $json
        return $resp.choices[0].message.content
    } catch {
        # If the model doesn't support chat/completions, retry using the Responses API.
        try {
            return Invoke-OpenAIResponses -Prompt $Prompt -Headers $headers -Config $Config -ResponseFormat $ResponseFormat
        } catch {
            $detail = $null
            try {
                if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
                    $detail = $_.ErrorDetails.Message
                } elseif ($_.Exception -and $_.Exception.Response) {
                    if ($_.Exception.Response.PSObject.Properties["Content"] -and $_.Exception.Response.Content) {
                        $detail = $_.Exception.Response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
                    }
                }
            } catch {
                # ignore
            }

            if ($detail) {
                throw "Failed to call OpenAI API: $($_.Exception.Message) | $detail"
            }
            throw "Failed to call OpenAI API: $($_.Exception.Message)"
        }
    }
}

function Invoke-OpenAIResponses {
    [CmdletBinding()]
    param(
        [Parameter(Mandatory)]
        [string]$Prompt,
        [Parameter(Mandatory)]
        [hashtable]$Headers,
        [Parameter(Mandatory)]
        [hashtable]$Config,
        [ValidateSet("text", "json")]
        [string]$ResponseFormat = "text"
    )

    $model = [string]$Config.Model
    $maxOut = [int]$Config.MaxTokens
    if ($maxOut -lt 1) { $maxOut = 8000 }
    $makeBody = {
        param([int]$MaxOutTokens)
        # NOTE: Force a hashtable here (not [pscustomobject]) so we can safely add optional
        # fields like "reasoning" without PowerShell throwing:
        # "The property 'X' cannot be found on this object. Verify that the property exists and can be set."
        $b = [hashtable]@{
            model             = $model
            input             = $Prompt
            max_output_tokens = $MaxOutTokens
        }

        # Some models (e.g., gpt-5-mini) reject temperature in the Responses API.
        if ($model -and ($model -notlike "gpt-5*")) {
            $b["temperature"] = $Config.Temperature
        }

        # For gpt-5* models, reduce reasoning overhead and verbosity to avoid burning the output budget.
        if ($model -like "gpt-5*") {
            $b["reasoning"] = [hashtable]@{ effort = "low" }
            if (-not $b.ContainsKey("text") -or -not $b["text"]) { $b["text"] = [hashtable]@{} }
            $b["text"]["verbosity"] = "low"
        }

        if ($ResponseFormat -eq "json") {
            # Responses API uses text.format (not response_format)
            if (-not $b.ContainsKey("text") -or -not $b["text"]) { $b["text"] = [hashtable]@{} }
            $b["text"]["format"] = [hashtable]@{ type = "json_object" }
        }

        return $b
    }

    try {
        $resp = $null

        # Retry once if we hit max_output_tokens and got no usable text output.
        for ($attempt = 0; $attempt -lt 2; $attempt++) {
            $body = & $makeBody $maxOut
            $json = $body | ConvertTo-Json -Depth 10
            $resp = Invoke-RestMethod -Uri "https://api.openai.com/v1/responses" -Method Post -Headers $Headers -Body $json

            if ($resp -and $resp.PSObject.Properties["status"] -and $resp.status -eq "incomplete") {
                $reason = $null
                if ($resp.PSObject.Properties["incomplete_details"] -and $resp.incomplete_details -and $resp.incomplete_details.PSObject.Properties["reason"]) {
                    $reason = [string]$resp.incomplete_details.reason
                }
                if ($reason -eq "max_output_tokens") {
                    # Increase budget and retry
                    $maxOut = [Math]::Min($maxOut * 2, 16000)
                    continue
                }
            }
            break
        }

        # Prefer convenience property if present
        if ($resp.PSObject.Properties["output_text"] -and $resp.output_text) {
            return [string]$resp.output_text
        }

        # Otherwise, walk the response structure and extract text
        if ($resp.PSObject.Properties["output"] -and $resp.output) {
            foreach ($item in $resp.output) {
                if ($item.PSObject.Properties["content"] -and $item.content) {
                    foreach ($c in $item.content) {
                        if ($c.PSObject.Properties["text"] -and $c.text) {
                            return [string]$c.text
                        }
                        if ($c.PSObject.Properties["type"] -and $c.type -eq "output_text" -and $c.PSObject.Properties["text"]) {
                            return [string]$c.text
                        }
                    }
                }
            }
        }

        # Surface response shape to help diagnose schema differences
        $raw = $null
        try {
            $raw = $resp | ConvertTo-Json -Depth 20 -Compress
            if ($raw.Length -gt 2000) {
                $raw = $raw.Substring(0, 2000) + "...(truncated)"
            }
        } catch {
            # ignore
        }

        if ($raw) {
            throw "OpenAI Responses API returned an unexpected shape (no output text). Raw response: $raw"
        }
        throw "OpenAI Responses API returned an unexpected shape (no output text)."
    } catch {
        $detail = $null
        try {
            if ($_.ErrorDetails -and $_.ErrorDetails.Message) {
                $detail = $_.ErrorDetails.Message
            } elseif ($_.Exception -and $_.Exception.Response) {
                # PowerShell 7+: HttpResponseMessage
                if ($_.Exception.Response.PSObject.Properties["Content"] -and $_.Exception.Response.Content) {
                    $detail = $_.Exception.Response.Content.ReadAsStringAsync().GetAwaiter().GetResult()
                }
            }
        } catch {
            # ignore
        }

        if ($detail) {
            throw "Failed to call OpenAI API (responses): $($_.Exception.Message) | $detail"
        }
        throw "Failed to call OpenAI API (responses): $($_.Exception.Message)"
    }
}

Export-ModuleMember -Function *-AI*

