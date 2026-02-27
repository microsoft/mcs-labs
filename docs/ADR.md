# Architecture Decision Records (ADRs)

This document tracks important architectural decisions made during the development of the Microsoft Copilot Studio Labs project.

## ADR-001: Docker-First Development Environment

**Status**: Accepted  
**Date**: October 2025  
**Context**: Need consistent development environment across different operating systems and developer machines.

**Decision**: Use Docker and Docker Compose for all development work instead of requiring developers to install Jekyll/Ruby directly.

**Consequences**:
- ✅ Consistent environment across Windows, macOS, Linux
- ✅ No need to manage Ruby versions locally
- ✅ Easy onboarding for new developers
- ❌ Requires Docker Desktop installation
- ❌ File watching requires special configuration on Windows

**Implementation Details**:
- Must use detached mode: `docker-compose up -d jekyll-dev`
- Force polling required for Windows: `--force_polling` flag
- LiveReload configuration in both docker-compose.yml and _config.yml

---

## ADR-002: CSS-Only Styling Architecture

**Status**: Accepted  
**Date**: October 2025  
**Context**: PowerShell script was generating HTML with inline `<style>` blocks, making maintenance difficult and preventing consistent theming.

**Decision**: Remove ALL inline CSS from generated HTML. All styling must come from the main CSS file.

**Consequences**:
- ✅ Centralized styling in `assets/css/style.css`
- ✅ Consistent theme support across all pages
- ✅ Easier maintenance and updates
- ✅ Better separation of concerns
- ❌ Requires manual cleanup of existing PowerShell generation code

**Implementation Details**:
- Modified `scripts/Generate-Labs.ps1` to remove all `<style>` blocks
- Use CSS classes and semantic HTML structure
- Rely on CSS Custom Properties for theming

---

## ADR-003: CSS Custom Properties for Theme System

**Status**: Accepted  
**Date**: October 2025  
**Context**: Need to support both light and dark modes with consistent styling across all components.

**Decision**: Implement theming using CSS Custom Properties (CSS Variables) with a data-theme attribute system.

**Consequences**:
- ✅ Comprehensive theme support without code duplication
- ✅ Easy to add new themes in the future
- ✅ Consistent color system across all components
- ✅ Flash prevention possible with preload scripts
- ❌ Requires modern browser support (IE11 not supported)

**Implementation Details**:
```css
:root { /* light theme variables */ }
[data-theme="dark"] { /* dark theme overrides */ }
```

**Components**:
- Preload script prevents flash of wrong theme
- Toggle button in header
- localStorage persistence
- System preference detection

---

## ADR-004: PowerShell-Based Content Generation

**Status**: Accepted  
**Date**: October 2025  
**Context**: Large number of lab variations and configurations need to be generated programmatically.

**Decision**: Use PowerShell scripts to generate lab content rather than maintaining individual files manually.

**Consequences**:
- ✅ Single source of truth for lab configurations
- ✅ Consistent structure across all labs
- ✅ Easy to add new labs or modify existing ones
- ✅ Automatic generation of navigation and indexes
- ❌ Requires PowerShell knowledge for content updates
- ❌ Generated files should not be edited directly

**Implementation Details**:
- Main script: `scripts/Generate-Labs.ps1`
- Source content in `labs/` directory
- Generated content in `_labs/` directory (git-tracked but auto-generated)
- Support for journey-specific generation
- PDF generation capability (can be skipped for development)

---

## ADR-005: Force Polling for File Watching

**Status**: Accepted  
**Date**: October 2025  
**Context**: Jekyll file watching not working reliably in Docker on Windows, causing poor development experience.

**Decision**: Enable force polling for file watching in both Jekyll and Docker configuration.

**Consequences**:
- ✅ Reliable file change detection on Windows
- ✅ Automatic site regeneration during development
- ✅ LiveReload works consistently
- ❌ Higher CPU usage due to polling
- ❌ Platform-specific configuration required

