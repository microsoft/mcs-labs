# Multi-Theme System Documentation

## Overview

The MCS Labs site now supports multiple theme families with light/dark mode variants and a modular architecture that makes it easy to add new themes in the future.

## Available Themes

### Theme Families
1. **Rich** - The original colorful design with gradients, shadows, and vibrant colors
   - 🎨 **Rich Light** - Light mode with colorful design
   - 🌙 **Rich Dark** - Dark mode with vibrant colors

2. **Minimal** - Clean, blog-style theme inspired by the Microsoft CAT blog with Chirpy Jekyll theme colors
   - 📄 **Minimal Light** - Clean, professional light theme with neutral colors
   - 🌑 **Minimal Dark** - Minimal dark theme with clean typography

## How to Use

- Click the theme family button in the header to switch between Rich and Minimal
- Click the light/dark mode toggle to switch between light and dark variants
- Your theme preference is automatically saved and remembered
- Themes load dynamically without requiring a page refresh

## Architecture

### Files Structure
```
assets/
├── css/
│   ├── style.css              # Base styles (theme-agnostic)
│   └── themes/
│       ├── theme-rich.css     # Rich theme family (light & dark variants)
│       └── theme-minimal.css  # Minimal theme family (light & dark variants)
└── js/
    └── theme-manager.js       # Theme loading and management system
```

### How It Works

1. **Base CSS** (`style.css`) contains all structural styles using CSS custom properties (variables)
2. **Theme CSS files** define the color schemes, typography, and theme-specific overrides
3. **Theme Manager** (`theme-manager.js`) dynamically loads the appropriate theme CSS file
4. **Layout integration** in `_layouts/default.html` initializes the theme system with FOUC protection
5. **Data attributes** (`data-theme-family` and `data-theme`) applied to HTML element for theme-specific styling

## Theme System Details

### Theme Families vs Modes
- **Theme Family**: Overall design approach (Rich vs Minimal)
- **Theme Mode**: Color variant within a family (Light vs Dark)
- Storage: `theme-family` and `theme-mode` in localStorage
- HTML attributes: `data-theme-family="minimal"` and `data-theme="dark"`

### CSS Selector Strategy
Theme-specific styles use combined selectors:
```css
html[data-theme-family="minimal"] .lab-card {
    /* Minimal theme specific styles */
}

html[data-theme-family="minimal"][data-theme="dark"] .lab-card {
    /* Minimal dark mode specific styles */
}
```

## Adding New Themes

To add a new theme family:

1. **Create a new theme CSS file** in `assets/css/themes/`
2. **Define the theme family** in `theme-manager.js` by adding to the `THEME_FAMILIES` object:
   ```javascript
   'new-theme': {
       name: 'New Theme',
       file: '/assets/css/themes/theme-new.css',
       description: 'Description of the new theme'
   }
   ```
3. **Create the CSS variables** in your theme file using the same variable names as existing themes
4. **Add theme-specific overrides** using `html[data-theme-family="new-theme"]` selectors

## CSS Variables Used

All themes should define these CSS custom properties:

### Core Colors
- `--bg-primary`, `--bg-secondary`, `--bg-tertiary` - Background colors
- `--text-primary`, `--text-secondary`, `--text-muted` - Text colors
- `--heading-color` - Heading text color
- `--border-color`, `--border-light` - Border colors
- `--shadow`, `--shadow-hover` - Box shadow values

### Interactive Colors
- `--link-color`, `--link-hover-color` - Link colors
- `--accent-primary`, `--accent-secondary` - Accent colors
- `--hover-bg` - Hover background colors

### Typography
- `--font-family-base`, `--font-family-monospace` - Font families
- `--font-size-base`, `--line-height-base` - Typography scale

### Component Colors
- `--header-bg`, `--header-text` - Header styling
- `--badge-*-bg`, `--badge-*-text` - Badge colors for different types
- `--border-*` - Border colors for different content types
- `--journey-*-color` - Journey-specific colors

### Theme-Specific Overrides
The minimal theme uses additional selectors for component-specific styling:
```css
html[data-theme-family="minimal"] .lab-card {
    /* Override lab card styling for minimal theme */
}

html[data-theme-family="minimal"] .filter-btn {
    /* Override filter button styling for minimal theme */
}
```

## Theme Features

### Minimal Theme Enhancements
- **Chirpy Jekyll colors** - Professional color palette inspired by jekyll-theme-chirpy
- **Neutral accent colors** - No bright blues, uses elegant grays
- **Enhanced typography** - Source Sans Pro font family with refined line heights
- **Sophisticated shadows** - Layered shadow system for premium feel
- **Component overrides** - Specific styling for lab cards, buttons, filters, and headers
- **Professional appearance** - Blog-style design focused on content readability

### Rich Theme Features
- **Vibrant colors** - Original colorful design with gradients
- **Dynamic interactions** - Hover effects and transitions
- **Colorful badges** - Journey-specific color coding
- **Rich visual hierarchy** - Strong contrast and visual elements

### Mermaid Diagram Theme Integration

Both theme families provide full support for Mermaid.js diagrams with automatic color adaptation:

**Theme-Aware Rendering:**
- Diagrams automatically detect current theme (light/dark mode)
- Color palette updates when user switches themes
- Smooth re-rendering preserves diagram structure

**Color Variables:**
Each theme mode configures 20+ Mermaid color variables including:
- Primary/secondary/tertiary colors for diagram elements
- Actor styling for sequence diagrams
- Signal and note colors
- Background and border colors
- Text colors for labels and annotations

