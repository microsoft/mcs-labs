# PDF Generation Guide

This guide explains how PDFs are generated for lab download functionality, both on GitHub Actions and locally.

## 🎯 Critical Design Principle: Local/CI Parity

**IMPORTANT**: Local PDF generation must exactly match GitHub Actions behavior to prevent workflow failures.

### Why This Matters
- **Prevent CI Failures**: Testing locally catches issues before they break the deployment pipeline
- **Consistent Output**: Users get identical PDFs whether generated locally or in CI
- **Faster Iteration**: Debug PDF rendering issues locally without pushing to GitHub
- **Environment Parity**: Same tools, same versions, same configuration

### How We Maintain Parity
1. **Pandoc 3.1.3**: Both environments use the exact same version from GitHub releases
2. **Mermaid.js v11**: Same CDN version loaded in both local and CI scripts
3. **Identical Preprocessing**: AWK/PowerShell callout handling produces same output
4. **Same Commands**: Pandoc flags and extensions match character-for-character
5. **Same Working Directory**: Both run Pandoc from lab directory for image resolution

### Testing Before Push
```powershell
# ALWAYS test locally before pushing changes that affect PDFs:
.\scripts\Generate-Labs.ps1 -GeneratePDFs

# For quick iteration on a single lab:
.\scripts\Generate-Labs.ps1 -SingleLabPDF "your-lab-name" -GeneratePDFs
```

## Overview

PDFs are generated from lab markdown files using a multi-stage process:
1. **Markdown Preprocessing** - Handles GitHub-style callouts, removes duplicate titles
2. **Pandoc Conversion** - Converts markdown to HTML with embedded resources
3. **Mermaid Rendering** - Renders interactive diagrams to static SVG
4. **PDF Generation** - Uses Puppeteer to generate print-ready PDFs

## GitHub Actions (Production Method)

PDFs are automatically generated when you push changes to the `main` branch.

### How It Works
1. GitHub Actions workflow (`.github/workflows/build-and-deploy.yml`) detects changes
2. For each lab in `labs/*/README.md`:
   - Preprocesses markdown (callouts, headers)
   - Converts to HTML using Pandoc 3.1.3
   - Renders Mermaid diagrams using Mermaid.js v11
   - Generates PDF using Puppeteer (`.github/scripts/generate-pdf.js`)
3. Outputs PDFs to `assets/pdfs/{lab-name}.pdf`
4. Deploys to GitHub Pages

### Process Details
```bash
# For each lab:
cd labs/{lab-name}/
pandoc {lab-name}_processed.md \
  -o ../../dist/{lab-name}/{lab-name}.html \
  --standalone \
  --embed-resources \
  --css='../../.github/styles/html.css' \
  --html-q-tags \
  --section-divs \
  --metadata title="Lab Title" \
  -f markdown+auto_identifiers+gfm_auto_identifiers+emoji \
  -t html5

node ../../.github/scripts/generate-pdf.js \
  dist/{lab-name}/{lab-name}.html \
  assets/pdfs/{lab-name}.pdf \
  "Lab Title"
```

## Local PDF Generation

You can now generate PDFs locally using Docker! This is useful for:
- Testing PDF output before pushing to GitHub
- Offline development
- Faster iteration when working on lab content

### Prerequisites
- Docker Desktop running
- Jekyll development container (`mcs-labs-dev`)
- PowerShell 5.1+ or PowerShell Core

### Local Generation Process

#### 1. Start the Docker Container

```bash
docker-compose up -d jekyll-dev
```

The container includes:
- **Pandoc 3.1.3** (matching GitHub Actions version)
- **Node.js 18** with Puppeteer
- **Mermaid.js v11** for diagram rendering
- All required fonts and dependencies

#### 2. Generate PDFs

```powershell
# Generate all labs with PDFs
.\scripts\Generate-Labs.ps1

# Generate specific journey only
.\scripts\Generate-Labs.ps1 -SelectedJourneys @("developer")

# Skip PDFs for faster testing (recommended during development)
.\scripts\Generate-Labs.ps1 -SkipPDFs
```

#### 3. Check Output

PDFs are generated in `assets/pdfs/{lab-name}.pdf` and are immediately available in your local Jekyll site:

```
http://localhost:4000/mcs-labs/labs/
```

### What Gets Processed

#### Callout Blocks
GitHub-style alerts are converted to styled divs:

```markdown
> [!NOTE]
> This is a note callout

> [!WARNING]
> This is a warning callout
```

Becomes:
```html
> <div class="note">**Note:** This is a note callout</div>
> <div class="warning">**WARNING:** This is a warning callout</div>
```

**Supports:** `[!NOTE]`, `[!TIP]`, `[!IMPORTANT]`, `[!WARNING]`, `[!CAUTION]`
**Works with:** Indented callouts (inside lists or nested blocks)

#### Mermaid Diagrams
Interactive diagrams are rendered to static SVG in PDFs:

```html
<div class="mermaid">
sequenceDiagram
    participant User
    participant System
    User->>System: Request
    System-->>User: Response
</div>
```

