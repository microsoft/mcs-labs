# Bootcamp Navigation System Documentation

## Overview

This document explains the implementation of the bootcamp navigation system that provides:
- **Homepage**: Clean journey cards (excludes bootcamp)
- **Top Navigation**: Permanent bootcamp access via header menu
- **Bootcamp Page**: Dedicated page with special numbering (1a, 1b, 2, 3a, 3b, etc.)
- **Lab Numbers**: Visible throughout the site for all labs

## Architecture

### 1. Homepage Journey Cards

**File**: `lab-config.yml` - `journeys` section  
**Purpose**: Defines journey cards displayed on homepage  
**Implementation**: Only contains 4 journeys (quick-start, business-user, developer, autonomous-ai)

```yaml
journeys:
  quick-start:
    title: "Quick Start Journey"
    # ... other journeys
  # Bootcamp intentionally EXCLUDED from this section
```

**Result**: Homepage displays exactly 4 journey cards, bootcamp does not appear as a card.

### 2. Top Navigation

**File**: `_layouts/default.html`  
**Purpose**: Site-wide header navigation  
**Implementation**: Hardcoded navigation links in header

```html
<nav class="main-nav">
  <a href="{{ '/' | relative_url }}">Home</a>
  <a href="{{ '/labs/' | relative_url }}">All Labs</a>
  <a href="{{ '/labs/bootcamp/' | relative_url }}">Bootcamp</a>
</nav>
```

**Result**: Permanent bootcamp access in header next to Home and All Labs.

### 3. Bootcamp Page

**File**: `/labs/bootcamp/index.md`  
**Purpose**: Dedicated bootcamp page with special sequencing  
**Implementation**: Custom layout with bootcamp-specific CSS and HTML

**Features**:
- Special numbering system: 1a, 1b, 2, 3a, 3b, 4, 5a, 5b, 6, 7
- Custom styling for bootcamp-specific layout
- Independent of homepage journey system

### 4. Lab Numbering System

**File**: `assets/css/style.css`  
**Purpose**: Global lab number visibility  
**Implementation**: CSS styles for `.lab-sequence` and `.lab-order` elements

**Critical Fix Applied**:
```css
/* REMOVED: This CSS rule was hiding lab numbers globally
.lab-sequence, .lab-order { 
  display: none !important; 
}
*/
```

**Result**: Lab numbers now visible in:
- Lab cards on journey pages
- Sidebar navigation
- Bootcamp page sequencing
- All lab listing pages

## Configuration Details

### lab-config.yml Structure

```yaml
# Journey definitions for homepage cards
journeys:
  quick-start: { ... }
  business-user: { ... }
  developer: { ... }
  autonomous-ai: { ... }
  # bootcamp: EXCLUDED to prevent homepage display

# Lab assignments to journeys (for homepage organization)
lab_journeys:
  some-lab: ["quick-start", "developer"]
  # Bootcamp labs NOT assigned here to prevent homepage appearance

# Bootcamp ordering for dedicated page
bootcamp_lab_orders:
  agent-builder-sharepoint: "1a"
  agent-builder-web: "1b"
  setup-for-success: "2"
  # ... continues with special numbering
```

### Navigation URL Patterns

1. **Homepage**: `/` - Shows 4 journey cards
2. **All Labs**: `/labs/` - Lists all labs regardless of journey
3. **Bootcamp**: `/labs/bootcamp/` - Dedicated bootcamp page
4. **Dynamic Bootcamp**: `/labs/?bootcamp=true` - Still works for filtering

## Implementation History

### Problem Solved
- **Issue**: Bootcamp appearing as journey card on homepage
- **Root Cause**: Bootcamp defined in `journeys` section of config
- **Solution**: Removed bootcamp from journeys while preserving functionality

### Changes Made

1. **lab-config.yml**:
   - Removed bootcamp from `journeys` section
   - Removed bootcamp assignments from `lab_journeys`
   - Preserved `bootcamp_lab_orders` for dedicated page

2. **_layouts/default.html**:
   - Added permanent "Bootcamp" link to header navigation
   - Fixed URL from `/labs/#bootcamp` to `/labs/bootcamp/`

3. **assets/css/style.css**:
   - Removed CSS rule hiding lab numbers globally
   - Restored visibility of `.lab-sequence` and `.lab-order` elements

4. **Generated Files**:
   - Regenerated all `_labs/*.md` files without bootcamp journey assignments
   - Maintained individual lab functionality and content

## Maintenance Guidelines

### Adding New Journeys
1. Add journey definition to `journeys` section in `lab-config.yml`
2. Assign relevant labs in `lab_journeys` section
3. Journey will automatically appear as homepage card

### Modifying Bootcamp
1. **Page Content**: Edit `/labs/bootcamp/index.md`
2. **Lab Sequence**: Modify `bootcamp_lab_orders` in `lab-config.yml`
3. **Navigation**: Hardcoded in `_layouts/default.html` (rarely changes)

### Lab Numbering
- **NEVER** add `display: none` to `.lab-sequence` or `.lab-order` CSS classes
- Lab numbers are essential for navigation and user experience
- Numbering appears in multiple contexts and should remain visible

### URL Structure
- **Homepage Cards**: Dynamic from `journeys` config
- **Bootcamp Navigation**: Hardcoded to `/labs/bootcamp/`
- **Dynamic Filtering**: `/labs/?bootcamp=true` still supported

## Testing Checklist

After making changes, verify:

- [ ] Homepage shows exactly 4 journey cards (no bootcamp card)
- [ ] Top navigation includes functional "Bootcamp" link
- [ ] Bootcamp link navigates to `/labs/bootcamp/` page
- [ ] Bootcamp page displays labs with special numbering
- [ ] Lab numbers visible in sidebar navigation
- [ ] Lab numbers visible on lab cards
- [ ] All lab functionality preserved

## Technical Notes

### Jekyll Generation
- PowerShell script (`Generate-Labs.ps1`) processes config and generates Jekyll files
- Journey assignments control homepage display
- Bootcamp ordering controls dedicated page sequencing

### CSS Architecture
- Theme-agnostic base styles in `style.css`
- Lab numbering uses CSS custom properties for theme flexibility
- Global visibility controlled by base CSS rules

### Navigation Patterns
- Homepage: Journey-based card system
- Header: Direct navigation links
- Bootcamp: Dedicated page with special layout
- All Labs: Complete lab listing regardless of journey

This system provides flexible navigation while maintaining clean separation between homepage journey cards and bootcamp functionality.