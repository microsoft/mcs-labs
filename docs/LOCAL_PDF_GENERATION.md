# Local PDF Generation Guide

This guide explains how to generate PDFs locally for testing the PDF download functionality in your lab cards and pages.

## Option 1: Docker-based Generation (Recommended)

The Docker approach provides a consistent environment that matches GitHub Actions, including Pandoc, Node.js, and all dependencies.

### Prerequisites
- Docker Desktop installed and running

### Quick Start
```bash
# Build and run PDF generation for all labs
npm run build-pdfs-docker

# Generate PDFs for a specific lab
pwsh -File scripts/Generate-PDFs-Docker.ps1 -LabFilter "agent-builder-web"

# Force rebuild of Docker image
pwsh -File scripts/Generate-PDFs-Docker.ps1 -Build

# Open interactive shell for debugging
pwsh -File scripts/Generate-PDFs-Docker.ps1 -Interactive
```

### Development with PDFs
```bash
# Start Jekyll development server with Docker
npm run dev

# Or with image rebuild
npm run dev-build
```

## Option 2: Local Installation

If you prefer to install dependencies locally:

### Prerequisites
- Node.js 18+
- Pandoc (from https://pandoc.org/installing.html)
- PowerShell 5.1+ or PowerShell Core

### Installation
```bash
# Install Pandoc (Windows)
winget install JohnMacFarlane.Pandoc

# Or download from https://pandoc.org/installing.html

# Install Node.js dependencies
npm install
```

### Usage
```bash
# Generate all PDFs
npm run build-pdfs

# Quick generation (skip npm install)
npm run build-pdfs-quick

# Generate PDFs for specific lab
pwsh -File scripts/Generate-PDFs-Local.ps1 -LabFilter "agent-builder-web"
```

## Output

Both methods generate:
- **HTML files**: `local-dist/{lab-name}/{lab-name}.html`
- **PDF files**: `local-dist/{lab-name}/{lab-name}.pdf`
- **Jekyll assets**: `assets/pdfs/{lab-name}.pdf` (for web serving)

## Testing PDF Downloads

After generating PDFs:

1. Start Jekyll development server:
   ```bash
   bundle exec jekyll serve --livereload
   # OR with Docker:
   npm run dev
   ```

2. Visit http://localhost:4000/mcs-labs/labs/

3. PDF download buttons will now work in:
   - Lab cards (📄 PDF button)
   - Individual lab pages (Download PDF Version section)

## Troubleshooting

### Docker Issues
- Ensure Docker Desktop is running
- Try rebuilding the image: `npm run build-pdfs-docker -- -Build`
- For debugging: `npm run build-pdfs-docker -- -Interactive`

### Local Installation Issues
- Verify Pandoc installation: `pandoc --version`
- Verify Node.js version: `node --version` (should be 18+)
- Check PowerShell modules: `Get-Module -ListAvailable powershell-yaml`

### PDF Generation Issues
- Check HTML generation first in `local-dist/` folder
- Puppeteer issues often relate to missing system fonts
- Try generating a single lab first: `-LabFilter "agent-builder-web"`

## Integration with GitHub Actions

The local generation uses the same process as GitHub Actions:
1. Markdown preprocessing (callouts, header cleanup)
2. Pandoc HTML conversion with styling
3. Puppeteer PDF generation with navigation

Your locally generated PDFs will match the ones created in CI/CD.