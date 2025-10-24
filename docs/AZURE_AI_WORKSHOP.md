# Azure AI Workshop Documentation

## Overview

This document explains the implementation of the Azure AI Workshop system, which provides a dedicated workshop experience similar to the Bootcamp but focused specifically on integrating Microsoft Copilot Studio with Azure AI services.

## Architecture

The Azure AI Workshop follows the same architectural pattern as the Bootcamp navigation system but is completely independent, allowing for separate content curation and progression.

### Key Components

1. **Homepage Journey Cards** - Azure AI Workshop is **NOT** included in homepage journeys
2. **Top Navigation** - Permanent "Azure AI Workshop" link in header menu
3. **Workshop Page** - Dedicated page at `/labs/azure-ai-workshop/` with custom sequencing
4. **Lab Numbering** - Progressive numbering (1, 2, 3, etc.) for clear workshop progression

## File Structure

```
mcs-labs/
├── labs/
│   └── azure-ai-workshop/
│       └── index.md                    # Main workshop page
├── _layouts/
│   └── default.html                    # Updated with workshop navigation link
├── _data/
│   └── lab-config.yml                  # Workshop configuration
└── docs/
    └── AZURE_AI_WORKSHOP.md           # This file
```

## Configuration

### lab-config.yml Structure

The workshop configuration is added to `_data/lab-config.yml`:

```yaml
# =====================================================
# AZURE AI WORKSHOP LAB ORDERING - Specific sequence for Azure AI workshop
# =====================================================
azure_ai_workshop_lab_orders:
  # Module 1: Foundation
  1: "lab-id-1"
  2: "lab-id-2"
  
  # Module 2: Azure AI Integration
  3: "lab-id-3"
  4: "lab-id-4"
  # ... and so on
```

### Workshop Page Structure

The workshop page (`labs/azure-ai-workshop/index.md`) includes:

1. **Workshop Header** - Title, description, and statistics
2. **Overview Section** - Learning objectives and prerequisites
3. **Lab Cards Grid** - Dynamically generated from configuration
4. **Resources Section** - Links to relevant Azure AI documentation
5. **Support Section** - Help and troubleshooting information

## Navigation URL Patterns

1. **Homepage**: `/` - Shows 4 journey cards (excludes workshop)
2. **All Labs**: `/labs/` - Lists all labs regardless of workshop
3. **Bootcamp**: `/labs/bootcamp/` - Dedicated bootcamp page
4. **Azure AI Workshop**: `/labs/azure-ai-workshop/` - Dedicated workshop page
5. **Workshop Lab Access**: `/labs/<lab-id>/?workshop=azure-ai` - Individual lab in workshop context

## Workshop Structure

The workshop is organized into 4 progressive modules:

### Module 1: Foundation (Labs 1-2)

- Basic agent building concepts
- Environment setup for Azure integration
- Introduction to Microsoft Copilot Studio

### Module 2: Azure AI Integration (Labs 3-5)

- Azure OpenAI Service integration
- Azure AI Search connectivity
- Azure Cognitive Services usage

### Module 3: Advanced Scenarios (Labs 6-8)

- Multi-agent orchestration with Azure
- Autonomous agents leveraging Azure AI
- Custom connectors and advanced integrations

### Module 4: Enterprise Readiness (Labs 9-11)

- Application Lifecycle Management (ALM)
- Testing and quality assurance frameworks
- Monitoring, analytics, and optimization

## Implementation Details

### Dynamic Content Generation

The workshop page uses Jekyll templating to dynamically generate content:

```liquid
{% assign config_data = site.data.lab-config %}
{% assign workshop_orders = config_data.azure_ai_workshop_lab_orders %}
{% assign lab_metadata = config_data.lab_metadata %}
```

Statistics are calculated automatically:

- Total number of labs
- Total estimated time
- Difficulty range
- Module organization

### Lab Card Generation

Lab cards are generated dynamically from the `azure_ai_workshop_lab_orders` configuration:

```liquid
{% for order_pair in workshop_orders %}
  {% assign workshop_order = order_pair[0] %}
  {% assign lab_id = order_pair[1] %}
  <!-- Generate lab card with workshop context -->
{% endfor %}
```

### URL Parameter System

Workshop labs can be accessed with context:

- Regular access: `/labs/<lab-id>/`
- Workshop context: `/labs/<lab-id>/?workshop=azure-ai`

This allows tracking workshop-specific navigation and potentially customizing content for workshop participants.

## Adding New Labs to the Workshop

### Step 1: Create Lab Content

1. Create lab folder in `labs/<lab-id>/`
2. Add `README.md` with lab content
3. Include images in `labs/<lab-id>/images/`

### Step 2: Update Configuration

Add lab metadata to `lab_metadata` section in `lab-config.yml`:

```yaml
lab_metadata:
  60:  # Use appropriate number in 60-80 range for workshop labs
    id: "your-lab-id"
    title: "Your Lab Title"
    description: "Lab description"
    difficulty: "Intermediate (Level 200)"
    duration: 45
    section: "azure_ai_workshop"
```

### Step 3: Add to Workshop Sequence