**Implementation Details**:
- `--force_polling` flag in Jekyll command
- `force_polling: true` in _config.yml
- LiveReload configuration for instant updates
- Incremental builds for better performance

---

## ADR-006: Local/CI Parity for PDF Generation

**Status**: Accepted  
**Date**: October 2025  
**Context**: PDF generation was working differently in local Docker environment vs GitHub Actions, causing deployment failures when PDFs rendered correctly locally but broke in CI.

**Decision**: Maintain strict parity between local PDF generation and GitHub Actions CI/CD pipeline. Local environment must exactly match CI tools, versions, and commands.

**Consequences**:
- ✅ Prevents CI failures from PDF rendering issues
- ✅ Faster iteration - test locally instead of pushing to CI
- ✅ Consistent output for end users regardless of generation method
- ✅ Reduces debugging time and failed deployments
- ❌ Requires careful version management across environments
- ❌ Local testing mandatory before pushing PDF-related changes

**Implementation Details**:
- **Pandoc 3.1.3**: Same version in Docker (GitHub releases) and CI (pandoc/actions/setup@v1.1.1)
- **Mermaid.js v11**: Identical CDN version in both environments
- **Preprocessing**: AWK (CI) and PowerShell (local) produce identical output for callouts
- **Pandoc Commands**: Exact same flags, extensions (+raw_html+raw_attribute), working directory
- **Font Stack**: Noto Color Emoji fonts installed in both environments
- **Testing Requirement**: `.\scripts\Generate-Labs.ps1 -GeneratePDFs` before pushing changes

**Related Files**:
- `.github/workflows/build-and-deploy.yml` (CI)
- `scripts/Generate-Labs.ps1` (Local)
- `Dockerfile` (Pandoc 3.1.3 installation)
- `.github/scripts/generate-pdf.js` (PDF generation)

---

## ADR-007: Single Source of Truth for Lab Metadata

**Status**: Accepted  
**Date**: October 2025  
**Context**: Lab metadata (duration, difficulty) existed in multiple places - README files and lab-config.yml were getting out of sync, causing incorrect values to display on lab pages.

**Decision**: Make `lab-config.yml` the single source of truth for lab metadata. PowerShell script overrides README-parsed values with config values.

**Consequences**:
- ✅ Single file to update for metadata changes
- ✅ Handles duration ranges (60-75 minutes) that regex can't parse
- ✅ Consistent values across all pages and PDFs
- ✅ Easier to maintain and audit metadata
- ❌ README table and config can drift if not careful
- ❌ Requires regeneration of Jekyll files after config updates

**Implementation Details**:
```powershell
# In Generate-Labs.ps1 - Override README values with config
if ($Config.lab_metadata) {
    foreach ($order in $Config.lab_metadata.Keys) {
        $configLab = $Config.lab_metadata[$order]
        if ($configLab.id -eq $folder.Name) {
            $lab.difficulty = [int]$matches[1]  # Extract from "Level 200"
            $lab.duration = [int]$configLab.duration
            break
        }
    }
}
```

**Related Files**:
- `lab-config.yml` (source of truth)
- `_data/lab-config.yml` (symbolic link to root)
- `scripts/Generate-Labs.ps1` (override logic)
- `_layouts/lab.html` (displays metadata)

---

## ADR-008: Automatic Configuration Synchronization

**Status**: Accepted  
**Date**: October 2025  
**Context**: `lab-config.yml` existed in two locations (root and `_data/`) and was getting out of sync, causing stale metadata to be used by Jekyll. Initial approach using symbolic links failed in GitHub Actions CI with `Errno::ELOOP` error.

**Decision**: Maintain `lab-config.yml` at root as single source of truth, with automatic file copy to `_data/` directory during lab generation.

**Consequences**:
- ✅ Single file to maintain - no manual duplication
- ✅ Jekyll always uses latest config values after generation
- ✅ Eliminates configuration drift
- ✅ Works in all environments (local, CI, Windows, Mac, Linux)
- ✅ No symlink compatibility issues
- ❌ Requires running generation script to sync changes
- ❌ Two files exist in git (but one is auto-generated)

