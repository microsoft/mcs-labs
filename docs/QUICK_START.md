# Quick Start Guide

This is a quick reference for developers working on the Microsoft Copilot Studio Labs project.

## 🚀 First Time Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/pratapladhani/mcs-labs.git
   cd mcs-labs
   ```

2. **⚠️ REQUIRED: Generate content files**
   ```powershell
   # This generates index.md files and lab content from sources
   pwsh -ExecutionPolicy Bypass -File scripts/Generate-Labs.ps1 -SkipPDFs
   ```

3. **Start development environment**
   ```bash
   docker-compose up -d jekyll-dev
   ```

4. **Open in browser**
   - Local site: http://localhost:4000/mcs-labs/

> **Important**: Steps 2 is required because `index.md` files are auto-generated and not stored in git!

## ⚡ Daily Development Commands

### Start Development Server
```bash
docker-compose up -d jekyll-dev
```

### Check Server Status
```bash
docker-compose logs -f jekyll-dev
```

### Generate Lab Content
```bash
# All labs (fast - skip PDFs)
pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs

# Specific journey
pwsh -File scripts/Generate-Labs.ps1 -SelectedJourneys "developer" -SkipPDFs
```

> **⚡ Speed Tip**: Always use `-SkipPDFs` during development for much faster generation!

### Restart Server (if changes not detected)
```bash
docker-compose restart jekyll-dev
```

### Stop Development Server
```bash
docker-compose down
```

## 🔧 Common Tasks

### Adding New Lab Content

1. Edit source files in `labs/[lab-name]/`
2. Run generation script:
   ```bash
   pwsh -File scripts/Generate-Labs.ps1 -SkipPDFs
   ```
3. Changes automatically appear in browser

### Modifying Styles

1. Edit `assets/css/style.css`
2. Changes auto-reload in browser (if force polling is working)
3. For theme changes, use CSS Custom Properties

### Updating Layout

1. Edit `_layouts/default.html` or `_layouts/lab.html`
2. Restart server if changes don't appear:
   ```bash
   docker-compose restart jekyll-dev
   ```

## 🚨 Troubleshooting

### Site Not Loading
- Check Docker is running
- Verify container is up: `docker-compose ps`
- Check logs: `docker-compose logs jekyll-dev`

### Changes Not Appearing
- Force restart: `docker-compose restart jekyll-dev`
- Check file watching is enabled in logs

### PowerShell Script Errors
- Check PowerShell execution policy
- Run from project root directory
- Verify source lab files exist

### Theme Toggle Not Working
- Check browser console for JavaScript errors
- Verify script syntax in `_layouts/default.html`

## 📁 Key Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `assets/css/style.css` | All styling | Adding/changing styles |
| `_layouts/default.html` | Main site layout | Layout changes, theme system |
| `scripts/Generate-Labs.ps1` | Lab generation | Adding new labs, changing structure |
| `docker-compose.yml` | Development environment | Environment configuration |
| `_config.yml` | Jekyll configuration | Site settings, plugins |

## 🎯 Important Rules

1. **Never edit files in `_labs/` directly** - they're auto-generated
2. **All styling goes in CSS files** - no inline styles in HTML
3. **Use CSS Custom Properties** - for theme-able values
4. **Test both light and dark modes** - when changing styles
5. **Run generation script** - after modifying source labs

## 📚 More Information

- Full details: [docs/DEVELOPMENT.md](./DEVELOPMENT.md)
- Architecture decisions: [docs/ADR.md](./ADR.md)
- Jekyll docs: https://jekyllrb.com/docs/