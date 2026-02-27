# Changelog

All notable changes to the Microsoft Copilot Studio Labs will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
