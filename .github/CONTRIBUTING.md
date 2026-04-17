# 🛠️ Contributing to Microsoft Copilot Studio Labs

## 📋 Repository Structure

This repository contains hands-on lab materials for Microsoft Copilot Studio. The project uses automated workflows to generate documentation in multiple formats.

### Directory Structure
```
mcs-labs/
├── labs/                    # Source lab content (Markdown)
│   ├── lab-name/
│   │   ├── README.md       # Lab instructions (source)
│   │   └── images/         # Lab screenshots and assets
├── dist/                   # Generated documentation (auto-generated)
│   ├── lab-name/
│   │   ├── lab-name.html   # Web-ready HTML version
│   │   └── lab-name.pdf    # Printable PDF version
├── .github/
│   ├── workflows/          # GitHub Actions automation
│   ├── scripts/            # PDF generation scripts
│   └── styles/             # CSS styling for outputs
└── package.json            # Node.js dependencies for workflows
```

## 🔄 Automated Documentation Generation

### Overview
This repository uses GitHub Actions to automatically convert lab markdown files into professional HTML and PDF formats. The generated files are stored in the `dist/` directory and deployed to GitHub Pages.

### Workflow Architecture

#### 1. **Generate Documentation Workflow** (`generate-documentation.yml`)
- **Triggers**: Changes to lab content, styling, workflow files, or dependencies
- **Process**:
  1. Installs Pandoc for Markdown → HTML conversion
  2. Installs Node.js dependencies (Puppeteer for PDF generation)
  3. Processes each lab's `README.md` file
  4. Generates styled HTML with navigation and branding
  5. Converts HTML to PDF with bookmarks and professional layout
  6. Uploads generated files as workflow artifacts (keeps repository clean)

#### 2. **Deploy Lab Portal Workflow** (`deploy-lab-portal.yml`)
- **Triggers**: Automatically after documentation generation completes
- **Process**:
  1. Downloads generated HTML/PDF files from artifacts
  2. Creates a web portal homepage
  2. Deploys HTML files to GitHub Pages
  3. Provides downloadable PDF links

### Dependencies Management

#### package.json Configuration
```json
{
  "name": "mcs-labs-documentation",
  "version": "1.0.0",
  "description": "Microsoft Copilot Studio Labs - Documentation Generator",
  "private": true,
  "scripts": {
    "generate-pdf": "node .github/scripts/generate-pdf.js"
  },
  "devDependencies": {
    "puppeteer": "^24.15.0"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

**Why package.json is important**:
- **Version Control**: Pins Puppeteer to compatible version (`^24.15.0`)
- **Consistency**: Ensures same dependencies across all workflow runs
- **Professional Structure**: Standard Node.js project format
- **Future Extensibility**: Easy to add more tools and scripts

#### Installation Process in Workflows
```bash
npm install  # Reads package.json, installs exact compatible versions
```

**Alternative approaches considered**:
- `npm ci`: Requires package-lock.json (not used for flexibility)
- `npm install puppeteer`: Direct install without version control (less stable)

## 🎨 Styling and Branding

### HTML Styling
- Location: `.github/styles/html.css`
- Features: Professional layout, responsive design, consistent branding
- Applied during Pandoc conversion with `--css` parameter

### PDF Generation

- **Tool**: Puppeteer (replaces wkhtmltopdf for better stability)
- **Script**: `.github/scripts/generate-pdf.js`
- **Features**: Bookmarks, page numbers, professional formatting
- **Why not LaTeX?**: We use HTML→PDF via Puppeteer instead of Pandoc's LaTeX engine for better web styling consistency and to avoid LaTeX dependencies (`texlive-latex-recommended`, `texlive-xetex`, etc.)

## 🚀 Making Changes

### Adding New Labs
1. Create new directory in `labs/`
2. Add `README.md` with lab content
3. Include images in `images/` subdirectory
4. Commit changes - workflows will automatically generate HTML/PDF artifacts

### Modifying Existing Labs
1. Edit the `README.md` file in the lab directory
2. Commit changes - workflows will regenerate documentation artifacts
3. Generated files are available as downloadable artifacts from workflow runs

### Styling Changes
1. Modify `.github/styles/html.css` for HTML appearance
2. Update `.github/scripts/generate-pdf.js` for PDF formatting
3. Changes trigger automatic regeneration of all documents

## ♿ Accessibility

The site ships a design-token layer, a masthead theme switcher (Light / Dark / High contrast / Match system), a 3-step text-size control, and an adaptive Lab Assistant flyout. Two CI workflows enforce baselines on every PR:

- **`.github/workflows/a11y.yml`** — runs `pa11y-ci` against the URL list in `.pa11yci.json` at `WCAG2AA`. Zero errors required.
- **`.github/workflows/lighthouse.yml`** — runs Lighthouse CI (`lighthouserc.json`). Accessibility score ≥ 95 per URL.

### Rules for contributors

1. **Every new color must come from a token.** Add or reuse a CSS custom property in `assets/css/_tokens.scss`. Do not write hardcoded hex values in `assets/css/main.scss` or in `_includes/webchat/styles.html`. When adding a token, provide values in every palette (`:root`, `@mixin dark-tokens`, `[data-theme="hc"]`).
2. **Use `:focus-visible` for focus styles.** Do not use `outline: none` without a `box-shadow` fallback on the same selector.
3. **SVG icons** are decorative by default. Add `aria-hidden="true" focusable="false"` unless the icon is the only accessible name for its control, in which case add `<title>` + `role="img"` and ensure contrast.
4. **Inputs need labels.** Placeholder text is not a label. Use a `<label for="…">` (hide it with `.visually-hidden` if a visible label would hurt the design).
5. **Respect `prefers-reduced-motion`.** New CSS animations or transitions should be neutralized by the global block in `_tokens.scss`. If you need a longer-running animation, add an explicit override under that block.

### Bumping the `minimal-mistakes-jekyll` gem

`_includes/masthead.html` **shadows** the upstream theme's masthead at version `4.27.3` (see the header comment in that file). Bumping the Gemfile pin requires:

1. Diff `_includes/masthead.html` against the new upstream version at `https://github.com/mmistakes/minimal-mistakes/blob/<new-version>/_includes/masthead.html`.
2. Reconcile additions upstream into our shadow.
3. Update the version line in the comment at the top of `_includes/masthead.html`.
4. Re-run Phase A (local Docker) before opening the PR.

