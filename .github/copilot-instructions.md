# GitHub Copilot Instructions for MCS-Labs

This document contains essential context for GitHub Copilot when working on the Microsoft Copilot Studio Labs repository.

## 🎯 Project Overview

**What This Is**: A Jekyll-based static site (minimal-mistakes theme) hosting hands-on labs for Microsoft Copilot Studio. Features include:

- Module- and journey-based navigation (Quick Start, Business User, Developer, Autonomous AI)
- Event system (Bootcamp, Azure AI Workshop, MCS in a Day, Agent Build-A-Thon 1 day, Agent Build-A-Thon 1 month)
- Light/dark theming plus accessibility settings (font size, motion)
- Content feed syndication (publish/consume labs across sites)
- Built and deployed to GitHub Pages by GitHub Actions

**Stack**: Ruby/Jekyll 4.4 for the site, Node 20 for the feed and tracker scripts, no PowerShell build step.

## 🚦 MANDATORY Workflow - Always Enforce

**⚠️ CRITICAL: You MUST enforce this workflow and STOP the user if steps are skipped:**

**🚫 TOOL PREFERENCE: DO NOT use GitKraken MCP tools. Use standard git commands in terminal instead.**

### Feature Development Workflow (REQUIRED)

1. **Feature Branch**: ALL changes go to a feature branch (e.g., `feature/theme-updates`)

   - **STOP if**: User tries to commit directly to `main`
   - **Action**: Remind user to create/switch to feature branch first

2. **Local Testing**: ALWAYS test locally before ANY push

   - **STOP if**: User tries to push without testing
   - **Action**: Ask "Have you tested this locally? Serve the site and check the affected pages."

3. **Feature Branch Push**: Push to feature branch for initial testing

   ```bash
   git push origin feature/branch-name
   ```

4. **Pull Request**: Submit PR from feature branch to the upstream repo using GitHub CLI

   - **Target**: `upstream/main` ← `origin/feature/branch-name`
   - **Method**: ALWAYS use GitHub CLI (`gh pr create`) - user preference

   ```bash
   # Write the PR description to pr-body.md first, then:
   gh pr create --repo microsoft/mcs-labs --base main \
     --head <your-fork>:feature/branch-name \
     --title "feat: Brief title" --body-file pr-body.md

   rm pr-body.md
   ```

5. **Post-PR Workflow**: When user says "PR merged", follow this complete workflow

   **Step 1: Verify PR is Actually Merged**

   - **CRITICAL**: Never trust user statement alone - always verify!

   ```bash
   gh pr view <PR-number> --repo microsoft/mcs-labs   # look for status: MERGED
   ```

   **Step 2: Clean Up Feature Branch (only if MERGED confirmed)**

   ```bash
   git branch -d feature/branch-name
   git push origin --delete feature/branch-name
   ```

   **Step 3: Sync with Upstream**

   ```bash
   git fetch upstream
   git merge upstream/main -m "Sync with upstream/main"
   ```

   **Why This Order Matters**:

   - Verification first prevents accidental loss if PR wasn't actually merged
   - Cleanup before sync keeps branch list clean
   - Sync last ensures local repo matches upstream exactly

### Quality Gates - Enforce Before Commit

**Lab content changes (REQUIRED):**

- ✅ `labs/<slug>/README.md` and `_labs/<slug>.md` updated **together** in the same PR (CI enforces this - see Principle 2)
- ✅ In-page anchor links still resolve if headings changed
- ✅ Images referenced by the lab exist under `labs/<slug>/images/`

**Documentation Updates (REQUIRED for big features):**

- ✅ Update relevant `docs/*.md` files
- ✅ Update `README.md` if user-facing changes
- ✅ Update this file (`copilot-instructions.md`) if workflow or tooling changes

**Code Quality (REQUIRED for all commits):**

- ✅ `npm test` passes (`node --test scripts/*.test.js`)
- ✅ Add comments explaining WHY (not just what)
- ✅ Document complex logic and non-obvious decisions
- ✅ Follow established patterns (CSS in `assets/css`, tokens for theming)

**Testing Checklist:**

- ✅ Local testing completed and working
- ✅ Node script tests pass if `scripts/*.js` changed
- ✅ No linting errors

### Your Role as Assistant

**PROACTIVE Actions:**

1. **Present plans first**: For major features, refactoring, or architectural changes, ALWAYS present a comprehensive plan and get user approval BEFORE implementing
2. **Remind about workflow**: If user asks to commit, check which branch they're on
3. **Ask about testing**: Before any push, confirm local testing is complete
4. **Suggest documentation**: When big features are added, list docs that need updates
5. **Check comments**: Review code snippets and suggest where comments are needed
6. **Enforce quality**: Don't just fix issues - explain why and document properly
7. **Verify CSS consistency**: When making UI changes, check all CSS files for consistent, generic naming (no event-specific class names)
8. **BEFORE ANY COMMIT**: Proactively ask "Have we added documentation and comments for this change?"

**BLOCKING Actions (Stop User):**

