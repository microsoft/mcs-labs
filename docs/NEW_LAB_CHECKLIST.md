# New Lab Checklist

Quick reference guide for adding new labs to the MCS Labs repository.

## 🎉 Good News: Adding Labs is Now Simple!

With the simplified `lab-config.yml`, adding a new lab requires just **ONE config entry**.

## ✅ Quick Checklist (3 Steps)

### Step 1: Create Lab Folder

```powershell
mkdir labs/your-lab-name
mkdir labs/your-lab-name/images
# Create labs/your-lab-name/README.md with your content
```

### Step 2: Add ONE Entry to lab-config.yml

Open `lab-config.yml` (in root) and add your lab to the `labs:` section:

```yaml
labs:
  # ... existing labs ...
  
  your-lab-name:                    # Must match folder name in labs/
    title: "Your Lab Title"
    difficulty: "Intermediate"      # Beginner, Intermediate, Advanced
    duration: 45                    # Minutes
    section: intermediate           # core, intermediate, advanced, specialized, optional
    order: 225                      # Pick a number between existing labs
    journeys: [developer]           # Which homepage cards show this lab
```

### Step 3: Generate and Test

```powershell
.\scripts\Generate-Labs.ps1 -SkipPDFs
# View at http://localhost:4000/mcs-labs/
```

**That's it!** 🎉

---

## 📋 Reference: All Lab Properties

| Property | Required | Description | Example |
|----------|----------|-------------|---------|
| `title` | ✅ | Full lab title | `"Build a Support Agent"` |
| `difficulty` | ✅ | Skill level | `Beginner`, `Intermediate`, `Advanced` |
| `duration` | ✅ | Minutes to complete | `30` |
| `section` | ✅ | Grouping for filters | `core`, `intermediate`, `advanced`, `specialized`, `optional` |
| `order` | ✅ | Sort order (3-digit recommended) | `225` |
| `journeys` | ✅ | Learning paths | `[quick-start, business-user]` |
| `events` | ⚠️ Optional | Event pages | `[bootcamp, mcs-in-a-day]` |
| `external` | ⚠️ Optional | For external labs | See below |

## 🔢 Order Number Guide

Pick a number based on section (all numbers start at 100+):

| Range | Section | Examples |
|-------|---------|----------|
| 100-199 | Core Learning Path | Basic agent creation, featured labs |
| 200-299 | Intermediate | SharePoint, connectors |
| 300-399 | Advanced | Autonomous agents, CUA |
| 400-499 | Specialized | MCP, DevOps, Analytics |
| 500-599 | Optional | Shortened versions |
| 600-699 | External | Labs hosted elsewhere |

**Tip**: Check existing labs to find a gap. Use numbers like 215, 225 to leave room.

```powershell
# View current order numbers
Select-String -Path "lab-config.yml" -Pattern "order:" | Select-Object Line
```

## 🎯 Journey Selection Guide

| Journey | Target Audience | Duration |
|---------|-----------------|----------|
| `quick-start` | New users, first steps | 15-30 min labs |
| `business-user` | No-code/low-code builders | Any duration |
| `developer` | Code-first, integrations | Any duration |
| `autonomous-ai` | Advanced AI agents | Usually 30+ min |

Labs can appear in **multiple journeys**:
```yaml
journeys: [quick-start, business-user, developer]
```

## 🎪 Adding Labs to Events (Optional)

If your lab should appear in an event (Bootcamp, Workshop, etc.), add it to the event's `lab_order` array:

### Option A: Add events property to your lab
```yaml
  your-lab-name:
    title: "Your Lab"
    # ... other properties ...
    events: [bootcamp, mcs-in-a-day]  # Adds to these events
```

### Option B: Add to event's lab_order for custom sequencing
```yaml
events:
  bootcamp:
    # ... event metadata ...
    lab_order:
      - agent-builder-m365
      - setup-for-success
      - your-lab-name        # Add here for specific position
```

## 🌐 External Labs (Hosted Elsewhere)

For labs hosted on external sites:

```yaml
  my-external-lab:
    title: "External Lab Title"
    difficulty: "Beginner"
    duration: 60
    section: external
    order: 610
    journeys: [developer]
    external:
      url: "https://example.com/lab"
      repository: "org/repo"
      description: "Brief description of the external lab"
```

## 🔍 Troubleshooting

### Lab doesn't appear on site?

1. **Run the audit**: `.\scripts\Check-LabConfigs.ps1 -Verbose`
2. **Check folder name**: Must exactly match the key in `labs:` section
3. **Run generation**: `.\scripts\Generate-Labs.ps1 -SkipPDFs`
4. **Restart Jekyll**: `docker-compose restart jekyll-dev`

### Lab appears in wrong order?

- Check your `order` number
- For journey ordering, add to `journeys.{journey-name}.lab_order` array
- For event ordering, add to `events.{event-name}.lab_order` array

### Config validation failed?

The audit runs automatically before generation. Common issues:
- Lab folder exists but no config entry
- Config entry exists but no lab folder
- Typo in lab ID (folder name ≠ config key)

## 📚 Complete Example

Adding a new intermediate lab about Teams integration:

```yaml
labs:
  teams-integration-agent:
    title: "Build a Teams-Integrated Support Agent"
    difficulty: "Intermediate"
    duration: 45
    section: intermediate
    order: 235
    journeys: [business-user, developer]
    events: [bootcamp]
```

Then:
```powershell
.\scripts\Generate-Labs.ps1 -SkipPDFs
# Verify at http://localhost:4000/mcs-labs/labs/teams-integration-agent/
```

---

## 🔄 How It Works (Behind the Scenes)

You don't need to understand this, but for the curious:

```
┌─────────────────────────┐     ┌──────────────────────────┐     ┌─────────────────────────┐
│  lab-config.yml         │     │   Generate-Labs.ps1      │     │  _data/lab-config.yml   │
│  (you edit this)        │────▶│   Converts & Exports     │────▶│  (Jekyll reads this)    │
└─────────────────────────┘     └──────────────────────────┘     └─────────────────────────┘
         │                                  │
         │                                  ▼
         │                        ┌─────────────────────┐
         │                        │  _labs/*.md files   │
         │                        │  (generated)        │
         │                        └─────────────────────┘
         │                                  │
         ▼                                  ▼
    Source of Truth              Jekyll builds the site
```

The script:
1. Reads your simplified config
2. Generates `_labs/*.md` files with proper front matter
3. Exports a compatible config to `_data/` for Jekyll templates
4. Jekyll combines everything at build time

**You only edit `lab-config.yml` in the root** - everything else is auto-generated!
