$rubyPackageName = "RubyInstallerTeam.RubyWithDevKit.3.1";
$rubyPath = (get-location).Drive.Name + ":\Ruby31-x64\bin"

Write-Host "Checking for WinGet..."
$wingetInstalled = winget --version | Out-Null

if (-not $wingetInstalled) {
    Write-Error "WinGet is not installed. Please install WinGet from https://aka.ms/getwinget and re-run this script."
    Exit 1
} else {
    Write-Host "Validated WinGet installation."
}

$rubyInstalled = winget list --id $rubyPackageName | Select-Object -First 1

if (-not $rubyInstalled) {
    Write-Host "Installing Ruby using WinGet..."
    winget install --id $rubyPackageName --source winget --accept-source-agreements --accept-package-agreements

    # Add the Ruby installation path to process PATH
    $env:Path = $env:Path + ";$rubyPath"
    Write-Host "Ruby installed."
} else {
    Write-Host "Validated Ruby installation."
}

$bundlerInstalled = gem list bundler -i

if (-not $bundlerInstalled) {
    Write-Host "Installing Bundler gem..."
    gem install bundler
    Write-Host "Bundler gem installed."
} else {
    Write-Host "Validated Bundler gem installation."
}

Write-Host "Running bundle install..."
bundle install --quiet
Write-Host "Bundle install completed."
