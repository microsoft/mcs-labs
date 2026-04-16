# Lab Configuration Audit Script
# Checks for labs that exist in folders but are missing configuration entries
# Supports both simplified format (labs section) and legacy format (lab_metadata)

param(
    [switch]$Fix,
    [switch]$Verbose
)

Write-Host "`n🔍 Lab Configuration Audit" -ForegroundColor Cyan
Write-Host "================================`n" -ForegroundColor Cyan

# Excluded event/special folders (not expected to have local folders)
$excludedFolders = @("bootcamp", "azure-ai-workshop", "mcs-in-a-day", "agent-buildathon-1day", "agent-buildathon-1month")

# Get all lab folders
$labFolders = Get-ChildItem -Path "labs\" -Directory | 
Where-Object { $_.Name -notin $excludedFolders } |
Select-Object -ExpandProperty Name

Write-Host "📁 Found $($labFolders.Count) lab folders (excluding event folders)`n" -ForegroundColor Gray

# Read config and detect format
$configContent = Get-Content -Path "lab-config.yml" -Raw

# Detect config format and extract lab IDs accordingly
$isSimplifiedFormat = $configContent -match '^labs:\s*$' -or $configContent -match '\nlabs:\s*\n'
$configIds = @()
$externalLabs = @()

if ($isSimplifiedFormat) {
    Write-Host "📋 Detected: Simplified config format (labs section)" -ForegroundColor Cyan
    
    # Parse labs section - each lab is a top-level key under 'labs:'
    $inLabsSection = $false
    $configLines = $configContent -split "`n"
    foreach ($line in $configLines) {
        if ($line -match '^labs:\s*$') {
            $inLabsSection = $true
            continue
        }
        if ($inLabsSection) {
            # Exit on next top-level key
            if ($line -match '^[a-z]' -and $line -notmatch '^\s') {
                $inLabsSection = $false
                continue
            }
            # Match lab entries (2-space indent, followed by colon)
            if ($line -match '^  ([\w-]+):\s*$') {
                $labId = $matches[1]
                $configIds += $labId
                
                # Check if external (look ahead for 'external:' under this lab)
            }
            # Detect external labs by looking for 'external:' property
            if ($line -match '^\s+external:\s*$') {
                # The previous lab entry is external
                if ($configIds.Count -gt 0) {
                    $externalLabs += $configIds[-1]
                }
            }
        }
    }
}
else {
    Write-Host "📋 Detected: Legacy config format (lab_metadata section)" -ForegroundColor Cyan
    
    # Legacy format: extract from id: "lab-name" patterns
    $configIds = [regex]::Matches($configContent, 'id:\s*"([^"]+)"') | 
    ForEach-Object { $_.Groups[1].Value }
    
    # Legacy external labs detection
    $externalLabs = @("mcs-mcp-external", "agent-academy-recruit")
}

Write-Host "⚙️  Found $($configIds.Count) configured labs in lab-config.yml" -ForegroundColor Gray
if ($externalLabs.Count -gt 0) {
    Write-Host "🌐 External labs (no local folder expected): $($externalLabs -join ', ')" -ForegroundColor Gray
}
Write-Host ""

# Check for missing configurations
$missingConfigs = $labFolders | Where-Object { $_ -notin $configIds }
$orphanedConfigs = $configIds | Where-Object { $_ -notin $labFolders -and $_ -notin $externalLabs }

# Report results
if ($missingConfigs.Count -gt 0) {
    Write-Host "⚠️  LABS MISSING CONFIG ENTRIES:" -ForegroundColor Yellow
    Write-Host "================================" -ForegroundColor Yellow
    foreach ($lab in $missingConfigs) {
        Write-Host "  ❌ $lab" -ForegroundColor Red
        
        if ($Verbose) {
            $readmePath = "labs\$lab\README.md"
            if (Test-Path $readmePath) {
                $readme = Get-Content $readmePath -Raw
                if ($readme -match '##\s*([^\n]+)') {
                    Write-Host "     Title: $($matches[1])" -ForegroundColor Gray
                }
            }
        }
    }
    Write-Host ""
    
    if ($Fix) {
        Write-Host "🔧 To add a new lab, add an entry to the 'labs' section:" -ForegroundColor Yellow
        Write-Host "" -ForegroundColor Yellow
        foreach ($lab in $missingConfigs) {
            Write-Host "  $lab`:" -ForegroundColor Cyan
            Write-Host "    title: `"Your Lab Title`"" -ForegroundColor Gray
            Write-Host "    difficulty: `"Intermediate`"" -ForegroundColor Gray
            Write-Host "    duration: 45" -ForegroundColor Gray
            Write-Host "    section: intermediate" -ForegroundColor Gray
            Write-Host "    order: 250" -ForegroundColor Gray
            Write-Host "    journeys: [developer]" -ForegroundColor Gray
            Write-Host ""
        }
    }
    else {
        Write-Host "💡 Tip: Run with -Verbose to see lab titles" -ForegroundColor Cyan
        Write-Host "💡 Tip: See docs/NEW_LAB_CHECKLIST.md for update instructions`n" -ForegroundColor Cyan
    }
}
else {
    Write-Host "✅ All lab folders have config entries" -ForegroundColor Green
}

