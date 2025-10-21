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

## Future Considerations

### ADR-006: Component-Based Architecture (Proposed)

**Status**: Under Consideration  
**Context**: As the project grows, we may need more modular CSS and HTML components.

**Potential Decision**: Implement a component-based architecture using Jekyll includes and modular CSS.

**Considerations**:
- Would improve maintainability
- Better code reuse across labs
- More complex build process
- Need to evaluate impact on generation scripts

### ADR-007: Build Pipeline Optimization (Proposed)

**Status**: Under Consideration  
**Context**: Build times may become an issue as content grows.

**Potential Decision**: Implement build caching and optimization strategies.

**Considerations**:
- Faster development cycles
- More complex CI/CD setup
- Dependency management complexity

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