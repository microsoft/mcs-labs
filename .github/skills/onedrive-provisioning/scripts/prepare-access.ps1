[CmdletBinding()]
param(
    [Parameter(Mandatory)][string]$Config,
    [switch]$Execute,
    [switch]$AllowProvisioning,
    [switch]$AllowAdminAccess,
    [string]$OnlyObjectId
)
$ErrorActionPreference = 'Stop'

# The Node check binds the approved identities and payload to this exact config.
& node (Join-Path $PSScriptRoot 'provision.cjs') --config $Config --check-plan
if ($LASTEXITCODE -ne 0) { throw 'Plan validation failed.' }
$configPath = (Resolve-Path -LiteralPath $Config).Path
$cfg = Get-Content -Raw -LiteralPath $configPath | ConvertFrom-Json
$outDir = if ([IO.Path]::IsPathRooted($cfg.outDir)) {
    [IO.Path]::GetFullPath($cfg.outDir)
} else { [IO.Path]::GetFullPath((Join-Path (Split-Path $configPath) $cfg.outDir)) }
$planPath = Join-Path $outDir 'plan.json'
$plan = Get-Content -Raw -LiteralPath $planPath | ConvertFrom-Json
$targets = @($plan.recipients)
if ($OnlyObjectId) {
    $targets = @($targets | Where-Object objectId -EQ $OnlyObjectId)
    if ($targets.Count -ne 1) { throw 'OnlyObjectId must select exactly one approved recipient.' }
}
if (-not $Execute) {
    Write-Output "Dry run: inspect $($targets.Count) personal sites. Provisioning=$AllowProvisioning; grant admin access=$AllowAdminAccess. No sign-in or changes."
    return
}
if (-not $OnlyObjectId) {
    $canary = Get-Content -Raw -LiteralPath (Join-Path $outDir 'canary.json') | ConvertFrom-Json
    if ($canary.inputsHash -ne $plan.inputsHash -or $canary.status -ne 'verified' -or
        @($targets | Where-Object objectId -EQ $canary.objectId).Count -ne 1) {
        throw 'Verify a single-recipient upload canary before bulk permission preparation.'
    }
}

function Invoke-SpoRetry([string]$Operation, [scriptblock]$Action) {
    for ($attempt = 0; $attempt -lt 5; $attempt++) {
        try { return (& $Action) }
        catch {
            $failure = $_
            $transient = $failure.Exception.Message -match '\b(429|503|504)\b'
            $retryAfter = $null
            for ($exception = $failure.Exception; $null -ne $exception; $exception = $exception.InnerException) {
                if ($null -ne $exception.Response) {
                    $transient = $transient -or ([int]$exception.Response.StatusCode -in @(429, 503, 504))
                    $retryAfter = $exception.Response.Headers['Retry-After']
                }
            }
            if (-not $transient -or $attempt -eq 4) { throw }
            $seconds = [Math]::Min(300, 30 * [Math]::Pow(2, $attempt))
            $requested = 0
            $date = [DateTimeOffset]::MinValue
            if ([int]::TryParse([string]$retryAfter, [ref]$requested)) { $seconds = [Math]::Max($seconds, $requested) }
            elseif ([DateTimeOffset]::TryParse([string]$retryAfter, [ref]$date)) {
                $seconds = [Math]::Max($seconds, [Math]::Ceiling(($date - [DateTimeOffset]::UtcNow).TotalSeconds))
            }
            Write-Warning "$Operation throttled; waiting $seconds seconds."
            Start-Sleep -Seconds $seconds
        }
    }
}

