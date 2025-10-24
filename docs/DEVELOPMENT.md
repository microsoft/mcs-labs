# Development Guide

This document contains essential information for developing the Microsoft Copilot Studio Labs project.

## 🏗️ Architecture Overview

### Tech Stack
- **Static Site Generator**: Jekyll (Ruby-based)
- **CSS Framework**: Custom CSS with CSS Custom Properties
- **Content Generation**: PowerShell scripts
- **PDF Generation**: Pandoc 3.1.3 + Puppeteer + Mermaid.js v11
- **Containerization**: Docker & Docker Compose
- **Deployment**: GitHub Pages

### Key Architectural Decisions

1. **Docker-First Development**: We use Docker containers for consistent development environment across different machines
2. **Separation of Concerns**: All styling is handled in main CSS file, NOT in generated HTML
3. **Dynamic Content Generation**: Labs are generated from PowerShell scripts, not manually created
4. **Multi-Theme System**: CSS Custom Properties with theme families (Rich/Minimal) and mode variants (Light/Dark) support
5. **🎯 Local/CI Parity (CRITICAL)**: Local PDF generation MUST exactly match GitHub Actions to prevent deployment failures

### 🎯 Local/CI Parity Principle

**CRITICAL FOR ALL CONTRIBUTORS**: 

This project maintains strict parity between local development and CI/CD environments. This means:

- **Same Tools, Same Versions**: Pandoc 3.1.3, Mermaid.js v11, Node.js 18
- **Identical Commands**: Pandoc flags, extensions, and working directories match exactly
- **Same Preprocessing**: AWK (CI) and PowerShell (local) produce identical output
- **Same Configuration**: CSS, fonts, rendering settings are identical

**Why This Matters**:
- Prevents CI failures from PDF rendering issues
- Enables faster iteration (test locally, not in CI)
- Ensures consistent output for end users
- Reduces debugging time and failed deployments

**Before Pushing Any Changes**:
```powershell
# ALWAYS test locally if you modified:
# - Lab markdown content
# - PDF generation scripts
# - Pandoc configuration
# - Mermaid diagrams
# - Callout preprocessing

.\scripts\Generate-Labs.ps1 -GeneratePDFs
```

See [LOCAL_PDF_GENERATION.md](LOCAL_PDF_GENERATION.md) for complete details.

## 🚀 Development Environment Setup

### Prerequisites
- Docker Desktop
- Git
- PowerShell (for content generation)

### PowerShell Environment Notes

**⚠️ IMPORTANT**: This project is developed on Windows and uses PowerShell syntax throughout. When working with the terminal commands:

- Use PowerShell cmdlets instead of Unix commands:
  - `Remove-Item -Recurse -Force` instead of `rm -rf`
  - `Get-ChildItem` instead of `ls`
  - `Select-Object -Last 5` instead of `tail -5`
  - `Copy-Item` instead of `cp`
- PowerShell scripts use `.ps1` extension and require execution policy configuration
- Docker commands work the same across platforms, but file operations should use PowerShell syntax

### Starting Development Server

```bash
# Start Jekyll development server (REQUIRED: detached mode with force polling)
docker-compose up -d jekyll-dev

# Check logs
docker-compose logs -f jekyll-dev

# 🌐 Site will be available at: http://localhost:4000/mcs-labs/
# Note: The /mcs-labs/ path is required for local testing
```

**⚠️ CRITICAL**: Always use `-d` (detached) flag and ensure `--force_polling` is in docker-compose.yml for proper file watching on Windows.

## 🚀 **REQUIRED: First-Time Setup**

After cloning the repository, you **MUST** generate the content files before the site will work:

```powershell
# REQUIRED: Generate all Jekyll content from lab sources
pwsh -ExecutionPolicy Bypass -File scripts/Generate-Labs.ps1 -SkipPDFs
```

This generates:
- ✅ `index.md` - Homepage with journey cards
- ✅ `labs/index.md` - Labs listing page  
- ✅ `_labs/*.md` - Individual lab files
- ✅ All dynamic content from `lab-config.yml`

**🚫 These files are NOT in the repository** - they're auto-generated and git-ignored.