if ($orphanedConfigs.Count -gt 0) {
    Write-Host "`n⚠️  CONFIGS WITHOUT MATCHING FOLDERS:" -ForegroundColor Yellow
    Write-Host "=====================================" -ForegroundColor Yellow
    foreach ($config in $orphanedConfigs) {
        Write-Host "  ⚠️  $config (config exists but no labs/$config/ folder)" -ForegroundColor Red
    }
    Write-Host ""
}

# =====================================================
# LAB ORDERS VALIDATION
# =====================================================
# Check if labs assigned to journeys/events are missing from lab_orders arrays

Write-Host "`n🔗 Lab Orders Validation" -ForegroundColor Cyan
Write-Host "========================`n" -ForegroundColor Cyan

$orderIssues = @()

# Build lab ID to 3-digit number mapping from legacy_lab_orders
$labIdToNumber = @{}
$numberToLabId = @{}

# Parse legacy_lab_orders section - match all lines with "lab-id: number" pattern after the header
$inLegacySection = $false
$configLines = $configContent -split "`n"
foreach ($line in $configLines) {
    if ($line -match '^legacy_lab_orders:') {
        $inLegacySection = $true
        continue
    }
    if ($inLegacySection) {
        # Exit section on next top-level key (no indent)
        if ($line -match '^[a-z#]' -and $line -notmatch '^\s') {
            $inLegacySection = $false
            continue
        }
        # Match lab entries (skip comments)
        if ($line -match '^\s+([\w-]+):\s*(\d+)') {
            $labId = $matches[1]
            $labNum = "{0:D3}" -f [int]$matches[2]
            $labIdToNumber[$labId] = $labNum
            $numberToLabId[$labNum] = $labId
        }
    }
}

if ($Verbose) {
    Write-Host "  📋 Loaded $($labIdToNumber.Count) lab ID mappings from legacy_lab_orders" -ForegroundColor Gray
}

# Parse lab_journeys section to get journey assignments
$labJourneys = @{}
$inJourneysSection = $false
foreach ($line in $configLines) {
    if ($line -match '^lab_journeys:') {
        $inJourneysSection = $true
        continue
    }
    if ($inJourneysSection) {
        # Exit section on next top-level key (no indent)
        if ($line -match '^[a-z#]' -and $line -notmatch '^\s') {
            $inJourneysSection = $false
            continue
        }
        # Match lab entries with journey arrays (skip comments)
        if ($line -match '^\s+([\w-]+):\s*\[([^\]]*)\]') {
            $labId = $matches[1]
            $journeys = $matches[2] -replace '"', '' -replace "'", '' -split '\s*,\s*' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            $labJourneys[$labId] = $journeys
        }
    }
}

# =====================================================
# DUPLICATE DETECTION
# =====================================================
# Check for duplicate lab IDs in the configuration

Write-Host "`n🔎 Duplicate Detection" -ForegroundColor Cyan
Write-Host "======================`n" -ForegroundColor Cyan

$duplicates = @()
if ($isSimplifiedFormat) {
    # For simplified format, check labs section for duplicate IDs
    $labIdCounts = @{}
    $inLabsSection = $false
    foreach ($line in $configLines) {
        if ($line -match '^labs:\s*$') {
            $inLabsSection = $true
            continue
        }
        if ($inLabsSection) {
            if ($line -match '^[a-z]' -and $line -notmatch '^\s') {
                $inLabsSection = $false
                continue
            }
            if ($line -match '^  ([\w-]+):\s*$') {
                $labId = $matches[1]
                if (-not $labIdCounts.ContainsKey($labId)) {
                    $labIdCounts[$labId] = 0
                }
                $labIdCounts[$labId]++
            }
        }
    }
    $duplicates = $labIdCounts.GetEnumerator() | Where-Object { $_.Value -gt 1 } | ForEach-Object { $_.Key }
}
else {
    # For legacy format, check for duplicate id: values
    $idMatches = [regex]::Matches($configContent, 'id:\s*"([^"]+)"')
    $labIdCounts = @{}
    foreach ($match in $idMatches) {
        $labId = $match.Groups[1].Value
        if (-not $labIdCounts.ContainsKey($labId)) {
            $labIdCounts[$labId] = 0
        }
        $labIdCounts[$labId]++
    }
    $duplicates = $labIdCounts.GetEnumerator() | Where-Object { $_.Value -gt 1 } | ForEach-Object { $_.Key }
}