**Why Not Symbolic Links?**:
Symbolic links seemed ideal but failed in GitHub Actions with:
```
Errno::ELOOP - Too many levels of symbolic links @ rb_sysopen - /home/runner/work/mcs-labs/mcs-labs/_data/lab-config.yml
```
CI runners don't handle symlinks the same way as local filesystems.

**Implementation Details**:
```powershell
# In scripts/Generate-Labs.ps1 - Automatic sync after generation
Write-Host "`n📋  Syncing configuration..." -ForegroundColor Yellow
$sourceConfig = Join-Path $Paths.root "lab-config.yml"
$destConfig = Join-Path $Paths.root "_data/lab-config.yml"
if (Test-Path $sourceConfig) {
    Copy-Item -Path $sourceConfig -Destination $destConfig -Force
    Write-Host "✅  Synced lab-config.yml to _data/ directory" -ForegroundColor Green
}
```

**Workflow**:
1. Edit `lab-config.yml` (root) to update metadata
2. Run `.\scripts\Generate-Labs.ps1` to generate Jekyll files
3. Script automatically copies config to `_data/` directory
4. Jekyll uses synced config for site generation

**Related Files**:
- `lab-config.yml` (source of truth)
- `_data/lab-config.yml` (auto-synced copy)
- `scripts/Generate-Labs.ps1` (sync logic)

---

## ADR-009: Theme Loading Optimization

**Status**: Accepted  
**Date**: October 2025  
**Context**: Loading both theme CSS files simultaneously caused a visible flash when navigating between pages, degrading user experience.

**Decision**: Load only the active theme CSS file synchronously during page load, with FOUC (Flash of Unstyled Content) prevention.

**Consequences**:
- ✅ Eliminates navigation flash
- ✅ Faster page load (only one CSS file)
- ✅ Smooth 150ms fade-in transition
- ✅ Better perceived performance
- ❌ Theme switching requires CSS file swap (brief delay)
- ❌ More complex JavaScript for theme management

**Implementation Details**:
```javascript
// In default.html - Inline script runs before rendering
(function () {
  const savedTheme = localStorage.getItem("theme-family") || "rich";
  document.documentElement.setAttribute("data-theme-family", savedTheme);
  
  // Load only active theme CSS synchronously
  const themePath = '/mcs-labs/assets/css/themes/theme-' + savedTheme + '.css';
  document.write('<link rel="stylesheet" href="' + themePath + '" id="active-theme-css">');
  
  setTimeout(() => document.documentElement.classList.add('theme-ready'), 50);
})();
```

**CSS FOUC Prevention**:
```css
html:not(.theme-ready) body {
  visibility: hidden;
  opacity: 0;
}
html.theme-ready body {
  visibility: visible;
  opacity: 1;
  transition: opacity 0.15s ease-in;
}
```

**Related Files**:
- `_layouts/default.html` (inline script)
- `assets/js/theme-manager.js` (theme switching)
- `assets/css/themes/theme-rich.css`
- `assets/css/themes/theme-minimal.css`

---

## Future Considerations

### ADR-010: Mermaid Diagram Rendering Strategy (Implemented)

**Status**: Accepted  
**Date**: October 2025  
**Context**: Mermaid diagrams needed to render in both web portal and PDFs with proper theming and spacing.

**Decision**: Use Markdown code fences for Mermaid diagrams with JavaScript transformation for web rendering.

**Implementation**:
- Source: ` ```mermaid` in README files
- Web: JavaScript converts to `<div class="mermaid">` using `innerHTML` (preserves HTML)
- PDF: Puppeteer + Mermaid.js v11 renders to static SVG
- BR tags: `<br/>` supported in Mermaid syntax for line breaks

**Related Files**:
- `_layouts/default.html` (code block converter JavaScript)
- `.github/scripts/generate-pdf.js` (Mermaid v11 rendering)
- `labs/guildhall-custom-mcp/README.md` (example with BR tags)

### ADR-011: Component-Based Architecture (Proposed)

