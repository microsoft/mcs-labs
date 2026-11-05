param(
    # Named HostName because $Host is a read-only PowerShell automatic variable.
    [Alias("H")]
    [string]$HostName = "127.0.0.1",
    [Alias("p")]
    [switch]$Production,
    # No "h" alias: PowerShell aliases are case-insensitive, so it would clash
    # with "H" above. Use -Help or -? instead.
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage:"
    Write-Host ""
    Write-Host "   .\tools\run.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "     -H, -HostName [HOST]   Host to bind to (default 127.0.0.1)."
    Write-Host "     -p, -Production        Run Jekyll in 'production' mode."
    Write-Host "     -Help                  Print this help information."
    exit 0
}

if ($Production) {
    $env:JEKYLL_ENV = "production"
}

Write-Host ""
Write-Host "> bundle exec jekyll s -l -H $HostName"
Write-Host ""
& bundle exec jekyll s -l -H $HostName
exit $LASTEXITCODE