Update `azure_ai_workshop_lab_orders`:

```yaml
azure_ai_workshop_lab_orders:
  1: "your-lab-id"
  # ... existing labs
```

### Step 4: Generate Content

Run the PowerShell generation script:

```powershell
pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs
```

## Styling and Theming

The workshop page uses the same CSS classes as the Bootcamp:

- `.bootcamp-nav` - Navigation and header section
- `.bootcamp-info` - Workshop information block
- `.bootcamp-stats` - Statistics display
- `.workshop-overview` - Overview content section
- `.bootcamp-labs` - Labs grid container
- `.lab-card` - Individual lab cards
- `.workshop-resources` - Resources section
- `.workshop-support` - Support information

These classes are styled in `assets/css/style.css` and work with both Rich and Minimal themes.

## Differences from Bootcamp

While the Azure AI Workshop follows the same architectural pattern as the Bootcamp, there are key differences:

| Aspect | Bootcamp | Azure AI Workshop |
|--------|----------|-------------------|
| **Numbering** | Special (1a, 1b, 2, 3a, 3b, etc.) | Progressive (1, 2, 3, 4, etc.) |
| **Focus** | General Copilot Studio mastery | MCS + Azure AI integration |
| **Structure** | Mixed lab progression | 4 defined modules |
| **URL** | `/labs/bootcamp/` | `/labs/azure-ai-workshop/` |
| **Config Key** | `bootcamp_lab_orders` | `azure_ai_workshop_lab_orders` |
| **URL Parameter** | `?bootcamp=true` | `?workshop=azure-ai` |

## Maintenance Guidelines

### Adding New Workshops

To add additional workshops in the future:

1. Create workshop directory: `labs/<workshop-name>/`
2. Create `index.md` with workshop structure (use `azure-ai-workshop/index.md` as template)
3. Add configuration section in `lab-config.yml`: `<workshop_name>_lab_orders`
4. Add navigation link in `_layouts/default.html`
5. Update this documentation

### Modifying Workshop Content

1. **Workshop Page**: Edit `labs/azure-ai-workshop/index.md`
2. **Lab Sequence**: Modify `azure_ai_workshop_lab_orders` in `lab-config.yml`
3. **Lab Content**: Edit lab README files in `labs/<lab-id>/`
4. **Navigation**: Modify `_layouts/default.html` (rarely needed)

### Lab Number Ranges

To maintain organization, use these number ranges:

- **1-10**: Core Learning Path
- **11-20**: Intermediate Labs
- **21-30**: Advanced Labs
- **31-40**: Specialized Labs
- **41-50**: Optional Labs
- **51-60**: External Labs
- **60-80**: Azure AI Workshop Labs (recommended)
- **81-100**: Reserved for future workshops

## Testing Checklist

After making changes to the workshop:

- [ ] Workshop page loads at `/labs/azure-ai-workshop/`
- [ ] Navigation link works in header
- [ ] Lab cards display correctly with proper numbering
- [ ] Statistics calculate correctly (time, difficulty, lab count)
- [ ] Lab links include workshop parameter (`?workshop=azure-ai`)
- [ ] PDF download links work
- [ ] Resources section displays external links correctly
- [ ] Page works with both Rich and Minimal themes
- [ ] Page works in both Light and Dark modes
- [ ] Mobile responsive layout functions properly

## Current Status

### Implementation Phase: Framework Complete ✅

**Completed:**

- ✅ Workshop page structure created
- ✅ Navigation integration added
- ✅ Configuration scaffolding in lab-config.yml
- ✅ Documentation written
- ✅ Feature branch created

**Pending (Awaiting Lab Content):**

- ⏳ Actual lab content compilation
- ⏳ Lab metadata definition
- ⏳ Workshop lab ordering finalization
- ⏳ Module-specific content refinement

### Placeholder Configuration

The current configuration uses placeholder lab IDs:

- `placeholder-lab-1` through `placeholder-lab-11`

These will be replaced with actual lab IDs once the lab content is compiled and ready.

## Next Steps

1. **Lab Content Development**
   - Compile and create Azure AI-focused lab content
   - Ensure labs cover the 4 module structure
   - Include Azure-specific prerequisites and setup

2. **Configuration Updates**
   - Replace placeholder lab IDs with actual lab identifiers
   - Define complete lab metadata
   - Set accurate duration and difficulty estimates

3. **Testing and Validation**
   - Run generation script with actual labs
   - Test navigation and user flow
   - Validate all links and resources

4. **Content Enhancement**
   - Add workshop-specific images
   - Create module introduction content
   - Develop troubleshooting guides

## Support and Contact

For questions or issues with the Azure AI Workshop implementation:

1. Review this documentation
2. Check the [Bootcamp Navigation System Documentation](./BOOTCAMP_NAVIGATION_SYSTEM.md) for related patterns
3. Consult [Development Guide](./DEVELOPMENT.md) for general system information
4. Review [Architecture Decision Records](./ADR.md) for design decisions

---

**Last Updated**: October 21, 2025  
**Status**: Framework Complete - Awaiting Lab Content  
**Maintainer**: Development Team