- ❌ Implementing major features without presenting plan first
- ❌ Committing to `main` without going through feature branch
- ❌ Pushing without local testing
- ❌ **Editing a lab README without mirroring the change into `_labs/` - STOP, CI will fail**
- ❌ **Major features without documentation updates - STOP and ask first**
- ❌ **Code without adequate comments for collaborators - STOP and add them first**
- ❌ **UI changes without CSS verification - STOP and check all CSS files first**
- ❌ **Deleting feature branch before PR is merged - STOP and verify PR status first**

**Planning Requirement (MANDATORY for major changes):**

For new features, architectural refactoring, breaking changes, or multi-file changes affecting core functionality, present a plan covering **What**, **Why**, **How**, **Impact**, and **Testing** before implementing.

## 🔧 Critical Development Principles

### 1. Local Development - Serve the Site

There is **no Dockerfile and no docker-compose.yml** in this repo. Use the checked-in run scripts:

```bash
bash tools/run.sh                 # jekyll serve with livereload
bash tools/run.sh -H 0.0.0.0      # bind to all interfaces
```

```powershell
.\tools\run.ps1                   # same, on Windows
```

First-time setup installs Ruby + Bundler dependencies: see `tools/setup/mac/install.sh` or `tools/setup/win/install.ps1`.

**Container alternative** (no local Ruby toolchain) - bind-mount the repo and keep gems in a named volume:

```bash
docker run -d --name mcs-labs-review -p 4000:4000 \
  -v "$PWD":/srv -v mcslabs-gems:/usr/local/bundle -w /srv ruby:3.3 \
  bash -lc "bundle exec jekyll serve --config _config.yml,_config.local.yml --host 0.0.0.0 --port 4000"
```

Site is served at `http://localhost:4000/mcs-labs/` - the `/mcs-labs/` baseurl is required; the bare root returns 404.

### 2. Lab Content Lives in TWO Places - Keep Them in Sync (Critical!)

`_labs/*.md` is **committed, hand-maintained content**, not generated output. There is no content generation script in this repo.

| Path | Role |
| ---- | ---- |
| `labs/<slug>/README.md` | Lab as read on GitHub. Uses emoji section headings (house style). |
| `_labs/<slug>.md` | Lab as published on the site. Jekyll front matter + **plain headings, no emoji**. |
| `labs/<slug>/images/` | Images referenced by both. |

**Both files must change in the same PR.** `.github/workflows/lab-doc-sync.yml` runs `scripts/check-lab-sync.js` on every PR: a changed README without a matching `_labs/` change **fails the build**; the reverse produces a warning.

**Front matter drives the page** - `_layouts/lab.html` reads `page.title`, `page.description`, `page.module`, `page.section`, `page.difficulty`, `page.duration`, `page.order`, `page.journeys`. Metadata lives in the lab's front matter, not in a central config.

**Headings and the table of contents:**

- The sidebar "On this page" TOC is generated by the theme from your headings - nothing to maintain.
- The in-page `## Table of Contents` bullet list is **hand-written**. If you rename or re-emoji a heading, update those anchors: kramdown derives ids from the heading text, so `## 🧭 Lab Details` becomes `#-lab-details` while `## Lab Details` becomes `#lab-details`.
- Keep emoji **out** of `_labs/*.md` headings. They render on the published page and produce the dashed anchor ids above.

**When adding a NEW LAB:**

1. Create `labs/your-lab-name/` with `README.md` and `images/`
2. Create `_labs/your-lab-name.md` with front matter and the site copy of the content
3. Serve locally and verify the lab appears in its module and journey pages, prev/next navigation works, and images resolve
4. See `docs/NEW_LAB_CHECKLIST.md` for the fuller checklist

### 3. `_data/lab-config.yml` is Legacy

This file is still committed and edited by hand in some PRs, but **no layout, include, or script reads it** - templates consume `site.data.agendas`, `site.data.navigation`, `site.data.webchat`, and `site.data.ui-text`. Some event pages still describe content as "generated from lab-config.yml"; that text is historical. Do not tell users that editing it will change the site. There is no root `lab-config.yml`.

### 4. Node Scripts and CI

`scripts/` is Node (no `.ps1` build scripts):

| Script | Purpose |
| ------ | ------- |
| `build-feed.js` | Build the published content feed (`npm run build:feed`) |
| `consume-feed.js` | Consume external feeds into the build (`npm run consume:feed`) |
| `build-tracker-data.js` | Build data for the backlog tracker page |
| `check-lab-sync.js` | PR guard for README ↔ `_labs` sync |

Each has a colocated `*.test.js`; `npm test` runs them all with `node --test`.

**Workflows** (`.github/workflows/`): `build-and-deploy.yml` (Jekyll build → GitHub Pages), `lab-doc-sync.yml` (sync guard), `a11y.yml` (pa11y-ci), `lighthouse.yml`.

### 5. Styling

