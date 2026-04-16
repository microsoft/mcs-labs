param(
    [Alias("H")]
    [string]$Host = "127.0.0.1",
    [Alias("p")]
    [switch]$Production,
    [Alias("h")]
    [switch]$Help
)

if ($Help) {
    Write-Host "Usage:"
    Write-Host ""
    Write-Host "   .\tools\run.ps1 [options]"
    Write-Host ""
    Write-Host "Options:"
    Write-Host "     -Host [HOST]    Host to bind to."
    Write-Host "     -Production     Run Jekyll in 'production' mode."
    Write-Host "     -Help           Print this help information."
    exit 0
}

$command = "bundle exec jekyll s -l -H $Host"

if ($Production) {
    $env:JEKYLL_ENV = "production"
}

Write-Host ""
Write-Host "> $command"
Write-Host ""
Invoke-Expression $command