After generation, start the development server:

```bash
docker-compose up -d
```

🌐 **Site will be available at**: `http://localhost:4000/mcs-labs/`

### File Watching Configuration

Jekyll file watching requires specific configuration in Docker on Windows:

```yaml
# In docker-compose.yml
command: bundle exec jekyll serve --host 0.0.0.0 --livereload --livereload-port 35729 --incremental --force_polling
```

```yaml
# In _config.yml
livereload: true
livereload_port: 35729
incremental: true
force_polling: true
```

## 📁 Project Structure

```
mcs-labs/
├── _layouts/           # Jekyll layout templates
│   ├── default.html    # Main site layout with theme toggle
│   └── lab.html        # Individual lab page layout
├── assets/css/         # Stylesheets
│   └── style.css       # Main CSS with theme support
├── scripts/            # Content generation
│   └── Generate-Labs.ps1  # Main lab generation script
├── labs/               # Source lab content
├── _labs/              # Generated lab files (auto-generated)
├── docs/               # Documentation
└── docker-compose.yml  # Development environment
```

## 🔄 Content Generation Workflow

### Lab Content Generation

**IMPORTANT**: All lab content is generated via PowerShell scripts. Never edit files in `_labs/` directly.

```bash
# Generate all labs (skip PDFs for faster development)
pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs

# Generate specific journey
pwsh -File scripts/Generate-Labs.ps1 -SelectedJourneys "developer" -SkipPDFs
```

> **💡 Pro Tip for Faster Testing**: Always use the `-SkipPDFs` flag during development! PDF generation can take several minutes and is usually not needed for testing layout, styling, or content changes. Only generate PDFs when you need to test the final output or before production deployment.

### Key Rules for Content Generation

1. **CSS Architecture**: Remove ALL `<style>` blocks from PowerShell-generated HTML
2. **Styling Source**: All styling MUST come from `assets/css/style.css`
3. **Theme Support**: Use CSS Custom Properties (CSS variables) for theme-able properties
4. **Clean HTML**: Generated HTML should contain NO inline styles

## ⚠️ CRITICAL: Generated Files Warning

**DO NOT MANUALLY EDIT THESE FILES** - They are automatically generated and will be overwritten:

### Files Generated by `scripts/Generate-Labs.ps1`:
- 🚫 **`index.md`** - Root homepage generated from `lab-config.yml` journey definitions
- 🚫 **`labs/index.md`** - Labs listing page generated from lab discovery
- 🚫 **`_labs/*.md`** - Individual lab files generated from lab folders and configuration

### Safe to Edit:
- ✅ **`assets/css/style.css`** - Main stylesheet (never touched by scripts)
- ✅ **`_layouts/*.html`** - Jekyll templates and layouts  
- ✅ **`_config.yml`** - Jekyll configuration
- ✅ **`lab-config.yml`** - Source of truth for journeys and lab assignments
- ✅ **`docs/`** - Documentation files
- ✅ **Lab content in `labs/*/README.md`** - Source content (gets processed, not overwritten)

### Workflow for Content Changes:
1. **For journey/homepage changes**: Edit `lab-config.yml` → Run generation script
2. **For styling changes**: Edit CSS and layout files directly
3. **For lab content changes**: Edit `labs/*/README.md` files → Run generation script

> **💡 Remember**: The generation script creates Jekyll-compatible files from your lab sources. Always run `pwsh scripts/Generate-Labs.ps1 -SkipPDFs` after making configuration changes!

### Modifying Lab Generation

When editing `scripts/Generate-Labs.ps1`:

1. **Never add inline CSS**: Use CSS classes and let main CSS handle styling
2. **Test generation**: Always run the script after changes
3. **Clean architecture**: HTML structure only, styling in CSS only

## 🎨 Theme System

### Modern Multi-Theme Architecture

The site now supports multiple theme families with light/dark variants:

```css
/* Theme family variables in theme-minimal.css */
:root {
    --bg-primary: white;
    --text-primary: #34343c;
    --heading-color: #2a2a2a;
    /* ... */
}

[data-theme="dark"] {
    /* Dark mode overrides */
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
    /* ... */
}

/* Theme-specific component overrides */
html[data-theme-family="minimal"] .lab-card {
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px var(--shadow);
}
```