$lockPath = Join-Path $outDir 'run.lock'
$lock = [IO.File]::Open($lockPath, [IO.FileMode]::CreateNew, [IO.FileAccess]::Write, [IO.FileShare]::None)
$report = [ordered]@{
    inputsHash = $plan.inputsHash
    adminUpn = $cfg.adminUpn
    recipients = @($plan.recipients | ForEach-Object {
        [pscustomobject]@{ objectId = $_.objectId; status = 'unattempted'; wasSiteAdmin = $null; granted = $false; error = $null }
    })
}
$reportPath = Join-Path $outDir 'access-results.json'
function Save-Report {
    $report | ConvertTo-Json -Depth 15 | Set-Content -LiteralPath "$reportPath.tmp" -Encoding UTF8
    Move-Item -LiteralPath "$reportPath.tmp" -Destination $reportPath -Force
}
try {
    $lockBytes = [Text.Encoding]::UTF8.GetBytes((@{ pid = $PID; mode = 'prepare-access' } | ConvertTo-Json -Compress))
    $lock.Write($lockBytes, 0, $lockBytes.Length)
    $lock.Flush()
    if (Test-Path -LiteralPath $reportPath) {
        $previous = Get-Content -Raw -LiteralPath $reportPath | ConvertFrom-Json
        if ($previous.inputsHash -ne $plan.inputsHash -or $previous.adminUpn -ine $cfg.adminUpn -or
            @($previous.recipients).Count -ne @($plan.recipients).Count) {
            throw 'Existing access report belongs to another plan; preserve it and choose a new outDir.'
        }
        foreach ($row in $report.recipients) {
            $prior = @($previous.recipients | Where-Object objectId -EQ $row.objectId)
            if ($prior.Count -ne 1) { throw 'Existing access report has an invalid recipient set.' }
            $row.wasSiteAdmin = $prior[0].wasSiteAdmin
            $row.granted = $prior[0].granted
            $row.status = $prior[0].status
        }
    }
    Save-Report
    Import-Module Microsoft.Online.SharePoint.PowerShell -DisableNameChecking
    Write-Output "Sign in as the configured administrator in the selected tenant. No app registrations or permissions will be created."
    Connect-SPOService -Url $cfg.sharePointAdminOrigin -ModernAuth $true -AuthenticationUrl "https://login.microsoftonline.com/$($cfg.tenantId)"
    foreach ($target in $targets) {
        $row = @($report.recipients | Where-Object objectId -EQ $target.objectId)[0]
        try {
            if (Test-Path -LiteralPath (Join-Path $outDir 'stop.flag')) { throw 'Stopped by stop.flag.' }
            $row.status = 'in_progress'
            Save-Report
            $site = $null
            try { $site = Invoke-SpoRetry 'Get-SPOSite' { Get-SPOSite -Identity $target.siteUrl } }
            catch {
                if ($_.Exception.Message -notlike 'Cannot get site *') { throw }
                if (-not $AllowProvisioning) { throw 'Personal site missing; provisioning requires explicit authorization.' }
                Invoke-SpoRetry 'Request-SPOPersonalSite' { Request-SPOPersonalSite -UserEmails ([string[]]@($target.upn)) -NoWait }
                for ($attempt = 0; $attempt -lt 20 -and $null -eq $site; $attempt++) {
                    Start-Sleep -Seconds 30
                    try { $site = Invoke-SpoRetry 'Get-SPOSite' { Get-SPOSite -Identity $target.siteUrl } }
                    catch { if ($_.Exception.Message -notlike 'Cannot get site *') { throw } }
                }
                if ($null -eq $site) { throw 'Personal site provisioning did not finish within ten minutes.' }
            }
            $owner = $site.Owner -replace '^i:0#\.f\|membership\|', ''
            if ($owner -ine $target.upn -or $site.Url.TrimEnd('/') -ine $target.siteUrl) {
                throw 'Site owner or URL differs from the approved identity; no grant made.'
            }
            $users = @(Invoke-SpoRetry 'Get-SPOUser' { Get-SPOUser -Site $target.siteUrl -Limit All })
            $admin = @($users | Where-Object { ($_.LoginName -replace '^i:0#\.f\|membership\|', '') -ieq $cfg.adminUpn })
            if ($admin.Count -gt 1) { throw 'Ambiguous site administrator identity.' }
            $isSiteAdmin = $admin.Count -eq 1 -and $admin[0].IsSiteAdmin
            if ($null -eq $row.wasSiteAdmin) { $row.wasSiteAdmin = $isSiteAdmin }
            Save-Report
            if (-not $isSiteAdmin) {
                if (-not $AllowAdminAccess) { throw 'Site administrator access is absent; granting it requires explicit authorization.' }
                Invoke-SpoRetry 'Set-SPOUser' { Set-SPOUser -Site $target.siteUrl -LoginName $cfg.adminUpn -IsSiteCollectionAdmin $true } | Out-Null
                $row.granted = $true
                Save-Report
            }
            $verified = Invoke-SpoRetry 'Get-SPOUser' { Get-SPOUser -Site $target.siteUrl -LoginName $cfg.adminUpn }
            if (-not $verified.IsSiteAdmin) { throw 'Site administrator access could not be verified.' }
            $row.status = 'ready'
            Save-Report
        } catch {
            $row.status = 'blocked'; $row.error = $_.Exception.Message
            Save-Report
            throw
        }
    }
    Write-Output "Verified $($targets.Count) personal sites. Any newly granted admin access remains in place; see access-results.json."
} finally {
    $lock.Dispose()
    Remove-Item -LiteralPath $lockPath
}