**Status**: Under Consideration  
**Context**: As the project grows, we may need more modular CSS and HTML components.

**Potential Decision**: Implement a component-based architecture using Jekyll includes and modular CSS.

**Considerations**:
- Would improve maintainability
- Better code reuse across labs
- More complex build process
- Need to evaluate impact on generation scripts

### ADR-011: Component-Based Architecture (Proposed)

**Status**: Under Consideration  
**Context**: As the project grows, we may need more modular CSS and HTML components.

**Potential Decision**: Implement a component-based architecture using Jekyll includes and modular CSS.

**Considerations**:
- Would improve maintainability
- Better code reuse across labs
- More complex build process
- Need to evaluate impact on generation scripts

### ADR-012: Build Pipeline Optimization (Proposed)

**Status**: Under Consideration  
**Context**: Build times may become an issue as content grows.

**Potential Decision**: Implement build caching and optimization strategies.

**Considerations**:
- Faster development cycles
- More complex CI/CD setup
- Dependency management complexity

---

## ADR-012: Simplified Single-Source Configuration Format

**Status**: Accepted  
**Date**: December 2025  
**Context**: Lab configuration was fragmented across multiple YAML sections (`lab_metadata`, `lab_orders`, `lab_journeys`, and per-event `*_lab_orders`). Adding a new lab required updating 3-6 different places, leading to errors and inconsistencies.

**Decision**: Consolidate all lab configuration into a single `labs:` section where each lab is defined once with all its properties (title, difficulty, duration, section, order, journeys, events).

**Consequences**:
- ✅ Adding a lab requires ONE entry instead of 3-6
- ✅ All lab properties visible in one place
- ✅ Eliminates sync issues between metadata and orders
- ✅ Simpler onboarding for new contributors
- ✅ Easier to audit and validate configuration
- ❌ Requires migration from legacy format (one-time)
- ❌ Scripts need conversion layer for backward compatibility

**Implementation Details**:

**New Simplified Format**:
```yaml
labs:
  my-lab-name:                    # Must match folder name in labs/
    title: "My Lab Title"
    difficulty: "Intermediate"    # Beginner, Intermediate, Advanced
    duration: 45                  # Minutes
    section: intermediate         # core, intermediate, advanced, specialized, optional, external
    order: 225                    # Sort order (100-699 range)
    journeys: [developer]         # Learning paths
    events: [bootcamp]            # Optional: event pages
    external:                     # Optional: for external labs
      url: "https://..."
      repository: "org/repo"
```

**Order Numbering Scheme**:
- 100-199: Core Learning Path (beginner essentials)
- 200-299: Intermediate Labs
- 300-399: Advanced Labs
- 400-499: Specialized Labs
- 500-599: Optional Labs
- 600-699: External Labs

**Conversion Layer**:
- `Convert-SimplifiedConfig` function in Generate-Labs.ps1 transforms new format to legacy structures
- `Export-ConfigAsYaml` serializes converted config for Jekyll templates
- Jekyll templates continue working without modification

**Enhanced Audit**:
- Check-LabConfigs.ps1 now validates:
  - Missing/orphaned config entries
  - Duplicate lab IDs
  - Card vs navigation count mismatches
  - Invalid journey references

**Related Files**:
- `lab-config.yml` (simplified format)
- `scripts/Generate-Labs.ps1` (conversion and YAML export)
- `scripts/Check-LabConfigs.ps1` (enhanced validation)
- `docs/NEW_LAB_CHECKLIST.md` (simplified instructions)

---

**Template for New ADRs**:

```markdown
## ADR-XXX: [Title]

**Status**: [Proposed|Accepted|Rejected|Superseded]  
**Date**: [Date]  
**Context**: [What is the issue that we're seeing that is motivating this decision or change?]

**Decision**: [What is the change that we're proposing and/or doing?]

**Consequences**: [What becomes easier or more difficult to do because of this change?]
- ✅ Positive consequences
- ❌ Negative consequences

**Implementation Details**: [How is this implemented? Code examples, configuration, etc.]
```