### Theme System Implementation

- **Theme Families**: Rich vs Minimal design approaches
- **Mode Variants**: Light and Dark modes within each family
- **Dynamic Loading**: Theme CSS files loaded asynchronously via theme-manager.js
- **FOUC Prevention**: Immediate theme detection prevents flash of unstyled content
- **Data Attributes**: `data-theme-family` and `data-theme` applied to HTML element
- **Local Storage**: Separate storage for theme family and mode preferences

### Theme File Structure

```
assets/css/themes/
├── theme-rich.css     # Rich theme family (colorful, gradients)
└── theme-minimal.css  # Minimal theme family (clean, blog-style)
```

## 📱 Mobile Responsive Features

### Mobile Table of Contents (TOC)

The site includes a sophisticated mobile navigation system for lab pages:

**Features:**
- **Floating Action Button**: Appears on screens ≤ 1366px in bottom-right corner
- **Full-Screen Overlay**: Semi-transparent backdrop with slide-in panel
- **Multi-Level Navigation**: Supports both h2 (sections) and h3 (subsections) headings
- **Auto-Close Behavior**: Closes when clicking links or outside the panel
- **Smooth Scrolling**: Animated scroll to sections when TOC links are clicked

**Responsive Breakpoint:**
- **Desktop**: Sidebar TOC visible, floating button hidden (> 1366px)
- **Tablet/Mobile**: Sidebar hidden, floating button visible (≤ 1366px)

**Implementation:**
- HTML structure in `_layouts/lab.html` (lines 232-271)
- JavaScript handlers in `_layouts/lab.html` (lines 1290-1340)
- CSS styling in `assets/css/style.css` (lines 820-995)

### Why 1366px Breakpoint?

We use 1366px instead of the traditional 1024px to accommodate:
- Modern tablets in landscape mode
- Smaller laptop screens
- Better readability on medium-sized devices
- Smoother transition between mobile and desktop layouts

## 🎨 Mermaid Diagram Support

### Interactive Diagram Rendering

The site supports Mermaid.js v11 for creating interactive diagrams directly in markdown:

**Features:**
- **Theme Integration**: Diagrams automatically adapt to light/dark modes
- **Dynamic Re-rendering**: Diagrams update colors when theme changes
- **Rich Diagram Types**: Sequence, flowchart, class, state, Gantt, and more
- **Responsive Design**: Diagrams scale appropriately on mobile devices

**Usage Example:**
```html
<div class="mermaid">
sequenceDiagram
    participant User
    participant System
    User->>System: Request
    System-->>User: Response
</div>
```

**Real-World Example:**
See `labs/guildhall-custom-mcp/README.md` for OAuth authentication flow diagram (47 lines, replaces static PNG image).

**Implementation:**
- Mermaid v11 ESM module loaded from CDN
- Theme detection and configuration in `_layouts/default.html` (lines 346-407)
- Custom color variables for 20+ diagram elements
- Event-driven re-rendering on theme changes
- Original code preservation for clean re-rendering

**Styling:**
- Responsive containers with max-width and auto margins
- Theme-aware colors synchronized with site themes
- Custom CSS in `assets/css/style.css` (lines 3097-3137)

## � PDF Generation System

### Overview

PDFs are generated from lab markdown files using a multi-stage pipeline that ensures parity between **local development** (Docker) and **production** (GitHub Actions).

**Critical Requirement**: Both environments use **identical versions** of all tools to ensure consistent output.

### Technology Stack

| Tool           | Version  | Purpose                                            |
| -------------- | -------- | -------------------------------------------------- |
| **Pandoc**     | 3.1.3    | Markdown → HTML conversion with embedded resources |
| **Node.js**    | 18       | JavaScript runtime for Puppeteer                   |
| **Puppeteer**  | Latest   | Headless Chrome for PDF generation                 |
| **Mermaid.js** | v11      | Diagram rendering in PDFs                          |
| **Rouge**      | (Jekyll) | Syntax highlighting (embedded in HTML)             |