Supported diagram types: sequence, flowchart, class, state, Gantt, pie, etc.

#### Images
Images are embedded directly in the HTML using `--embed-resources`, ensuring:
- No broken image links in PDFs
- Self-contained PDF files
- Proper rendering across all viewers

### Troubleshooting Local Generation

#### Docker Container Not Running
```bash
# Check container status
docker-compose ps

# Restart if needed
docker-compose restart jekyll-dev
```

#### Pandoc Version Mismatch
```bash
# Verify Pandoc version in container
docker-compose exec jekyll-dev pandoc --version
# Should show: pandoc 3.1.3

# If wrong version, rebuild container
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

#### PDFs Not Generating
```powershell
# Clean up and try again
Remove-Item -Path "assets/pdfs" -Recurse -Force -ErrorAction SilentlyContinue
Remove-Item -Path "dist" -Recurse -Force -ErrorAction SilentlyContinue
.\scripts\Generate-Labs.ps1
```

#### Check Logs
```bash
# View PDF generation output
docker-compose logs -f jekyll-dev
```

## PDF Generation Technical Details

### Technologies Used
- **Pandoc 3.1.3**: Markdown → HTML conversion with resource embedding
- **Node.js 18**: JavaScript runtime for Puppeteer
- **Puppeteer**: Headless Chrome for PDF generation
- **Mermaid.js v11**: Diagram rendering
- **Rouge**: Syntax highlighting (server-side during Jekyll build for web, embedded in PDFs)

### File Processing Pipeline

```
labs/{lab-name}/README.md
  ↓ (PowerShell preprocessing - callouts, title removal)
labs/{lab-name}/{lab-name}_processed.md
  ↓ (Pandoc - HTML conversion with embedded resources)
dist/{lab-name}/{lab-name}.html
  ↓ (Puppeteer - Mermaid rendering + PDF generation)
assets/pdfs/{lab-name}.pdf
```

### CSS Styling
- **HTML styling**: `.github/styles/html.css` - Embedded in HTML
- **PDF styling**: `.github/styles/pdf.css` - Applied during PDF generation
- **Syntax highlighting**: Rouge-generated HTML with embedded styles

### PDF Configuration
```javascript
// In generate-pdf.js
{
  format: 'Letter',
  margin: {
    top: '0.75in',
    bottom: '1.0in',
    left: '0.75in',
    right: '0.75in'
  },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: '...' // Page numbers + title
}
```

## Best Practices

### For Lab Authors

1. **⚠️ ALWAYS Test Locally Before Pushing**
   ```powershell
   # Test all PDFs before committing changes
   .\scripts\Generate-Labs.ps1 -GeneratePDFs
   
   # Quick test for the lab you're editing
   .\scripts\Generate-Labs.ps1 -SingleLabPDF "your-lab-name" -GeneratePDFs
   ```
   **Why**: Catches PDF rendering issues locally instead of breaking CI/deployment

2. **Maintain Environment Parity**
   - Use the same Pandoc version (3.1.3) locally and in CI
   - Use the same Mermaid.js version (v11) in both environments
   - Keep preprocessing logic (AWK/PowerShell) identical
   
3. **Use appropriate code fences**: Only use language tags for actual code that needs syntax highlighting
3. **Include images**: PDFs embed images automatically - no special handling needed
4. **Use callouts**: GitHub-style `[!NOTE]`, `[!WARNING]` etc. render beautifully in PDFs
5. **Test Mermaid diagrams**: Complex diagrams may need adjustment for PDF printing

### For Development

1. **Use `-SkipPDFs` during iteration**: PDF generation takes time - skip it during rapid testing
2. **Match production**: Local Docker uses same Pandoc 3.1.3 as GitHub Actions
3. **Clean state**: Remove `dist/` and `assets/pdfs/` before final testing
4. **Check output**: Always review generated PDFs before committing changes

## FAQ

**Q: Are PDFs stored in the repository?**
A: No. PDFs are generated during GitHub Actions and deployed to GitHub Pages. They are not committed to the repository to keep it clean and small.

**Q: Can I generate PDFs without Docker?**
A: Yes, but you'll need to install Pandoc 3.1.3, Node.js 18, and Puppeteer locally. The PowerShell script supports both Docker and direct execution (CI environment).

**Q: Why are some PDFs failing to generate?**
A: Common reasons:
- Docker container not running
- Wrong Pandoc version (need 3.1.3)
- Missing images or broken markdown
- Mermaid syntax errors

Check the logs with `docker-compose logs -f jekyll-dev` for details.

**Q: How long does PDF generation take?**
A: Approximately 3-5 seconds per lab locally, 2-3 minutes for all 20+ labs in GitHub Actions.

**Q: Can I customize PDF styling?**
A: Yes! Edit `.github/styles/pdf.css` for PDF-specific styles and `.github/styles/html.css` for base HTML styling.

---

**Last Updated**: October 2025
**Pandoc Version**: 3.1.3
**Mermaid Version**: v11
**Node Version**: 18
