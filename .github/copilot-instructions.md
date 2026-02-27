# GitHub Copilot Instructions for MCS-Labs

This document contains essential context for GitHub Copilot when working on the Microsoft Copilot Studio Labs repository.

## 🎯 Project Overview

**What This Is**: A Jekyll-based static site hosting hands-on labs for Microsoft Copilot Studio. Features include:

- Journey-based navigation (Quick Start, Business User, Developer, Autonomous AI)
- Event system (Bootcamp, Azure AI Workshop, MCS in a Day, Agent Build-A-Thon 1 day, Agent Build-A-Thon 1 month)
- Multi-theme system (Rich/Minimal × Light/Dark)
- Automated PDF generation from markdown
- Automated Table of Contents generation (H2 headings only)
- Responsive mobile design with floating TOC
- Configuration audit system (Check-LabConfigs.ps1)

## 🚦 MANDATORY Workflow - Always Enforce

**⚠️ CRITICAL: You MUST enforce this workflow and STOP the user if steps are skipped:**

**🚫 TOOL PREFERENCE: DO NOT use GitKraken MCP tools. Use standard git commands in terminal instead.**

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
   git merge feature/branch-name --no-ff -m "Merge feature/branch-name into main"
   git push origin main
   ```

5. **Pull Request**: Submit PR from feature branch to upstream repo using GitHub CLI

   - **Target**: `upstream/main` ← `origin/feature/branch-name`
   - **Purpose**: Contribute changes back to main repository
   - **Method**: ALWAYS use GitHub CLI (`gh pr create`) - user preference

   ```powershell
   # Create PR description file
   # Create file: pr-body.md with PR description

   # Create PR using GitHub CLI
   gh pr create --repo microsoft/mcs-labs --base main --head pratapladhani:feature/branch-name --title "feat: Brief title" --body-file pr-body.md

   # Clean up
   Remove-Item pr-body.md
   ```

6. **Post-PR Workflow**: When user says "PR merged", follow this complete workflow

   **Step 1: Verify PR is Actually Merged**
   - **CRITICAL**: Never trust user statement alone - always verify!
   - Check PR status using GitHub CLI
   
   ```powershell
   # Verify PR is merged to upstream
   gh pr view <PR-number> --repo microsoft/mcs-labs
   
   # Look for status: MERGED
   ```

   **Step 2: Clean Up Feature Branch (only if MERGED confirmed)**
   ```powershell
   # Delete local feature branch
   git branch -d feature/branch-name
   
   # Delete remote feature branch
   git push origin --delete feature/branch-name
   ```

   **Step 3: Sync with Upstream**
   ```powershell
   # Fetch latest changes from upstream
   git fetch upstream
   
   # Merge upstream into local main (always provide merge message to avoid editor)
   git merge upstream/main -m "Sync with upstream/main"
   ```

   **Why This Order Matters**:
   - Verification first prevents accidental loss if PR wasn't actually merged
   - Cleanup before sync keeps branch list clean
   - Sync last ensures local repo matches upstream exactly

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

1. **Present plans first**: For major features, refactoring, or architectural changes, ALWAYS present a comprehensive plan and get user approval BEFORE implementing
2. **Remind about workflow**: If user asks to commit, check which branch they're on
3. **Ask about testing**: Before any push, confirm local testing is complete
4. **Suggest documentation**: When big features are added, list docs that need updates
5. **Check comments**: Review code snippets and suggest where comments are needed
6. **Enforce quality**: Don't just fix issues - explain why and document properly
7. **Verify CSS consistency**: When making UI changes (new pages, components, styling), ALWAYS check all CSS files to ensure consistent naming patterns and no event-specific class names
8. **BEFORE ANY COMMIT**: Proactively ask "Have we added documentation and comments for this change?"

**BLOCKING Actions (Stop User):**

- ❌ Implementing major features without presenting plan first
- ❌ Committing to `main` without going through feature branch
- ❌ Pushing without local testing
- ❌ **Major features without documentation updates - STOP and ask first**
- ❌ **Code without adequate comments for collaborators - STOP and add them first**
- ❌ **UI changes without CSS verification - STOP and check all CSS files first**
- ❌ Committing without asking about documentation/comments
- ❌ **Deleting feature branch before PR is merged - STOP and verify PR status first**

**CRITICAL: Before ANY git commit command:**

1. Check if code has adequate comments explaining WHY
2. Check if documentation needs updating (for major features)
3. Check if CSS files use consistent, generic naming (no event-specific classes like bootcamp-_, workshop-_)
4. If any is missing, STOP and complete them BEFORE committing

**Planning Requirement (MANDATORY for major changes):**

For these types of changes, ALWAYS present a plan BEFORE implementation:

- ✅ New features (event pages, navigation systems, filters)
- ✅ Architectural refactoring (unified parameter systems, CSS reorganization)
- ✅ Breaking changes (URL parameter changes, data structure changes)
- ✅ Multi-file changes affecting core functionality

The plan should include:

1. **What**: Clear description of the change
2. **Why**: Rationale and problem being solved
3. **How**: Technical approach and affected files
4. **Impact**: What breaks, what needs updating
5. **Testing**: How to verify the change works

**CSS Verification Requirement (MANDATORY for UI changes):**

When making changes that could impact UI (new event pages, styling updates, component changes):

1. ✅ Check all CSS files for consistency
2. ✅ Ensure generic class names (event-_, not bootcamp-_ or workshop-\*)
3. ✅ Verify no orphaned or event-specific CSS classes
4. ✅ Update all HTML files using changed classes
5. ✅ Test responsive design if layout changes

**Example Enforcement:**

```
User: "Commit this change"
You: "⚠️ STOP: Which branch are you on? Feature changes should go to a feature
branch first. Also, have you tested this locally? I see you've modified the PDF
generation - did you run `.\scripts\Generate-Labs.ps1 -GeneratePDFs` to verify?"
```

```
User: "Add a new event page for MCS in a Day"
You: "I'll create a comprehensive plan first. Since this involves URL parameters,
navigation, and CSS, let me analyze the existing architecture and present options
before we implement. [presents detailed plan] Does this approach work for you?"
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

