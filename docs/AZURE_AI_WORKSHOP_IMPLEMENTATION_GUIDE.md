# Azure AI Workshop - Implementation Guide

## Quick Reference

This guide provides step-by-step instructions for adding actual lab content to the Azure AI Workshop framework.

## Current State

✅ **Completed:**

- Workshop page template created
- Navigation integration added
- Configuration structure defined
- Placeholder lab IDs in place
- Documentation written
- Feature branch created

⏳ **Next Steps:**

- Replace placeholder lab IDs with actual labs
- Add lab metadata
- Develop lab content
- Test workshop flow

## Step-by-Step Implementation

### Phase 1: Lab Content Preparation

#### 1.1 Identify Workshop Labs

Determine which labs will be included in the workshop and how they map to the 4 modules:

**Module 1: Foundation (2 labs)**

- Introduction and setup labs
- Basic Copilot Studio concepts

**Module 2: Azure AI Integration (3 labs)**

- Azure OpenAI Service
- Azure AI Search
- Azure Cognitive Services

**Module 3: Advanced Scenarios (3 labs)**

- Multi-agent orchestration
- Autonomous agents
- Custom integrations

**Module 4: Enterprise Readiness (3 labs)**

- ALM and deployment
- Testing frameworks
- Monitoring and analytics

#### 1.2 Create Lab Content

For each lab in the workshop:

1. Create lab directory: `labs/<lab-id>/`
2. Add `README.md` with lab instructions
3. Include images: `labs/<lab-id>/images/`
4. Add any assets: `labs/<lab-id>/assets/`

Example lab structure:
```
labs/azure-openai-integration/
├── README.md
├── images/
│   ├── step1-screenshot.png
│   ├── step2-screenshot.png
│   └── architecture.png
└── assets/
    └── sample-config.json
```

### Phase 2: Configuration Updates

#### 2.1 Add Lab Metadata

Edit `_data/lab-config.yml` and add entries to the `lab_metadata` section:

```yaml
lab_metadata:
  # ... existing labs ...
  
  # Azure AI Workshop Labs (60-80 range recommended)
  61:
    id: "azure-openai-integration"
    title: "Integrate Azure OpenAI Service with Copilot Studio"
    description: "Learn to connect your agents to Azure OpenAI for enhanced AI capabilities"
    difficulty: "Intermediate (Level 200)"
    duration: 45
    section: "azure_ai_workshop"
    
  62:
    id: "azure-ai-search-integration"
    title: "Implement Azure AI Search for Intelligent Data Retrieval"
    description: "Build agents that leverage Azure AI Search for enterprise knowledge management"
    difficulty: "Intermediate (Level 200)"
    duration: 50
    section: "azure_ai_workshop"
    
  # ... continue for all workshop labs
```

#### 2.2 Update Workshop Lab Orders

Replace placeholder IDs in the `azure_ai_workshop_lab_orders` section:

```yaml
azure_ai_workshop_lab_orders:
  # Module 1: Foundation
  1: "agent-builder-web"              # Use existing lab or create new
  2: "setup-for-success"              # Use existing lab or create new
  
  # Module 2: Azure AI Integration
  3: "azure-openai-integration"       # New workshop-specific lab
  4: "azure-ai-search-integration"    # New workshop-specific lab
  5: "azure-cognitive-services"       # New workshop-specific lab
  
  # Module 3: Advanced Scenarios
  6: "azure-multi-agent-orchestration"  # New workshop-specific lab
  7: "autonomous-account-news"          # Use existing autonomous lab
  8: "azure-custom-connectors"          # New workshop-specific lab
  
  # Module 4: Enterprise Readiness
  9: "setup-for-success"                # Reuse ALM lab
  10: "copilot-studio-kit"              # Reuse testing lab
  11: "measure-success"                 # Reuse analytics lab
```

#### 2.3 Add Journey Sequence (Optional)

If you want detailed progression tracking, add to `journey_sequences`:

```yaml
journey_sequences:
  # ... existing journeys ...
  
  azure-ai-workshop:
    description: "Comprehensive MCS + Azure AI integration workshop"
    sequence:
      - lab_number: 1
        lab_id: "agent-builder-web"
        title: "Foundation: Agent Building Basics"
        why_included: "Essential foundation before Azure integration"
        
      - lab_number: 3
        lab_id: "azure-openai-integration"
        title: "Azure OpenAI: Advanced AI Capabilities"
        why_included: "Core Azure AI service for intelligent agents"
        
      # ... continue for all labs
```

### Phase 3: Content Generation

#### 3.1 Run Generation Script

Generate all workshop content:

```powershell
# Generate all content (skip PDFs for faster development)
pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs

# Or generate with PDFs for production
pwsh -File scripts/Generate-Labs.ps1
```

#### 3.2 Verify Generated Files

Check that these files were created:

- `_labs/<lab-id>.md` for each workshop lab
- `index.md` updated with workshop references
- `labs/index.md` includes workshop labs

### Phase 4: Testing

#### 4.1 Start Development Environment

```powershell
docker-compose up -d jekyll-dev
```

#### 4.2 Access Workshop Page

Navigate to: `http://localhost:4000/mcs-labs/labs/azure-ai-workshop/`

#### 4.3 Verification Checklist

- [ ] Workshop page loads without errors
- [ ] All lab cards display correctly
- [ ] Lab numbering is sequential (1, 2, 3, etc.)
- [ ] Lab titles and descriptions are accurate
- [ ] Difficulty and duration display correctly
- [ ] Statistics (total time, lab count) are calculated correctly
- [ ] "Start Lab" buttons work
- [ ] PDF download links work (if PDFs generated)
- [ ] Navigation link in header works
- [ ] Page renders correctly in both themes (Rich/Minimal)
- [ ] Page renders correctly in both modes (Light/Dark)
- [ ] External links open in new tabs
- [ ] Mobile responsive layout works

