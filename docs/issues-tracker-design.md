# Issue Tracker — Design Spec

Status: Draft for approval
Owner: dewainr
Date: 2026-05-21
Target PR: bundles with the `bootcamp_feature.yml` issue template + label cleanup

## 1. Problem & Goal

The bootcamp team needs a single place to see what work is queued, in-flight, and recently done across the mcs-labs project. Today, that information lives in the GitHub Issues UI — usable for maintainers but not approachable for learners or stakeholders who just want a status overview.

**Goal:** a static page on the labs site at `/tracker/` that shows issue status across five categories with charts and a Kanban board. 100% public — any deeper interaction (issue detail, assignees, history, creating issues) deep-links to GitHub. Discoverable only from the labs home-page footer (not site-wide nav).

> **v1 scope note:** OAuth sign-in / maintainer-only detail was dropped before implementation. The tracker is purely public; rely on GitHub's own UI for everything below the surface.

## 2. Categories & Label Mapping

| Card | Source label | Issue template |
|---|---|---|
| Bugs | `type: bug` | `bug_report.yml` |
| New Labs | `type: new-lab` | `new_lab.yml` |
| Content Updates | `type: lab-update` | `enhancement.yml` |
| Portal Enhancements | `portal-enhancement` (renamed from `redesign`) | `portal_enhancement.yml` (renamed from `redesign-feedback.yml`) |
| Bootcamp Features | `type: bootcamp-feature` | `bootcamp_feature.yml` |

Issues without any of these **type** labels are not shown on the tracker. (Status labels are handled in §3.)

## 3. Status Lifecycle

Triage → Backlog → In Progress → Done (closed within selectable window).

Status is derived from labels:

| Label | Status |
|---|---|
| `status: triage` | Triage |
| `status: backlog` | Backlog |
| `status: in-progress` | In Progress |
| (closed within window) | Done |