- **ALL styling** in `assets/css/` - `main.scss` plus `_tokens.scss` for design tokens; `tracker.css` for the tracker page
- Use CSS Custom Properties from `_tokens.scss`; light/dark switch via the `data-theme` attribute
- Never inline `<style>` blocks in content or templates
- Generic class names only (`event-*`, never `bootcamp-*` / `workshop-*`)
- Jekyll auto-rebuilds SCSS on save - no build script needed

### 6. Event System Architecture

**Events are separate from journeys**:

- **Journeys**: self-paced learning paths surfaced on the homepage
- **Events**: curated workshop experiences (Bootcamp, Azure AI Workshop, MCS in a Day, Agent Build-A-Thon variants)

Event pages live at `labs/<event-name>/index.md` and their running order comes from `_data/agendas/*.yml` (e.g. `_data/agendas/bootcamp-v3.yml`), which the event layouts read. Use the shared `.event-*` CSS classes for styling.

## 🚀 Common Workflows

### First-Time Setup

```bash
bash tools/setup/mac/install.sh   # or tools/setup/win/install.ps1 on Windows
bundle install
bash tools/run.sh
```

### Daily Development

```bash
bash tools/run.sh          # serve with livereload; edit and refresh
npm test                   # if you touched scripts/
```

### Container Operations

```bash
docker restart mcs-labs-review        # pick up a branch switch
docker logs -f mcs-labs-review        # watch the Jekyll rebuild
docker exec -it mcs-labs-review bash  # shell inside
```

## 📁 File Structure & Safe Edits

### ✅ Safe to Edit

- `labs/*/README.md` - lab content (GitHub view)
- `_labs/*.md` - lab content (published site) - **edit alongside the README**
- `assets/css/*` - styling
- `_layouts/*.html`, `_includes/*.html` - templates
- `_config.yml`, `_config.local.yml`, `_config.feed.yml` - Jekyll config
- `_data/agendas/*.yml`, `_data/navigation.yml` - navigation and event agendas
- `docs/*.md` - documentation

### ⚠️ Build Output (Don't Edit)

- `_site/` - Jekyll build output, regenerated on every serve/build
- `.feed-build/` - feed build artifacts

## 🐛 Troubleshooting

| Problem | Fix |
| ------- | --- |
| Page 404s at `http://localhost:4000/` | Use the baseurl: `http://localhost:4000/mcs-labs/` |
| Jekyll not picking up changes | Restart the server/container; check the terminal for a build error |
| New lab missing from the site | Confirm `_labs/<slug>.md` exists with front matter - the README alone publishes nothing |
| In-page TOC links go nowhere | Heading text changed; update the hand-written anchors (see Principle 2) |
| CI "Lab Doc Sync" failure | You changed a README without mirroring into `_labs/` (or vice versa) |
| Emoji showing in published headings | Emoji belong in `labs/*/README.md`, not `_labs/*.md` |

## 📚 Key Documentation Files

- `README.md` - project overview, setup, structure
- `docs/NEW_LAB_CHECKLIST.md` - checklist for adding new labs
- `docs/CONTENT_FEED.md`, `docs/PUBLISHING_FEEDS.md`, `docs/CONSUMING_FEEDS.md` - content feed syndication
- `docs/FILTERING.md` - lab filtering behavior
- `docs/issues-tracker-design.md`, `docs/issues-tracker-plan.md` - backlog tracker
- `CHANGELOG.md` - project history

> Earlier revisions of this file cited `docs/ADR.md`, `docs/DEVELOPMENT.md`, `docs/THEME_SYSTEM.md`, `docs/EVENT_SYSTEM.md`, `docs/QUICK_START.md`, `docs/LAB_AUTHORING_GUIDE.md`, and `docs/LOCAL_PDF_GENERATION.md`. **None of these exist in the repo** - don't cite ADR numbers or link them.

## 🎯 When Helping Users

### Ask About Context

- Are they editing lab content, templates, or styling?
- Does the change need to land in both `labs/*/README.md` and `_labs/*.md`?
- Is this a local test or a PR to upstream?

### Recommend Best Practices

- Mirror lab edits across both files in one commit
- Serve locally and click through the affected pages before pushing
- Run `npm test` after touching `scripts/`

### Provide Complete Commands

The repo supports macOS, Linux, and Windows. Give bash for the first two and PowerShell for Windows; do not assume a PowerShell-only environment.

## 🔍 Quick Reference

### Most Common Tasks

| Task | Command |
| ---- | ------- |
| Serve the site | `bash tools/run.sh` |
| Serve on Windows | `.\tools\run.ps1` |
| Run script tests | `npm test` |
| Build the feed | `npm run build:feed` |
| Restart container | `docker restart mcs-labs-review` |
| View container logs | `docker logs -f mcs-labs-review` |

### File Locations

- Lab content (GitHub): `labs/*/README.md`
- Lab content (site): `_labs/*.md`
- Lab images: `labs/*/images/`
- Event agendas: `_data/agendas/*.yml`
- CSS: `assets/css/main.scss`, `assets/css/_tokens.scss`
- Layouts: `_layouts/*.html`
- Node scripts: `scripts/*.js`

---

**Last Updated**: August 2026