### PDF Generation Pipeline

```
labs/{lab-name}/README.md
  ↓ (1) Markdown Preprocessing
labs/{lab-name}/{lab-name}_processed.md
  ↓ (2) Pandoc HTML Conversion
dist/{lab-name}/{lab-name}.html
  ↓ (3) HTML Post-Processing
dist/{lab-name}/{lab-name}.html (cleaned)
  ↓ (4) Mermaid Rendering + PDF Generation
assets/pdfs/{lab-name}.pdf
```

### Stage 1: Markdown Preprocessing

**Purpose**: Transform GitHub-style callouts and remove duplicate headers.

**Callout Processing:**
```powershell
# GitHub-style alerts → HTML divs
> [!NOTE]        → <div class="note">**Note:** ...</div>
> [!TIP]         → <div class="tip">**Tip:** ...</div>
> [!IMPORTANT]   → <div class="important">**Important:** ...</div>
> [!WARNING]     → <div class="warning">**Warning:** ...</div>
> [!CAUTION]     → <div class="caution">**Caution:** ...</div>
```

**Implementation:**
- **GitHub Actions**: AWK script in `.github/workflows/build-and-deploy.yml` (lines 127-150)
- **Local (PowerShell)**: `scripts/Generate-Labs.ps1` (lines 490-530)

**Key Feature**: Supports **indented callouts** (e.g., inside lists):
```markdown
1. Step one
   > [!NOTE]
   > This callout is indented and still processes correctly
```

**Regex Pattern**: `^([[:space:]]*)> \[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\]`

### Stage 2: Pandoc HTML Conversion

**Purpose**: Convert preprocessed markdown to self-contained HTML with embedded images.

**Critical Command** (must run from lab directory):
```bash
cd labs/{lab-name}/
pandoc {lab-name}_processed.md \
  -o ../../dist/{lab-name}/{lab-name}.html \
  --standalone \
  --embed-resources \
  --css='../../.github/styles/html.css' \
  --html-q-tags \
  --section-divs \
  --id-prefix='' \
  --metadata title="Lab Title" \
  --metadata lang='en' \
  -f markdown+auto_identifiers+gfm_auto_identifiers+emoji \
  -t html5
```

**Why run from lab directory?**
- `--embed-resources` converts image paths like `images/screenshot.png` to embedded base64
- Running from lab directory ensures Pandoc finds images in `labs/{lab-name}/images/`
- Prevents "image not found" errors that occur when running from `dist/` directory

**Pandoc 3.1.3 Features:**
- `--embed-resources`: Embeds all images, CSS, and assets into HTML
- `--standalone`: Generates complete HTML document with `<head>` and `<body>`
- `--section-divs`: Wraps sections in `<div>` for better styling
- GFM auto identifiers: GitHub-flavored markdown link compatibility

### Stage 3: HTML Post-Processing

**Purpose**: Clean up Pandoc-generated HTML for better PDF rendering.

**Operations** (using sed in Docker):
```bash
# Remove Pandoc's title block header (redundant in PDFs)
sed -i '/<header id="title-block-header">/,/<\/header>/d' {html-file}

# Remove empty id attributes (cleaner HTML)
sed -i 's/id=""//g' {html-file}

# Add target="_blank" to external links (PDF accessibility)
sed -i 's/<a href="\(https\?:\/\/[^"]*\)"/<a href="\1" target="_blank" rel="noopener noreferrer"/g' {html-file}
```

### Stage 4: Mermaid Rendering + PDF Generation

**Purpose**: Render interactive Mermaid diagrams and generate print-ready PDFs.

**Implementation**: `.github/scripts/generate-pdf.js`

**Process:**
1. **Load HTML** in headless Chrome (Puppeteer)
2. **Detect Mermaid diagrams**:
   ```javascript
   const hasMermaid = await page.evaluate(() => {
     return document.querySelectorAll('.mermaid, div.mermaid').length > 0;
   });
   ```
3. **Inject Mermaid.js** from CDN if diagrams found
4. **Configure Mermaid** with PDF-friendly settings:
   ```javascript
   mermaid.initialize({
     startOnLoad: false,
     theme: 'default',
     sequence: { useMaxWidth: true, wrap: true },
     flowchart: { useMaxWidth: true }
   });
   ```
