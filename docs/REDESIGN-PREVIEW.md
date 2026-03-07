# Site Redesign Preview — `redesign/air-theme`

- [What's changing](#whats-changing)
- [How to run locally](#how-to-run-locally)
- [Open questions](#open-questions)
- [What to expect](#what-to-expect) — [Homepage](#homepage) · [Labs index](#labs-index-labs) · [Lab detail](#lab-detail-pages) · [Workshops index](#workshops-index-workshops) · [Workshop detail](#workshop-detail-pages) · [About](#about-page-about) · [Navigation](#navigation) · [Feedback](#feedback)
- [What to look for](#what-to-look-for)

## What's changing

The original MCS Labs site uses a fully custom Jekyll layout — hand-rolled HTML, CSS, and navigation. This redesign moves to **[Minimal Mistakes](https://mmistakes.github.io/minimal-mistakes/)** with the **"air" skin**, a mature, well-maintained Jekyll theme that gives us responsive layouts, built-in search, sidebar navigation, table-of-contents support, and accessibility out of the box — so we can focus on content instead of maintaining layout code.

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

## Open questions

There are a couple of open design questions — please weigh in on the issues:

- [#213 — Do we need learning paths on the homepage?](https://github.com/microsoft/mcs-labs/issues/213)
- [#214 — Rethink lab section groupings on /labs/ index](https://github.com/microsoft/mcs-labs/issues/214)

Found a bug or have a suggestion? **[Open a redesign feedback issue](https://github.com/microsoft/mcs-labs/issues/new?template=redesign-feedback.yml)**

---

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