**Implementation Details:**
- Mermaid v11 ESM module with dynamic initialization
- Theme change listener re-renders all diagrams
- Original diagram code preserved in data attributes
- Custom themeVariables synchronized with CSS custom properties

**Usage:**
```html
<div class="mermaid">
sequenceDiagram
    participant A as User
    participant B as System
    A->>B: Request
    B-->>A: Response
</div>
```

**Styling:**
- Responsive containers adapt to screen size
- Max-width constraints prevent overly wide diagrams on desktop
- Centered alignment for visual balance
- Theme-specific color palettes defined in `_layouts/default.html`

**Examples:**
- See `labs/guildhall-custom-mcp/README.md` for OAuth flow sequence diagram
- Diagrams maintain readability in both Rich and Minimal themes
- Colors complement site design without clashing

## Backward Compatibility

The system maintains backward compatibility while providing new features:
- Theme family and mode are stored separately in localStorage
- Automatic migration from old theme storage format
- Event system for theme changes: `themeChanged` event
- Support for both theme family changes and mode toggles

## Development Notes

- **FOUC Prevention** - System prevents flash of unstyled content with immediate theme detection
- **Asynchronous Loading** - Themes are loaded asynchronously for better performance
- **CSS Specificity** - Theme overrides use data attributes for proper specificity
- **Component Isolation** - Each theme can override specific components without affecting others
- **Professional Standards** - Minimal theme follows modern blog design patterns

## GitHub Copilot Development Guide

### Context for AI Assistants

When working with GitHub Copilot or other AI assistants on this theme system, provide this context:

**Current Architecture:**
- Theme families: `rich` and `minimal` with light/dark mode variants
- CSS variables defined in `/assets/css/themes/theme-*.css` files
- Theme-specific overrides use `html[data-theme-family="name"]` selectors
- JavaScript API in `ThemeManager` object with methods: `applyTheme()`, `changeThemeFamily()`, `toggleMode()`

**Key Files to Reference:**
- `/assets/css/themes/theme-minimal.css` - Minimal theme with Chirpy Jekyll colors
- `/assets/css/themes/theme-rich.css` - Rich theme with vibrant colors
- `/assets/js/theme-manager.js` - Theme switching logic
- `/assets/css/style.css` - Base styles using CSS custom properties

### Common AI-Assisted Tasks

#### **Adding New Theme-Specific Styling:**
```css
/* Template for theme-specific overrides */
html[data-theme-family="minimal"] .component-name {
    /* Use existing CSS variables */
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}
```

#### **Debugging Theme Issues:**
Ask GitHub Copilot to help with:
- CSS specificity conflicts with theme overrides
- JavaScript theme manager API usage
- CSS custom property inheritance issues
- Theme switching event handling

#### **Adding New CSS Variables:**
When adding variables, ensure consistency across both theme files:
```css
/* Add to both theme-minimal.css and theme-rich.css */
:root {
    --new-component-bg: /* theme-appropriate color */;
    --new-component-text: /* theme-appropriate color */;
}
```

### AI Assistant Prompts

**For Theme Development:**
> "I'm working on the MCS Labs theme system. We have Rich and Minimal theme families with light/dark variants. Theme-specific CSS uses `html[data-theme-family="name"]` selectors. Help me [specific task] while maintaining consistency with existing patterns."

**For Component Styling:**
> "I need to style [component] for the minimal theme. The minimal theme uses neutral colors, no bright blues, and follows blog-style design. Current variables available: --bg-primary, --text-primary, --border-color, --shadow. Help me create elegant styling."

**For JavaScript Theme Logic:**
> "I'm working with the ThemeManager JavaScript API. Current methods: applyTheme(family, mode), changeThemeFamily(family), toggleMode(). Help me [specific functionality] while maintaining the existing event system and localStorage persistence."

### Code Patterns to Follow

#### **Theme-Specific Component Override Pattern:**
```css
/* Always use this pattern for theme-specific styling */
html[data-theme-family="minimal"] .component {
    /* Minimal theme styling */
}

html[data-theme-family="rich"] .component {
    /* Rich theme styling */
}
```

#### **CSS Variable Usage Pattern:**
```css
/* Use variables for all theme-able properties */
.component {
    background: var(--bg-primary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    box-shadow: 0 2px 4px var(--shadow);
}
```

#### **JavaScript Theme API Pattern:**
```javascript
// Use the established API methods
ThemeManager.applyTheme('minimal', 'light');
ThemeManager.changeThemeFamily('rich');
ThemeManager.toggleMode();

// Listen for theme changes
window.addEventListener('themeChanged', (e) => {
    console.log('Theme changed:', e.detail);
});
```

## Testing

### Theme Test Page (`theme-test.md`)

Use the `theme-test.md` page to verify that all themes render correctly with various UI components. The page demonstrates:
- Lab card styling
- Button interactions
- Typography hierarchy
- Color scheme consistency
- Component behavior across themes

**How to use:**
1. Navigate to `/theme-test.html` in your local development environment
2. Use the theme controls in the header to switch between theme families and modes
3. Verify that all UI components render correctly in each theme variant
4. Check typography, colors, spacing, and interactive elements

### Testing Checklist

When adding new themes or modifying existing ones:

✅ **Visual Testing**: Use `theme-test.md` to verify UI components  
✅ **Cross-browser Testing**: Test in Chrome, Firefox, Safari, Edge  
✅ **Responsive Testing**: Test on different screen sizes  
✅ **Persistence Testing**: Verify theme choice is saved and restored  
✅ **FOUC Testing**: Ensure no flash of unstyled content on page load  
✅ **JavaScript Debugging**: Use GitHub Copilot for troubleshooting theme functionality