5. **Render diagrams** to static SVG:
   ```javascript
   await mermaid.run({ querySelector: '.mermaid, div.mermaid' });
   ```
6. **Wait for rendering** (1 second for complex diagrams)
7. **Generate PDF** with Puppeteer

**PDF Configuration:**
```javascript
{
  format: 'Letter',
  margin: { top: '0.75in', bottom: '1.0in', left: '0.75in', right: '0.75in' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: `
    <div style="font-size: 10px; text-align: center; width: 100%; margin: 0 0.75in;">
      <span class="pageNumber"></span> of <span class="totalPages"></span> | ${title}
    </div>
  `
}
```

### Local vs GitHub Actions Parity

**Ensuring Consistency:**

| Component          | GitHub Actions           | Local (Docker)                | Verification       |
| ------------------ | ------------------------ | ----------------------------- | ------------------ |
| **Pandoc**         | 3.1.3 (via setup action) | 3.1.3 (manual install)        | `pandoc --version` |
| **Node.js**        | 18                       | 18                            | `node --version`   |
| **Preprocessing**  | AWK script               | PowerShell (equivalent logic) | Output comparison  |
| **Pandoc args**    | Build workflow           | Generate-Labs.ps1             | Exact match        |
| **HTML cleanup**   | sed commands             | sed in Docker                 | Exact match        |
| **PDF generation** | generate-pdf.js          | Same file                     | Shared code        |

**Docker Pandoc Installation** (`Dockerfile` lines 10-27):
```dockerfile
# Install Pandoc 3.1.3 (matching GitHub Actions version)
RUN wget https://github.com/jgm/pandoc/releases/download/3.1.3/pandoc-3.1.3-1-amd64.deb \
    && dpkg -i pandoc-3.1.3-1-amd64.deb \
    && rm pandoc-3.1.3-1-amd64.deb
```

**Why specific version?**
- `--embed-resources` flag requires Pandoc 3.x
- Older versions use deprecated `--self-contained`
- Ensures identical output between local and CI

### Common PDF Issues & Solutions

**Problem**: Images showing as alt text instead of embedded images
**Cause**: Pandoc running from wrong directory, can't find image files
**Solution**: Always run Pandoc from lab directory (`cd labs/{lab-name}/ && pandoc ...`)

**Problem**: Callouts not rendering (showing raw markdown)
**Cause**: Preprocessor regex not matching indented callouts
**Solution**: Use pattern `^([[:space:]]*)>` instead of `^>` to capture indentation

**Problem**: Mermaid diagrams missing from PDFs
**Cause**: Puppeteer not loading Mermaid.js library
**Solution**: Detect diagrams, inject Mermaid.js CDN, render before PDF generation

**Problem**: Pandoc version mismatch errors
**Cause**: Docker using old Pandoc from Debian packages
**Solution**: Rebuild Docker image with Pandoc 3.1.3 from GitHub releases

**Problem**: PDFs failing silently in GitHub Actions
**Cause**: Missing dependencies or wrong Node.js version
**Solution**: Check workflow logs, ensure Pandoc setup action completed successfully

### Development Workflow

**Testing PDFs locally:**
```powershell
# Clean previous output
Remove-Item -Path "assets/pdfs" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue

# Generate PDFs for all labs
.\scripts\Generate-Labs.ps1

# Generate PDFs for specific journey only
.\scripts\Generate-Labs.ps1 -SelectedJourneys @("developer")

# Skip PDFs during rapid iteration (much faster!)
.\scripts\Generate-Labs.ps1 -SkipPDFs
```

**Debugging:**
```bash
# Check Pandoc version in Docker
docker-compose exec jekyll-dev pandoc --version

# View PDF generation logs
docker-compose logs -f jekyll-dev

# Test Pandoc manually
docker-compose exec jekyll-dev bash
cd /workspace/labs/agent-builder-web/
pandoc README.md -o test.html --embed-resources
```

### Best Practices