### Local accessibility testing

```bash
# with the dev container running on http://localhost:4000/mcs-labs/
npm install
npm run a11y        # pa11y-ci
npm run lighthouse  # @lhci/cli
```

## 🐛 Troubleshooting

### Common Issues

#### Workflow Failures
- **npm install fails**: Check `package.json` syntax and dependencies
- **PDF generation fails**: Verify Puppeteer compatibility and HTML structure
- **Pandoc conversion fails**: Check markdown syntax and YAML front matter

#### Path Resolution
- All workflow commands run from repository root
- File paths in workflows are relative to root directory
- HTML post-processing uses paths relative to `dist/` structure

### Debugging Workflows
Use GitHub CLI to view workflow logs:
```bash
gh run list --limit 5                    # List recent workflow runs
gh run view [RUN_ID] --log-failed        # View detailed failure logs
```

## 📊 Monitoring and Maintenance

### Generated Files
- HTML files: `dist/{lab-name}/{lab-name}.html`
- PDF files: `dist/{lab-name}/{lab-name}.pdf`
- Available as downloadable artifacts from workflow runs (not committed to repository)

### File Exclusions

`.gitignore` includes:

- `dist/` directory (generated content, excluded from repository)
- `node_modules/` directory (temporary dependencies)

### Branch Protection
- `main` branch contains stable lab content
- `feature/*` branches used for testing and development
- Workflows enabled on both main and feature branches for testing

## 🔧 Local Development

### Prerequisites
- Node.js 18+ (for PDF generation scripts)
- Pandoc (for HTML conversion)
- Git (for version control)

### Setup
```bash
git clone [repository-url]
cd mcs-labs
npm install                    # Install dependencies
```

### Testing Changes Locally
```bash
# Generate PDF for specific lab (example)
node .github/scripts/generate-pdf.js dist/lab-name/lab-name.html dist/lab-name/lab-name.pdf "Lab Title"
```

### Environment Variables

Workflows use these GitHub-provided variables:

- `GITHUB_TOKEN`: For accessing repository metadata
- `GITHUB_REPOSITORY`: For repository context
- `GITHUB_REF`: For branch detection

## 📈 Performance Optimizations

### Workflow Efficiency
- Pandoc action for faster setup
- Parallel font installation
- Conditional HTML processing
- Efficient file organization in `dist/` structure

### PDF Generation
- Puppeteer with optimized browser settings
- Professional page layout and margins
- Internal link preservation for navigation
- Header/footer with page numbering

## 🔄 Version History
- **v1.0**: Initial workflow setup with wkhtmltopdf
- **v2.0**: Migration to Puppeteer for better stability
- **v3.0**: Restructured to separate source (`labs/`) from generated (`dist/`) content
- **v3.1**: Added package.json for better dependency management