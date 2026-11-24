$ErrorActionPreference = 'Stop'
$root = Join-Path ([IO.Path]::GetTempPath()) ("workshop-access-test-" + [guid]::NewGuid().ToString('N'))
$out = Join-Path $root 'out'
New-Item -ItemType Directory -Path $out -Force | Out-Null
$scriptPath = Join-Path $PSScriptRoot '..\scripts\prepare-access.ps1'
$configPath = Join-Path $root 'config.json'
$id = '11111111-1111-1111-1111-111111111111'
$upn = 'attendee@contoso.com'
$siteUrl = 'https://contoso-my.sharepoint.com/personal/attendee_contoso_com'
@{ outDir = 'out'; adminUpn = 'admin@contoso.com'; tenantId = $id; sharePointAdminOrigin = 'https://contoso-admin.sharepoint.com' } |
    ConvertTo-Json | Set-Content -LiteralPath $configPath
@{ inputsHash = 'fixture'; recipients = @(@{ objectId = $id; upn = $upn; siteUrl = $siteUrl }) } |
    ConvertTo-Json -Depth 5 | Set-Content -LiteralPath (Join-Path $out 'plan.json')
$state = @{ connections = 0; grants = 0; siteAdmin = $false; wrongOwner = $false }

# These test doubles prevent authentication and all Microsoft 365 requests.
function node { $global:LASTEXITCODE = 0 }
function Import-Module { param($Name, [switch]$DisableNameChecking) }
function Connect-SPOService { param($Url, $ModernAuth, $AuthenticationUrl) $state.connections++ }
function Get-SPOSite {
    param($Identity)
    return [pscustomobject]@{ Owner = $(if ($state.wrongOwner) { 'another@contoso.com' } else { $upn }); Url = $siteUrl }
}
function Get-SPOUser {
    param($Site, $LoginName, $Limit)
    return [pscustomobject]@{ LoginName = 'admin@contoso.com'; IsSiteAdmin = $state.siteAdmin }
}
function Set-SPOUser {
    param($Site, $LoginName, $IsSiteCollectionAdmin)
    if (-not $IsSiteCollectionAdmin) { throw 'Unexpected revocation.' }
    $state.grants++; $state.siteAdmin = $true
}
function Assert($Condition, $Message) { if (-not $Condition) { throw $Message } }
try {
    & $scriptPath -Config $configPath -OnlyObjectId $id
    Assert ($state.connections -eq 0 -and $state.grants -eq 0) 'Dry run authenticated or changed permissions.'

    $denied = $false
    try { & $scriptPath -Config $configPath -OnlyObjectId $id -Execute }
    catch { $denied = $_.Exception.Message -match 'requires explicit authorization' }
    Assert ($denied -and $state.grants -eq 0) 'Missing permission acknowledgement did not block the grant.'
    Assert (-not (Test-Path (Join-Path $out 'run.lock'))) 'Lock survived a failed run.'

    & $scriptPath -Config $configPath -OnlyObjectId $id -Execute -AllowAdminAccess
    $first = Get-Content -Raw (Join-Path $out 'access-results.json') | ConvertFrom-Json
    Assert ($state.grants -eq 1 -and $first.recipients[0].granted -and $first.recipients[0].wasSiteAdmin -eq $false) 'Grant before-state missing.'
    & $scriptPath -Config $configPath -OnlyObjectId $id -Execute
    $resumed = Get-Content -Raw (Join-Path $out 'access-results.json') | ConvertFrom-Json
    Assert ($state.grants -eq 1 -and $resumed.recipients[0].granted -and $resumed.recipients[0].wasSiteAdmin -eq $false) 'Resume lost the original grant record.'

    $state.wrongOwner = $true
    $denied = $false
    try { & $scriptPath -Config $configPath -OnlyObjectId $id -Execute -AllowAdminAccess }
    catch { $denied = $_.Exception.Message -match 'owner or URL differs' }
    Assert ($denied -and $state.grants -eq 1) 'Mismatched site owner did not block permission changes.'
    Write-Output 'Offline SharePoint access checks passed.'
} finally {
    Remove-Item -LiteralPath $root -Recurse -Force
}