**For Lab Authors:**
1. ✅ Test PDFs locally before pushing to GitHub
2. ✅ Use relative image paths: `images/screenshot.png` (not absolute)
3. ✅ Test Mermaid diagrams in both web view and PDF
4. ✅ Use appropriate callout types for context ([!NOTE], [!WARNING], etc.)
5. ✅ Keep Mermaid diagrams simple for better PDF rendering

**For Developers:**
1. ✅ Always match Pandoc versions between local and CI
2. ✅ Run Pandoc from lab directory for correct image resolution
3. ✅ Use `--embed-resources` instead of deprecated `--self-contained`
4. ✅ Test callout preprocessing with indented examples
5. ✅ Clean `dist/` and `assets/pdfs/` before final testing

**For CI/CD:**
1. ✅ Pin Pandoc version in GitHub Actions (`pandoc/actions/setup@v1.1.1`)
2. ✅ Verify all prerequisites (Node.js 18, Puppeteer dependencies)
3. ✅ Check workflow logs for PDF generation errors
4. ✅ Test with labs containing all features (callouts, Mermaid, images, code blocks)

### Further Reading

See **[LOCAL_PDF_GENERATION.md](./LOCAL_PDF_GENERATION.md)** for:
- Complete local PDF generation guide
- Docker setup instructions
- Troubleshooting common issues
- FAQ and best practices

## �💻 Code Syntax Highlighting

### Jekyll Rouge Integration

The site uses Jekyll's built-in Rouge syntax highlighter for server-side code highlighting:

**Features:**
- **Server-side rendering**: Syntax highlighting happens during Jekyll build (faster page loads)
- **Opt-in by default**: Only code blocks with explicit language tags get highlighted
- **Plain text by default**: Unlabeled code blocks are treated as plain text
- **No JavaScript required**: Highlighting works even with JavaScript disabled
- **Theme-aware styling**: Custom GitHub-style colors for light/dark modes
- **Support for 100+ languages**: Including JavaScript, TypeScript, Python, C#, JSON, YAML, Bash, PowerShell, SQL, XML, and more

**Configuration:**
```yaml
# In _config.yml
highlighter: rouge
kramdown:
  syntax_highlighter: rouge
  syntax_highlighter_opts:
    css_class: 'highlight'
```

**Usage in Markdown:**

For code with syntax highlighting (explicitly specify language):
````markdown
```javascript
function hello() {
  console.log("Hello, world!");
}
```
````

For plain text (no language tag needed):
````markdown
```
Extract Contract Number, Customer name, Vendor name and Date from {ContractInput}
Customer Name: Adventure Works
Vendor Name: Contoso Solutions Inc.
```
````

You can also explicitly mark as plain text:
````markdown
```text
Your plain text instructions here
```
````

**How It Works:**
1. Rouge processes code blocks during Jekyll build
2. Generates semantic HTML with class names (e.g., `.kd` for keywords, `.nx` for names)
3. CSS in `assets/css/style.css` provides colors for each token type
4. Theme switching updates colors via CSS variables

**Supported in lab content:**
- Instructions to copy and paste (plain text)
- Configuration text (plain text)
- Sample data (plain text)
- Actual code snippets (highlighted with language tags)

**Implementation Details:**
- Rouge configuration in `_config.yml`
- Syntax highlighting CSS in `assets/css/style.css` with `.highlight` classes
- Light/dark theme colors defined with `[data-theme="dark"]` selectors
- GitHub-style color scheme matching the site's design system

## 🎨 Theme System

### Modern Multi-Theme Architecture

The site now supports multiple theme families with light/dark variants:

```css
/* Theme family variables in theme-minimal.css */
:root {
    --bg-primary: white;
    --text-primary: #34343c;
    --heading-color: #2a2a2a;
    /* ... */
}

[data-theme="dark"] {
    /* Dark mode overrides */
    --bg-primary: #1a1a1a;
    --text-primary: #ffffff;
    /* ... */
}

/* Theme-specific component overrides */
html[data-theme-family="minimal"] .lab-card {
    border: 1px solid var(--border-color);
    box-shadow: 0 1px 3px var(--shadow);
}
```

### Theme System Implementation

