# Event System Documentation

## Overview

This document is the **single source of truth** for all event-related documentation in MCS Labs. It explains the unified event system architecture which provides a consistent framework for hosting curated workshop experiences (Bootcamp, Azure AI Workshop, MCS in a Day, Agent Build-A-Thon variants) separate from the main journey-based navigation.

> **Note**: Event-specific lab lists and ordering are maintained in `lab-config.yml`. This document covers architecture and implementation only - see the config file for current event content.

**Key Features:**
- **Unified URL Parameters**: Consistent `?event=` parameter for all event filtering
- **Generic CSS Classes**: Shared `.event-*` styling across all events
- **Centralized Configuration**: Single source of truth in `lab-config.yml`
- **Homepage Exclusion**: Events accessible via top navigation, not journey cards
- **Event-Specific Sequencing**: Custom lab ordering per event

## Event System Architecture

### Unified Event Parameter Pattern

All events use a consistent `?event=` URL parameter:

| Event             | URL Parameter              | Config Key                     | Event Page                 |
| ----------------- | -------------------------- | ------------------------------ | -------------------------- |
| Bootcamp          | `?event=bootcamp`          | `bootcamp_lab_orders`          | `/labs/bootcamp/`          |
| Azure AI Workshop | `?event=azure-ai-workshop` | `azure_ai_workshop_lab_orders` | `/labs/azure-ai-workshop/` |
| MCS in a Day      | `?event=mcs-in-a-day`      | `mcs_in_a_day_lab_orders`      | `/labs/mcs-in-a-day/`      |

**Why Unified?**
- Consistent user experience across all events
- Easier to document and explain
- Simplified JavaScript detection logic
- Scalable for future events without new parameter patterns

### Migration from Old System

**Old (Inconsistent) Parameters:**
```
/labs/bootcamp/?bootcamp=true              ❌ Boolean pattern
/labs/azure-ai-workshop/?workshop=azure-ai ❌ Different parameter name
```

**New (Unified) Parameters:**
```
/labs/bootcamp/?event=bootcamp                    ✅ Consistent
/labs/azure-ai-workshop/?event=azure-ai-workshop  ✅ Same pattern
/labs/mcs-in-a-day/?event=mcs-in-a-day           ✅ Scalable
```

## Technical Implementation

### 1. Configuration (lab-config.yml)

Event metadata and lab ordering centralized in `lab-config.yml`:

```yaml
# =====================================================
# EVENT CONFIGURATIONS - Centralized event metadata
# =====================================================
event_configs:
  bootcamp:
    title: "⚔️ Bootcamp Journey"
    config_key: "bootcamp_lab_orders"
  azure-ai-workshop:
    title: "☁️ Azure AI Workshop"
    config_key: "azure_ai_workshop_lab_orders"
  mcs-in-a-day:
    title: "⚡ MCS in a Day"
    config_key: "mcs_in_a_day_lab_orders"

# =====================================================
# EVENT-SPECIFIC LAB ORDERING
# =====================================================
bootcamp_lab_orders:
  agent-builder-sharepoint: "1a"
  agent-builder-web: "1b"
  setup-for-success: "2"
  # ... special numbering continues

azure_ai_workshop_lab_orders:
  1: "contract-alerts-azure-ai"
  # ... progressive numbering

mcs_in_a_day_lab_orders:
  1: "agent-builder-web"
  2: "public-website-agent"
  3: "agent-builder-sharepoint"
  4: "ask-me-anything"
  5: "autonomous-support-agent"
```

**Key Principles:**
- Events are NOT in `journeys` section (prevents homepage display)
- Events are NOT in `lab_journeys` assignments
- Event lab ordering completely independent

### 2. JavaScript Event Detection (_layouts/lab.html)

Unified event parameter detection:

