# GitHub Copilot Instructions for MCS-Labs

This document contains essential context for GitHub Copilot when working on the Microsoft Copilot Studio Labs repository.

## 🎯 Project Overview

**What This Is**: A Jekyll-based static site hosting hands-on labs for Microsoft Copilot Studio. Features include:

- Journey-based navigation (Quick Start, Business User, Developer, Autonomous AI)
- Bootcamp system with curated sequences
- Multi-theme system (Rich/Minimal × Light/Dark)
- Automated PDF generation from markdown
- Responsive mobile design with floating TOC

## 🚦 MANDATORY Workflow - Always Enforce

**⚠️ CRITICAL: You MUST enforce this workflow and STOP the user if steps are skipped:**

### Feature Development Workflow (REQUIRED)

1. **Feature Branch**: ALL changes go to a feature branch (e.g., `feature/theme-updates`)

   - **STOP if**: User tries to commit directly to `main`
   - **Action**: Remind user to create/switch to feature branch first

2. **Local Testing**: ALWAYS test locally before ANY push
   - **STOP if**: User tries to push without testing
   - **Action**: Ask "Have you tested this locally? Run the relevant commands first."
3. **Feature Branch Push**: Push to feature branch for initial testing

   ```powershell
   git push origin feature/branch-name
   ```

4. **Merge to Main**: After feature branch push, merge to main for workflow testing

   ```powershell
   git checkout main
   git merge feature/branch-name --no-ff
   git push origin main
   ```

5. **Pull Request**: Submit PR from feature branch to upstream repo
   - **Target**: `upstream/main` ← `origin/feature/branch-name`
   - **Purpose**: Contribute changes back to main repository

### Quality Gates - Enforce Before Commit

**Documentation Updates (REQUIRED for big features):**

- ✅ Update relevant `docs/*.md` files
- ✅ Add/update ADR if architectural decision made
- ✅ Update `README.md` if user-facing changes
- ✅ Update this file (`copilot-instructions.md`) if workflow changes

**Code Quality (REQUIRED for all commits):**

- ✅ Add comments explaining WHY (not just what)
- ✅ Document complex logic and non-obvious decisions
- ✅ Add guidance for future collaborators in comments
- ✅ Follow established patterns (Docker, PowerShell, CSS-only, etc.)

**Testing Checklist:**

- ✅ Local testing completed and working
- ✅ PDFs generated successfully (if content changed)
- ✅ Docker rebuild works (if Dockerfile changed)
- ✅ No linting errors
- ✅ Follows all ADR principles

### Your Role as Assistant

**PROACTIVE Actions:**

1. **Remind about workflow**: If user asks to commit, check which branch they're on
2. **Ask about testing**: Before any push, confirm local testing is complete
3. **Suggest documentation**: When big features are added, list docs that need updates
4. **Check comments**: Review code snippets and suggest where comments are needed
5. **Enforce quality**: Don't just fix issues - explain why and document properly

**BLOCKING Actions (Stop User):**

- ❌ Committing to `main` without going through feature branch
- ❌ Pushing without local testing
- ❌ Major features without documentation updates
- ❌ Code without adequate comments for collaborators

**Example Enforcement:**

```
User: "Commit this change"
You: "⚠️ STOP: Which branch are you on? Feature changes should go to a feature
branch first. Also, have you tested this locally? I see you've modified the PDF
generation - did you run `.\scripts\Generate-Labs.ps1 -GeneratePDFs` to verify?"
```

## 🔧 Critical Development Principles

### 1. Docker-First Development (ADR-001)

- **ALWAYS use Docker** - no local Jekyll/Ruby installation
- Start server: `docker-compose up -d jekyll-dev`
- Access site: `http://localhost:4000/mcs-labs/`
- **NEVER** use commands like `bundle exec jekyll serve` directly

### 2. PowerShell Environment (Windows)

- **Use PowerShell syntax**, not Unix commands:
  - ✅ `Remove-Item -Recurse -Force` instead of ❌ `rm -rf`
  - ✅ `Get-ChildItem` instead of ❌ `ls`
  - ✅ `Select-Object -Last 5` instead of ❌ `tail -5`