- **Theme Families**: Rich vs Minimal design approaches
- **Mode Variants**: Light and Dark modes within each family
- **Dynamic Loading**: Theme CSS files loaded asynchronously via theme-manager.js
- **FOUC Prevention**: Immediate theme detection prevents flash of unstyled content
- **Data Attributes**: `data-theme-family` and `data-theme` applied to HTML element
- **Local Storage**: Separate storage for theme family and mode preferences

### Theme File Structure

```
assets/css/themes/
├── theme-rich.css     # Rich theme family (colorful, gradients)
└── theme-minimal.css  # Minimal theme family (clean, blog-style)
```

### Adding New Themed Components

1. Define CSS Custom Properties for colors in theme files
2. Use properties in base component styles in `style.css`
3. Add theme-specific overrides using `html[data-theme-family="theme-name"]` selectors
4. Test across all theme families and modes
5. Update `THEME_SYSTEM.md` documentation

### Theme Development Best Practices

- **Use CSS Variables**: Always use custom properties for theme-able values
- **Specific Selectors**: Use data attribute selectors for theme-specific overrides
- **Component Isolation**: Override specific components without affecting others
- **Consistent Naming**: Follow established variable naming conventions
- **Test All Variants**: Verify styling in all theme family/mode combinations

### GitHub Copilot Integration

#### **AI-Assisted Theme Development**
When working with GitHub Copilot on theme-related tasks, provide this context:

**Current Setup:**
- Multi-theme system with Rich/Minimal families and Light/Dark modes
- CSS variables in `/assets/css/themes/` directory
- Theme overrides use `html[data-theme-family="name"]` selectors
- JavaScript theme manager with family/mode separation

**Effective Prompts:**
```
"Help me create minimal theme styling for [component] using neutral colors and existing CSS variables like --bg-primary, --text-primary, --border-color"

"I need to add theme-specific override for .lab-card component in the minimal theme. Use the pattern html[data-theme-family='minimal'] and ensure it works with both light and dark modes"

"Debug this theme switching issue: [describe problem]. The theme manager uses applyTheme(family, mode) and sets data-theme-family attribute"
```

#### **Code Pattern Recognition**
GitHub Copilot should recognize these established patterns:
- CSS variables for all theme-able properties
- `html[data-theme-family="name"]` for theme-specific overrides
- ThemeManager API methods for JavaScript interactions
- Minimal theme uses neutral colors, Rich theme uses vibrant colors

### Theme Testing Pages

#### **Visual Testing - `theme-test.md`**
Navigate to `/theme-test.html` to test UI component rendering:
- Displays sample lab cards, buttons, typography
- Use header theme controls to switch between themes
- Verify visual consistency across all theme combinations

## 🐛 Common Development Issues

### Jekyll Not Detecting File Changes

**Problem**: Changes to files not triggering Jekyll regeneration

**Solution**: Ensure force polling is enabled:
```bash
docker-compose restart jekyll-dev
```

### Theme System Not Working

**Problem**: Themes not switching or JavaScript errors in browser console

**Solutions**:
- Check `theme-manager.js` for syntax errors
- Verify theme CSS files are accessible
- Check browser console for network errors
- Ensure `data-theme-family` and `data-theme` attributes are set on HTML element
- Use GitHub Copilot to help debug theme manager API calls and JavaScript issues

### Theme-Specific Styles Not Applied

**Problem**: Theme overrides not taking effect

**Solutions**:
- Check CSS selector specificity - use `html[data-theme-family="name"]` for sufficient specificity
- Verify theme CSS file is loaded (check Network tab in DevTools)
- Ensure CSS custom properties are defined in theme files
- Test with `!important` temporarily to diagnose specificity issues
- Ask GitHub Copilot to help analyze CSS specificity conflicts

### Styling Not Applied

**Problem**: Styles not showing up in generated pages

**Solution**: 
1. Ensure CSS is in `assets/css/style.css`
2. Remove any `<style>` blocks from PowerShell scripts
3. Use CSS classes, not inline styles

### Docker Issues

**Problem**: Container won't start or file watching broken

**Solution**:
```bash
# Full reset
docker-compose down
docker-compose up -d jekyll-dev
```