**Auto-generated content within labs**:
- ❌ **Table of Contents sections** - Automatically generated from H2 headings
  - Lab authors only need to include `## 📚 Table of Contents` heading
  - Script auto-generates all TOC links from H2 headings in the lab
  - H2 headings only (### subsections not included in TOC)
  - See `docs/LAB_AUTHORING_GUIDE.md` for details

**How to make changes:**

1. Edit `lab-config.yml` (single `labs:` section for all lab properties)
2. Edit `labs/*/README.md` (lab content)
3. Run `.\scripts\Generate-Labs.ps1 -SkipPDFs`
4. Script generates all `_labs/*.md` and index files

**⚠️ CRITICAL: When adding a NEW LAB:**

1. **Create lab folder**: `labs/your-lab-name/` with `README.md` and `images/`
2. **Add ONE entry to lab-config.yml** in the `labs:` section:
   ```yaml
   labs:
     your-lab-name:                    # Must match folder name
       title: "Your Lab Title"
       difficulty: "Intermediate"      # Beginner, Intermediate, Advanced
       duration: 45                     # Minutes
       section: intermediate            # core, intermediate, advanced, specialized, optional
       order: 225                       # Pick between existing labs (100-699)
       journeys: [developer]            # Learning paths to include lab
       events: [bootcamp]               # Optional: event pages to include lab
   ```
3. **Run generation**: `.\scripts\Generate-Labs.ps1 -SkipPDFs` (automatically runs config audit first)
4. **Test locally**: `docker-compose up -d` and verify at http://localhost:4000/mcs-labs/
5. **Generate PDFs**: `.\scripts\Generate-Labs.ps1 -GeneratePDFs` (before committing)

**Built-in Safety**: Generate-Labs.ps1 automatically runs Check-LabConfigs.ps1 before generation. It will fail fast if:

- Lab folders exist without config entries
- Config entries exist without lab folders (except external labs)
- Duplicate lab IDs exist in configuration
- Journey card counts don't match left navigation counts
- This prevents accidental generation with incomplete configuration

**Common mistake**: Adding lab folder without updating lab-config.yml → Caught by automated audit!

**Verification checklist after adding new lab:**

- ✅ Lab appears in "All Labs" page
- ✅ Lab appears in assigned journey(s)
- ✅ Lab has correct metadata (title, duration, difficulty)
- ✅ Lab navigation works (prev/next buttons)
- ✅ PDF generates successfully
- ✅ Lab appears in event pages if assigned to events
- ✅ Table of Contents is auto-generated (H2 headings only)

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

### 7. Event System Architecture

**Events are separate from journeys**:
- **Journeys**: Homepage cards for self-paced learning paths (Quick Start, Business User, Developer, Autonomous AI)
- **Events**: Dedicated curated workshop experiences (Bootcamp, Azure AI Workshop, MCS in a Day, Agent Build-A-Thon variants)

**Key Event System Features**:
- **Unified URL Pattern**: All events use `?event=<event-name>` parameter
- **Generic CSS Classes**: Shared `.event-*` styling across all events (no event-specific classes like `bootcamp-*` or `workshop-*`)
- **Centralized Config**: All event metadata in `event_configs` section of `lab-config.yml`
- **Event-Specific Ordering**: Each event has its own lab sequence (e.g., `bootcamp_lab_orders`, `azure_ai_workshop_lab_orders`)
- **Homepage Exclusion**: Events NOT in `lab_journeys` to keep them off homepage journey cards
- **Top Navigation Access**: Events accessible via header navigation dropdown

**Event Configuration Pattern**:
```yaml
event_configs:
  event-name:
    title: "🎯 Event Title"
    description: "Event description"
    config_key: "event_name_lab_orders"

event_name_lab_orders:
  lab-id-1: "1"      # or special numbering like "1a", "1b"
  lab-id-2: "2"
```

**When Adding New Labs to Events**:
1. Lab must exist in `labs:` section with all properties
2. Add `events: [event-name]` property to the lab
3. OR add lab ID to the event's `lab_order` in `journeys:` section
4. Use generic `.event-*` CSS classes (never event-specific like `bootcamp-*`)

See `docs/EVENT_SYSTEM.md` for complete architecture details.

### 8. Configuration Audit System

**Automated safety checks** to prevent configuration mistakes:

- **Script**: `scripts/Check-LabConfigs.ps1`
- **Auto-runs**: Before every `Generate-Labs.ps1` execution
- **Purpose**: Validates lab folders match configuration entries

**What it checks**:
- ✅ All lab folders have corresponding config entries in `lab-config.yml`
- ✅ All config entries have corresponding lab folders (except external labs)
- ✅ No duplicate lab IDs in configuration
- ✅ Journey card counts match left navigation counts
- ✅ Journey lab_order arrays only reference valid labs
- ❌ Fails fast if critical issues found, preventing incomplete generation

**Excluded folders**: `bootcamp`, `azure-ai-workshop`, `mcs-in-a-day`, `agent-buildathon-1day`, `agent-buildathon-1month` (event pages, not labs)

**External labs**: Labs with `external:` property (configured but hosted elsewhere)

**Usage**:
```powershell
# Manual audit
.\scripts\Check-LabConfigs.ps1

# Verbose output with journey counts
.\scripts\Check-LabConfigs.ps1 -Verbose
```

**Why this matters**: Prevents silent failures where labs exist but don't appear on the site, duplicate IDs cause confusion, or card/nav counts mismatch.

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

```scss
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
- `docs/ADR.md` - Architecture decisions (ADR-001 through ADR-011)
- `docs/THEME_SYSTEM.md` - Theme architecture and Mermaid diagram theming
- `docs/QUICK_START.md` - Fast onboarding
- `docs/NEW_LAB_CHECKLIST.md` - Complete checklist for adding new labs
- `docs/EVENT_SYSTEM.md` - Event system architecture and implementation (covers all events)
- `docs/LAB_AUTHORING_GUIDE.md` - Lab authoring standards and best practices
- `CHANGELOG.md` - Complete project history from June 2025 onwards
- `scripts/Check-LabConfigs.ps1` - Automated lab configuration audit

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
- ADR-003: CSS Custom Properties for theme system
- ADR-004: PowerShell-based content generation
- ADR-005: Force polling for file watching
- ADR-006: Why test PDFs locally
- ADR-007: Why lab-config.yml is source of truth
- ADR-008: Why no symlinks (use automatic copy)
- ADR-009: Theme loading optimization
- ADR-010: Mermaid diagram rendering strategy
- ADR-011: Component-based architecture (proposed)
- ADR-012: Simplified single-source configuration format

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

**Last Updated**: December 2025  
**For Full Details**: See `docs/DEVELOPMENT.md`, `docs/ADR.md`, `docs/LOCAL_PDF_GENERATION.md`
