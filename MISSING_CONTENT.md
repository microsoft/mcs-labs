# ⚠️ MISSING CONTENT FILES

If you're seeing this message, you need to generate the content files first!

## Quick Fix:

```powershell
# Run this command to generate all content:
pwsh -ExecutionPolicy Bypass -File scripts/Generate-Labs.ps1 -SkipPDFs

# Then start the development server:
docker-compose up -d
```

## Why?

The `index.md` and `labs/index.md` files are auto-generated from:
- `lab-config.yml` (journey definitions)  
- `labs/*/README.md` (lab content)

These generated files are **not stored in git** - they're created fresh each time.

## More Info:

- 📖 **Full Setup Guide**: `docs/DEVELOPMENT.md`
- 🚀 **Quick Start**: `docs/QUICK_START.md`

---
*This file appears when content generation is needed.*