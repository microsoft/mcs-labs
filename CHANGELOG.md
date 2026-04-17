# Changelog

All notable changes to the Microsoft Copilot Studio Labs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## Unreleased

### Added
- **Event-aware navigation.** Labs opened from an event page now show an in-lab rail below the header with the event name, `Lab X of Y` position, Previous / Next lab buttons, and an expandable agenda popover. A matching pair of Previous / Next cards renders at the bottom of the lab. Breadcrumbs override to `Home / Events / <Event> / <Lab>` when an event context is active. Event context sticks via `sessionStorage['mcs-labs.event-context.v1']` so the user keeps in-event navigation even when they click internal links that don't carry `?event=`. A × button on the rail exits the event context explicitly.
- **Event agenda data model (`_data/agendas/<event_id>.yml`).** Each event can now declare a full schedule with labs, sessions, breaks, and external links. The event detail page renders this as a timeline; non-lab items (welcome, Q&A, lunch, etc.) display inline. Events without an agenda file fall back to the existing `labs:` array — no migration required.
- **Slides download chips on session rows.** Session entries in an agenda can declare `slides:` pointing to a file in `/presentations/`; the event timeline renders a small accent-tint "Slides" chip below the session title that downloads the deck when tapped. Wired to all Bootcamp + MCS in a Day modules.
- Homepage "Browse all labs →" link replacing the Learning paths grid.

- Accessibility settings menu in the masthead: theme switcher (Light, Dark, High contrast, Match system) and 3-step text size (A−, A, A+). Preferences persist in `localStorage` under `mcs-labs.prefs.v1`. A pre-paint inline script applies the stored theme before CSS loads, preventing any flash of wrong theme on reload.
- Dark-mode Rouge syntax highlighting (Monokai-like palette) and high-contrast code blocks under `[data-theme="hc"]`.
- Design-token layer (`assets/css/_tokens.scss`): all site colors now resolve through CSS custom properties with Light, Dark, and High contrast palettes plus a `System` option that follows `prefers-color-scheme`.
- Global `prefers-reduced-motion` block that neutralizes panel slide, typing-dot pulse, and send-button transitions for motion-sensitive users.
- Continuous a11y coverage on pull requests: `pa11y-ci` at WCAG 2.1 AA (`.github/workflows/a11y.yml`, `.pa11yci.json`) and Lighthouse CI requiring an accessibility score ≥ 95 (`.github/workflows/lighthouse.yml`, `lighthouserc.json`).

### Changed
- Lab Assistant chat persists across in-tab page navigation using `sessionStorage` (no cookies). Token, Direct Line conversation, and transcript are preserved; state clears when the tab closes. Open/closed panel state also survives navigation.
- Lab Assistant panel no longer overlaps the site masthead on small screens — panel top now tracks the masthead's live height.
- Lab Assistant now shifts main content instead of overlaying it at viewports ≥ 1024 px. Below 1024 px the panel continues to overlay; at 1440 px+ both the TOC and the panel stay on-screen. The TOC collapses when the panel is open between 1024–1440 px to keep the content column readable.
- Lab Assistant pull-handle is now a native `<button>`; gains automatic keyboard activation and focus semantics.
- Pinned `minimal-mistakes-jekyll` to `= 4.27.3` to protect the new `_includes/masthead.html` shadow from silent upstream drift.