- Project runs on Windows with PowerShell scripts

### 3. Generated Content - DO NOT EDIT (Critical!)

**Auto-generated files - editing them is USELESS:**

- ❌ `index.md` (root homepage)
- ❌ `labs/index.md` (labs listing)
- ❌ `_labs/*.md` (individual lab files)

**How to make changes:**

1. Edit `lab-config.yml` (journeys, metadata)
2. Edit `labs/*/README.md` (lab content)
3. Run `.\scripts\Generate-Labs.ps1 -SkipPDFs`
4. Script generates all `_labs/*.md` and index files

### 4. Local/CI Parity - Test Before Push (ADR-006)

**CRITICAL**: Always test PDFs locally before pushing:

```powershell
# Test all PDFs
.\scripts\Generate-Labs.ps1 -GeneratePDFs

# Quick test single lab
.\scripts\Generate-Labs.ps1 -SingleLabPDF "your-lab-name" -GeneratePDFs
```

**Why**: Local must match GitHub Actions exactly (Pandoc 3.1.3, Mermaid v11) to prevent CI failures.

### 5. CSS-Only Styling (ADR-002)

- **NEVER** add inline `<style>` blocks in PowerShell scripts
- **ALL styling** in `assets/css/style.css`
- Use CSS Custom Properties for theming
- Clean HTML generation, styling via classes

### 6. Configuration Single Source of Truth (ADR-007, ADR-008)

