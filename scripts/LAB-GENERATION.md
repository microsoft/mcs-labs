# Lab Generation Process

This repository uses an automated system to generate Jekyll lab files from source content and configuration.

## 🏗️ Architecture

```
labs/                          # Source content (committed to git)
├── agent-builder-web/
│   └── README.md             # Original lab content
├── agent-builder-sharepoint/
│   └── README.md
└── ...

lab-config.yml                # Journey metadata & config (committed to git)

_labs/                         # Generated Jekyll files (NOT committed to git)
├── agent-builder-web.md      # Auto-generated with front matter
├── agent-builder-sharepoint.md
└── ...
```

## 🔄 Generation Scripts

- **`scripts/Generate-Labs.ps1`** - Main conversion script (reads lab-config.yml)
- **`scripts/Build.ps1`** - Simple build script for development

## 🚀 Usage

### Quick Start (Recommended)

```powershell
# Generate lab files and get ready to serve
./scripts/Build.ps1

# Then run Jekyll
jekyll serve
```

### Advanced Usage

```powershell  
# Generate lab files directly
./scripts/Generate-Labs.ps1

# Get help
./scripts/Generate-Labs.ps1 -Help
```

### Adding New Labs
1. Create source content in `labs/new-lab-id/README.md`
2. Add lab metadata to `lab-config.yml`
3. Run conversion script
4. Commit only the source and config changes

### Labs Index Page
The `labs/index.md` file is **automatically generated** with enhanced functionality that dynamically adapts to your configuration:

- **Dynamic Journey Buttons**: Automatically generated from `journeys` section in `lab-config.yml`
- **Dynamic Section Buttons**: Automatically generated from `sections` section in `lab-config.yml`  
- **Dynamic Journey Metadata**: JavaScript journey data generated from configuration
- **Toggle Filtering**: Click to filter, click again to show all labs
- **Section Names in Lab Cards**: Color-coded section badges
- **URL Hash Support**: Bookmarkable filtered views

✅ **Fully Automatic**: New journeys, sections, and labs automatically appear in the interface without manual updates!

### Modifying Journey Classifications

#### Option 1: Explicit Journey Assignment (Recommended)

1. Edit the `lab_journeys` section in `lab-config.yml`:

   ```yaml
   lab_journeys:
     agent-builder-web: ["quick-start", "business-user"]
     autonomous-cua: ["autonomous-ai", "developer"]
     # ... other labs
   ```

2. Run conversion script
3. Labs will use explicit assignments (shows 🎯 in output)

#### Option 2: Automatic Assignment (Fallback)

- If a lab is not in `lab_journeys`, the script will auto-assign based on difficulty and keywords
- Shows 🤖 in script output for automatically assigned journeys
- Less predictable but useful for new labs without explicit configuration

## 📁 What's Committed to Git

### ✅ Committed
- `labs/*/README.md` - Source content
- `lab-config.yml` - Lab configuration and journey metadata
- `scripts/*.ps1` - Generation scripts
- `index.md` - Site structure
- `assets/`, `_layouts/` - Styling and templates

### ❌ Not Committed (Auto-generated)
- `_labs/*.md` - Generated Jekyll lab files
- `_site/` - Jekyll build output
- `.jekyll-cache/`, `.jekyll-metadata` - Jekyll cache files
- `Gemfile.lock` - Dependency lockfile

## 🎯 Benefits

- **Single source of truth** - Journey metadata in `lab-config.yml`
- **Maintainable** - Changes persist through regeneration
- **Scalable** - Easy to add new labs and journeys
- **Clean git history** - Only source changes tracked