### Fixed
- Restore lab content overwritten by the redesign merge (PR #265). The `_labs/*.md` collection was frozen at 2026-03-06 and missed subsequent content PRs (#215, #224, #225, #234, #242, #244, #245, #248, #249, #250, #251, #252, #253, #254, #255, #256, #257, #258). Rewrote every lab body from the authoritative `labs/*/README.md` source.
- Re-apply PR #246 orphan-lab removal: delete `public-website-agent` and `ask-me-anything-30-mins` (lab files and navigation entries) that returned after the redesign merge.
- Secondary-gray text tokens (TOC titles, timestamps, placeholders, hints) darkened to pass WCAG 2.1 AA contrast; previously several fell between 1.8:1 and 3.3:1.
- Visible keyboard focus ring on the Lab Assistant send input; previously `outline: none !important` stripped it with no fallback.
- Lab Assistant decorative SVG icons now carry `aria-hidden="true" focusable="false"` so screen readers skip them.
- Lab Assistant send input is now associated with a `<label>` (`Message Lab Assistant`) — placeholder alone was not sufficient for assistive tech.
- Lab Assistant panel announces with `role="dialog"` + `aria-labelledby` and exposes `aria-expanded` on its trigger; previously announced as a generic complementary region with no expanded state.

## 3.2.0 - 2026-03-20

### Added
- Presentation decks added to presentations folder (#227)
- Presentations folder structure (#205)

## 3.1.0 - 2026-02-26

### Added
- Optional Work tab experience steps to agent-builder-m365 lab (#190)
- Bug Bash guide for reporting lab issues (#151)
- Report Issue button to site navigation (#152)
- mcs-governance lab, mcs-in-a-day-v2 event (#149, #150)
- Required solution files for labs (#145)
- New ALM consolidated lab combining setup-for-success and pipelines (#143)
- Copilot Studio Tools lab (#142)
- Dataverse MCP Connector lab (#140)
- New Component Collections lab (#139)
- Dataverse search steps (#137)
- Copilot Studio bootcamp labs (#129)

### Changed
- Use README as source of truth for lab durations (#161)
- Update BUG-BASH.md portal link to point to bootcamp event page (#160)
- Refine instructions for Copilot Studio agent creation (#157)
- Updates from testing (#155, #156)
- Update component collection name and contents in Component Collections lab (#147)
- Update root README with all labs (#146)
- Update core-concepts-variables-agents-channels from testing (#144)
- Update multi-agent lab copy (#128)
- Update licensing guide and file size (#130)
- Refactor core concepts into three focused labs (#131)

### Fixed
- Fix note callout formatting in governance lab (#199)
- Revise prompt for visual sales chart in README (#169)
- Refine summary of prompt in README (#170)
- Update governance lab agent URLs and fix Dockerfile multi-arch support (#197)
- Add missing mcs-governance lab to README table (#154)
- Fix mcs-ALM 404 by renaming folder to lowercase mcs-alm (#153)
- Fix grammar and spelling throughout multi-agent lab (#138)
- Restore multi-agent indexing (#136)

## 3.0.0 - 2026-01-28

### Added
- New multi-agent lab (#122)
- Human-in-the-loop lab — expense claims with approvals (#118)
- Setup-for-success added to buildathon 1-month journey (#113)
- Workflow concurrency controls (#112)

### Changed
- Update top-level docs for multi-agent lab (#124)
- Multi-agent lab: Remove indexing instructions (#123)
- Update bootcamp docs (#119)
- Update AI builder labs (#111)

### Fixed
- Add .gitignore for data config (#121)
- Fix typo in lab instructions (#120)
- Add tip to Ask Me Anything lab (#116)
- Fix minor typos (#110)

## Unreleased

### Added
- Simplified single-source configuration format (ADR-012)
  - Labs now defined once in `labs:` section with all properties (title, difficulty, duration, section, order, journeys, events)
  - Adding a new lab requires ONE entry instead of 3-6
  - Automatic conversion layer maintains backward compatibility with Jekyll templates
- Enhanced configuration audit in Check-LabConfigs.ps1
  - Duplicate lab ID detection
  - Journey card vs left navigation count validation
  - Multi-line YAML array parsing support
- Agent Academy external lab integration
  - Links to microsoft/agent-academy Recruit Level curriculum
  - 13-lesson curriculum covering agents, LLMs, and deployment
- YAML export function in Generate-Labs.ps1
  - Serializes converted config to `_data/` for Jekyll templates
  - Handles PowerShell hashtables, arrays, and List types

### Changed
- **Rebranded "Copilot Studio Lite" to "Agent Builder in Microsoft 365"**
  - Renamed lab folder `copilot-studio-lite` → `agent-builder-m365`
  - Updated all lab titles, descriptions, and references across the codebase
  - Updated Microsoft docs links to new URL slugs
- Generate-Labs.ps1 now calls Check-LabConfigs.ps1 directly instead of embedding audit logic
- Order numbering scheme updated to 100-699 range (all 3-digit)
- NEW_LAB_CHECKLIST.md simplified to reflect single-entry workflow

### Fixed
- Duplicate lab counting in card vs nav validation (reset currentLab after section exit)
- List type serialization in YAML export (handles System.Collections.Generic.List)
- External lab order not being applied (was always 999, now reads from config)

## 2.6.0 - 2025-11-19

### Added
- Events dropdown navigation system for improved scalability (#89)
  - Replaced flat event links with collapsible dropdown in header
  - Added support for 5 events: Bootcamp, Azure AI Workshop, MCS in a Day, Agent Build-A-Thon (1 day), Agent Build-A-Thon (1 month)
  - Implemented JavaScript toggle behavior (click, outside click, ESC key)
  - Added ARIA attributes for accessibility
- Two new Build-A-Thon event pages (#89)
  - Agent Build-A-Thon (1 day) with 2 labs
  - Agent Build-A-Thon (1 month) with 8 labs including autonomous AI agents
- Event context banner system (#89)
  - Dynamic banner shows current event context when viewing labs with `?event=` parameter
  - Left navigation title changes to "Event Navigation" in event context
- Comprehensive CHANGELOG.md documenting project history from June 2025 to present (#90)

### Changed
- Improved button styling across all theme variants (#89)
  - Added `--text-on-accent` CSS variable to Rich and Minimal themes
  - Fixed text contrast issues in all 4 theme combinations

### Fixed
- Button text contrast issues across all 4 theme variants (#89)
- Duplicate emoji display in event context banner (#89)

## 2.5.0 - 2025-10-27

### Added
- Guild Hall Custom MCP lab with Windows curl syntax (#54, #78, #81, #86)
- PR merge verification step in workflow documentation (#76)

### Changed
- Updated BYOM lab to focus on Chit Chat Generator with grok-3-mini (#80)
- Switched Azure AI Workshop lab order - Data Fabric Agent now Lab 4, Guild Hall MCP now Lab 5 (#79)
- Enhanced Dataverse MCP connector lab content (#77)

### Fixed
- TOC regex capturing all content after horizontal rules (#85)
- TOC anchors with emoji headings preserving leading dashes (#84)
- Minor formatting and clarification improvements (#83)
- Broken image references and Azure region updates (#82)
- Standardized lab resource placeholders in contract-alerts-azure-ai (#87)

## 2.4.0 - 2025-10-26

### Added
- MCS in a Day event page with unified event system (#67)
- Automated lab configuration auditing system (#74)
- Copilot Studio Lite progressive learning lab (#63)

### Changed
- Enhanced BYOM lab with screenshots and improved instructions (#75)

### Fixed
- Consistent header layout between rich and minimal themes (#75)
- Correct image filename reference in dataverse-mcp-connector lab (#75)

## 2.3.0 - 2025-10-25

### Added
- Bring Your Own Model (BYOM) lab (#65)
- Contract Alerts Azure AI lab with Azure setup reference and accessibility improvements (#64)
- Automated H2-only TOC generation with truncation bug fix (#66)

## 2.2.0 - 2025-10-24

### Added
- Data Fabric Agent lab with CSS improvements (#55)

### Fixed
- Removed duplicate script block causing redundant function definitions (#56)
- Escaped pipes in markdown link text to prevent table parsing (#59)
- Added missing HTML comment opening tag in default layout (#60)
- Updated callout wording in dataverse-mcp-connector lab (#61)

## 2.1.0 - 2025-10-23

### Added
- Guild Hall MCP lab (#54)

## 2.0.0 - 2025-10-17

### Added
- Markdown detection feature and improved fenced code block formatting (#52)

### Changed
- Complete apostrophe spacing resolution with Kramdown configuration (#50)

### Fixed
- Apostrophe spacing issues in HTML rendering (#48)

## 1.9.0 - 2025-10-16

### Added
- Comprehensive bootcamp navigation system with section filtering (#45)

### Changed
- Enhanced lab instructions for Lab 4 and other bootcamp labs (#46, #47, #49)

## 1.8.0 - 2025-10-15

### Added
- Scroll-to-top button on lab pages (#42)
- Web portal link to README for better user experience (#43)

### Changed
- Complete theme system overhaul with major infrastructure cleanup (#41)

### Fixed
- Hide lab numbers from both lab cards and left navigation (#44)

## 1.7.0 - 2025-10-13

### Fixed
- Major navigation fixes and UX improvements for lab browser (#39)

## 1.6.0 - 2025-10-06

### Added
- Comprehensive documentation pipeline for GitHub Pages enhancement (#37)

### Fixed
- Markdown formatting issues in autonomous-account-news lab (#38)

## 1.5.0 - 2025-10-03

### Changed
- Revised Dataverse connector configuration (#36)
- Updated autonomous lab instructions (#34, #35)
- Revised topic addition steps in README (#33)

## 1.4.0 - 2025-10-02

### Added
- 30-minute version of Ask Me Anything lab (#33)

### Changed
- Updated labs to add tips and place Teams chat as extra challenge (#32)

## 1.3.0 - 2025-10-01

### Changed
- Revised Nova AI setup and interaction instructions (#28)
- Clarified connector names and commit message examples (#27)
- Updated agent configuration and file handling instructions (#26, #25)

### Fixed
- Fixed URLs and improved step instructions (#29)

## 1.2.0 - 2025-09-29

### Changed
- Updated CUA lab to use hosted browser instead of hosted machine (#24)
- Renamed "Agent Builder" to "Copilot Studio Lite" (#23)

## 1.1.0 - 2025-09-22

### Changed
- Modified Excel knowledge to file upload in contract alerts lab (#22)
- August retrospective updates for workshop agent (#21)

## 1.0.0 - 2025-08-18

### Changed
- Replaced poem by city in lab content (#15)

## 0.4.0 - 2025-07-24

### Fixed
- Documentation updates and README improvements (#13, #14)

## 0.3.0 - 2025-07-15

### Added
- Autonomous agents with CUA lab (#12)
- MCP Qualify Lead lab (#11)

## 0.2.0 - 2025-06-30

### Added
- Standard Orchestration lab (#9)

## 0.1.0 - 2025-06-20

### Added
- MBR prep SharePoint agent lab (#7)
- Account news autonomous agent lab (#4)

### Fixed
- Blockquote formatting (#5)

### Security
- Added Microsoft SECURITY.MD (#2)

## 0.0.1 - 2025-06-11

### Added
- Initial repository setup with Microsoft mandatory files
- Agent Builder Web lab
- Ask Me Anything lab
- Setup for Success lab
- Lab template for contributors
- Journey-based navigation (Quick Start, Business User, Developer, Autonomous AI)
- Multi-theme system (Rich/Minimal × Light/Dark)
- Automated PDF generation from markdown
- Docker-based development environment
- PowerShell automation scripts for lab generation
- README with project overview and setup instructions
- LICENSE file
