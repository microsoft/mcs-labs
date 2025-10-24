# PowerShell Lab Generation Script - Refactored Version
# Unified script for PDF generation and Jekyll processing with comprehensive documentation
#
# BOOTCAMP NAVIGATION SYSTEM:
# ===============================
# This script implements a comprehensive bootcamp navigation system that separates bootcamp
# from regular journey cards while maintaining full functionality. Architecture overview:
#
# 1. HOMEPAGE EXCLUSION STRATEGY:
#    - Homepage journey cards are generated from the 'journeys' section only
#    - Bootcamp is intentionally excluded from 'journeys' to prevent homepage display
#    - Clean separation between homepage navigation and bootcamp functionality
#
# 2. BOOTCAMP PAGE IMPLEMENTATION:
#    - bootcamp_lab_orders defines special sequencing (1a, 1b, 2, 3a, 3b, 4, 5a, 5b, 6, 7)
#    - Dedicated /labs/bootcamp/ page renders bootcamp-specific lab organization
#    - Labs retain their original journey assignments (quick-start, business-user, etc.)
#    - bootcamp_order frontmatter added to labs for proper sequencing
#
# 3. NAVIGATION ARCHITECTURE:
#    - Permanent "Bootcamp" link in top header navigation (_layouts/default.html)
#    - Bootcamp page filters labs by bootcamp_order attribute presence
#    - Previous/Next navigation respects bootcamp context and ordering
#    - Query parameter preservation maintains bootcamp context across navigation
#
# 4. DATA FLOW AND FRONTMATTER:
#    - Labs have journeys: ["quick-start", "business-user"] for regular navigation
#    - Labs with bootcamp assignment get additional bootcamp_order: "1a" frontmatter
#    - Jekyll templates use both data sets for different navigation contexts
#    - Client-side JavaScript filters and sorts based on active context
#
# 5. TECHNICAL IMPLEMENTATION:
#    - PowerShell generates frontmatter with both journey and bootcamp data
#    - Jekyll templates include data-bootcamp-order attributes for JavaScript filtering
#    - Alphanumeric sorting handles bootcamp sequence (1a < 1b < 2 < 3a)
#    - Base URL preservation ensures GitHub Pages compatibility

#region Script Parameters and Help
param(
    [string[]]$SelectedJourneys = @(),
    [switch]$SkipPDFs = $false,
    [switch]$ShowHelp = $false,
    [switch]$GeneratePDFs = $false,
    [switch]$LocalTest = $false,
    [switch]$MarkdownDetectOnly = $false,       # Detect markdown issues without modifying source content
    [string]$SingleLabPDF = ""                  # Generate PDF for a single lab by slug (e.g., "guildhall-custom-mcp")
)

# Global collection for detection-only summary
$script:MarkdownIssueLog = @()

# Handle legacy parameter mapping
if ($GeneratePDFs) { $SkipPDFs = $false }
if ($LocalTest) { $SkipPDFs = $false }

if ($ShowHelp) {
    Write-Host @"
╔═════════════════════════════════════════════════════════════════════════════════════════╗
║                             MCS Labs - Jekyll Generator (Refactored)                     ║
╚═════════════════════════════════════════════════════════════════════════════════════════╝

USAGE:
    .\Generate-Labs.ps1 [-SelectedJourneys <string[]>] [-SkipPDFs] [-GeneratePDFs] [-LocalTest] 
                        [-SingleLabPDF <string>] [-MarkdownDetectOnly] [-ShowHelp]

DESCRIPTION:
    Refactored and well-documented version of the lab generation script.
    Generates Jekyll-compatible markdown files and optionally PDFs from lab configuration.
    
    Features comprehensive error handling, modular functions, and detailed logging.

PARAMETERS:
    -SelectedJourneys      Array of journey names to filter labs (e.g., @("business-user", "developer"))
    -SkipPDFs             Skip PDF generation (Jekyll files only)
    -GeneratePDFs         Generate PDFs for all labs (requires Docker)
    -LocalTest            Complete local testing: generate Jekyll files + PDFs + build site
    -SingleLabPDF         Generate PDF for a single lab by ID (e.g., "guildhall-custom-mcp")
    -MarkdownDetectOnly   Detection-only mode: report problematic fenced blocks but do not modify content
    -ShowHelp             Show this help message

EXAMPLES:
    # Generate all labs with PDFs
    .\Generate-Labs.ps1
    
    # Jekyll files only (skip PDF generation)
    .\Generate-Labs.ps1 -SkipPDFs
    
    # Filter by journey
    .\Generate-Labs.ps1 -SelectedJourneys @("business-user")
    .\Generate-Labs.ps1 -SelectedJourneys @("quick-start", "developer") -SkipPDFs
    
    # Generate single lab PDF
    .\Generate-Labs.ps1 -SingleLabPDF "guildhall-custom-mcp" -GeneratePDFs
    .\Generate-Labs.ps1 -SingleLabPDF "public-website-agent" -GeneratePDFs
    
    # Complete local test (all labs + PDFs)
    .\Generate-Labs.ps1 -LocalTest
    
    # Detect markdown issues only (no fixes, fast scan)
    .\Generate-Labs.ps1 -MarkdownDetectOnly
    .\Generate-Labs.ps1 -SkipPDFs -MarkdownDetectOnly

REQUIREMENTS:
    - PowerShell 5.1+ or PowerShell Core
    - powershell-yaml module (auto-installed if missing)
    - lab-config.yml configuration file
    - Docker (for PDF generation)

OUTPUT:
    - Jekyll files: _labs/ directory
    - PDF files: assets/pdfs/ directory
    - Index pages: labs/index.md and index.md (root)

NOTES:
    - PDF generation requires Docker with jekyll-dev container running
    - Single lab PDF mode generates only the specified lab (counter shows 1/1)
    - Journey filtering affects Jekyll generation but not PDF generation
    - Configuration sync happens automatically (lab-config.yml -> _data/lab-config.yml)

"@ -ForegroundColor Cyan
    exit 0
}
#endregion

#region Core Initialization and Environment Setup
# ============================================================================
# CORE INITIALIZATION FUNCTIONS
# ============================================================================