#### 4.4 Test Individual Labs

For each workshop lab:

1. Click "Start Lab" button
2. Verify lab content displays correctly
3. Check that images load properly
4. Test all internal links
5. Verify workshop context parameter (`?workshop=azure-ai`) is present

### Phase 5: Refinement

#### 5.1 Update Workshop Page Content

Edit `labs/azure-ai-workshop/index.md` to:

- Refine workshop description
- Update prerequisites based on actual labs
- Add workshop-specific notes
- Include troubleshooting tips

#### 5.2 Add Workshop-Specific Sections

Create additional content sections in `index.md`:

```markdown
<div class="workshop-prerequisites">
  <h2>📋 Technical Prerequisites</h2>
  <ul>
    <li>Active Azure subscription with appropriate permissions</li>
    <li>Azure OpenAI Service access</li>
    <li>Microsoft 365 Copilot license</li>
    <!-- Add actual prerequisites based on labs -->
  </ul>
</div>
```

#### 5.3 Create Images Directory (Optional)

Add workshop-specific images:

```
labs/azure-ai-workshop/
├── index.md
├── README.md
└── images/
    ├── workshop-architecture.png
    ├── module-overview.png
    └── azure-services-diagram.png
```

Reference in `index.md`:

```markdown
![Workshop Architecture](images/workshop-architecture.png)
```

### Phase 6: Documentation Updates

#### 6.1 Update AZURE_AI_WORKSHOP.md

Once labs are finalized:

1. Update the "Current Status" section
2. Add actual lab IDs and titles
3. Document any workshop-specific patterns
4. Include troubleshooting for common issues

#### 6.2 Update QUICK_START.md

Add workshop reference:

```markdown
### Workshop Pages

- **Bootcamp**: Comprehensive hands-on bootcamp at `/labs/bootcamp/`
- **Azure AI Workshop**: MCS + Azure AI integration at `/labs/azure-ai-workshop/`
```

## Common Patterns

### Reusing Existing Labs

You can reuse existing labs in the workshop:

```yaml
azure_ai_workshop_lab_orders:
  1: "agent-builder-web"        # Existing lab
  2: "setup-for-success"        # Existing lab
  3: "new-azure-specific-lab"   # New lab
```

Labs appear in multiple contexts without duplication.

### Creating Workshop-Specific Labs

For Azure AI-specific content:

1. Create new lab with unique ID
2. Add to `lab_metadata` with `section: "azure_ai_workshop"`
3. Include in `azure_ai_workshop_lab_orders`
4. Do NOT add to other journeys unless relevant

### Mixed Numbering Approach

**Option A: Sequential Workshop Numbers**
```yaml
azure_ai_workshop_lab_orders:
  1: "lab-1"
  2: "lab-2"
  3: "lab-3"
```

**Option B: Module-Based Numbering** (like Bootcamp)
```yaml
azure_ai_workshop_lab_orders:
  "1a": "foundation-lab-1"
  "1b": "foundation-lab-2"
  "2a": "integration-lab-1"
  "2b": "integration-lab-2"
```

Choose based on workshop structure preferences.

## Troubleshooting

### Workshop Page Not Loading

**Problem**: 404 error on `/labs/azure-ai-workshop/`

**Solution**:

1. Ensure `labs/azure-ai-workshop/index.md` exists
2. Check front matter is correct
3. Run generation script
4. Restart Jekyll server

### Labs Not Appearing

**Problem**: Lab cards not showing on workshop page

**Solution**:

1. Verify lab IDs in `azure_ai_workshop_lab_orders` match `lab_metadata`
2. Check Jekyll logs for errors
3. Ensure generation script ran successfully

### Navigation Link Missing

**Problem**: Workshop link not in header

**Solution**:

1. Verify `_layouts/default.html` has workshop link
2. Clear browser cache
3. Restart Jekyll server

### Incorrect Statistics

**Problem**: Total time or lab count wrong

**Solution**:

1. Check all lab metadata has `duration` field
2. Verify lab IDs in workshop orders exist in metadata
3. Review Jekyll calculation logic in `index.md`

## Best Practices

### Lab Organization

- **Keep lab IDs lowercase with hyphens**: `azure-openai-integration`
- **Use descriptive titles**: Clear indication of lab content
- **Set realistic durations**: Test labs to estimate time accurately
- **Match difficulty to content**: Align with existing difficulty scale

### Content Structure

- **Progressive complexity**: Start simple, build to advanced
- **Module coherence**: Keep related labs together
- **Clear prerequisites**: State requirements at lab start
- **Consistent formatting**: Follow established lab template

### Configuration Management

- **Comment thoroughly**: Explain workshop structure in config
- **Use ranges for numbers**: Keep workshop labs in dedicated number range
- **Document decisions**: Note why labs are included/excluded
- **Version control**: Commit config changes with descriptive messages

## Next Actions

1. **Compile lab content** - Develop or identify labs for each module
2. **Update configuration** - Replace all placeholder IDs
3. **Test thoroughly** - Verify complete workshop flow
4. **Gather feedback** - Test with actual users
5. **Iterate and improve** - Refine based on feedback

## Support

For questions or issues:

1. Review [AZURE_AI_WORKSHOP.md](./AZURE_AI_WORKSHOP.md)
2. Consult [DEVELOPMENT.md](./DEVELOPMENT.md)
3. Check [BOOTCAMP_NAVIGATION_SYSTEM.md](./BOOTCAMP_NAVIGATION_SYSTEM.md) for patterns
4. Reach out to development team

---

**Created**: October 21, 2025  
**Last Updated**: October 21, 2025  
**Status**: Ready for lab content integration