```javascript
// Detect event parameter
const urlParams = new URLSearchParams(window.location.search);
const filterEvent = urlParams.get("event");

// Map event to configuration key
const eventConfigMap = {
  "bootcamp": "bootcamp_lab_orders",
  "azure-ai-workshop": "azure_ai_workshop_lab_orders",
  "mcs-in-a-day": "mcs_in_a_day_lab_orders"
};

// Get event-specific lab IDs
if (filterEvent && eventConfigMap[filterEvent]) {
  const configKey = eventConfigMap[filterEvent];
  const eventLabIds = document.body.dataset[`eventLabs${filterEvent.replace(/-/g, '')}`];
  // ... filter and sort labs
}
```

**Features:**
- Single parameter detection (no dual checks)
- Dynamic lab ID array loading from data attributes
- Event-aware filtering and sorting
- Context preservation in navigation

### 3. Generic CSS Classes (assets/css/style.css)

All events share generic `.event-*` classes:

```css
/* EVENT PAGE STYLES - Generic for all events */
.event-nav { /* Navigation bar */ }
.event-info { /* Title and description */ }
.event-stats { /* Statistics display */ }
.event-labs { /* Lab cards container */ }
.event-overview { /* Overview section */ }
.event-resources { /* Additional resources */ }
.event-support { /* Support information */ }
```

**Why Generic Classes?**
- Single CSS update affects all events consistently
- Eliminates duplicate event-specific CSS (bootcamp-*, workshop-*)
- Follows DRY principle
- New events automatically styled correctly

### 4. Event Page Structure

All event pages follow identical HTML structure:

```html
<div class="event-nav">
  <a href="/labs/" class="nav-link">← Back to All Labs</a>
  <div class="event-info">
    <h1>Event Title</h1>
    <p>Event description</p>
    <div class="event-stats">
      <span>📊 Difficulty</span>
      <span>⏱️ Estimated Time</span>
      <span>📚 Total Labs</span>
    </div>
  </div>
</div>

<div class="event-overview">
  <!-- Event-specific overview content -->
</div>

<div class="event-labs">
  <!-- Dynamically generated lab cards -->
</div>

<div class="event-resources">
  <!-- Additional resources -->
</div>

<div class="event-support">
  <!-- Support information -->
</div>
```

### 5. Navigation Integration (_layouts/default.html)

Events accessible via top navigation:

```html
<nav class="main-nav">
  <a href="/">Home</a>
  <a href="/labs/">All Labs</a>
  <a href="/labs/bootcamp/">Bootcamp</a>
  <a href="/labs/azure-ai-workshop/">Azure AI Workshop</a>
  <a href="/labs/mcs-in-a-day/">MCS in a Day</a>
</nav>
```

## Event Navigation Features

### URL Patterns

1. **Homepage**: `/` - Shows 4 journey cards (events excluded)
2. **All Labs**: `/labs/` - Lists all labs regardless of journey or event
3. **Event Pages**: `/labs/{event-name}/` - Dedicated event landing pages
4. **Event Filtering**: `/labs/{event-name}/?event={event-name}` - Filtered event view
5. **Lab with Event Context**: `/labs/{lab-id}/?event={event-name}` - Individual lab in event context

### Event Filtering Workflow

When a user navigates with `?event=` parameter:

1. **URL Detection**: JavaScript detects `urlParams.get("event")`
2. **Config Lookup**: Maps event value to config key via `eventConfigMap`
3. **Lab Filtering**: Displays only labs configured for that event
4. **Custom Ordering**: Labs appear in event-specific sequence
5. **Context Preservation**: Left navigation maintains event context between lab pages
6. **Title Display**: Shows centralized event title from `event_configs`

### Lab Navigation in Event Context

When viewing labs within an event:

- **Prev/Next Navigation**: Cycles through event labs in configured order
- **Back Link**: Returns to event page with proper event parameter preserved
- **Journey Badges**: Event journey badge shown instead of regular journey badges
- **Title Display**: Shows event-specific title (e.g., "⚔️ Bootcamp Journey")
- **Breadcrumb Context**: Lab aware it's part of an event sequence

## Adding New Events

### Step-by-Step Guide

1. **Add Event Metadata** to `lab-config.yml`:
   ```yaml
   event_configs:
     new-event-name:
       title: "🎯 New Event Title"
       config_key: "new_event_lab_orders"
   ```

