# Site Redesign Preview — `redesign/air-theme`

## What's changing

The original MCS Labs site uses a fully custom Jekyll layout — hand-rolled HTML, CSS, and navigation. This redesign moves to **[Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/)** with the **"air" skin**, a mature, well-maintained Jekyll theme that gives us responsive layouts, built-in search, sidebar navigation, table-of-contents support, and accessibility out of the box — so we can focus on content instead of maintaining layout code.

## What to expect

### Homepage
Dark gradient hero banner with live stats (lab count, hours, levels, workshops), learning path cards, and workshop cards.

![Homepage](screenshots/homepage.png)

### Labs index (`/labs/`)
Card-based grid layout with difficulty and duration pills for every lab.

![Labs index](screenshots/labs-index.png)

### Lab detail pages
Structured header with metadata pills (level, duration, section). Table of contents sits as a sticky right sidebar (CSS Grid 75/25 split). Feedback section at the bottom powered by utterances.

![Lab detail](screenshots/lab-detail.png)

### Workshops index (`/workshops/`)
Card grid showing each workshop with computed duration and level ranges.

![Workshops index](screenshots/workshops-index.png)

### Workshop detail pages
Hero banner with workshop stats and an ordered lab card list. Feedback section at the bottom.

![Workshop detail](screenshots/workshop-detail.png)

### About page (`/about/`)
New page showcasing the Copilot Acceleration Team (CAT) with a hero banner, team card grid, and an about-the-labs section.

![About](screenshots/about.png)

### Navigation
Top nav bar: **Home | All Labs | Workshops | About**. Left sidebar groups labs by section (Core, Intermediate, Advanced, Specialized, Optional, External).

### Feedback
Every lab and workshop page has an [utterances](https://utteranc.es/) comment section — GitHub-backed, so feedback shows up as GitHub Issues.

> **Note:** The utterances widget won't render locally or on non-deployed branches. It only activates on the deployed domain with the [utterances GitHub app](https://github.com/apps/utterances) installed.

---

## How to run locally

### Mac

```bash
git clone https://github.com/microsoft/mcs-labs.git
cd mcs-labs
git checkout redesign/air-theme
bash tools/setup/mac/install.sh   # installs Ruby, Bundler, and gems
bash tools/run.sh
```

### Windows (PowerShell)

```powershell
git clone https://github.com/microsoft/mcs-labs.git
cd mcs-labs
git checkout redesign/air-theme
.\tools\setup\win\install.ps1     # installs Ruby, Bundler, and gems
.\tools\run.ps1
```

Site will be at **http://127.0.0.1:4000/mcs-labs/**

---

## What to look for

1. **Overall feel** — clean, modern layout with consistent card-based UI and dark hero banners
2. **Nav** — top bar and left sidebar both work, "About" link routes correctly
3. **Homepage** — hero stats are accurate, learning path and workshop cards render
4. **Labs index** — all labs appear as cards with correct pills
5. **Lab pages** — sticky TOC on the right, structured header, "Leave feedback" pill
6. **`/workshops/`** — descriptions fully visible, duration/level pills computed correctly
7. **Workshop detail pages** — hero stats, ordered lab list, feedback section at bottom
8. **`/about/`** — hero + team cards + about section
9. **Responsive** — check on narrow viewports (TOC should collapse, grids reflow)

## Open questions

- **Do we need learning paths on the homepage?** Currently Quick Start / Business User / Developer / Autonomous AI are hard-coded cards that link to the labs index with a level filter — but these are meant to be topic-based groupings, not difficulty levels. If we keep them, they should probably be curated indexes (like workshops) rather than just a filter shortcut. Or do workshops already serve this purpose?
- **Do we need the section groupings on the labs index?** Labs are currently grouped under Core Learning Path, Intermediate, Advanced, Specialized, Optional, External — but the categories overlap and the naming is inconsistent (some are difficulty-based, some are topic-based). Should we simplify to just a flat list with level/duration filters? Or rethink the taxonomy entirely?

## Known issues

- **About page team cards** have placeholder names/roles (to be filled in)
- **utterances** requires the repo to be public and the utterances app installed
- **Learning path links** are a temporary hack — they filter by difficulty level which doesn't match the intended topic-based groupings