function Initialize-Environment {
    <#
    .SYNOPSIS
        Initialize the script environment, install dependencies, and validate requirements
    #>
    
    Write-Host "╔═══════════════════════════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║                       MCS Labs - Jekyll Generator (Refactored)                        ║" -ForegroundColor Cyan
    Write-Host "╚═══════════════════════════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "🔧  Initializing environment..." -ForegroundColor Yellow
    
    # Install PowerShell YAML module if not present
    if (-not (Get-Module -ListAvailable -Name powershell-yaml)) {
        Write-Host "📦  Installing PowerShell YAML module..." -ForegroundColor Yellow
        try {
            Install-Module -Name powershell-yaml -Force -Scope CurrentUser -ErrorAction Stop
            Write-Host "✅  PowerShell YAML module installed successfully" -ForegroundColor Green
        }
        catch {
            Write-Host "❌  Failed to install PowerShell YAML module: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
    
    Import-Module powershell-yaml -ErrorAction Stop
    Write-Host "✅  Environment initialized successfully" -ForegroundColor Green
}

function Get-Configuration {
    <#
    .SYNOPSIS
        Load and parse the lab-config.yml configuration file
    .DESCRIPTION
        Validates configuration file existence and parses YAML content
    #>
    
    # Validate lab-config.yml exists (check both current directory and parent)
    $configPath = if (Test-Path "./lab-config.yml") { 
        "./lab-config.yml" 
    }
    elseif (Test-Path "../lab-config.yml") { 
        "../lab-config.yml" 
    }
    else { 
        $null 
    }
    
    if (-not $configPath) {
        Write-Host "❌  lab-config.yml not found in current or parent directory" -ForegroundColor Red
        Write-Host "    Please ensure the lab-config.yml file exists in the repository root" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "📖  Reading lab configuration from $configPath..." -ForegroundColor Green
    
    # Read and parse lab-config.yml
    try {
        $configContent = Get-Content $configPath -Raw -ErrorAction Stop
        $config = ConvertFrom-Yaml $configContent -ErrorAction Stop
        
        Write-Host "✅  Configuration loaded successfully" -ForegroundColor Green
        return $config
    }
    catch {
        Write-Host "❌  Failed to read or parse lab-config.yml: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

function Get-Paths {
    <#
    .SYNOPSIS
        Determine and validate all required file paths
    .DESCRIPTION
        Works whether run from root or scripts folder, creates output directories if needed
    #>
    
    # Define base paths (works whether run from root or scripts folder)
    $basePath = if (Test-Path "./labs") { "." } else { ".." }
    $labsPath = "$basePath/labs"
    $outputPath = "$basePath/_labs"
    $indexPath = "$basePath/labs/index.md"
    
    # Validate that labs directory exists
    if (-not (Test-Path $labsPath)) {
        Write-Host "❌  Labs directory not found: $labsPath" -ForegroundColor Red
        exit 1
    }
    
    # Create output directory if it doesn't exist
    if (-not (Test-Path $outputPath)) {
        New-Item -ItemType Directory -Path $outputPath -Force | Out-Null
        Write-Host "📁  Created output directory: $outputPath" -ForegroundColor Green
    }
    
    return @{
        basePath   = $basePath
        labsPath   = $labsPath
        outputPath = $outputPath
        indexPath  = $indexPath
    }
}

function Get-LabJourneyAssignments {
    <#
    .SYNOPSIS
        Extract lab journey assignments from configuration
    #>
    param([Parameter(Mandatory)]$Config)
    
    # Create a hashtable for lab journey assignments
    $labJourneys = @{}
    
    # Process explicit lab journey assignments from config (direct hashtable access)
    if ($Config.lab_journeys) {
        foreach ($labId in $Config.lab_journeys.Keys) {
            $assignedJourneys = $Config.lab_journeys[$labId]
            
            if ($assignedJourneys -and $assignedJourneys.Count -gt 0) {
                $labJourneys[[string]$labId] = $assignedJourneys
            }
        }
    }
    
    Write-Host "🎯  Loaded journey assignments for $($labJourneys.Keys.Count) labs" -ForegroundColor Green
    return $labJourneys
}

function Show-StartupInfo {
    <#
    .SYNOPSIS
        Display startup information and processing parameters
    #>
    param([string[]]$SelectedJourneys, [bool]$SkipPDFs)
    
    Write-Host "🚀  Starting lab generation process..." -ForegroundColor Yellow
    
    if ($SelectedJourneys.Count -gt 0) {
        Write-Host "🎯  Selected journeys: $($SelectedJourneys -join ', ')" -ForegroundColor Cyan
    }
    else {
        Write-Host "🌐  Processing all journeys" -ForegroundColor Cyan
    }
    
    if ($SkipPDFs) {
        Write-Host "⏭️   PDF generation: SKIPPED" -ForegroundColor Yellow
    }
    else {
        Write-Host "📄  PDF generation: ENABLED" -ForegroundColor Green
    }
    Write-Host ""
}

#endregion

#region PDF Generation Functions
# ============================================================================
# PDF GENERATION FUNCTIONS
# ============================================================================

function Test-DockerEnvironment {
    <#
    .SYNOPSIS
        Test if Docker Compose environment is available and Jekyll container is running
    #>
    
    try {
        # Check if docker-compose is available
        $null = docker-compose --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            return $false
        }
        
        # Check if Jekyll development container is running
        $dockerCheck = docker-compose ps jekyll-dev 2>&1
        if ($dockerCheck -match "jekyll-dev.*Up") {
            return $true
        }
        else {
            Write-Host "    ⚠️   Jekyll development container not running" -ForegroundColor Yellow
            Write-Host "    💡  Start with: docker-compose up -d" -ForegroundColor Yellow
            return $false
        }
    }
    catch {
        return $false
    }
}

function Test-CIEnvironment {
    <#
    .SYNOPSIS
        Test if running in CI environment with pandoc and node.js available
    #>
    
    try {
        # Check if pandoc is available
        $null = pandoc --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            return $false
        }
        
        # Check if node.js is available
        $null = node --version 2>&1
        if ($LASTEXITCODE -ne 0) {
            return $false
        }
        
        # Check if generate-pdf.js script exists (check both current and parent directory)
        $scriptPath = if (Test-Path ".github/scripts/generate-pdf.js") { 
            ".github/scripts/generate-pdf.js" 
        }
        elseif (Test-Path "../.github/scripts/generate-pdf.js") { 
            "../.github/scripts/generate-pdf.js" 
        }
        else { 
            $null 
        }
        
        if (-not $scriptPath) {
            return $false
        }
        
        return $true
    }
    catch {
        return $false
    }
}

function Test-PreGeneratedPDFs {
    <#
    .SYNOPSIS
        Test if PDFs have already been generated by the GitHub Actions workflow
    #>
    
    # Check if dist directory exists with PDFs (GitHub Actions pre-generation)
    if (Test-Path "dist") {
        $distPdfs = Get-ChildItem "dist" -Recurse -Filter "*.pdf" -ErrorAction SilentlyContinue
        if ($distPdfs -and $distPdfs.Count -gt 0) {
            return $true
        }
    }
    
    # Check if assets/pdfs directory already has PDFs
    if (Test-Path "assets/pdfs") {
        $assetsPdfs = Get-ChildItem "assets/pdfs" -Filter "*.pdf" -ErrorAction SilentlyContinue
        if ($assetsPdfs -and $assetsPdfs.Count -gt 0) {
            return $true
        }
    }
    
    return $false
}

function Invoke-PDFGeneration {
    <#
    .SYNOPSIS
        Generate PDFs for all specified labs using Docker or CI tools
    .DESCRIPTION
        Processes each lab through Docker-based PDF generation pipeline (local)
        or direct pandoc/node.js commands (CI environment)
    #>
    param(
        [Parameter(Mandatory)]$AllLabs,
        [Parameter(Mandatory)]$Paths,
        [string]$SingleLabPDF = ""
    )
    
    Write-Host "📄  Starting PDF generation..." -ForegroundColor Yellow
    
    # Check if single lab mode is enabled
    if ($SingleLabPDF) {
        Write-Host "🎯  Single lab PDF mode: $SingleLabPDF" -ForegroundColor Cyan
        $AllLabs = $AllLabs | Where-Object { $_.id -eq $SingleLabPDF }
        if ($AllLabs.Count -eq 0) {
            Write-Host "❌  Lab '$SingleLabPDF' not found in the current lab set" -ForegroundColor Red
            return @()
        }
    }
    
    # Check if PDFs have already been generated by GitHub Actions workflow
    $preGeneratedPDFs = Test-PreGeneratedPDFs
    if ($preGeneratedPDFs -and -not $SingleLabPDF) {
        Write-Host "✅  PDFs already generated by GitHub Actions workflow - skipping PDF generation" -ForegroundColor Green
        Write-Host "    Found existing PDFs in dist/ or assets/pdfs/ directories" -ForegroundColor Cyan
        return @()
    }
    
    # Determine environment and available tools
    $useDocker = Test-DockerEnvironment
    $useCITools = Test-CIEnvironment
    
    if ($useDocker) {
        Write-Host "✅  Docker environment detected - using containerized PDF generation" -ForegroundColor Green
    }
    elseif ($useCITools) {
        Write-Host "✅  CI environment detected - using direct pandoc/node.js PDF generation" -ForegroundColor Green
    }
    else {
        Write-Host "❌  Neither Docker nor CI tools available. Skipping PDF generation." -ForegroundColor Red
        Write-Host "    Local: Start Docker with 'docker-compose up -d'" -ForegroundColor Yellow
        Write-Host "    CI: Ensure pandoc and node.js are installed" -ForegroundColor Yellow
        return @()
    }
    
    # Generate PDFs for each lab
    $results = @()
    $processed = 0
    
    # Calculate total based on whether we're filtering to a single lab
    $labsToProcess = @(if ($SingleLabPDF) {
            $AllLabs | Where-Object { $_.id -eq $SingleLabPDF }
        }
        else {
            $AllLabs
        })
    $total = $labsToProcess.Count
    
    foreach ($lab in $labsToProcess) {
        $processed++
        Write-Host "📝  Processing PDF $processed/$total`: $($lab.id)" -ForegroundColor Cyan
        
        $result = New-PDFForLab -Lab $lab -Paths $Paths -UseDocker $useDocker
        $results += $result
        
        if ($result.Success) {
            Write-Host "    ✅  PDF generated successfully" -ForegroundColor Green
        }
        else {
            Write-Host "    ❌  PDF generation failed: $($result.Error)" -ForegroundColor Red
        }
    }
    
    # Summary
    $successfulResults = @($results | Where-Object { $_.Success })
    $successful = $successfulResults.Count
    $failed = $results.Count - $successful
    
    Write-Host "`n📊  PDF Generation Summary:" -ForegroundColor Yellow
    Write-Host "    ✅  Successful: $successful/$($results.Count)" -ForegroundColor Green
    if ($failed -gt 0) {
        Write-Host "    ❌  Failed: $failed" -ForegroundColor Red
    }
    
    return $results
}

function New-PDFForLab {
    <#
    .SYNOPSIS
        Generate a PDF for a specific lab using Docker or CI tools
    #>
    param(
        [Parameter(Mandatory)]$Lab,
        [Parameter(Mandatory)]$Paths,
        [bool]$UseDocker = $true
    )
    
    $startTime = Get-Date
    $labPath = Join-Path $Paths.labsPath $Lab.id
    $readmePath = Join-Path $labPath "README.md"
    $pdfPath = Join-Path $Paths.basePath "assets/pdfs/$($Lab.id).pdf"
    
    # Skip if source doesn't exist (external labs)
    if (-not (Test-Path $readmePath)) {
        return @{
            LabId          = $Lab.id
            Success        = $false
            Error          = "Source README.md not found (external lab)"
            ProcessingTime = 0
        }
    }
    
    try {
        # Prepare title and escape for bash commands
        $labTitle = $Lab.title
        $escapedTitle = $labTitle -replace '"', '\"'
        
        # Create necessary directories
        $distPath = Join-Path $Paths.basePath "dist/$($Lab.id)"
        $assetsPath = Join-Path $Paths.basePath "assets/pdfs"
        New-Item -ItemType Directory -Path $distPath -Force | Out-Null
        New-Item -ItemType Directory -Path $assetsPath -Force | Out-Null
        
        # Read and preprocess content
        $content = Get-Content $readmePath -Raw -ErrorAction Stop
        
        # Process callout blocks (GitHub-style [!NOTE], [!WARNING], etc.)
        # This matches the AWK preprocessing in build-and-deploy.yml
        $calloutLines = $content -split "`n"
        $finalLines = @()
        $inCallout = $false
        $calloutIndent = ""
        
        for ($i = 0; $i -lt $calloutLines.Count; $i++) {
            $line = $calloutLines[$i]
            
            # Match callout start: optional whitespace + > [!TYPE]
            if ($line -match '^(\s*)>\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](.*)$') {
                $calloutIndent = $matches[1]
                $calloutType = $matches[2].ToLower()
                $restOfLine = $matches[3]
                
                # Determine CSS class and label
                $class = "note"
                $label = "**Note:** "
                if ($calloutType -eq "tip") {
                    $class = "tip"
                    $label = "**Tip:** "
                }
                elseif ($calloutType -in @("warning", "caution", "important")) {
                    $class = "warning"
                    $label = "**$($calloutType.ToUpper()):** "
                }
                
                # Keep blockquote marker and wrap in div (matching GitHub Actions AWK)
                $finalLines += "$calloutIndent> <div class=`"$class`">$label$restOfLine"
                $inCallout = $true
            }
            # If in callout and line starts with > (with same indent), continue
            elseif ($inCallout -and $line -match '^\s*>\s') {
                $finalLines += $line
            }
            # If in callout and line doesn't start with >, close the callout
            elseif ($inCallout) {
                $finalLines += "$calloutIndent</div>"
                $finalLines += $line
                $inCallout = $false
                $calloutIndent = ""
            }
            else {
                $finalLines += $line
            }
        }
        
        # Close callout if still open at end of file
        if ($inCallout) {
            $finalLines += "$calloutIndent</div>"
        }
        
        $processedContent = $finalLines -join "`n"
        
        # Write processed content to temporary file IN THE LAB DIRECTORY (like GitHub Actions does)
        # This ensures relative image paths work correctly
        $tempFileInLabDir = Join-Path $labPath "$($Lab.id)_processed.md"
        Set-Content -Path $tempFileInLabDir -Value $processedContent -Encoding UTF8
        
        # Choose execution method based on environment
        if ($UseDocker) {
            # Docker-based execution (local development)
            # Match GitHub Actions: cd into lab directory before running Pandoc
            $labRelativePath = "labs/$($Lab.id)"
            $htmlFile = "../../dist/$($Lab.id)/$($Lab.id).html"
            
            # Create dist directory
            docker-compose exec jekyll-dev bash -c "mkdir -p dist/$($Lab.id)" 2>&1 | Out-Null
            
            # Determine markdown format (check for YAML front matter)
            $yamlDisabledFormat = "markdown+auto_identifiers+gfm_auto_identifiers+emoji+header_attributes+raw_html+raw_attribute"
            if ($processedContent -match '(?m)^---\s*$') {
                $lines = $processedContent -split "`n"
                if ($lines[0] -ne "---" -or ($lines.Count -gt 1 -and $lines[1] -eq "---")) {
                    $yamlDisabledFormat = "markdown-yaml_metadata_block+auto_identifiers+gfm_auto_identifiers+emoji+header_attributes+raw_html+raw_attribute"
                }
            }
            
            # Run Pandoc from the lab directory (like GitHub Actions does)
            # Use exact same command as GitHub Actions workflow (single line for bash compatibility)
            $createHtmlCmd = "cd $labRelativePath && pandoc $($Lab.id)_processed.md -o $htmlFile --standalone --embed-resources --css='../../.github/styles/html.css' --html-q-tags --section-divs --id-prefix='' --metadata title=`"$escapedTitle`" --metadata lang='en' -f '$yamlDisabledFormat' -t html5"
            
            $htmlResult = docker-compose exec jekyll-dev bash -c $createHtmlCmd 2>&1
            
            # Check if HTML was created
            $htmlCheckResult = docker-compose exec jekyll-dev bash -c "test -f dist/$($Lab.id)/$($Lab.id).html && echo 'exists' || echo 'missing'" 2>&1
            if ($htmlCheckResult -match "exists") {
                # Post-process HTML (like GitHub Actions does)
                $postProcessCmd = @"
sed -i '/<header id=`"title-block-header`">/,/<\/header>/d' dist/$($Lab.id)/$($Lab.id).html && \
sed -i 's/id=`"`"//g' dist/$($Lab.id)/$($Lab.id).html && \
sed -i 's/<a href=`"\(https\?:\/\/[^`"]*\)`"/<a href=`"\1`" target=`"_blank`" rel=`"noopener noreferrer`"/g' dist/$($Lab.id)/$($Lab.id).html
"@
                docker-compose exec jekyll-dev bash -c $postProcessCmd 2>&1 | Out-Null
                
                # Generate PDF using Node.js script
                $createPdfCmd = "node .github/scripts/generate-pdf.js dist/$($Lab.id)/$($Lab.id).html assets/pdfs/$($Lab.id).pdf `"$escapedTitle`""
                $pdfResult = docker-compose exec jekyll-dev bash -c "$createPdfCmd" 2>&1
                
                # Clean up temporary files
                docker-compose exec jekyll-dev rm -f "dist/$($Lab.id)/$($Lab.id).html" "$labRelativePath/$($Lab.id)_processed.md" 2>&1 | Out-Null
                Remove-Item -Path $tempFileInLabDir -Force -ErrorAction SilentlyContinue
                $htmlCreated = $true
            }
            else {
                $htmlCreated = $false
                $htmlResult = "Docker HTML creation failed: $htmlResult"
            }
        }
        else {
            # Direct execution (CI environment)
            $htmlFile = Join-Path $distPath "$($Lab.id).html"
            $cssPath = "../../.github/styles/html.css"  # Relative path from lab directory
            
            # Create HTML using direct pandoc command from lab directory
            try {
                # Save current location
                Push-Location
                Set-Location $labPath
                
                $pandocArgs = @(
                    "$($Lab.id)_processed.md"
                    "-o", $htmlFile
                    "--standalone"
                    "--embed-resources"
                    "--css", $cssPath
                    "--html-q-tags"
                    "--section-divs"
                    "--metadata", "title=$escapedTitle"
                    "-f", "markdown+auto_identifiers+gfm_auto_identifiers+emoji"
                    "-t", "html5"
                )
                
                & pandoc @pandocArgs 2>&1 | Out-Null
                
                # Return to original location
                Pop-Location
                
                if ($LASTEXITCODE -eq 0 -and (Test-Path $htmlFile)) {
                    $htmlCreated = $true
                }
                else {
                    $htmlCreated = $false
                    $htmlResult = "Direct pandoc execution failed with exit code: $LASTEXITCODE"
                }
            }
            catch {
                Pop-Location -ErrorAction SilentlyContinue
                $htmlCreated = $false
                $htmlResult = "Direct pandoc execution error: $($_.Exception.Message)"
            }
            
            # Generate PDF using direct Node.js command
            if ($htmlCreated) {
                try {
                    $nodeArgs = @(
                        ".github/scripts/generate-pdf.js"
                        $htmlFile
                        $pdfPath
                        $escapedTitle
                    )
                    
                    & node @nodeArgs 2>&1 | Out-Null
                    if ($LASTEXITCODE -ne 0) {
                        $pdfResult = "Direct node.js execution failed with exit code: $LASTEXITCODE"
                    }
                }
                catch {
                    $pdfResult = "Direct node.js execution error: $($_.Exception.Message)"
                }
                
                # Clean up temporary files
                Remove-Item -Path $htmlFile -Force -ErrorAction SilentlyContinue
                Remove-Item -Path $tempFileInLabDir -Force -ErrorAction SilentlyContinue
            }
        }
        
        # Check final result
        if ($htmlCreated -and (Test-Path $pdfPath)) {
            $processingTime = ((Get-Date) - $startTime).TotalSeconds
            return @{
                LabId          = $Lab.id
                Success        = $true
                Error          = $null
                ProcessingTime = $processingTime
            }
        }
        else {
            # Clean up temp file even on failure
            Remove-Item -Path $tempFileInLabDir -Force -ErrorAction SilentlyContinue
            $errorMsg = if (-not $htmlCreated) { "Failed to create HTML: $htmlResult" } else { "PDF file not created: $pdfResult" }
            return @{
                LabId          = $Lab.id
                Success        = $false
                Error          = $errorMsg
                ProcessingTime = 0
            }
        }
    }
    catch {
        return @{
            LabId          = $Lab.id
            Success        = $false
            Error          = $_.Exception.Message
            ProcessingTime = 0
        }
    }
}

#endregion

#region Lab Discovery and Processing
# ============================================================================
# LAB DISCOVERY AND PROCESSING FUNCTIONS
# ============================================================================

function Get-LabFromReadme {
    <#
    .SYNOPSIS
        Parse lab information from README.md file
    .DESCRIPTION
        Extracts title, duration, difficulty, description and other metadata from README content
    #>
    param(
        [Parameter(Mandatory)][string]$LabPath,
        [Parameter(Mandatory)][string]$LabId
    )
    
    $readmePath = Join-Path $LabPath "README.md"
    if (-not (Test-Path $readmePath)) {
        return $null
    }
    
    try {
        $content = Get-Content $readmePath -Raw -ErrorAction Stop
        $lines = $content -split "`n"
        
        # Initialize lab object with defaults
        $lab = @{
            id          = $LabId
            slug        = $LabId  # Use the lab folder name as the slug
            title       = ""
            duration    = 30  # Default duration in minutes
            difficulty  = 100  # Default difficulty level
            description = ""
            journeys    = @()
            section     = ""  # Will be auto-assigned if not specified
            tags        = @()
        }
        
        # Parse lab content
        $inTable = $false
        $foundTitle = $false
        
        foreach ($line in $lines) {
            $line = $line.Trim()
            
            # Extract title from first heading
            if (-not $foundTitle -and $line -match "^#\s+(.+)") {
                $lab.title = $matches[1].Trim()
                $foundTitle = $true
                continue
            }
            
            # Extract description from content after title
            if ($foundTitle -and -not $lab.description -and $line -and 
                -not $line.StartsWith("#") -and -not $line.StartsWith("---") -and 
                -not $line.StartsWith("<!--") -and -not $line.StartsWith("|")) {
                $lab.description = $line
            }
            
            # Parse lab details table (Level | Persona | Duration | Purpose format)
            if ($line -match "Level.*Persona.*Duration.*Purpose") {
                $inTable = $true
                continue
            }
            
            if ($inTable -and $line -match "^\|\s*(\d+)\s*\|\s*([^|]+)\s*\|\s*(\d+)\s*minutes?\s*\|\s*(.+)\s*\|") {
                $lab.difficulty = [int]$matches[1]
                $lab.duration = [int]$matches[3]
                # Use table description if we don't have one yet
                if (-not $lab.description) {
                    $lab.description = $matches[4].Trim()
                }
                $inTable = $false
            }
        }
        
        # Auto-assign section based on difficulty and naming patterns
        if (-not $lab.section) {
            $lab.section = Get-AutoSection -LabId $LabId -Difficulty $lab.difficulty
        }
        
        return $lab
    }
    catch {
        Write-Host "  ❌  Error parsing $LabId`: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Get-AutoSection {
    <#
    .SYNOPSIS
        Automatically determine section assignment based on lab characteristics
    #>
    param(
        [string]$LabId,
        [int]$Difficulty
    )
    
    # Section assignment based on naming patterns and difficulty
    if ($LabId -match "external|mcp-external") { return "external_labs" }
    if ($LabId -match "30-mins|optional") { return "optional_labs" }
    if ($LabId -match "autonomous") { return "advanced_labs" }
    if ($LabId -match "mcp|pipeline|kit|measure") { return "specialized_labs" }
    
    # Difficulty-based assignment
    if ($Difficulty -le 100) { return "core_learning_path" }
    if ($Difficulty -le 200) { return "intermediate_labs" }
    return "advanced_labs"
}

function Get-AutoJourneys {
    <#
    .SYNOPSIS
        Automatically assign journeys based on lab content analysis
    #>
    param($Lab)
    
    $journeys = @()
    $title = $Lab.title.ToLower()
    $id = $Lab.id.ToLower()
    
    # Journey assignment based on content analysis
    if ($Lab.difficulty -le 100 -or $title -match "start|begin|first|basic") {
        $journeys += "quick-start"
    }
    
    if ($title -match "business|maker" -or $Lab.difficulty -le 200) {
        $journeys += "business-user"
    }
    
    if ($title -match "developer|technical|integration|pipeline|mcp" -or $id -match "setup|pipeline|mcp") {
        $journeys += "developer"
    }
    
    if ($id -match "autonomous" -or $title -match "autonomous|ai automation") {
        $journeys += "autonomous-ai"
    }
    
    # Ensure every lab has at least one journey
    if ($journeys.Count -eq 0) {
        if ($Lab.difficulty -le 150) {
            $journeys += "business-user"
        }
        else {
            $journeys += "developer"
        }
    }
    
    return $journeys
}

function Get-AllLabsFromFolders {
    <#
    .SYNOPSIS
        Discover all labs by scanning lab folders and external lab configuration
    #>
    param(
        [Parameter(Mandatory)]$Config,
        [Parameter(Mandatory)]$Paths,
        [Parameter(Mandatory)]$LabJourneys
    )
    
    $discoveredLabs = @()
    $labFolders = Get-ChildItem $Paths.labsPath -Directory | Where-Object { 
        $_.Name -ne "lab-template.md" -and (Test-Path (Join-Path $_.FullName "README.md"))
    }
    
    Write-Host "🔍  Auto-discovering labs from folders..." -ForegroundColor Yellow
    
    # Process local lab folders
    foreach ($folder in $labFolders) {
        $lab = Get-LabFromReadme -LabPath $folder.FullName -LabId $folder.Name
        if ($lab) {
            # Override duration and difficulty with config values if they exist
            # This allows lab-config.yml to be the source of truth for metadata
            if ($Config.lab_metadata) {
                foreach ($order in $Config.lab_metadata.Keys) {
                    $configLab = $Config.lab_metadata[$order]
                    if ($configLab.id -eq $folder.Name) {
                        # Extract numeric difficulty from config (e.g., "Intermediate (Level 200)" -> 200)
                        if ($configLab.difficulty -match '(\d+)') {
                            $lab.difficulty = [int]$matches[1]
                        }
                        # Use duration from config
                        if ($configLab.duration) {
                            $lab.duration = [int]$configLab.duration
                        }
                        # Use section from config if specified
                        if ($configLab.section) {
                            $lab.section = $configLab.section
                        }
                        break
                    }
                }
            }
            
            # Assign journeys from config or auto-assign
            if ($LabJourneys.ContainsKey($folder.Name)) {
                $lab.journeys = $LabJourneys[$folder.Name]
                Write-Host "    🎯 Using explicit journey assignment: $($lab.journeys -join ', ')" -ForegroundColor Magenta
            }
            else {
                $lab.journeys = Get-AutoJourneys -Lab $lab
                Write-Host "    🤖 Using automatic journey assignment: $($lab.journeys -join ', ')" -ForegroundColor Yellow
            }
            
            $discoveredLabs += $lab
            Write-Host "  ✅  Discovered: $($folder.Name)" -ForegroundColor Green
        }
        else {
            Write-Host "  ⚠️   Failed to parse: $($folder.Name)" -ForegroundColor Yellow
        }
    }
    
    # Add external labs from configuration
    if ($Config.external_labs) {
        Write-Host "🌐  Adding external labs from config..." -ForegroundColor Cyan
        foreach ($externalLab in $Config.external_labs) {
            $lab = @{
                id          = $externalLab.id
                slug        = $externalLab.id  # Use the lab id as the slug
                title       = $externalLab.title
                duration    = $externalLab.duration
                difficulty  = if ($externalLab.difficulty -match '\d+') { [int]($externalLab.difficulty -replace '\D', '') } else { 200 }
                description = $externalLab.description
                journeys    = if ($externalLab.journeys) { $externalLab.journeys } else { @("developer") }
                section     = if ($externalLab.section) { $externalLab.section } else { "external_labs" }
                url         = $externalLab.url
                repository  = $externalLab.repository
            }
            $discoveredLabs += $lab
            Write-Host "  ✅  Added external lab: $($externalLab.id)" -ForegroundColor Green
        }
    }
    
    Write-Host "📊  Discovered $($discoveredLabs.Count) labs total" -ForegroundColor Cyan
    return $discoveredLabs
}

#endregion

#region Jekyll Generation Functions
# ============================================================================
# JEKYLL GENERATION FUNCTIONS
# ============================================================================

function ConvertTo-JekyllLab {
    <#
    .SYNOPSIS
        Convert a lab object to Jekyll-compatible markdown file
    .DESCRIPTION
        Creates Jekyll front matter and processes content for web display
    #>
    param(
        [Parameter(Mandatory)]$Lab,
        [Parameter(Mandatory)][int]$Order,
        [Parameter(Mandatory)][string]$SectionName,
        [Parameter(Mandatory)][string]$LabType,
        [Parameter(Mandatory)]$Paths
    )
    
    $lab_key = $Lab.id
    $source_file = "$($Paths.basePath)/labs/$lab_key/README.md"
    $target_file = "$($Paths.outputPath)/$lab_key.md"  # Always use semantic names
    
    if (Test-Path $source_file) {
        return New-LocalLabFile -Lab $Lab -Order $Order -SectionName $SectionName -LabType $LabType -SourceFile $source_file -TargetFile $target_file
    }
    elseif ($Lab.url -or $Lab.repository) {
        return New-ExternalLabFile -Lab $Lab -Order $Order -SectionName $SectionName -LabType $LabType -TargetFile $target_file
    }
    else {
        Write-Host "    ⚠️   Source file not found: $source_file" -ForegroundColor Yellow
        return $false
    }
}

function New-LocalLabFile {
    <#
    .SYNOPSIS
        Create Jekyll file for local lab with README.md content
    #>
    param($Lab, $Order, $SectionName, $LabType, $SourceFile, $TargetFile)
    
    Write-Host "  📝  Processing $SectionName`: $($Lab.id) -> $(Split-Path $TargetFile -Leaf)" -ForegroundColor Cyan
    
    try {
        # Read and process source content
        $content = Get-Content $SourceFile -Raw -ErrorAction Stop
        
        # Extract description if not already set
        $description = Get-LabDescription -Content $content -Lab $Lab
        
        # Create Jekyll front matter
        $frontMatter = Build-JekyllFrontMatter -Lab $Lab -Order $Order -SectionName $SectionName -LabType $LabType -Description $description
        
        # Process content (remove duplicate titles, normalize formatting)
        $cleanContent = Get-CleanLabContent -Content $content -Title $Lab.title

        # Optional markdown detection (fenced code blocks immediately following list items)
        if ($MarkdownDetectOnly) {
            # Detection only: capture issues but do not modify content
            $detectResult = Test-MarkdownListCodeBlocks -Content $cleanContent -LabId $Lab.id
            if ($detectResult.Fixes -gt 0) {
                $script:MarkdownIssueLog += @{ Lab = $Lab.id; Count = $detectResult.Fixes; Lines = $detectResult.LineNumbers }
            }
        }
        
        # Combine front matter and content
        $finalContent = $frontMatter + "`n`n---`n`n" + $cleanContent
        
        # Write to target file
        $finalContent | Set-Content $TargetFile -Encoding UTF8 -ErrorAction Stop
        Write-Host "    ✅  Created $(Split-Path $TargetFile -Leaf)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "    ❌  Failed to process $($Lab.id)`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function New-ExternalLabFile {
    <#
    .SYNOPSIS
        Create Jekyll file for external lab with repository links
    #>
    param($Lab, $Order, $SectionName, $LabType, $TargetFile)
    
    Write-Host "  🌐  Processing external $SectionName`: $($Lab.id) -> $(Split-Path $TargetFile -Leaf)" -ForegroundColor Cyan
    
    try {
        $description = if ($Lab.description) { $Lab.description } else { "External lab hosted at $($Lab.url)" }
        
        # Create Jekyll front matter for external lab
        $frontMatter = Build-JekyllFrontMatter -Lab $Lab -Order $Order -SectionName $SectionName -LabType $LabType -Description $description -IsExternal $true
        
        # Create external lab content template
        $externalContent = Build-ExternalLabContent -Lab $Lab -Description $description
        
        # Combine front matter and content
        $finalContent = $frontMatter + "`n`n---`n`n" + $externalContent
        
        # Write to target file
        $finalContent | Set-Content $TargetFile -Encoding UTF8 -ErrorAction Stop
        Write-Host "    ✅  Created external lab $(Split-Path $TargetFile -Leaf)" -ForegroundColor Green
        return $true
    }
    catch {
        Write-Host "    ❌  Failed to process external lab $($Lab.id)`: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

function Get-LabDescription {
    <#
    .SYNOPSIS
        Extract description from README content or use configured description
    #>
    param($Content, $Lab)
    
    $description = ""
    $lines = $Content -split "`n"
    $foundTitle = $false
    
    foreach ($line in $lines) {
        $line = $line.Trim()
        
        # Skip until we find the main heading
        if ($line -match "^#\s+") {
            $foundTitle = $true
            continue
        }
        
        # After title, look for first substantial paragraph
        if ($foundTitle -and $line -and 
            -not $line.StartsWith("#") -and -not $line.StartsWith("---") -and -not $line.StartsWith("<!--")) {
            $description = $line
            break
        }
    }
    
    # Fallback to config description if we couldn't extract one
    if (-not $description) {
        $description = $Lab.description
    }
    
    return $description
}

function Build-JekyllFrontMatter {
    <#
    .SYNOPSIS
        Build Jekyll front matter YAML for a lab
    #>
    param($Lab, $Order, $SectionName, $LabType, $Description, [bool]$IsExternal = $false)
    
    # Escape title to prevent YAML breaking with quotes or special characters
    $escapedTitle = $Lab.title -replace '"', '\"'
    
    $frontMatter = @"
---
layout: lab
title: "$escapedTitle"
order: $Order
duration: $($Lab.duration)
difficulty: $($Lab.difficulty)
lab_type: $LabType
section: $SectionName
"@
    
    if ($IsExternal) {
        $frontMatter += "`nexternal: true"
        if ($Lab.url) {
            $frontMatter += "`nurl: `"$($Lab.url)`""
        }
        if ($Lab.repository) {
            $frontMatter += "`nrepository: `"$($Lab.repository)`""
        }
    }
    
    # Add journeys if they exist
    if ($Lab.journeys -and $Lab.journeys.Count -gt 0) {
        $journeyArray = $Lab.journeys | ForEach-Object { "`"$_`"" }
        $journeyString = "[" + ($journeyArray -join ", ") + "]"
        $frontMatter += "`njourneys: $journeyString"
        
        # Add bootcamp_order if lab is in bootcamp configuration
        if ($Config.bootcamp_lab_orders) {
            # Find the bootcamp order for this lab by checking all bootcamp entries
            foreach ($bootcampOrder in $Config.bootcamp_lab_orders.Keys) {
                $bootcampLabId = $Config.bootcamp_lab_orders[$bootcampOrder]
                if ($bootcampLabId -eq $Lab.id) {
                    $frontMatter += "`nbootcamp_order: `"$bootcampOrder`""
                    break
                }
            }
        }
    }
    
    # Add description (escape quotes)
    $escapedDescription = $Description -replace '"', '\"'
    $frontMatter += "`ndescription: `"$escapedDescription`""
    
    return $frontMatter
}

function Get-CleanLabContent {
    <#
    .SYNOPSIS
        Clean and normalize lab content for Jekyll processing
    #>
    param($Content, $Title)
    
    # Clean up content - remove leading/trailing whitespace and normalize newlines
    $cleanContent = $Content.Trim()
    
    # Remove duplicate title from content if it matches (avoid double headers)
    $lines = $cleanContent -split "`n"
    if ($lines.Count -gt 0 -and $lines[0] -match "^#\s+(.+)") {
        $contentTitle = $matches[1].Trim()
        if ($contentTitle -eq $Title) {
            # Remove the first line (duplicate title) and any following empty lines
            $lines = $lines[1..($lines.Length - 1)]
            while ($lines.Count -gt 0 -and [string]::IsNullOrWhiteSpace($lines[0])) {
                $lines = $lines[1..($lines.Length - 1)]
            }
            $cleanContent = $lines -join "`n"
        }
    }
    
    # Escape pipes in markdown link text to prevent Kramdown from treating them as table separators
    # Pattern: [text with | pipes](url) -> [text with \| pipes](url)
    # Uses negative lookbehind to avoid double-escaping already escaped pipes
    $cleanContent = $cleanContent -replace '\[([^\]]*(?<!\\))\|([^\]]*)\]\(', '[$1\|$2]('
    
    return $cleanContent
}

function Test-MarkdownListCodeBlocks {
    <#
    .SYNOPSIS
        Detect fenced code blocks that immediately follow list items without indentation (no mutation).
    .DESCRIPTION
        Kramdown requires indentation (4 spaces) to nest a fenced block inside a preceding list item.
        This detection-only helper scans markdown lines and when it finds a numbered list item
        followed directly (optionally with one blank line) by an unindented fenced code block, it
        records the list item line number for reporting. Content is never modified.
    .PARAMETER Content
        The markdown content to analyze.
    .PARAMETER LabId
        Lab identifier (for logging context).
    .OUTPUTS
        Hashtable: @{ Content = <string>; Fixes = <int>; Warnings = <[string[]]> }
    #>
    param(
        [Parameter(Mandatory)][string]$Content,
        [string]$LabId = ""
    )

    $lines = $Content -split "`n"
    $fixes = 0
    $warnings = @()
    $lineNumbers = @()

    # Track original line numbers for logging
    for ($i = 0; $i -lt $lines.Length - 1; $i++) {
        $current = $lines[$i]

        # Match numbered list item (e.g. '17. Something', may have leading spaces)
        if ($current -match '^\s*\d+\.\s+') {
            $nextIndex = $i + 1
            # Skip a single blank line if present
            if ($nextIndex -lt $lines.Length -and $lines[$nextIndex] -match '^\s*$') {
                $nextIndex++
            }

            if ($nextIndex -lt $lines.Length -and $lines[$nextIndex] -match '^```(\w+)?\s*$') {
                # Unindented fenced block detected after list item
                # Ensure a blank line between list item and fence for readability
                if ($lines[$i + 1] -notmatch '^\s*$' -and $lines[$i + 1] -match '^```') {
                    # Insert blank line before fence
                    $lines = $lines[0..$i] + @('') + $lines[($i + 1)..($lines.Length - 1)]
                    $nextIndex++
                }

                # Record detection only; do not mutate lines
                $insideFence = $true
                for ($j = $nextIndex + 1; $j -lt $lines.Length -and $insideFence; $j++) {
                    if ($lines[$j] -match '^```\s*$') { $insideFence = $false }
                }
                $fixes++
                $lineNumbers += ($i + 1)
                Write-Host "    ⚠️  Detected unindented fenced block after list item at line $($i+1) in $LabId" -ForegroundColor DarkYellow
            }
        }
    }
    if ($fixes -gt 0) {
        Write-Host "    ⚠️  Markdown issues detected: $fixes fenced block(s)" -ForegroundColor Yellow
    }
    else {
        Write-Host "    ℹ️  No markdown list/fence issues detected for $LabId" -ForegroundColor DarkGray
    }
    return @{ Content = $Content; Fixes = $fixes; Warnings = $warnings; LineNumbers = $lineNumbers }
}

function Build-ExternalLabContent {
    <#
    .SYNOPSIS
        Build content template for external labs
    #>
    param($Lab, $Description)
    
    return @"
$Description

## 🌐 External Repository

This lab is hosted in an external repository. Click the link below to access the full lab content:

**Repository**: [$($Lab.repository)]($($Lab.url))

## Lab Details

- **Duration**: $($Lab.duration) minutes
- **Difficulty**: $($Lab.difficulty)
- **Type**: External Lab

## Getting Started

1. Navigate to the [external repository]($($Lab.url))
2. Follow the README instructions in that repository
3. Complete the lab exercises as directed

---

*This is an external lab. All content and instructions are maintained in the linked repository.*
"@
}

#endregion

#region Index Page Generation
# ============================================================================
# INDEX PAGE GENERATION FUNCTIONS
# ============================================================================

function New-IndexPage {
    <#
    .SYNOPSIS
        Generate dynamic index.md file with journey and section definitions from configuration
    #>
    param($Config, $Paths, $AllLabs)
    
    Write-Host "📄  Generating dynamic index.md page..." -ForegroundColor Yellow
    
    # Build journey filter buttons dynamically
    $journeyButtons = @()
    if ($Config.journeys) {
        foreach ($journeyKey in $Config.journeys.Keys) {
            $journey = $Config.journeys[$journeyKey]
            $icon = if ($journey.icon) { $journey.icon } else { "🔧" }
            $title = if ($journey.title) { $journey.title } else { $journeyKey }
            
            $journeyButtons += "    <button onclick=`"filterByJourney('$journeyKey')`" class=`"filter-btn`" id=`"$journeyKey-btn`">$icon $title</button>"
        }
    }
    
    # Build section filter buttons dynamically from discovered lab sections
    $sectionButtons = @()
    $discoveredSections = $AllLabs | Group-Object -Property section | Sort-Object Name
    
    foreach ($sectionGroup in $discoveredSections) {
        $sectionKey = $sectionGroup.Name
        $labCount = $sectionGroup.Count
        
        # Get section metadata from config or use defaults
        $sectionMeta = if ($Config.sections -and $Config.sections[$sectionKey]) { 
            $Config.sections[$sectionKey] 
        }
        else { 
            @{ title = $sectionKey; icon = "📁" } 
        }
        
        $icon = if ($sectionMeta.icon) { $sectionMeta.icon } else { "📁" }
        $title = if ($sectionMeta.title) { $sectionMeta.title } else { $sectionKey }
        
        $sectionButtons += "    <button onclick=`"filterBySection('$sectionKey')`" class=`"filter-btn section-btn`" id=`"$sectionKey-btn`">$icon $title</button>"
        
        Write-Host "    🔧 Generated section filter: $title ($labCount labs)" -ForegroundColor Cyan
    }
    
    # Build JavaScript journey definitions dynamically
    $journeyDefinitions = @()
    if ($Config.journeys) {
        foreach ($journeyKey in $Config.journeys.Keys) {
            $journey = $Config.journeys[$journeyKey]
            $title = if ($journey.title) { $journey.title } else { $journeyKey }
            $icon = if ($journey.icon) { $journey.icon } else { "🔧" }
            $description = if ($journey.description) { $journey.description } else { "Learning journey for $title" }
            $difficulty = if ($journey.difficulty) { $journey.difficulty } else { "Intermediate" }
            $estimatedTime = if ($journey.estimated_time) { $journey.estimated_time } else { "2-4 hours" }
            
            # Escape JavaScript strings to prevent injection
            $escapedTitle = ($icon + " " + $title) -replace "'", "\'" -replace "\\", "\\\\"
            $escapedDescription = $description -replace "'", "\'" -replace "\\", "\\\\"
            $escapedDifficulty = $difficulty -replace "'", "\'" -replace "\\", "\\\\"
            $escapedEstimatedTime = $estimatedTime -replace "'", "\'" -replace "\\", "\\\\"
            
            $journeyDefinitions += "  '$journeyKey': { title: '$escapedTitle', description: '$escapedDescription', difficulty: '$escapedDifficulty', estimatedTime: '$escapedEstimatedTime' }"
        }
    }
    
    # Generate the complete index.md content
    $indexContent = Build-IndexPageContent -JourneyButtons $journeyButtons -JourneyDefinitions $journeyDefinitions -SectionButtons $sectionButtons
    
    # Write to index.md file
    $indexPath = Join-Path $Paths.basePath "labs/index.md"
    try {
        $indexContent | Set-Content $indexPath -Encoding UTF8 -ErrorAction Stop
        Write-Host "✅  Generated dynamic index.md with $($Config.journeys.Keys.Count) journeys" -ForegroundColor Green
    }
    catch {
        Write-Host "❌  Failed to generate index.md: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function New-RootHomepage {
    <#
    .SYNOPSIS
        Generate dynamic root index.md homepage with journey cards
    #>
    param($Config, $Paths, $AllLabs)
    
    Write-Host "🏠  Generating root homepage index.md..." -ForegroundColor Yellow
    
    # Calculate stats for each journey
    $journeyStats = @{}
    if ($Config.journeys) {
        foreach ($journeyKey in $Config.journeys.Keys) {
            $labCount = 0
            $totalDuration = 0
            
            foreach ($lab in $AllLabs) {
                if ($lab.journeys -and $journeyKey -in $lab.journeys) {
                    $labCount++
                    $totalDuration += $lab.duration
                }
            }
            
            $journeyStats[$journeyKey] = @{
                LabCount      = $labCount
                TotalDuration = $totalDuration
                Hours         = [math]::Round($totalDuration / 60, 1)
            }
        }
    }
    
    # Build journey cards dynamically
    $journeyCards = @()
    if ($Config.journeys) {
        foreach ($journeyKey in $Config.journeys.Keys) {
            # Skip bootcamp journey - it should only appear as dynamic navigation, not as a homepage journey card
            if ($journeyKey -eq "bootcamp") {
                continue
            }
            
            $journey = $Config.journeys[$journeyKey]
            $stats = $journeyStats[$journeyKey]
            
            $icon = if ($journey.icon) { $journey.icon } else { "🔧" }
            $title = if ($journey.title) { $journey.title } else { $journeyKey }
            $description = if ($journey.description) { $journey.description } else { "Learning journey for $title" }
            $difficulty = if ($journey.difficulty) { $journey.difficulty } else { "Intermediate" }
            
            # Format time display
            $timeDisplay = if ($stats.Hours -lt 1) { 
                "$($stats.TotalDuration) mins" 
            }
            elseif ($stats.Hours -ge 2) { 
                "$([math]::Floor($stats.Hours))-$([math]::Ceiling($stats.Hours)) hours" 
            }
            else { 
                "$($stats.Hours) hours" 
            }
            
            $journeyCards += @"
    <div class="journey-card $journeyKey">
        <h3>$icon $($title.Replace(' Journey', ''))</h3>
        <p>$description</p>
        <div class="journey-meta">
            <span>⏱️ $timeDisplay</span>
            <span>📊 $difficulty</span>
            <span>📚 $($stats.LabCount) labs</span>
        </div>
        <a href="{{ '/labs/#$journeyKey' | relative_url }}" class="journey-btn">Start Journey →</a>
    </div>
"@
        }
    }
    
    # Build the complete homepage content
    $homepageContent = Build-RootHomepageContent -JourneyCards $journeyCards
    
    # Write to root index.md file
    $rootIndexPath = Join-Path $Paths.basePath "index.md"
    try {
        $homepageContent | Set-Content $rootIndexPath -Encoding UTF8 -ErrorAction Stop
        Write-Host "✅  Generated root homepage with $($Config.journeys.Keys.Count) journey cards" -ForegroundColor Green
    }
    catch {
        Write-Host "❌  Failed to generate root homepage: $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Build-RootHomepageContent {
    <#
    .SYNOPSIS
        Build the complete root homepage content
    #>
    param($JourneyCards)
    
    $journeyCardsHtml = $JourneyCards -join "`n`n"
    
    return @"
---
layout: default
title: Home
---

<!-- 
🚫 WARNING: This file is automatically generated by scripts/Generate-Labs.ps1
🚫 DO NOT EDIT MANUALLY - Changes will be overwritten!
🚫 To modify content: Edit lab-config.yml and run the generation script
-->

# Microsoft Copilot Studio Labs

Welcome to hands-on labs for building AI agents with Microsoft Copilot Studio. Choose your learning journey based on your goals and experience level.

## 🎯 **Choose Your Learning Journey**

<div class="journey-cards">
$journeyCardsHtml
</div>

---

## 🎯 **Getting Started**

1. **Choose your journey** above based on your goals and experience
2. **Follow the guided path** with labs specifically selected for your needs
3. **Build hands-on skills** with real Microsoft Copilot Studio projects
4. **Progress at your own pace** - each journey is self-contained

**Ready to build amazing AI agents?** Pick your journey and start learning! 🎉

- Join the community discussions for questions and insights
- Practice with your own use cases after completing each lab

Happy learning! 🎉


"@
}

function Build-IndexPageContent {
    <#
    .SYNOPSIS
        Build the complete index.md page content
    #>
    param($JourneyButtons, $JourneyDefinitions, $SectionButtons)
    
    $journeyButtonsHtml = $JourneyButtons -join "`n"
    $journeyDefinitionsJs = $JourneyDefinitions -join ",`n"
    $sectionButtonsHtml = $SectionButtons -join "`n"
    
    return @"
---
layout: default
title: Labs
description: Microsoft Copilot Studio labs - browse all or filter by learning journey
---

<!-- 
🚫 WARNING: This file is automatically generated by scripts/Generate-Labs.ps1
🚫 DO NOT EDIT MANUALLY - Changes will be overwritten!
🚫 To modify content: Edit lab-config.yml and run the generation script
-->

<div class="current-filter-display">
  <div class="filter-status">
    <span class="filter-label">Current View:</span>
    <span id="current-filter-name" class="current-filter">All Labs</span>
    <button id="clear-filter-btn" class="clear-filter-btn" onclick="showAllLabs()" style="display: none;">✕ Clear Filter</button>
  </div>
</div>

<div id="journey-header" style="display: none;" class="content-journey-header">
  <h1 id="journey-title"></h1>
  <p id="journey-description"></p>
  <div id="journey-stats" class="journey-stats"></div>
</div>

<div id="section-header" style="display: none;" class="section-header">
  <h1 id="section-title"></h1>
  <p id="section-description"></p>
  <div id="section-stats" class="section-stats"></div>
</div>

<div id="all-labs-header">
  <h1>All Labs</h1>
  <p>Browse all available Microsoft Copilot Studio labs. Choose individual labs or follow our learning journeys for a guided experience.</p>
</div>

<div class="filter-sections-container">
<div class="filter-section">
  <h3>Filter by Journey</h3>
  <p class="filter-hint">Click a filter to apply it, click again to show all labs</p>
  <div class="lab-filters">
$journeyButtonsHtml
  </div>
</div>

<div class="filter-section">
  <h3>Filter by Section</h3>
  <div class="lab-filters">
$sectionButtonsHtml
  </div>
</div>
</div>

<div class="labs-grid" id="labs-container">
{% for lab in site.labs %}
  <div class="lab-card" data-difficulty="{{ lab.difficulty }}" data-duration="{{ lab.duration }}" data-journeys="{{ lab.journeys | join: ',' }}" data-section="{{ lab.section }}" data-order="{{ lab.order }}">
    <div class="lab-sequence">
      <span class="sequence-number"></span>
    </div>
    <div class="lab-header">
      <h3><a href="{{ '/labs/' | relative_url }}{{ lab.slug }}/">{{ lab.title }}</a></h3>
      <div class="lab-meta">
        <span class="section {{ lab.section }}">{{ lab.section | capitalize }}</span>
        <span class="difficulty">Level {{ lab.difficulty }}</span>
        <span class="duration">{{ lab.duration }}min</span>
      </div>
    </div>
    <div class="lab-description">
      <p>{{ lab.description }}</p>
    </div>
    <div class="lab-actions">
      <a href="{{ '/labs/' | relative_url }}{{ lab.slug }}/" class="btn btn-primary start-lab">
        🚀 Start Lab
      </a>
      {% if lab.lab_type != 'external' %}
        <a href="{{ '/assets/pdfs/' | relative_url }}{{ lab.slug }}.pdf" class="btn btn-secondary download-pdf" target="_blank">
          📄 Download PDF
        </a>
      {% endif %}
    </div>
    <div class="lab-journeys">
      {% for journey in lab.journeys %}
        <span class="journey-tag">{{ journey }}</span>
      {% endfor %}
    </div>
  </div>
{% endfor %}
</div>

<script>
// Journey metadata (dynamically generated from config)
const journeys = {
$journeyDefinitionsJs
};

// Section metadata
const sections = {
  'advanced_labs': { title: '🚀 Advanced Labs', description: 'Cutting-edge features and advanced implementations for experienced developers and power users.', difficulty: 'Advanced', icon: '🚀' },
  'core_learning_path': { title: '📚 Core Learning Path', description: 'Essential foundational labs that provide the fundamental knowledge and skills needed for effective use.', difficulty: 'Beginner to Intermediate', icon: '📚' },
  'external_labs': { title: '🌐 External Labs', description: 'Labs hosted in external repositories with specialized content and advanced integrations.', difficulty: 'Varies', icon: '🌐' },
  'intermediate_labs': { title: '🎯 Intermediate Labs', description: 'Mid-level labs that build upon basic concepts and introduce more complex scenarios and integrations.', difficulty: 'Intermediate', icon: '🎯' },
  'optional_labs': { title: '🔧 Optional Labs', description: 'Supplementary labs that provide additional knowledge and alternative approaches for specific use cases.', difficulty: 'Varies', icon: '🔧' },
  'specialized_labs': { title: '⚡ Specialized Labs', description: 'Focused labs covering specific tools, integrations, and specialized workflows for particular scenarios.', difficulty: 'Intermediate to Advanced', icon: '⚡' }
};

function updateSequenceNumbers() {
  const cards = document.querySelectorAll('.lab-card');
  let sequenceNumber = 1;
  
  cards.forEach(card => {
    const sequenceElement = card.querySelector('.sequence-number');
    if (card.style.display !== 'none') {
      sequenceElement.textContent = sequenceNumber;
      sequenceElement.style.display = 'block';
      sequenceNumber++;
    } else {
      sequenceElement.style.display = 'none';
    }
  });
}

function updateLabLinks(filterType, filterValue) {
  // Update all lab card links to include filter context
  const labCards = document.querySelectorAll('.lab-card');
  
  labCards.forEach(card => {
    // Update title link
    const titleLink = card.querySelector('h3 a');
    if (titleLink) {
      const baseUrl = titleLink.href.split('?')[0]; // Remove existing query params
      
      if (filterType && filterValue) {
        // Add filter context as query parameter
        titleLink.href = baseUrl + '?' + filterType + '=' + encodeURIComponent(filterValue);
      } else {
        // Remove filter context
        titleLink.href = baseUrl;
      }
    }
    
    // Update "Start Lab" button
    const startLabBtn = card.querySelector('.start-lab');
    if (startLabBtn) {
      const baseUrl = startLabBtn.href.split('?')[0]; // Remove existing query params
      
      if (filterType && filterValue) {
        // Add filter context as query parameter
        startLabBtn.href = baseUrl + '?' + filterType + '=' + encodeURIComponent(filterValue);
      } else {
        // Remove filter context
        startLabBtn.href = baseUrl;
      }
    }
  });
}

function showAllLabs() {
  document.getElementById('all-labs-header').style.display = 'block';
  document.getElementById('journey-header').style.display = 'none';
  document.getElementById('section-header').style.display = 'none';
  
  // Show all lab cards
  const cards = document.querySelectorAll('.lab-card');
  cards.forEach(card => card.style.display = 'block');
  
  // Update sequence numbers
  updateSequenceNumbers();
  
  // Update lab links to remove filter context
  updateLabLinks();
  
  // Clear active buttons
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  
  // Update current filter display
  document.getElementById('current-filter-name').textContent = 'All Labs';
  document.getElementById('clear-filter-btn').style.display = 'none';
  
  // Update URL
  history.pushState({}, '', '{{ "/labs/" | relative_url }}');
}

function filterByJourney(journeyName) {
  const journey = journeys[journeyName];
  if (!journey) return;
  
  // Check if this filter is already active (toggle behavior)
  const button = document.getElementById(journeyName + '-btn');
  if (button.classList.contains('active')) {
    // Unselect - show all labs
    showAllLabs();
    return;
  }
  
  // Show journey header
  document.getElementById('all-labs-header').style.display = 'none';
  document.getElementById('journey-header').style.display = 'block';
  document.getElementById('section-header').style.display = 'none';
  document.getElementById('journey-title').textContent = journey.title;
  document.getElementById('journey-description').textContent = journey.description;
  
  // Calculate and show stats
  const cards = document.querySelectorAll('.lab-card');
  let labCount = 0;
  let totalDuration = 0;
  
  cards.forEach(card => {
    const journeyData = card.dataset.journeys;
    if (journeyData) {
      const journeys = journeyData.split(',').map(j => j.trim());
      if (journeys.includes(journeyName)) {
        card.style.display = 'block';
        labCount++;
        totalDuration += parseInt(card.dataset.duration);
      } else {
        card.style.display = 'none';
      }
    } else {
      card.style.display = 'none';
    }
  });
  
  document.getElementById('journey-stats').innerHTML = 
    '<strong>Difficulty Level:</strong> ' + journey.difficulty + '<br>' +
    '<strong>Estimated Time:</strong> ' + journey.estimatedTime + '<br>' +
    '<strong>Total Labs:</strong> ' + labCount + ' labs (' + totalDuration + ' minutes)';
  
  // Update sequence numbers
  updateSequenceNumbers();
  
  // Update lab links with journey context
  updateLabLinks('journey', journeyName);
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(journeyName + '-btn').classList.add('active');
  
  // Update current filter display
  document.getElementById('current-filter-name').textContent = journey.title;
  document.getElementById('clear-filter-btn').style.display = 'block';
  
  // Update URL
  history.pushState({}, '', '{{ "/labs/" | relative_url }}#' + journeyName);
}

function filterBySection(sectionName) {
  const section = sections[sectionName];
  if (!section) return;
  
  // Check if this filter is already active (toggle behavior)
  const button = document.getElementById(sectionName + '-btn');
  if (button.classList.contains('active')) {
    // Unselect - show all labs
    showAllLabs();
    return;
  }
  
  // Show section header
  document.getElementById('all-labs-header').style.display = 'none';
  document.getElementById('journey-header').style.display = 'none';
  document.getElementById('section-header').style.display = 'block';
  document.getElementById('section-title').textContent = section.title;
  document.getElementById('section-description').textContent = section.description;
  
  // Filter cards by section
  const cards = document.querySelectorAll('.lab-card');
  let labCount = 0;
  let totalDuration = 0;
  
  cards.forEach(card => {
    const cardSection = card.dataset.section;
    if (cardSection === sectionName) {
      card.style.display = 'block';
      labCount++;
      totalDuration += parseInt(card.dataset.duration);
    } else {
      card.style.display = 'none';
    }
  });
  
  document.getElementById('section-stats').innerHTML = 
    '<strong>Difficulty Level:</strong> ' + section.difficulty + '<br>' +
    '<strong>Total Labs:</strong> ' + labCount + ' labs (' + totalDuration + ' minutes)';
  
  // Update sequence numbers
  updateSequenceNumbers();
  
  // Update lab links with section context
  updateLabLinks('section', sectionName);
  
  // Update active button
  document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(sectionName + '-btn').classList.add('active');
  
  // Update current filter display
  document.getElementById('current-filter-name').textContent = section.title;
  document.getElementById('clear-filter-btn').style.display = 'block';
  
  // Update URL
  history.pushState({}, '', '{{ "/labs/" | relative_url }}#section-' + sectionName);
}

// Function to sort lab cards numerically by order
function sortLabCardsByOrder() {
  const container = document.getElementById('labs-container');
  const cards = Array.from(container.querySelectorAll('.lab-card'));
  
  // Sort cards by numeric order value
  cards.sort((a, b) => {
    const orderA = parseInt(a.dataset.order) || 999;
    const orderB = parseInt(b.dataset.order) || 999;
    return orderA - orderB;
  });
  
  // Reorder DOM elements
  cards.forEach(card => container.appendChild(card));
}

// Initialize based on URL hash or parameters
document.addEventListener('DOMContentLoaded', function() {
  // First, sort all lab cards numerically by order
  sortLabCardsByOrder();
  
  // Check for hash first (e.g., #quick-start or #section-core)
  let hash = window.location.hash.substring(1);
  
  // Handle section filtering
  if (hash.startsWith('section-')) {
    const sectionName = hash.substring(8); // Remove 'section-' prefix
    filterBySection(sectionName);
    return;
  }
  
  // Handle journey filtering
  if (hash && journeys[hash]) {
    filterByJourney(hash);
  } else {
    showAllLabs();
  }
});

// Listen for hash changes
window.addEventListener('hashchange', function() {
  const hash = window.location.hash.substring(1);
  
  if (hash.startsWith('section-')) {
    const sectionName = hash.substring(8);
    filterBySection(sectionName);
  } else if (hash && journeys[hash]) {
    filterByJourney(hash);
  } else {
    showAllLabs();
  }
});
</script>


<div class="navigation-actions">
  <a href="{{ '/' | relative_url }}" class="btn btn-secondary">← Back to Home</a>
</div>
"@
}

#endregion

#region Main Execution Logic
# ============================================================================
# MAIN EXECUTION LOGIC
# ============================================================================

function Invoke-LabGeneration {
    <#
    .SYNOPSIS
        Main orchestration function for lab generation process
    .DESCRIPTION
        Coordinates the entire lab generation workflow including PDF generation,
        Jekyll processing, and index creation
    #>
    
    $startTime = Get-Date
    
    try {
        # Initialize environment
        Initialize-Environment
        
        # Load configuration and set up paths
        $config = Get-Configuration
        $paths = Get-Paths
        $labJourneys = Get-LabJourneyAssignments -Config $config
        
        # Display startup information
        Show-StartupInfo -SelectedJourneys $SelectedJourneys -SkipPDFs $SkipPDFs
        
        # Discover all labs
        $allLabs = Get-AllLabsFromFolders -Config $config -Paths $paths -LabJourneys $labJourneys
        
        # Filter labs by selected journeys if specified
        if ($SelectedJourneys.Count -gt 0 -and $SelectedJourneys -notcontains "all") {
            $filteredLabs = $allLabs | Where-Object { 
                $labJourneys = $_.journeys
                ($SelectedJourneys | ForEach-Object { $labJourneys -contains $_ }) -contains $true
            }
            
            Write-Host "🎯  Filtered to $($filteredLabs.Count) labs for selected journeys" -ForegroundColor Yellow
            $allLabs = $filteredLabs
        }
        
        # Generate PDFs if not skipped
        $pdfResults = @()
        if (-not $SkipPDFs) {
            $pdfResults = Invoke-PDFGeneration -AllLabs $allLabs -Paths $paths -SingleLabPDF $SingleLabPDF
        }
        else {
            Write-Host "⏭️   Skipping PDF generation (SkipPDFs flag set)" -ForegroundColor Yellow
        }
        
        # Generate Jekyll files
        Invoke-JekyllGeneration -AllLabs $allLabs -Config $config -Paths $paths
        
        # Generate index.md file with dynamic journey definitions
        New-IndexPage -Config $config -Paths $paths -AllLabs $allLabs
        
        # Generate root homepage
        New-RootHomepage -Config $config -Paths $paths -AllLabs $allLabs
        
        # Show final statistics
        $processingTime = (Get-Date) - $startTime
        Show-FinalStatistics -Results $pdfResults -AllLabs $allLabs -ProcessingTime $processingTime
        
    }
    catch {
        Write-Host "❌  Critical error in lab generation:" -ForegroundColor Red
        Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "    $($_.ScriptStackTrace)" -ForegroundColor DarkRed
        exit 1
    }
}

function Invoke-JekyllGeneration {
    <#
    .SYNOPSIS
        Process all labs for Jekyll site generation
    #>
    param($AllLabs, $Config, $Paths)
    
    Write-Host "`n🏗️   Generating Jekyll files..." -ForegroundColor Yellow
    
    # Group labs by section for organized processing
    $sections = $AllLabs | Group-Object -Property section | Sort-Object Name
    $processedCount = 0
    
    foreach ($section in $sections) {
        $sectionName = $section.Name
        $sectionLabs = $section.Group
        
        Write-Host "📁  Processing section: $sectionName ($($sectionLabs.Count) labs)" -ForegroundColor Cyan
        
        foreach ($lab in $sectionLabs) {
            $labType = if ($lab.url) { "external" } else { "local" }
            
            # Get the configured order from lab_orders, fallback to sequential if not found
            $labSlug = $lab.slug
            $order = if ($labSlug -and $Config.lab_orders -and $Config.lab_orders.ContainsKey($labSlug)) {
                $Config.lab_orders[$labSlug]
            }
            else {
                # Fallback: use a high number (999) for unconfigured labs to sort them last
                999
            }
            
            $success = ConvertTo-JekyllLab -Lab $lab -Order $order -SectionName $section.Name -LabType $labType -Paths $Paths
            
            if ($success) {
                $processedCount++
            }
        }
    }
    
    Write-Host "✅  Jekyll generation complete: $processedCount/$($AllLabs.Count) files created" -ForegroundColor Green
}

function Show-FinalStatistics {
    <#
    .SYNOPSIS
        Display final processing statistics
    #>
    param($Results, $AllLabs, $ProcessingTime)
    
    Write-Host "`n" + "="*80 -ForegroundColor Cyan
    Write-Host "📊  PROCESSING COMPLETE - FINAL STATISTICS" -ForegroundColor Cyan
    Write-Host "="*80 -ForegroundColor Cyan
    
    # PDF Generation Results
    if ($Results.Count -gt 0) {
        # Use manual counting instead of Where-Object to avoid PowerShell hashtable filtering issues
        # Wrap in array to ensure single result is treated as array
        $resultArray = @($Results)
        $successful = 0
        $failed = 0
        
        foreach ($result in $resultArray) {
            if ($result -and $result.Success) {
                $successful++
            }
            else {
                $failed++
            }
        }
        
        Write-Host "📄  PDF Generation Results:" -ForegroundColor Yellow
        Write-Host "    ✅  Successful: $successful/$($resultArray.Count) PDFs" -ForegroundColor Green
        
        if ($failed -gt 0) {
            Write-Host "    ❌  Failed: $failed PDFs" -ForegroundColor Red
        }
    }
    
    # Lab Processing Results  
    Write-Host "`n🧪  Lab Processing Results:" -ForegroundColor Yellow
    Write-Host "    📚  Total Labs Processed: $($AllLabs.Count)" -ForegroundColor Cyan
    
    # Performance Metrics
    Write-Host "`n⚡  Performance Metrics:" -ForegroundColor Yellow
    Write-Host "    ⏱️   Total Processing Time: $([math]::Round($ProcessingTime.TotalSeconds, 2)) seconds" -ForegroundColor Cyan
    Write-Host "    🏭  Labs per Second: $([math]::Round($AllLabs.Count / $ProcessingTime.TotalSeconds, 2))" -ForegroundColor Cyan
    
    # Sync lab-config.yml to _data directory for Jekyll
    Write-Host "`n📋  Syncing configuration..." -ForegroundColor Yellow
    $rootPath = if (Test-Path "./labs") { "." } else { ".." }
    $sourceConfig = Join-Path $rootPath "lab-config.yml"
    $destConfig = Join-Path $rootPath "_data/lab-config.yml"
    if (Test-Path $sourceConfig) {
        Copy-Item -Path $sourceConfig -Destination $destConfig -Force
        Write-Host "✅  Synced lab-config.yml to _data/ directory" -ForegroundColor Green
    }
    
    Write-Host "="*80 -ForegroundColor Cyan
    Write-Host "✅  All processing completed successfully!" -ForegroundColor Green
    Write-Host "="*80 -ForegroundColor Cyan
}

#endregion

# Execute main function
Invoke-LabGeneration

# Detection-only summary (printed after main execution if global log populated)
if ($MarkdownDetectOnly -and $script:MarkdownIssueLog -and $script:MarkdownIssueLog.Count -gt 0) {
    Write-Host "`n=== Markdown Detection Summary ===" -ForegroundColor Cyan
    foreach ($entry in $script:MarkdownIssueLog) {
        $lines = ($entry.Lines -join ', ')
        Write-Host ("Lab: {0} | Issues: {1} | Lines: {2}" -f $entry.Lab, $entry.Count, $lines) -ForegroundColor Yellow
    }
    $totalIssues = ($script:MarkdownIssueLog | Measure-Object -Property Count -Sum).Sum
    Write-Host "Total Labs With Issues: $($script:MarkdownIssueLog.Count) | Total Fenced Blocks: $totalIssues" -ForegroundColor Magenta
    Write-Host "=====================================" -ForegroundColor Cyan
}