## 🔍 Debugging

### Useful Commands

```bash
# View Jekyll logs
docker-compose logs -f jekyll-dev

# Check container status
docker-compose ps

# Access container shell
docker-compose exec jekyll-dev bash

# Full rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d jekyll-dev
```

### PowerShell-Specific Commands

Since this project runs on Windows, use these PowerShell equivalents for common operations:

```powershell
# Clean Jekyll cache and generated files
Remove-Item -Recurse -Force _site, .jekyll-cache -ErrorAction SilentlyContinue

# List directory contents
Get-ChildItem _site/

# View last few lines of Docker logs
docker logs mcs-labs-dev | Select-Object -Last 10

# Copy files
Copy-Item source.txt destination.txt

# Find files
Get-ChildItem -Recurse -Filter "*.html" | Where-Object Name -like "*favicon*"

# Check if file exists
Test-Path "favicon.ico"
```

**Common Mistake**: Don't use `rm -rf`, `ls`, `tail`, `cp` commands - these are Unix/bash commands that won't work in PowerShell.

### File Locations in Container

- Workspace: `/workspace`
- Generated site: `/workspace/_site`
- Logs: Container stdout/stderr

## 📚 Additional Resources

- [Jekyll Documentation](https://jekyllrb.com/docs/)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Docker Compose](https://docs.docker.com/compose/)

---

**Last Updated**: October 2025  
**Maintainer**: Development Team

## Markdown Authoring Notes – Fenced Code Blocks in Lists

When placing a fenced code block (```) immediately after a numbered or bulleted list item, Kramdown (Jekyll's default Markdown processor) may render the fence as a separate block rather than nested under the list item unless it is indented.

Recommended pattern:

```markdown
1. Do the thing:

    ```
    Your code or multi-line instructions here
    ```
```

Key rules:
- Add a blank line after the list item text.
- Indent the opening and closing fence and all lines inside by 4 spaces (or one level of nesting) to associate the block with the list item.
- Avoid trailing stray backticks or mixing inline code with list punctuation on the same line as the fence.

### Automated Markdown Issue Detection

The generation script includes a **detection-only** capability that scans lab source files (`labs/*/README.md`) for unindented fenced code blocks that immediately follow list items. This helps authors locate formatting issues early without risking unintended automatic modifications.

Why this matters:
- Kramdown requires indentation to nest a fenced block under a list item.
- Unindented fences after numbered steps can break visual hierarchy and confuse readers.
- Detection supports manual, reviewed fixes instead of silent mutations.

Usage examples:
```powershell
# Run fast generation (skip PDFs) and report markdown issues
pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs -MarkdownDetectOnly

# Filter to a journey while detecting issues
pwsh -File scripts/Generate-Labs.ps1 -SelectedJourneys developer -SkipPDFs -MarkdownDetectOnly
```

Output format (example):
```
⚠️  Detected unindented fenced block after list item at line 162 in agent-builder-web
=== Markdown Detection Summary ===
Lab: agent-builder-web | Issues: 6 | Lines: 162, 178, 187, 193, 199, 227
Total Labs With Issues: 6 | Total Fenced Blocks: 21
=====================================
```

Fixing detected issues:
1. Open the referenced `labs/<lab-id>/README.md`.
2. Insert a blank line after the list item text if missing.
3. Indent the opening fence, all enclosed lines, and closing fence with four spaces.
4. Re-run the detection command to confirm the issue is cleared.

Best practices:
- Prefer indentation + blank line over alternative list syntaxes; it is the most reliable across Markdown renderers.
- Avoid mixing list markers and backticks on the same line (e.g., `1. ```bash`).
- Keep code fences minimal—remove trailing whitespace inside fenced blocks.

Future enhancements (deferred):
- Bullet list (`-` / `*`) fence detection.
- CI integration to surface issues in pull requests.
- Optional JSON report for tooling.

If you would like CI integration, create an issue requesting "Add Markdown Detection to CI" and reference this section.

This approach was applied in `labs/autonomous-support-agent/README.md` (steps 28 and 17 of the extended section) to fix mis-rendered instruction blocks.