if ($duplicates.Count -gt 0) {
    Write-Host "❌ DUPLICATE LAB IDS FOUND:" -ForegroundColor Red
    Write-Host "===========================" -ForegroundColor Red
    foreach ($dup in $duplicates) {
        Write-Host "   • $dup (appears $($labIdCounts[$dup]) times)" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "   Each lab ID must be unique in the configuration" -ForegroundColor Yellow
}
else {
    Write-Host "✅ No duplicate lab IDs found" -ForegroundColor Green
}

# =====================================================
# JOURNEY VALIDATION (Simplified Format Only)
# =====================================================
# For simplified format, validate that:
# 1. Journey lab_order arrays only reference valid labs
# 2. Labs in journeys match labs in journey order arrays (card count = nav count)

$orderIssues = @()
$cardNavMismatches = @()

if ($isSimplifiedFormat) {
    Write-Host "`n🔗 Journey Order Validation" -ForegroundColor Cyan
    Write-Host "===========================`n" -ForegroundColor Cyan
    
    # Build a map of journey -> labs from the labs section (what shows on cards)
    $labsInJourney = @{}
    $labOrders = @{}  # labId -> order number
    
    $inLabsSection = $false
    $currentLab = $null
    $currentLabJourneys = @()
    $currentLabOrder = $null
    
    foreach ($line in $configLines) {
        if ($line -match '^labs:\s*$') {
            $inLabsSection = $true
            continue
        }
        if ($inLabsSection) {
            # Exit on next top-level key
            if ($line -match '^[a-z]' -and $line -notmatch '^\s') {
                # Save last lab before exiting section
                if ($currentLab -and $currentLabJourneys.Count -gt 0) {
                    foreach ($j in $currentLabJourneys) {
                        if (-not $labsInJourney.ContainsKey($j)) { $labsInJourney[$j] = @() }
                        $labsInJourney[$j] += $currentLab
                    }
                    if ($currentLabOrder) { $labOrders[$currentLab] = $currentLabOrder }
                }
                # Reset current lab to prevent duplicate save in post-loop check
                $currentLab = $null
                $currentLabJourneys = @()
                $inLabsSection = $false
                continue
            }
            # Match lab entry (2-space indent)
            if ($line -match '^  ([\w-]+):\s*$') {
                # Save previous lab
                if ($currentLab -and $currentLabJourneys.Count -gt 0) {
                    foreach ($j in $currentLabJourneys) {
                        if (-not $labsInJourney.ContainsKey($j)) { $labsInJourney[$j] = @() }
                        $labsInJourney[$j] += $currentLab
                    }
                    if ($currentLabOrder) { $labOrders[$currentLab] = $currentLabOrder }
                }
                $currentLab = $matches[1]
                $currentLabJourneys = @()
                $currentLabOrder = $null
            }
            # Match journeys array
            if ($line -match '^\s+journeys:\s*\[([^\]]*)\]') {
                $currentLabJourneys = $matches[1] -split '\s*,\s*' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
            }
            # Match order number
            if ($line -match '^\s+order:\s*(\d+)') {
                $currentLabOrder = [int]$matches[1]
            }
        }
    }
    # Save last lab if still in section
    if ($currentLab -and $currentLabJourneys.Count -gt 0) {
        foreach ($j in $currentLabJourneys) {
            if (-not $labsInJourney.ContainsKey($j)) { $labsInJourney[$j] = @() }
            $labsInJourney[$j] += $currentLab
        }
        if ($currentLabOrder) { $labOrders[$currentLab] = $currentLabOrder }
    }
    
    # Parse journey lab_order arrays (what shows in left nav)
    $journeyOrders = @{}  # journey -> array of lab IDs
    $inJourneysSection = $false
    $currentJourney = $null
    $inLabOrder = $false
    $currentLabOrder = @()
    
    foreach ($line in $configLines) {
        if ($line -match '^journeys:\s*$') {
            $inJourneysSection = $true
            continue
        }
        if ($inJourneysSection) {
            # Exit on next top-level key
            if ($line -match '^[a-z]' -and $line -notmatch '^\s') {
                # Save last journey's lab_order
                if ($currentJourney -and $currentLabOrder.Count -gt 0) {
                    $journeyOrders[$currentJourney] = $currentLabOrder
                }
                $inJourneysSection = $false
                continue
            }
            # Match journey name (2-space indent)
            if ($line -match '^  ([\w-]+):\s*$') {
                # Save previous journey's lab_order
                if ($currentJourney -and $currentLabOrder.Count -gt 0) {
                    $journeyOrders[$currentJourney] = $currentLabOrder
                }
                $currentJourney = $matches[1]
                $currentLabOrder = @()
                $inLabOrder = $false
            }
            # Match inline lab_order array on same line
            if ($line -match '^\s+lab_order:\s*\[([^\]]+)\]\s*$' -and $currentJourney) {
                $labIds = $matches[1] -split '\s*,\s*' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
                $currentLabOrder = $labIds
            }
            # Match start of multi-line lab_order array (lab_order: or lab_order: [)
            elseif ($line -match '^\s+lab_order:\s*$' -or $line -match '^\s+lab_order:\s*\[\s*$') {
                $inLabOrder = $true
                $currentLabOrder = @()
            }
            # Parse multi-line array entries or single-line array on next line
            elseif ($inLabOrder -and $currentJourney) {
                # Check for complete inline array on its own line (e.g., "      [a, b, c]")
                if ($line -match '^\s*\[([^\]]+)\]\s*$') {
                    $labIds = $matches[1] -split '\s*,\s*' | ForEach-Object { $_.Trim() } | Where-Object { $_ }
                    $currentLabOrder = $labIds
                    $inLabOrder = $false
                }
                # Match array item (with or without trailing comma)
                elseif ($line -match '^\s+([\w-]+),?\s*$') {
                    $currentLabOrder += $matches[1]
                }
                # End of array
                if ($line -match '\]\s*$') {
                    $inLabOrder = $false
                }
            }
        }
    }
    # Save last journey
    if ($currentJourney -and $currentLabOrder.Count -gt 0) {
        $journeyOrders[$currentJourney] = $currentLabOrder
    }
    
    # Validate all referenced labs exist
    foreach ($journey in $journeyOrders.Keys) {
        $invalidLabs = $journeyOrders[$journey] | Where-Object { $_ -notin $configIds }
        if ($invalidLabs.Count -gt 0) {
            $orderIssues += [PSCustomObject]@{
                Journey     = $journey
                InvalidLabs = $invalidLabs
            }
        }
    }
    
    if ($orderIssues.Count -gt 0) {
        Write-Host "⚠️  INVALID LAB REFERENCES IN JOURNEY ORDERS:" -ForegroundColor Yellow
        Write-Host "==============================================" -ForegroundColor Yellow
        foreach ($issue in $orderIssues) {
            Write-Host "`n  📌 Journey: $($issue.Journey)" -ForegroundColor Cyan
            foreach ($lab in $issue.InvalidLabs) {
                Write-Host "    ❌ '$lab' not found in labs section" -ForegroundColor Red
            }
        }
        Write-Host ""
    }
    else {
        Write-Host "✅ All journey lab_order references are valid" -ForegroundColor Green
    }
    
    # =====================================================
    # CARD vs NAV MISMATCH VALIDATION
    # =====================================================
    # Compare labs that appear on journey cards vs labs in left nav
    
    Write-Host "`n🔄 Card vs Navigation Sync Check" -ForegroundColor Cyan
    Write-Host "================================`n" -ForegroundColor Cyan
    
    foreach ($journey in $labsInJourney.Keys | Sort-Object) {
        $cardLabs = @($labsInJourney[$journey])
        $navLabs = if ($journeyOrders.ContainsKey($journey)) { @($journeyOrders[$journey]) } else { @() }
        
        # Find labs in cards but not in nav
        $missingFromNav = $cardLabs | Where-Object { $_ -notin $navLabs }
        # Find labs in nav but not in cards (shouldn't happen, but check)
        $extraInNav = $navLabs | Where-Object { $_ -notin $cardLabs }
        
        if ($missingFromNav.Count -gt 0 -or $extraInNav.Count -gt 0) {
            $cardNavMismatches += [PSCustomObject]@{
                Journey        = $journey
                CardCount      = $cardLabs.Count
                NavCount       = $navLabs.Count
                MissingFromNav = $missingFromNav
                ExtraInNav     = $extraInNav
            }
        }
        
        if ($Verbose) {
            $status = if ($missingFromNav.Count -eq 0 -and $extraInNav.Count -eq 0) { "✅" } else { "⚠️" }
            Write-Host "  $status $journey`: Cards=$($cardLabs.Count), Nav=$($navLabs.Count)" -ForegroundColor Gray
        }
    }
    
    if ($cardNavMismatches.Count -gt 0) {
        Write-Host "⚠️  CARD vs NAVIGATION MISMATCHES:" -ForegroundColor Yellow
        Write-Host "===================================" -ForegroundColor Yellow
        foreach ($mismatch in $cardNavMismatches) {
            Write-Host "`n  📌 Journey: $($mismatch.Journey)" -ForegroundColor Cyan
            Write-Host "     Cards show: $($mismatch.CardCount) labs" -ForegroundColor Gray
            Write-Host "     Left nav shows: $($mismatch.NavCount) labs" -ForegroundColor Gray
            
            if ($mismatch.MissingFromNav.Count -gt 0) {
                Write-Host "     ❌ Missing from left nav (add to journeys.$($mismatch.Journey).lab_order):" -ForegroundColor Red
                foreach ($lab in $mismatch.MissingFromNav) {
                    Write-Host "        - $lab" -ForegroundColor Red
                }
            }
            if ($mismatch.ExtraInNav.Count -gt 0) {
                Write-Host "     ⚠️  In nav but not cards (shouldn't happen):" -ForegroundColor Yellow
                foreach ($lab in $mismatch.ExtraInNav) {
                    Write-Host "        - $lab" -ForegroundColor Yellow
                }
            }
        }
        Write-Host ""
        Write-Host "💡 Fix: Add missing labs to 'journeys.<journey>.lab_order' array in lab-config.yml" -ForegroundColor Cyan
        Write-Host ""
    }
    else {
        Write-Host "✅ All journey cards and left nav are in sync" -ForegroundColor Green
    }
}
else {
    Write-Host "`n🔗 Lab Orders Validation (Legacy Format)" -ForegroundColor Cyan
    Write-Host "========================================`n" -ForegroundColor Cyan
    Write-Host "⏭️  Skipping detailed order validation for legacy format" -ForegroundColor Gray
    Write-Host "   Consider migrating to simplified format for better validation" -ForegroundColor Gray
}

# Summary
Write-Host "`n📊 AUDIT SUMMARY" -ForegroundColor Cyan
Write-Host "================" -ForegroundColor Cyan
Write-Host "Config format: $(if ($isSimplifiedFormat) { 'Simplified (labs section)' } else { 'Legacy (lab_metadata)' })" -ForegroundColor Gray
Write-Host "Total lab folders: $($labFolders.Count)" -ForegroundColor Gray
Write-Host "Total configured: $($configIds.Count)" -ForegroundColor Gray
Write-Host "External labs: $($externalLabs.Count)" -ForegroundColor Gray
Write-Host "Missing configs: $($missingConfigs.Count)" -ForegroundColor $(if ($missingConfigs.Count -gt 0) { "Red" } else { "Green" })
Write-Host "Orphaned configs: $($orphanedConfigs.Count)" -ForegroundColor $(if ($orphanedConfigs.Count -gt 0) { "Yellow" } else { "Green" })
Write-Host "Duplicate lab IDs: $($duplicates.Count)" -ForegroundColor $(if ($duplicates.Count -gt 0) { "Red" } else { "Green" })
Write-Host "Card/Nav mismatches: $($cardNavMismatches.Count)" -ForegroundColor $(if ($cardNavMismatches.Count -gt 0) { "Yellow" } else { "Green" })

$hasIssues = $missingConfigs.Count -gt 0 -or $orphanedConfigs.Count -gt 0 -or $duplicates.Count -gt 0 -or $orderIssues.Count -gt 0 -or $cardNavMismatches.Count -gt 0

if (-not $hasIssues) {
    Write-Host "`n✨ Configuration is in sync with lab folders!`n" -ForegroundColor Green
    exit 0
}
else {
    Write-Host "`n⚠️  Configuration needs attention.`n" -ForegroundColor Yellow
    # Exit with error for critical issues (missing, orphaned, or duplicates)
    if ($missingConfigs.Count -gt 0 -or $orphanedConfigs.Count -gt 0 -or $duplicates.Count -gt 0) {
        exit 1
    }
    # Non-critical issues (card/nav mismatches) - warn but don't fail
    exit 0
}