Open issues that have a type label (per §2) but no `status:` label default to Triage. Issues with multiple `status:` labels use the most recently applied (timestamp from the issue's label-events timeline).

## 4. Architecture

**Stack:** static Jekyll page + GitHub Actions data refresh + client-side JS. Zero server-side runtime. No external chart libraries.

```
GitHub Actions (every 15 min + on issue/PR events)
   │ queries Issues API with GITHUB_TOKEN
   │ shapes into assets/data/issues.json
   │ idempotency: skip commit if unchanged
   └─ commits → triggers Pages rebuild

Browser loads /tracker/
   └─ renders Insights tab immediately from issues.json (zero API calls)
      (No background refresh — the 15-min cron is the freshness mechanism.
       Anonymous GitHub API calls share a 60/hr/IP limit, not worth the complexity.)
```

### Files created or modified

| Path | Purpose |
|---|---|
| `tracker.md` (new, at repo root) | Page with front matter `layout: tracker` |
| `_layouts/tracker.html` (new) | Layout with header, tabs, empty mount points for JS |
| `assets/js/tracker/data.js` (new) | Loads `issues.json`, exposes shaped data |
| `assets/js/tracker/insights.js` (new) | Renders KPI tiles, donut, trend line, aging heatmap |
| `assets/js/tracker/board.js` (new) | Renders Kanban columns, filter chips, smart New-issue button |
| `assets/css/tracker.css` (new) | All tracker styles, scoped to `.tracker-*` classes |
| `assets/data/issues.json` (new, generated) | Data snapshot committed by workflow |
| `_data/tracker.yml` (new) | Public config: repo owner/name, settings |
| `_includes/home-tracker-link.html` (new) | Footer-style link rendered only by `index.md` |
| `index.md` (modified) | Adds the footer-area link to the tracker |
| `.github/workflows/tracker-data.yml` (new) | 15-min cron + event-triggered data refresh |
| `.github/ISSUE_TEMPLATE/bootcamp_feature.yml` (already created) | Already in untracked state |
| `.github/ISSUE_TEMPLATE/portal_enhancement.yml` (renamed from redesign-feedback.yml) | Template rename + label updates |
| `docs/issues-tracker-design.md` (this file) | Design spec |

### Files NOT created
- No server-side anything (no Functions, no API)
- No external JS dependencies (no Chart.js, no React)
- No comment / issue-creation forms (deep-link to GitHub instead)
- No `auth.js` — OAuth was dropped from v1; everything is public
- No background API refresh — freshness comes from the 15-min cron

## 5. Page Structure

### Header (sticky on both tabs)
- Title "Issue Tracker" + tagline
- "Updated 4 min ago" timestamp
- Tabs: **Insights** (default) · Board
- Time-range selector (7d · 14d · 30d · 60d · 90d) — drives Closed KPI, trend chart x-axis, Done column window. Default 30d. Persists in localStorage.
- `+ New issue ▾` dropdown (template picker) — always visible

### Insights tab (default landing)
- **KPI strip** — 4 tiles: Open total · Closed (Nd) · Avg age · % in triage, each with delta vs. prior period.
- **Donut** — open issues by category. Clicking a slice switches to Board tab pre-filtered to that category.
- **Trend** — opened vs. closed line over selected time range. Filter chips above isolate a single category.
- **Aging heatmap** — 5 rows (one per category). Each row is the open issues sorted oldest → newest, one cell per issue, colored by age bucket (≤7d, ≤14d, ≤30d, ≤60d, >60d). Hover → tooltip with issue # + title; click → opens the GitHub issue.

### Board tab
- Filter chip row: `All · 56` · `Bugs · 14` · `New Labs · 3` · `Content · 9` · `Portal · 22` · `Bootcamp · 8`
- Smart `+ New issue` pill — when a category chip is active, links to that template; with All, opens the picker.
- 4 columns: Triage / Backlog / In Progress / Done (window).
- Cards: color-striped by category, show #, title, age. Click → opens the GitHub issue (where assignees, comments, and history are visible).

### Home-page footer link
- Added to `index.md` (not site-wide footer) as a quiet link styled like the existing `home-browse-all` link: `Issue tracker →`.

## 6. Data Pipeline

### Workflow: `.github/workflows/tracker-data.yml`

Triggers:
- `schedule: cron: "*/15 * * * *"`
- `issues:` and `pull_request:` (any activity)
- `workflow_dispatch:` (manual + PR-CI hook)

Single job, uses `GITHUB_TOKEN` (5000/hr authenticated, ample for this repo).

Steps:
1. Run a Node script (`scripts/build-tracker-data.js`) inside the workflow. Node 20+ on `ubuntu-latest` has `fetch` built in, no `npm install` needed.
2. Script issues a single GraphQL query against `gh api graphql` (using `GITHUB_TOKEN`) to fetch all issues with labels, state, timestamps, assignees, and the timeline events needed to determine status-label ordering. Paginated as needed (~500 issues fits in 2-3 pages).
3. Script shapes results into the JSON in §6.2, omitting the `generatedAt` field at this point.
4. Workflow runs `jq 'del(.generatedAt)' assets/data/issues.json` on the existing committed file and diffs against the freshly shaped (no-generatedAt) payload.
5. If diff is empty → exit 0, no commit. If diff has content → add `generatedAt: now()` and commit with message `chore(tracker): refresh issues snapshot [skip ci]`.

Idempotency rationale: without this, `generatedAt` would change every run and the workflow would commit 96 times per day even when nothing about the issues changed.

### 6.2 JSON shape (`assets/data/issues.json`)

```jsonc
{
  "generatedAt": "ISO-8601",
  "stats": {
    "open": number, "closed30d": number, "avgAgeDays": number, "pctTriage": number,
    "deltas": { "open": delta, "closed30d": delta, "avgAgeDays": delta, "pctTriage": delta }
  },
  "categories": {
    "bug":              { "open": n, "triage": n, "backlog": n, "inProgress": n, "done30d": n },
    "newLab":           { ... },
    "contentUpdate":    { ... },
    "portalEnhancement":{ ... },
    "bootcampFeature":  { ... }
  },
  "trend90d": [                                  // 90 daily points; client slices to selected window
    { "date": "YYYY-MM-DD", "opened": n, "closed": n }
  ],
  "issues": [                                    // every open issue + closed in last 90d
    {
      "number": n, "title": "...", "url": "...",
      "category": "bug|newLab|contentUpdate|portalEnhancement|bootcampFeature",
      "status": "triage|backlog|inProgress|done",
      "ageDays": n,
      "createdAt": "...", "updatedAt": "...", "closedAt": "..." | null,
      // assignees dropped from v1 — visible on GitHub via card click
    }
  ],
  // recentActivity dropped from v1 (maintainer-only field; no consumers)
}
```

Target payload: < 50 KB raw, < 30 KB gzipped.

## 7. Authentication & Authorization

**Dropped from v1.** The tracker is 100% public. Anything that would have required sign-in (assignees, comments, issue history, activity feed) is one click away on GitHub, which already handles auth correctly. A future v2 can reintroduce OAuth Device Flow if there's demonstrated need.

## 8. Edge Cases & Error Handling

| Scenario | Behavior |
|---|---|
| Snapshot older than 30 min | Amber dot + "Snapshot is N min old" (no auto-refresh in v1 — cron is the mechanism) |
| Category has zero open issues | Donut slice still in legend at 0%; Board column shows empty state |
| `issues.json` missing or malformed | Skeleton + "Issue tracker data not available yet — check back shortly" |
| Issue closed but no `closedAt` | Treated as still open (defensive) |
| Issue has multiple `type:` labels | First match wins, in priority order: bug > new-lab > content-update > portal-enhancement > bootcamp-feature |
| Issue has multiple `status:` labels | Most recently applied wins (timeline lookup) |
| Workflow run fails | GitHub Actions notification; tracker serves stale snapshot until next run |

## 9. Performance Budget

- Page JS: < 80 KB raw / < 30 KB gzipped
- JSON snapshot: < 50 KB raw / < 20 KB gzipped
- No external chart libraries — donut/line/heatmap rendered with raw SVG + CSS
- Lighthouse Performance ≥ 90 on mobile (existing site standard from `lighthouserc.json`)
- First Contentful Paint < 1.5s on Fast 3G

## 10. Repo Prep Steps (in same PR)

### Labels (gh CLI):
- Create `status: in-progress` (color `#cce5ff`, description "Someone is actively working on this")
- Rename `redesign` → `portal-enhancement` (`gh label edit redesign --name "portal-enhancement"`)
- Rename `feedback` → `discussion` (`gh label edit feedback --name "discussion" --description "Open-ended thread, not yet actionable"`)
- (Already done in prior step: `type: bootcamp-feature`, `status: backlog`, `status: triage`)

### Issue templates:
- Rename `.github/ISSUE_TEMPLATE/redesign-feedback.yml` → `portal_enhancement.yml`
- Update inside: `name: "Portal Enhancements"`, description revised, `title:` prefix removed, `labels: ["portal-enhancement"]`

### Config:
- `_data/tracker.yml` — Client ID + repo metadata
- `.gitignore` — confirm `.superpowers/` is present (already is)

### OAuth App
Dropped from v1.

## 11. Testing & Verification

| Phase | Verifies |
|---|---|
| **A. Local Docker** (`docker-compose -f docker-compose.dev.yml up`) | Pages render with last-committed snapshot; tabs switch; deep links open correct templates; filter chips, time-range, hover tooltips, click-through to GitHub |
| **B. PR CI** | Existing `build-and-deploy.yml` builds the site; `lighthouse.yml` checks tracker page hits perf budget; `tracker-data.yml` runs via workflow_dispatch on the PR branch to confirm JSON shape valid |
| **C. Post-merge production** | Confirm cron fires within 15 min, JSON committed, Pages rebuild, page loads at `microsoft.github.io/mcs-labs/tracker/`, home-page footer link works |

## 12. Out of Scope (YAGNI)

- Issue creation form on the page (deep-link to GitHub instead)
- Comment counts / threaded replies
- Custom charts beyond donut + line + heatmap
- Server-side runtime (Functions, API)
- Multi-repo support — `microsoft/mcs-labs` only
- Email / push notifications
- Filtering by assignee, milestone, or arbitrary label combinations

## 13. Open Items / Decisions Deferred

- **`feedback` rename target** — design assumes `discussion`; confirm before label rename.
- **Initial JSON seed** — first time the workflow runs, `issues.json` won't exist. The first run unconditionally commits.
- **Future v2: OAuth** — if maintainer-only views become valuable, reintroduce OAuth Device Flow + collaborator permission check. Cut from v1 to ship faster.