- `lab-config.yml` (root) = source of truth
- `_data/lab-config.yml` = auto-synced copy (don't edit manually)
- Script copies root → \_data automatically
- **Don't use symlinks** (fails in GitHub Actions)

## 🚀 Common Workflows

### First-Time Setup

```powershell
# REQUIRED: Generate content files
.\scripts\Generate-Labs.ps1 -SkipPDFs

# Start Docker
docker-compose up -d
```

### Daily Development

```powershell
# Fast iteration (no PDFs)
.\scripts\Generate-Labs.ps1 -SkipPDFs

# Specific journey
.\scripts\Generate-Labs.ps1 -SelectedJourneys @("developer") -SkipPDFs

# Test PDFs before push
.\scripts\Generate-Labs.ps1 -GeneratePDFs
```

### Docker Operations

```powershell
# Restart Jekyll (if not detecting changes)
docker-compose restart jekyll-dev

# Full reset
docker-compose down
docker-compose up -d

# View logs
docker-compose logs -f jekyll-dev

# Access container
docker-compose exec jekyll-dev bash
```

### Theme Development

```powershell
# Edit theme CSS directly
# No script needed - Jekyll auto-rebuilds
notepad assets\css\themes\theme-minimal.css
```

## 📁 File Structure & Safe Edits

### ✅ Safe to Edit

- `assets/css/*.css` - Styling
- `_layouts/*.html` - Jekyll templates
- `_config.yml` - Jekyll config
- `lab-config.yml` - Journey/metadata source of truth
- `labs/*/README.md` - Lab content
- `docs/*.md` - Documentation

### ❌ Auto-Generated (Don't Edit)

- `index.md` (root)
- `labs/index.md`
- `_labs/*.md`
- `_data/lab-config.yml` (auto-synced)

## 🎨 Theme System

### Architecture

- **Theme Families**: Rich (colorful) vs Minimal (clean)
- **Modes**: Light and Dark within each family
- **Loading**: Only active theme CSS loaded (prevents flash)
- **Storage**: Separate localStorage for family + mode

### Making Theme Changes

1. Edit `assets/css/themes/theme-{rich|minimal}.css`
2. Use CSS Custom Properties:

```css
:root {
  --bg-primary: white;
  --text-primary: #34343c;
}

[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --text-primary: #ffffff;
}
```

3. Jekyll auto-rebuilds - no script needed

## 📄 PDF Generation Pipeline

### Process Flow

```
labs/{lab}/README.md
  → PowerShell preprocessing (callouts)
  → Pandoc 3.1.3 (HTML + embed images)
  → Mermaid.js v11 (render diagrams)
  → Puppeteer (PDF generation)
  → assets/pdfs/{lab}.pdf
```

### Critical Requirements

- **Pandoc**: Run from lab directory for image resolution
- **Callouts**: Supports indented `> [!NOTE]` inside lists
- **Mermaid**: Uses `<br/>` tags for line breaks in diagrams
- **Versions**: Pandoc 3.1.3, Mermaid v11, Node 18

### Common Issues

| Problem                | Solution                                          |
| ---------------------- | ------------------------------------------------- |
| Images not embedded    | Run Pandoc from lab directory                     |
| Callouts not rendering | Check preprocessing regex for indentation         |
| Mermaid missing        | Verify Mermaid.js v11 loaded in PDF script        |
| Version mismatch       | Rebuild Docker: `docker-compose build --no-cache` |

## 🐛 Troubleshooting

### Jekyll Not Rebuilding

```powershell
# Force polling may be off
docker-compose restart jekyll-dev
```

### Theme Not Switching

```javascript
// Check browser console for errors
// Verify theme-manager.js loaded
// Check data-theme-family attribute on <html>
```

### PDF Generation Failed

```powershell
# Clean and retry
Remove-Item -Path "assets/pdfs","dist" -Recurse -Force
.\scripts\Generate-Labs.ps1 -GeneratePDFs
```

### Pandoc Version Wrong

```bash
# Check version in Docker
docker-compose exec jekyll-dev pandoc --version

# Should be 3.1.3 - if not, rebuild
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## 📚 Key Documentation Files

- `README.md` - Project overview, setup, structure
- `docs/DEVELOPMENT.md` - Comprehensive dev guide, PowerShell notes
- `docs/LOCAL_PDF_GENERATION.md` - PDF generation details, parity
- `docs/ADR.md` - Architecture decisions (ADR-001 through ADR-009)
- `docs/THEME_SYSTEM.md` - Theme architecture
- `docs/QUICK_START.md` - Fast onboarding

## 🎯 When Helping Users

### Ask About Context

- Are they editing lab content or themes?
- Do they need to generate PDFs?
- Is this a local test or production push?

### Recommend Best Practices

- Use `-SkipPDFs` for fast iteration
- Test PDFs before pushing if content changed
- Run generation script after config changes
- Use PowerShell syntax (not Unix commands)

### Provide Complete Commands

```powershell
# Good response (complete PowerShell command)
Remove-Item -Path "_site","_data/lab-config.yml" -Recurse -Force
.\scripts\Generate-Labs.ps1 -SkipPDFs

# Bad response (Unix commands that won't work)
rm -rf _site
./scripts/Generate-Labs.ps1
```

### Reference ADRs When Relevant

- ADR-001: Why Docker is required
- ADR-002: Why no inline CSS
- ADR-006: Why test PDFs locally
- ADR-007: Why lab-config.yml is source of truth
- ADR-008: Why no symlinks (use automatic copy)

## 🔍 Quick Reference

### Most Common Tasks

| Task                | Command                                                              |
| ------------------- | -------------------------------------------------------------------- |
| Generate content    | `.\scripts\Generate-Labs.ps1 -SkipPDFs`                              |
| Generate with PDFs  | `.\scripts\Generate-Labs.ps1 -GeneratePDFs`                          |
| Test single lab PDF | `.\scripts\Generate-Labs.ps1 -SingleLabPDF "lab-name" -GeneratePDFs` |
| Start Docker        | `docker-compose up -d`                                               |
| Restart Jekyll      | `docker-compose restart jekyll-dev`                                  |
| View logs           | `docker-compose logs -f jekyll-dev`                                  |
| Full reset          | `docker-compose down && docker-compose up -d`                        |

### File Locations

- Lab content: `labs/*/README.md`
- Generated labs: `_labs/*.md` (auto-generated)
- Configuration: `lab-config.yml` (root)
- CSS: `assets/css/style.css`
- Themes: `assets/css/themes/theme-{rich|minimal}.css`
- Layouts: `_layouts/*.html`
- PDFs: `assets/pdfs/*.pdf`

---

**Last Updated**: October 2025  
**For Full Details**: See `docs/DEVELOPMENT.md`, `docs/ADR.md`, `docs/LOCAL_PDF_GENERATION.md`