2. **Create Lab Ordering Configuration**:
   ```yaml
   new_event_lab_orders:
     1: "lab-id-1"
     2: "lab-id-2"
     3: "lab-id-3"
   ```

3. **Update JavaScript Mapping** in `_layouts/lab.html`:
   ```javascript
   const eventConfigMap = {
     // ... existing events
     "new-event-name": "new_event_lab_orders"
   };
   ```

4. **Create Event Page** at `labs/new-event-name/index.md`:
   - Use generic `.event-*` CSS classes
   - Follow existing event page structure
   - Include Jekyll templating for dynamic lab cards

5. **Add Navigation Link** (optional) in `_layouts/default.html`:
   ```html
   <a href="/labs/new-event-name/">New Event</a>
   ```

6. **Document Event** in `docs/NEW_EVENT_NAME.md`:
   - Event-specific schedule, content, facilitation guidance
   - Link to this EVENT_SYSTEM.md for architecture

7. **Test Event**:
   ```powershell
   .\scripts\Generate-Labs.ps1 -SkipPDFs
   # Test: http://localhost:4000/mcs-labs/labs/new-event-name/?event=new-event-name
   ```

## Implementation History

### Unified Event System (October 2025)

**Problem**: Inconsistent URL parameters across events
- Bootcamp used `?bootcamp=true` (boolean)
- Azure AI Workshop used `?workshop=azure-ai` (key-value)
- New events would create more patterns

**Solution**: Unified all events to use `?event={event-name}` parameter

**Changes Made**:
1. Added `event_configs` section with centralized metadata
2. Refactored `_layouts/lab.html` JavaScript for unified `?event=` detection
3. Renamed CSS classes from event-specific (bootcamp-*, workshop-*) to generic (event-*)
4. Updated all event pages to use unified parameter and CSS classes
5. Added event-specific lab ordering configurations

### Homepage Exclusion (Earlier)

**Problem**: Bootcamp/workshops appearing as journey cards on homepage

**Solution**: 
- Removed events from `journeys` section
- Added permanent navigation links in header
- Preserved event functionality via dedicated pages

## Testing Checklist

### Homepage and Navigation
- [ ] Homepage shows exactly 4 journey cards (no event cards)
- [ ] Top navigation includes functional event links
- [ ] All event links navigate to correct pages

### Event Pages
- [ ] Each event page displays correct labs with proper numbering
- [ ] Event statistics calculate correctly (difficulty, time, count)
- [ ] Generic `.event-*` CSS classes render consistently

### Event Filtering
- [ ] `/labs/bootcamp/?event=bootcamp` filters and sorts correctly
- [ ] `/labs/azure-ai-workshop/?event=azure-ai-workshop` filters and sorts correctly
- [ ] `/labs/mcs-in-a-day/?event=mcs-in-a-day` filters and sorts correctly
- [ ] Left navigation preserves event context when navigating between labs
- [ ] Prev/next navigation works correctly within event context
- [ ] Back links return to event page with proper parameter

### Visual Consistency
- [ ] All event pages use consistent styling
- [ ] No visual differences between events (except content)
- [ ] Responsive design works on mobile
- [ ] Lab numbers visible in sidebar navigation
- [ ] Lab numbers visible on lab cards

### Documentation
- [ ] Event configuration documented in `lab-config.yml` comments
- [ ] Event-specific docs reference this EVENT_SYSTEM.md
- [ ] CSS class naming conventions explained

## Related Documentation

- **Development Guides**:
  - [Development Guide](./DEVELOPMENT.md) - General development workflow
  - [Lab Authoring Guide](./LAB_AUTHORING_GUIDE.md) - Creating new labs
  - [Architecture Decisions](./ADR.md) - ADR records

- **Technical Details**:
  - [Theme System](./THEME_SYSTEM.md) - CSS theming architecture
  - [PDF Generation](./LOCAL_PDF_GENERATION.md) - PDF generation system

---

**Document Version**: 2.0  
**Last Updated**: January 2026  
**Maintainer**: MCS Labs Team
