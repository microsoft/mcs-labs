# Backlog Tracker Implementation Plan

> **Status (post-implementation):** This plan was executed via PR #315. After merge, the GitHub Actions cron portion failed due to org policies (branch protection on `main` + "Actions can't create PRs" setting both blocked the workflow's commit path). The page was switched to live client-side GitHub API fetch in a follow-up — see `docs/issues-tracker-design.md` §4 for the current architecture. The plan below is preserved as the historical execution record; treat all `tracker-data.yml` workflow content as deprecated.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a static `/tracker/` page on the labs site that shows GitHub issues across 5 categories with charts and a Kanban view. 100% public; any deeper interaction deep-links to GitHub.

**Architecture (as planned — see status note above for what actually shipped):** Jekyll page + GitHub Actions 15-min refresh + client-side vanilla JS. Data lives in a committed `assets/data/issues.json` snapshot; JS renders entirely from the snapshot. No OAuth, no background API calls — GitHub is the source of truth for anything beyond the dashboard view.

**Tech Stack:** Jekyll (minimal-mistakes theme), GitHub Actions, Node 20+ (built-in `fetch` + `node:test`), vanilla JS + SVG (no chart libraries).

**Spec:** `docs/issues-tracker-design.md`

---

## Pre-flight (already done — verify before starting)

- [x] `bootcamp_feature.yml` created at `.github/ISSUE_TEMPLATE/bootcamp_feature.yml` (untracked)
- [x] Labels created on GitHub: `type: bootcamp-feature`, `status: backlog`, `status: triage`
- [x] `.gitignore` includes `.superpowers/`
- [x] Design spec at `docs/issues-tracker-design.md`, approved

Before Task 1, confirm:

```bash
gh label list --repo microsoft/mcs-labs | grep -E "(bootcamp-feature|status:)"
# expect to see all three labels
ls C:/Users/dewainr/projects/mcs-labs/.github/ISSUE_TEMPLATE/bootcamp_feature.yml
# expect: file exists
```

## File Structure

| Path | Responsibility |
|---|---|
| `tracker.md` | Single-file Jekyll page with `layout: single` (same as home page) — inline HTML for header, tabs, range, mount points |
| `_data/tracker.yml` | Public config: OAuth Client ID, repo owner/name, polling interval |
| `_includes/home-tracker-link.html` | Footer-style link rendered only by `index.md` |
| `index.md` | Add include reference at bottom |
| `assets/css/tracker.css` | All tracker styling, scoped to `.tracker-*` classes |
| `assets/js/tracker/data.js` | Load snapshot, expose normalized data |
| `assets/js/tracker/insights.js` | KPI tiles, donut, trend, aging heatmap |
| `assets/js/tracker/board.js` | Kanban columns, filter chips, smart New-issue button |
| `assets/js/tracker/main.js` | Tab switching, time-range selector, render wiring |
| `assets/data/issues.json` | Generated data snapshot (committed by workflow) |
| `scripts/build-tracker-data.js` | Node script: fetch via GraphQL, shape, emit JSON |
| `scripts/build-tracker-data.test.js` | Tests for shaping logic |
| `.github/workflows/tracker-data.yml` | 15-min cron + event-triggered refresh |
| `.github/ISSUE_TEMPLATE/portal_enhancement.yml` | Renamed from `redesign-feedback.yml` |
| `docs/issues-tracker-design.md` | Spec (already exists) |
| `docs/issues-tracker-plan.md` | This plan (already exists) |

---

## Task 1: Cut a fresh branch from main

**Files:** none (git operations only)

- [ ] **Step 1.1: Stash the untracked template, switch to main, pull**

```bash
cd C:/Users/dewainr/projects/mcs-labs
git stash push --include-untracked -m "WIP bootcamp_feature.yml + design docs"
git switch main
git pull origin main
```

Expected: clean working tree on `main`, up to date with `origin/main`.

- [ ] **Step 1.2: Create the feature branch**

```bash
git switch -c dewain/issues-tracker
```

Expected: switched to new branch.

- [ ] **Step 1.3: Restore the stashed files**

```bash
git stash pop
```

Expected: `bootcamp_feature.yml`, `docs/issues-tracker-design.md`, `docs/issues-tracker-plan.md` reappear as untracked.

- [ ] **Step 1.4: Commit the design docs + template now (so subsequent commits can reference them)**

```bash
git add .github/ISSUE_TEMPLATE/bootcamp_feature.yml docs/issues-tracker-design.md docs/issues-tracker-plan.md
git commit -m "docs(tracker): bootcamp feature template + design spec + plan"
```

---

## Task 2: Rename labels & template — Portal Enhancements

**Files:**
- Rename: `.github/ISSUE_TEMPLATE/redesign-feedback.yml` → `.github/ISSUE_TEMPLATE/portal_enhancement.yml`
- Labels (via `gh`): create `status: in-progress`, rename `redesign` → `portal-enhancement`, rename `feedback` → `discussion`

- [ ] **Step 2.1: Create the `status: in-progress` label**

```bash
gh label create "status: in-progress" --repo microsoft/mcs-labs \
  --color "CCE5FF" --description "Someone is actively working on this"
```

- [ ] **Step 2.2: Rename `redesign` → `portal-enhancement`**

```bash
gh label edit redesign --repo microsoft/mcs-labs \
  --name "portal-enhancement" \
  --description "Improvement or feedback for the labs tracker site"
```

- [ ] **Step 2.3: Rename `feedback` → `discussion`**

```bash
gh label edit feedback --repo microsoft/mcs-labs \
  --name "discussion" \
  --description "Open-ended thread, not yet actionable"
```

- [ ] **Step 2.4: Verify**

```bash
gh label list --repo microsoft/mcs-labs | grep -E "(in-progress|portal-enhancement|discussion)"
```

Expected: three rows, no `redesign` or `feedback` rows remaining.

- [ ] **Step 2.5: Rename the template file**

```bash
git mv .github/ISSUE_TEMPLATE/redesign-feedback.yml .github/ISSUE_TEMPLATE/portal_enhancement.yml
```

- [ ] **Step 2.6: Edit the renamed template**

Replace the entire contents of `.github/ISSUE_TEMPLATE/portal_enhancement.yml`:

```yaml
name: Portal Enhancements
description: Report a bug, visual issue, or improvement suggestion for the labs site
labels: ["portal-enhancement"]
body:
  - type: dropdown
    id: type
    attributes:
      label: Type
      options:
        - Bug / visual issue
        - Suggestion / improvement
        - Question
    validations:
      required: true
  - type: dropdown
    id: page
    attributes:
      label: Which page?
      options:
        - Homepage
        - Labs index (/labs/)
        - Lab detail page
        - Events index (/events/)
        - Event detail page
        - About page (/about/)
        - Backlog tracker (/tracker/)
        - Navigation / sidebar
        - Other
    validations:
      required: true
  - type: textarea
    id: description
    attributes:
      label: Description
      description: What did you notice? Include screenshots if possible.
    validations:
      required: true
  - type: textarea
    id: expected
    attributes:
      label: Expected behavior
      description: What should happen instead? (optional)
  - type: input
    id: browser
    attributes:
      label: Browser / OS
      placeholder: "e.g. Chrome 120 / macOS 14"
```

- [ ] **Step 2.7: Commit**

```bash
git add .github/ISSUE_TEMPLATE/portal_enhancement.yml
git commit -m "feat(templates): rename Redesign Feedback → Portal Enhancements"
```

---

## Task 3: Data-shaping script + tests

**Files:**
- Create: `scripts/build-tracker-data.js`
- Create: `scripts/build-tracker-data.test.js`

- [ ] **Step 3.1: Write the failing test**

Create `scripts/build-tracker-data.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { categorize, deriveStatus, shape } = require('./build-tracker-data');

test('categorize: returns category for a typed issue', () => {
  assert.equal(categorize(['type: bug']), 'bug');
  assert.equal(categorize(['type: new-lab', 'priority: P1']), 'newLab');
  assert.equal(categorize(['type: lab-update']), 'contentUpdate');
  assert.equal(categorize(['portal-enhancement']), 'portalEnhancement');
  assert.equal(categorize(['type: bootcamp-feature']), 'bootcampFeature');
});

test('categorize: priority order resolves overlap', () => {
  // bug wins over new-lab when both labels exist
  assert.equal(categorize(['type: new-lab', 'type: bug']), 'bug');
});

test('categorize: returns null for issues with no relevant type label', () => {
  assert.equal(categorize(['documentation']), null);
  assert.equal(categorize([]), null);
});

test('deriveStatus: returns status from label', () => {
  assert.equal(deriveStatus({ state: 'open', labels: ['status: backlog'] }), 'backlog');
  assert.equal(deriveStatus({ state: 'open', labels: ['status: in-progress'] }), 'inProgress');
  assert.equal(deriveStatus({ state: 'open', labels: ['status: triage'] }), 'triage');
});

test('deriveStatus: open with no status label defaults to triage', () => {
  assert.equal(deriveStatus({ state: 'open', labels: ['type: bug'] }), 'triage');
});

test('deriveStatus: closed within window is done', () => {
  const closedAt = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(deriveStatus({ state: 'closed', closedAt, labels: [] }, 30), 'done');
});

test('deriveStatus: closed outside window is excluded', () => {
  const closedAt = new Date(Date.now() - 200 * 24 * 60 * 60 * 1000).toISOString();
  assert.equal(deriveStatus({ state: 'closed', closedAt, labels: [] }, 90), null);
});

test('shape: produces expected top-level keys', () => {
  const result = shape([], []);
  assert.ok(result.stats);
  assert.ok(result.categories);
  assert.ok(result.trend90d);
  assert.ok(Array.isArray(result.issues));
  assert.ok(Array.isArray(result.recentActivity));
});

test('shape: trend90d has exactly 90 daily entries', () => {
  const result = shape([], []);
  assert.equal(result.trend90d.length, 90);
});
```

- [ ] **Step 3.2: Run the test to verify it fails**

```bash
node --test scripts/build-tracker-data.test.js
```

Expected: FAIL with `Cannot find module './build-tracker-data'`.

- [ ] **Step 3.3: Implement the script**

Create `scripts/build-tracker-data.js`:

```js
const LABEL_TO_CATEGORY = [
  ['type: bug', 'bug'],
  ['type: new-lab', 'newLab'],
  ['type: lab-update', 'contentUpdate'],
  ['portal-enhancement', 'portalEnhancement'],
  ['type: bootcamp-feature', 'bootcampFeature'],
];

const STATUS_LABELS = {
  'status: triage': 'triage',
  'status: backlog': 'backlog',
  'status: in-progress': 'inProgress',
};

function categorize(labels) {
  for (const [labelName, category] of LABEL_TO_CATEGORY) {
    if (labels.includes(labelName)) return category;
  }
  return null;
}

function deriveStatus(issue, windowDays = 90) {
  if (issue.state === 'closed') {
    if (!issue.closedAt) return 'open'; // defensive
    const ageMs = Date.now() - new Date(issue.closedAt).getTime();
    if (ageMs / 86400000 <= windowDays) return 'done';
    return null;
  }
  for (const [label, status] of Object.entries(STATUS_LABELS)) {
    if (issue.labels.includes(label)) return status;
  }
  return 'triage';
}

function daysBetween(a, b) {
  return Math.floor((b - a) / 86400000);
}

function shape(rawIssues, rawEvents) {
  const now = Date.now();
  const cats = ['bug', 'newLab', 'contentUpdate', 'portalEnhancement', 'bootcampFeature'];
  const categories = Object.fromEntries(cats.map(c => [c, { open: 0, triage: 0, backlog: 0, inProgress: 0, done30d: 0 }]));

  const issues = [];
  for (const raw of rawIssues) {
    const labels = (raw.labels || []).map(l => typeof l === 'string' ? l : l.name);
    const category = categorize(labels);
    if (!category) continue;
    const status = deriveStatus({ ...raw, labels }, 90);
    if (!status) continue;
    const created = new Date(raw.createdAt).getTime();
    const issue = {
      number: raw.number,
      title: raw.title,
      url: raw.url,
      category,
      status,
      ageDays: daysBetween(created, now),
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
      closedAt: raw.closedAt || null,
      assignees: (raw.assignees || []).map(a => typeof a === 'string' ? a : a.login),
    };
    issues.push(issue);
    if (status === 'done') {
      const closedMs = now - new Date(raw.closedAt).getTime();
      if (closedMs / 86400000 <= 30) categories[category].done30d++;
    } else {
      categories[category].open++;
      categories[category][status]++;
    }
  }

  const open = issues.filter(i => i.status !== 'done');
  const stats = {
    open: open.length,
    closed30d: issues.filter(i => i.status === 'done' && (now - new Date(i.closedAt).getTime()) / 86400000 <= 30).length,
    avgAgeDays: open.length ? Math.round(open.reduce((s, i) => s + i.ageDays, 0) / open.length) : 0,
    pctTriage: open.length ? open.filter(i => i.status === 'triage').length / open.length : 0,
    deltas: { open: 0, closed30d: 0, avgAgeDays: 0, pctTriage: 0 }, // computed by workflow against prior snapshot
  };

  const trend90d = [];
  for (let i = 89; i >= 0; i--) {
    const day = new Date(now - i * 86400000);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate()).getTime();
    const dayEnd = dayStart + 86400000;
    trend90d.push({
      date: day.toISOString().slice(0, 10),
      opened: issues.filter(x => { const t = new Date(x.createdAt).getTime(); return t >= dayStart && t < dayEnd; }).length,
      closed: issues.filter(x => x.closedAt && (() => { const t = new Date(x.closedAt).getTime(); return t >= dayStart && t < dayEnd; })()).length,
    });
  }

  return {
    stats,
    categories,
    trend90d,
    issues,
    recentActivity: (rawEvents || []).slice(0, 20),
  };
}

module.exports = { categorize, deriveStatus, shape };

// CLI entry: node scripts/build-tracker-data.js [out-path]
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  (async () => {
    const token = process.env.GITHUB_TOKEN;
    if (!token) { console.error('GITHUB_TOKEN required'); process.exit(1); }
    const outPath = process.argv[2] || 'assets/data/issues.json';

    const query = `
      query($cursor: String) {
        repository(owner: "microsoft", name: "mcs-labs") {
          issues(first: 100, after: $cursor, states: [OPEN, CLOSED], orderBy: {field: UPDATED_AT, direction: DESC}) {
            pageInfo { hasNextPage endCursor }
            nodes {
              number title url state createdAt updatedAt closedAt
              labels(first: 30) { nodes { name } }
              assignees(first: 10) { nodes { login } }
            }
          }
        }
      }`;
    const issues = [];
    let cursor = null;
    let pages = 0;
    while (pages < 20) {
      const res = await fetch('https://api.github.com/graphql', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'mcs-labs-tracker-data' },
        body: JSON.stringify({ query, variables: { cursor } }),
      });
      const json = await res.json();
      if (json.errors) { console.error(json.errors); process.exit(1); }
      const conn = json.data.repository.issues;
      for (const n of conn.nodes) {
        // Stop paging once we hit issues older than 180d AND closed (we don't need older data)
        const t = new Date(n.updatedAt).getTime();
        const age = (Date.now() - t) / 86400000;
        if (age > 180 && n.state === 'CLOSED') { cursor = null; break; }
        issues.push({
          number: n.number,
          title: n.title,
          url: n.url,
          state: n.state.toLowerCase(),
          createdAt: n.createdAt,
          updatedAt: n.updatedAt,
          closedAt: n.closedAt,
          labels: n.labels.nodes.map(l => l.name),
          assignees: n.assignees.nodes.map(a => a.login),
        });
      }
      if (!conn.pageInfo.hasNextPage || !cursor && pages > 0) break;
      cursor = conn.pageInfo.endCursor;
      pages++;
    }

    const data = shape(issues, []);
    data.generatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2));
    console.log(`Wrote ${issues.length} issues → ${outPath}`);
  })();
}
```

- [ ] **Step 3.4: Run the tests to verify they pass**

```bash
node --test scripts/build-tracker-data.test.js
```

Expected: 9 tests pass, 0 fail.

- [ ] **Step 3.5: Dry-run the CLI locally to verify end-to-end**

```bash
GITHUB_TOKEN=$(gh auth token) node scripts/build-tracker-data.js /tmp/test-issues.json
head -50 /tmp/test-issues.json
```

Expected: valid JSON with `stats`, `categories`, `trend90d`, `issues` arrays populated from the real repo.

- [ ] **Step 3.6: Commit**

```bash
git add scripts/build-tracker-data.js scripts/build-tracker-data.test.js
git commit -m "feat(tracker): data shaping script + unit tests"
```

---

## Task 4: GitHub Actions workflow

**Files:**
- Create: `.github/workflows/tracker-data.yml`

- [ ] **Step 4.1: Create the workflow**

Create `.github/workflows/tracker-data.yml`:

```yaml
name: Refresh tracker data

on:
  schedule:
    - cron: "*/15 * * * *"
  issues:
    types: [opened, edited, deleted, transferred, pinned, unpinned, closed, reopened, assigned, unassigned, labeled, unlabeled]
  pull_request:
    types: [opened, closed, reopened, labeled, unlabeled]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  refresh:
    if: github.repository == 'microsoft/mcs-labs'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Build tracker data snapshot
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        run: node scripts/build-tracker-data.js assets/data/issues.json

      - name: Compute deltas vs prior snapshot
        run: |
          if git show HEAD:assets/data/issues.json > /tmp/prev.json 2>/dev/null; then
            node -e "
              const fs=require('node:fs');
              const cur=JSON.parse(fs.readFileSync('assets/data/issues.json'));
              const prev=JSON.parse(fs.readFileSync('/tmp/prev.json'));
              cur.stats.deltas = {
                open: cur.stats.open - prev.stats.open,
                closed30d: cur.stats.closed30d - prev.stats.closed30d,
                avgAgeDays: cur.stats.avgAgeDays - prev.stats.avgAgeDays,
                pctTriage: +(cur.stats.pctTriage - prev.stats.pctTriage).toFixed(3),
              };
              fs.writeFileSync('assets/data/issues.json', JSON.stringify(cur, null, 2));
            "
          fi

      - name: Check for meaningful change (ignore generatedAt)
        id: diff
        run: |
          if git show HEAD:assets/data/issues.json > /tmp/prev.json 2>/dev/null; then
            jq 'del(.generatedAt)' /tmp/prev.json > /tmp/prev-clean.json
            jq 'del(.generatedAt)' assets/data/issues.json > /tmp/cur-clean.json
            if diff -q /tmp/prev-clean.json /tmp/cur-clean.json > /dev/null; then
              echo "changed=false" >> "$GITHUB_OUTPUT"
            else
              echo "changed=true" >> "$GITHUB_OUTPUT"
            fi
          else
            echo "changed=true" >> "$GITHUB_OUTPUT"
          fi

      - name: Commit and push
        if: steps.diff.outputs.changed == 'true'
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "41898282+github-actions[bot]@users.noreply.github.com"
          git add assets/data/issues.json
          git commit -m "chore(tracker): refresh issues snapshot [skip ci]"
          git push
```

- [ ] **Step 4.2: Commit**

```bash
git add .github/workflows/tracker-data.yml
git commit -m "feat(tracker): GitHub Actions workflow to refresh issue snapshot every 15m"
```

---

## Task 5: Seed the initial snapshot

**Files:**
- Create: `assets/data/issues.json`

- [ ] **Step 5.1: Generate the first snapshot locally**

```bash
mkdir -p assets/data
GITHUB_TOKEN=$(gh auth token) node scripts/build-tracker-data.js assets/data/issues.json
```

Expected: `assets/data/issues.json` written with current real data.

- [ ] **Step 5.2: Sanity-check the file**

```bash
jq '.stats, .categories, (.issues | length)' assets/data/issues.json
```

Expected: stats object, categories object with 5 keys, issue count > 0.

- [ ] **Step 5.3: Commit**

```bash
git add assets/data/issues.json
git commit -m "feat(tracker): initial issues snapshot"
```

---

## Task 6: ~~Register OAuth App~~ — REMOVED

OAuth was dropped from v1 (per design spec §7). The tracker is 100% public. Skip ahead to Task 7.

---

## Task 7: Public config in `_data/tracker.yml`

**Files:**
- Create: `_data/tracker.yml`

- [ ] **Step 7.1: Create the config file**

```yaml
# Public tracker configuration. Safe to commit — no secrets.
repo:
  owner: "microsoft"
  name: "mcs-labs"

snapshot:
  staleThresholdMs: 1800000 # 30 minutes — show "snapshot is N min old" indicator past this
```

- [ ] **Step 7.2: Commit**

```bash
git add _data/tracker.yml
git commit -m "feat(tracker): public config (repo metadata, stale threshold)"
```

---

## Task 8: Page + layout shell

**Files:**
- Create: `tracker.md` (only — no separate layout file; uses `layout: single` from minimal-mistakes)

**IMPORTANT — visual consistency with the rest of the labs site:**
The tracker must inherit the labs site's chrome (masthead, footer, breadcrumbs, theme switcher) so it doesn't feel like a separate app. We accomplish this by:
- Using `layout: single` (the same layout the home page uses) — so the masthead, footer, theme-switcher, search, and feedback widgets all appear without us re-implementing them.
- Putting all tracker HTML directly inside `tracker.md` as a Liquid markdown page (matches the home-page pattern in `index.md`).
- NOT creating a custom `_layouts/tracker.html` — we don't need one.
- Hiding `.page__title` and `.page__meta` via inline CSS at the top of `tracker.md` (same trick `index.md` uses) so the layout's default title chrome doesn't double up with our header.
- Using minimal-mistakes theme tokens throughout — every color, border, and spacing references CSS variables (`--color-bg`, `--color-fg-strong`, `--color-border-subtle`, `--color-lab-grad-*`) so Light / Dark / High-Contrast themes work automatically.

- [ ] **Step 8.1: Create `tracker.md` with front matter and inline HTML**

Create `tracker.md` (single file — no separate layout):

```markdown
---
layout: single
title: "Backlog Tracker"
permalink: /tracker/
toc: false
classes: wide
author_profile: false
sitemap: false
header:
  overlay_image: false
---

<style>
.page__title { display: none; }
.page__meta { display: none; }
</style>

<main class="tracker" data-tracker>
  <header class="tracker-header">
    <div class="tracker-header-row">
      <h2 class="tracker-title">Backlog Tracker</h2>
      <span class="tracker-updated" data-tracker-updated>Loading…</span>
    </div>
    <p class="tracker-subtitle">Status of bootcamp work across the labs project.</p>
    <div class="tracker-controls">
      <nav class="tracker-tabs" role="tablist">
        <button class="tracker-tab is-active" data-tab="insights" role="tab" aria-selected="true">Insights</button>
        <button class="tracker-tab" data-tab="board" role="tab" aria-selected="false">Board</button>
      </nav>
      <label class="tracker-range">
        Range:
        <select data-tracker-range>
          <option value="7">7d</option>
          <option value="14">14d</option>
          <option value="30" selected>30d</option>
          <option value="60">60d</option>
          <option value="90">90d</option>
        </select>
      </label>
      <details class="tracker-newissue">
        <summary>+ New issue</summary>
        <ul data-tracker-templates>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=bug_report.yml">Bug</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=new_lab.yml">New Lab</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=enhancement.yml">Content Update</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=portal_enhancement.yml">Portal Enhancement</a></li>
          <li><a href="https://github.com/microsoft/mcs-labs/issues/new?template=bootcamp_feature.yml">Bootcamp Feature</a></li>
        </ul>
      </details>
    </div>
  </header>

  <section class="tracker-tabpanel" data-tabpanel="insights" role="tabpanel">
    <div data-tracker-kpis></div>
    <div class="tracker-charts">
      <div data-tracker-donut></div>
      <div data-tracker-trend></div>
    </div>
    <div data-tracker-heatmap></div>
  </section>

  <section class="tracker-tabpanel is-hidden" data-tabpanel="board" role="tabpanel">
    <div class="tracker-filters" data-tracker-filters></div>
    <div class="tracker-kanban" data-tracker-kanban></div>
  </section>
</main>

<link rel="stylesheet" href="{{ '/assets/css/tracker.css' | relative_url }}">
<script type="module" src="{{ '/assets/js/tracker/main.js' | relative_url }}"></script>
```

- [ ] **Step 8.2: ~~Create layout~~ — not needed**

We inherit `layout: single` from minimal-mistakes. No custom layout file. This is the same pattern `index.md` uses for the home page.

- [ ] **Step 8.3: Build and verify the page renders without JS modules**

```bash
docker-compose -f docker-compose.dev.yml up -d
# wait for build, then:
curl -s http://localhost:4000/mcs-labs/tracker/ | grep "data-tracker"
```

Expected: HTML response contains `data-tracker` attributes. Browser at the URL shows the skeleton (no errors in console even though JS modules don't exist yet — the script tag will 404 but that's fine for this checkpoint).

- [ ] **Step 8.4: Commit**

```bash
git add tracker.md
git commit -m "feat(tracker): page shell (single-layout, inline HTML, theme-consistent)"
```

---

## Task 9: CSS

**Files:**
- Create: `assets/css/tracker.css`

- [ ] **Step 9.1: Create the stylesheet**

Create `assets/css/tracker.css`. Use the same CSS-variable theme tokens from the home-page hero (`--color-lab-grad-*`, `--color-bg`, `--color-border-subtle`, etc.) so the tracker inherits the air-skin look:

```css
/* Tracker — scoped under .tracker to avoid bleed into other pages */
.tracker {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5em 1em;
  font-family: -apple-system, "Segoe UI", sans-serif;
  color: var(--color-fg-strong);
}
.tracker-header {
  position: sticky; top: 0; z-index: 10;
  background: var(--color-bg);
  padding: 1em 0;
  border-bottom: 1px solid var(--color-border-subtle);
}
.tracker-header-row { display: flex; align-items: baseline; justify-content: space-between; gap: 1em; }
.tracker-title { font-size: 1.6em; font-weight: 700; margin: 0; border: none; padding: 0; }
.tracker-updated { font-size: 0.75em; color: var(--color-fg-muted); }
.tracker-subtitle { font-size: 0.9em; color: var(--color-fg-muted); margin: 0.3em 0 1em; }
.tracker-controls { display: flex; align-items: center; gap: 0.75em; flex-wrap: wrap; }
.tracker-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--color-border-subtle); flex: 1; }
.tracker-tab {
  background: none; border: none; padding: 0.6em 1.2em; font-size: 0.9em; font-weight: 600;
  color: var(--color-fg-muted); border-bottom: 2px solid transparent; margin-bottom: -1px; cursor: pointer;
}
.tracker-tab.is-active { color: var(--color-fg-strong); border-bottom-color: var(--color-accent); }
.tracker-range select, .tracker-newissue summary, .tracker-signin {
  font-size: 0.85em; padding: 0.4em 0.8em; border: 1px solid var(--color-border-subtle);
  border-radius: 4px; background: var(--color-bg); cursor: pointer;
}
.tracker-newissue { position: relative; }
.tracker-newissue summary { list-style: none; }
.tracker-newissue ul {
  position: absolute; right: 0; top: 100%; margin-top: 4px; min-width: 200px;
  background: var(--color-bg); border: 1px solid var(--color-border-subtle); border-radius: 4px;
  padding: 0.4em 0; list-style: none; box-shadow: 0 2px 8px rgba(0,0,0,0.08); z-index: 20;
}
.tracker-newissue li a { display: block; padding: 0.4em 1em; font-size: 0.85em; text-decoration: none; color: var(--color-fg-strong); }
.tracker-newissue li a:hover { background: var(--color-bg-elevated); }
.tracker-tabpanel.is-hidden { display: none; }

/* KPI tiles */
.tracker-kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.5em; margin: 1em 0; }
.tracker-kpi {
  background: var(--color-bg-elevated); border: 1px solid var(--color-border-subtle);
  border-radius: 6px; padding: 0.7em 0.9em;
}
.tracker-kpi strong { display: block; font-size: 1.5em; font-weight: 700; }
.tracker-kpi span { font-size: 0.7em; color: var(--color-fg-muted); text-transform: uppercase; letter-spacing: 0.04em; }
.tracker-kpi .delta-up { color: #0e8a16; font-size: 0.75em; font-weight: 600; }
.tracker-kpi .delta-down { color: #d73a4a; font-size: 0.75em; font-weight: 600; }

/* Charts row */
.tracker-charts { display: grid; grid-template-columns: 1fr 2fr; gap: 1em; margin: 1em 0; }
.tracker-chart {
  background: var(--color-bg-elevated); border: 1px solid var(--color-border-subtle);
  border-radius: 6px; padding: 1em;
}
.tracker-chart h3 { font-size: 0.8em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; color: var(--color-fg-muted); margin: 0 0 0.6em; border: none; padding: 0; }

/* Aging heatmap */
.tracker-heatmap { background: var(--color-bg-elevated); border: 1px solid var(--color-border-subtle); border-radius: 6px; padding: 1em; margin: 1em 0; }
.tracker-heatmap-row { display: flex; align-items: center; gap: 0.5em; margin-bottom: 0.3em; }
.tracker-heatmap-label { width: 110px; font-size: 0.8em; color: var(--color-fg-muted); text-align: right; }
.tracker-heatmap-cells { display: flex; gap: 2px; flex-wrap: wrap; flex: 1; }
.tracker-heatmap-cell { width: 14px; height: 14px; border-radius: 2px; cursor: pointer; }
.age-1 { background: #c2e0c6; } .age-2 { background: #7fc97f; }
.age-3 { background: #fbcfb8; } .age-4 { background: #e99695; } .age-5 { background: #d73a4a; }
.tracker-heatmap-tooltip {
  position: absolute; background: #1f2328; color: #fff; padding: 0.4em 0.6em; border-radius: 4px;
  font-size: 0.75em; pointer-events: none; z-index: 100; max-width: 280px;
}

/* Board */
.tracker-filters { display: flex; gap: 0.4em; margin: 1em 0; flex-wrap: wrap; align-items: center; }
.tracker-chip {
  font-size: 0.8em; padding: 0.3em 0.8em; background: var(--color-bg-elevated);
  border-radius: 99px; color: var(--color-fg-muted); cursor: pointer; border: 1px solid transparent;
}
.tracker-chip.is-active { background: var(--color-fg-strong); color: var(--color-bg); border-color: var(--color-fg-strong); }
.tracker-newissue-smart { margin-left: auto; }

.tracker-kanban { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.6em; }
.tracker-col {
  background: var(--color-bg-elevated); border: 1px solid var(--color-border-subtle);
  border-radius: 6px; padding: 0.6em; min-height: 200px;
}
.tracker-col-head { display: flex; justify-content: space-between; font-size: 0.75em; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em; margin-bottom: 0.5em; }
.tracker-card {
  background: var(--color-bg); border: 1px solid var(--color-border-subtle);
  border-left: 3px solid var(--color-fg-muted); border-radius: 3px;
  padding: 0.4em 0.6em; margin-bottom: 0.3em; font-size: 0.8em;
  text-decoration: none; color: var(--color-fg-strong); display: block;
}
.tracker-card.cat-bug { border-left-color: #d73a4a; }
.tracker-card.cat-newLab { border-left-color: #0e8a16; }
.tracker-card.cat-contentUpdate { border-left-color: #8957e5; }
.tracker-card.cat-portalEnhancement { border-left-color: #1d76db; }
.tracker-card.cat-bootcampFeature { border-left-color: #d4a72c; }
.tracker-card-meta { font-size: 0.7em; color: var(--color-fg-muted); margin-top: 0.2em; }

@media (max-width: 768px) {
  .tracker-kpis { grid-template-columns: repeat(2, 1fr); }
  .tracker-charts { grid-template-columns: 1fr; }
  .tracker-kanban { grid-template-columns: 1fr; }
}
```

- [ ] **Step 9.2: Reload the dev server and verify CSS is served**

```bash
curl -sI http://localhost:4000/mcs-labs/assets/css/tracker.css | head -2
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 9.3: Commit**

```bash
git add assets/css/tracker.css
git commit -m "feat(tracker): styles for header, tabs, charts, board"
```

---

## Task 10: `data.js` — load snapshot

**Files:**
- Create: `assets/js/tracker/data.js`

- [ ] **Step 10.1: Implement the data module**

Create `assets/js/tracker/data.js`:

```js
const CONFIG = window.TRACKER_CONFIG || {};

let _data = null;

export async function load() {
  const res = await fetch('/mcs-labs/assets/data/issues.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error(`snapshot load failed: ${res.status}`);
  _data = await res.json();
  return _data;
}

export function get() { return _data; }

export function snapshotAgeMs() {
  if (!_data?.generatedAt) return Infinity;
  return Date.now() - new Date(_data.generatedAt).getTime();
}

export function isStale() {
  const threshold = CONFIG.snapshot?.staleThresholdMs ?? 1800000;
  return snapshotAgeMs() > threshold;
}
```

- [ ] **Step 10.2: Commit**

```bash
git add assets/js/tracker/data.js
git commit -m "feat(tracker): data module (snapshot load, staleness check)"
```

---

## Task 11: ~~auth.js~~ — REMOVED

OAuth dropped from v1. No `auth.js` module needed. Skip to Task 12.

---

## Task 12: `insights.js` — KPI, donut, trend, heatmap

**Files:**
- Create: `assets/js/tracker/insights.js`

- [ ] **Step 12.1: Implement the insights renderer**

Create `assets/js/tracker/insights.js`:

```js
const CAT_COLORS = {
  bug: '#d73a4a', newLab: '#0e8a16', contentUpdate: '#8957e5',
  portalEnhancement: '#1d76db', bootcampFeature: '#d4a72c',
};
const CAT_LABELS = {
  bug: 'Bugs', newLab: 'New Labs', contentUpdate: 'Content',
  portalEnhancement: 'Portal Enh', bootcampFeature: 'Bootcamp',
};

export function render(data, { rangeDays }) {
  renderKpis(data, rangeDays);
  renderDonut(data);
  renderTrend(data, rangeDays);
  renderHeatmap(data);
}

function renderKpis(data, rangeDays) {
  const closedInRange = data.issues.filter(i => i.closedAt && (Date.now() - new Date(i.closedAt).getTime()) / 86400000 <= rangeDays).length;
  const tiles = [
    { label: 'Open', value: data.stats.open, delta: data.stats.deltas.open },
    { label: `Closed ${rangeDays}d`, value: closedInRange, delta: data.stats.deltas.closed30d },
    { label: 'Avg age', value: data.stats.avgAgeDays + 'd', delta: data.stats.deltas.avgAgeDays, deltaUnit: 'd' },
    { label: '% triage', value: Math.round(data.stats.pctTriage * 100) + '%', delta: Math.round(data.stats.deltas.pctTriage * 100), deltaUnit: 'pt' },
  ];
  document.querySelector('[data-tracker-kpis]').innerHTML = `
    <div class="tracker-kpis">${tiles.map(t => `
      <div class="tracker-kpi">
        <strong>${t.value}</strong>
        <span>${t.label}</span>
        ${t.delta !== 0 ? `<div class="${t.delta > 0 ? 'delta-up' : 'delta-down'}">${t.delta > 0 ? '▲' : '▼'} ${Math.abs(t.delta)}${t.deltaUnit || ''}</div>` : ''}
      </div>`).join('')}</div>`;
}

function renderDonut(data) {
  const cats = Object.entries(data.categories);
  const total = cats.reduce((s, [, c]) => s + c.open, 0) || 1;
  let acc = 0;
  const stops = cats.map(([k, c]) => {
    const from = (acc / total) * 100;
    acc += c.open;
    const to = (acc / total) * 100;
    return `${CAT_COLORS[k]} ${from}% ${to}%`;
  });
  document.querySelector('[data-tracker-donut]').innerHTML = `
    <div class="tracker-chart">
      <h3>Open issues by category</h3>
      <div style="position:relative;width:140px;height:140px;margin:0 auto;">
        <div style="width:100%;height:100%;border-radius:50%;background:conic-gradient(${stops.join(',')});"></div>
        <div style="position:absolute;inset:28px;background:var(--color-bg-elevated);border-radius:50%;display:flex;flex-direction:column;align-items:center;justify-content:center;">
          <strong style="font-size:1.4em;font-weight:700">${total}</strong>
          <span style="font-size:0.7em;color:var(--color-fg-muted)">open</span>
        </div>
      </div>
      <ul style="list-style:none;padding:0;margin:0.8em 0 0;font-size:0.75em;display:grid;grid-template-columns:1fr 1fr;gap:0.2em 0.6em;">
        ${cats.map(([k, c]) => `<li><span style="display:inline-block;width:8px;height:8px;background:${CAT_COLORS[k]};border-radius:2px;margin-right:0.4em;"></span>${CAT_LABELS[k]} <strong>${c.open}</strong></li>`).join('')}
      </ul>
    </div>`;
}

function renderTrend(data, rangeDays) {
  const series = data.trend90d.slice(-rangeDays);
  const max = Math.max(1, ...series.map(d => Math.max(d.opened, d.closed)));
  const pts = (key, color) => series.map((d, i) => `${(i / (series.length - 1)) * 200},${80 - (d[key] / max) * 70}`).join(' ');
  document.querySelector('[data-tracker-trend]').innerHTML = `
    <div class="tracker-chart">
      <h3>Opened vs closed (${rangeDays}d)</h3>
      <svg width="100%" viewBox="0 0 200 90" preserveAspectRatio="none" style="height:120px;">
        <polyline fill="none" stroke="#1d76db" stroke-width="1.5" points="${pts('opened')}"/>
        <polyline fill="none" stroke="#0e8a16" stroke-width="1.5" stroke-dasharray="3,2" points="${pts('closed')}"/>
      </svg>
      <p style="font-size:0.7em;color:var(--color-fg-muted);margin:0.2em 0 0;text-align:center;">
        <span style="color:#1d76db">━ Opened</span> &nbsp; <span style="color:#0e8a16">- - Closed</span>
      </p>
    </div>`;
}

function renderHeatmap(data) {
  const open = data.issues.filter(i => i.status !== 'done');
  const ageBucket = (d) => d <= 7 ? 1 : d <= 14 ? 2 : d <= 30 ? 3 : d <= 60 ? 4 : 5;
  const rows = Object.keys(CAT_LABELS).map(k => {
    const items = open.filter(i => i.category === k).sort((a, b) => b.ageDays - a.ageDays);
    return `
      <div class="tracker-heatmap-row">
        <div class="tracker-heatmap-label">${CAT_LABELS[k]}</div>
        <div class="tracker-heatmap-cells">
          ${items.map(i => `<a href="${i.url}" target="_blank" rel="noopener" class="tracker-heatmap-cell age-${ageBucket(i.ageDays)}" data-title="#${i.number} ${escape(i.title)} — ${i.ageDays}d"></a>`).join('')}
        </div>
      </div>`;
  }).join('');
  document.querySelector('[data-tracker-heatmap]').innerHTML = `
    <div class="tracker-heatmap">
      <h3 style="font-size:0.8em;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;color:var(--color-fg-muted);margin:0 0 0.6em;border:none;padding:0;">Aging — days waiting (darker = older)</h3>
      ${rows}
    </div>`;
  wireTooltips();
}

function escape(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }

function wireTooltips() {
  let tip = null;
  document.querySelectorAll('[data-title]').forEach(el => {
    el.addEventListener('mouseenter', e => {
      tip = document.createElement('div');
      tip.className = 'tracker-heatmap-tooltip';
      tip.textContent = el.getAttribute('data-title');
      document.body.appendChild(tip);
      const r = el.getBoundingClientRect();
      tip.style.left = `${r.left + window.scrollX}px`;
      tip.style.top = `${r.bottom + window.scrollY + 4}px`;
    });
    el.addEventListener('mouseleave', () => { tip?.remove(); tip = null; });
  });
}

```

- [ ] **Step 12.2: Commit**

```bash
git add assets/js/tracker/insights.js
git commit -m "feat(tracker): insights renderer (KPI, donut, trend, heatmap)"
```

---

## Task 13: `board.js` — Kanban + filter chips + smart New-issue

**Files:**
- Create: `assets/js/tracker/board.js`

- [ ] **Step 13.1: Implement the board renderer**

Create `assets/js/tracker/board.js`:

```js
const CAT_LABELS = {
  bug: 'Bugs', newLab: 'New Labs', contentUpdate: 'Content',
  portalEnhancement: 'Portal Enh', bootcampFeature: 'Bootcamp',
};
const CAT_TEMPLATE = {
  bug: 'bug_report.yml', newLab: 'new_lab.yml', contentUpdate: 'enhancement.yml',
  portalEnhancement: 'portal_enhancement.yml', bootcampFeature: 'bootcamp_feature.yml',
};
const COLUMNS = [['triage', 'Triage'], ['backlog', 'Backlog'], ['inProgress', 'In Progress'], ['done', 'Done']];

let _state = { activeCategory: 'all', rangeDays: 30 };

export function render(data, { rangeDays }) {
  _state.rangeDays = rangeDays;
  renderFilters(data);
  renderKanban(data);
}

function renderFilters(data) {
  const total = Object.values(data.categories).reduce((s, c) => s + c.open, 0);
  const chips = [['all', 'All', total], ...Object.entries(data.categories).map(([k, c]) => [k, CAT_LABELS[k], c.open])];
  const el = document.querySelector('[data-tracker-filters]');
  el.innerHTML = `
    ${chips.map(([k, label, n]) => `<button class="tracker-chip ${k === _state.activeCategory ? 'is-active' : ''}" data-cat="${k}">${label} · ${n}</button>`).join('')}
    <a class="tracker-chip tracker-newissue-smart" data-newissue-smart href="${smartUrl()}" target="_blank" rel="noopener">+ New issue</a>
  `;
  el.querySelectorAll('[data-cat]').forEach(btn => btn.addEventListener('click', () => {
    _state.activeCategory = btn.getAttribute('data-cat');
    renderFilters(data);
    renderKanban(data);
  }));
}

function smartUrl() {
  const base = 'https://github.com/microsoft/mcs-labs/issues/new';
  if (_state.activeCategory === 'all') return base + '/choose';
  return `${base}?template=${CAT_TEMPLATE[_state.activeCategory]}`;
}

function renderKanban(data) {
  const filtered = _state.activeCategory === 'all' ? data.issues : data.issues.filter(i => i.category === _state.activeCategory);
  const byStatus = Object.fromEntries(COLUMNS.map(([s]) => [s, []]));
  for (const i of filtered) if (byStatus[i.status]) byStatus[i.status].push(i);
  // Done column respects rangeDays window
  byStatus.done = byStatus.done.filter(i => i.closedAt && (Date.now() - new Date(i.closedAt).getTime()) / 86400000 <= _state.rangeDays);

  document.querySelector('[data-tracker-kanban]').innerHTML = COLUMNS.map(([s, label]) => `
    <div class="tracker-col">
      <div class="tracker-col-head"><span>${label}</span><span>${byStatus[s].length}</span></div>
      ${byStatus[s].slice(0, 30).map(i => `
        <a class="tracker-card cat-${i.category}" href="${i.url}" target="_blank" rel="noopener">
          #${i.number} ${escape(i.title)}
          <div class="tracker-card-meta">${i.ageDays}d</div>
        </a>`).join('')}
      ${byStatus[s].length > 30 ? `<div class="tracker-card-meta" style="text-align:center;">+ ${byStatus[s].length - 30} more</div>` : ''}
    </div>`).join('');
}

function escape(s) { return s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
```

- [ ] **Step 13.2: Commit**

```bash
git add assets/js/tracker/board.js
git commit -m "feat(tracker): board renderer (Kanban, filter chips, smart New-issue)"
```

---

## Task 14: `main.js` — wiring it all together

**Files:**
- Create: `assets/js/tracker/main.js`

- [ ] **Step 14.1: Implement the entry module with Jekyll front matter so Liquid processes config injection**

Create `assets/js/tracker/main.js`:

```js
---
---
import { load, get, isStale, snapshotAgeMs } from './data.js';
import { render as renderInsights } from './insights.js';
import { render as renderBoard } from './board.js';

window.TRACKER_CONFIG = window.TRACKER_CONFIG || {
  repo: { owner: '{{ site.data.tracker.repo.owner }}', name: '{{ site.data.tracker.repo.name }}' },
  snapshot: { staleThresholdMs: {{ site.data.tracker.snapshot.staleThresholdMs }} },
};

let _rangeDays = +(localStorage.getItem('tracker.range') || 30);

async function init() {
  try { await load(); }
  catch (e) {
    document.querySelector('[data-tracker]').innerHTML = `<p style="padding:2em;text-align:center;color:var(--color-fg-muted);">Backlog tracker data not available yet — check back shortly.</p>`;
    return;
  }

  document.querySelector('[data-tracker-range]').value = _rangeDays;
  document.querySelector('[data-tracker-range]').addEventListener('change', e => {
    _rangeDays = +e.target.value;
    localStorage.setItem('tracker.range', _rangeDays);
    rerender();
  });

  document.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => switchTab(btn.getAttribute('data-tab'))));

  rerender();
}

function rerender() {
  const data = get(); if (!data) return;
  updateTimestamp();
  renderInsights(data, { rangeDays: _rangeDays });
  renderBoard(data, { rangeDays: _rangeDays });
}

function updateTimestamp() {
  const el = document.querySelector('[data-tracker-updated]');
  const min = Math.round(snapshotAgeMs() / 60000);
  el.textContent = isStale() ? `⚠ Snapshot ${min} min old` : `Updated ${min} min ago`;
}

function switchTab(name) {
  document.querySelectorAll('[data-tab]').forEach(b => {
    const on = b.getAttribute('data-tab') === name;
    b.classList.toggle('is-active', on);
    b.setAttribute('aria-selected', on);
  });
  document.querySelectorAll('[data-tabpanel]').forEach(p => {
    p.classList.toggle('is-hidden', p.getAttribute('data-tabpanel') !== name);
  });
}

init();
```

- [ ] **Step 14.2: Commit**

```bash
git add assets/js/tracker/main.js
git commit -m "feat(tracker): main module (tabs, range selector, render orchestration)"
```

---

## Task 15: Home-page footer link

**Files:**
- Create: `_includes/home-tracker-link.html`
- Modify: `index.md`

- [ ] **Step 15.1: Create the include**

Create `_includes/home-tracker-link.html`:

```html
<p class="home-tracker-link" style="margin-top:2em;text-align:center;font-size:0.85em;color:var(--color-fg-muted);">
  <a href="{{ '/tracker/' | relative_url }}">Backlog tracker →</a>
  <span style="opacity:0.6;"> · status of bootcamp work</span>
</p>
```

- [ ] **Step 15.2: Modify `index.md` — add the include reference**

Append to the very end of `C:/Users/dewainr/projects/mcs-labs/index.md` (after the last line, which currently is `<p class="home-browse-all"><a href="{{ '/labs/' | relative_url }}">Browse all labs →</a></p>`):

```liquid
{% include home-tracker-link.html %}
```

- [ ] **Step 15.3: Commit**

```bash
git add _includes/home-tracker-link.html index.md
git commit -m "feat(tracker): home-page footer link to backlog tracker"
```

---

## Task 16: Local Docker verification (Phase A)

**Files:** none

- [ ] **Step 16.1: Rebuild the dev container** (code changes include layouts + CSS, per the rebuild memory rule)

```bash
docker-compose -f docker-compose.dev.yml down
docker-compose -f docker-compose.dev.yml up --build -d
```

- [ ] **Step 16.2: Wait for build, then verify the page loads**

```bash
sleep 30
curl -sI http://localhost:4000/mcs-labs/tracker/ | head -3
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 16.3: Manual browser verification checklist**

Open `http://localhost:4000/mcs-labs/tracker/` in a browser. Verify:

- [ ] Page renders with header, both tabs visible, Insights selected by default.
- [ ] KPI tiles show real numbers from your snapshot.
- [ ] Donut shows 5 colored slices, legend matches.
- [ ] Trend chart shows two polylines.
- [ ] Aging heatmap shows 5 rows; hovering a cell shows a tooltip with `#NNN title — Nd`.
- [ ] Clicking a heatmap cell opens the issue on GitHub in a new tab.
- [ ] Time-range selector changes the "Closed Nd" KPI and trend x-axis. Reload retains selection.
- [ ] Board tab: filter chips work, smart `+ New issue` updates URL when a chip is selected.
- [ ] Each `+ New issue` link opens the correct GitHub issue template.
- [ ] Home page (`/`) shows the `Backlog tracker →` link at the bottom; other pages do NOT.
- [ ] No console errors.

- [ ] **Step 16.4: If anything fails, fix and re-commit, then return to 16.3**

---

## Task 16.5: Update CHANGELOG.md

**Files:**
- Modify: `CHANGELOG.md`

Add these entries under the existing `## Unreleased` section, matching the Keep-a-Changelog format already in use.

- [ ] **Step 16.5.1: Add to the existing `### Added` block (or create one near the top of Unreleased)**

```markdown
- **Backlog tracker at `/tracker/`.** New static page surfacing GitHub issues across 5 categories (Bugs, New Labs, Content Updates, Portal Enhancements, Bootcamp Features) with an Insights tab (KPI tiles, donut chart, opened-vs-closed trend, aging heatmap) and a Board tab (Kanban view with filter chips and a smart "+ New issue" button that deep-links to the right template). 100% public — any deeper interaction (assignees, comments, history) deep-links to the corresponding GitHub issue. Data refreshes via a 15-minute GitHub Actions cron (`tracker-data.yml`) that commits a normalized snapshot to `assets/data/issues.json`. Linked from the home page footer only.
- **`Bootcamp Feature` issue template.** New `.github/ISSUE_TEMPLATE/bootcamp_feature.yml` for bootcamp process, tooling, and management work — auto-applies `type: bootcamp-feature` and `status: triage` so new submissions land in a reviewable state.
- **Labels: `type: bootcamp-feature`, `status: triage`, `status: backlog`, `status: in-progress`.** New labels supporting the tracker's Triage → Backlog → In Progress → Done lifecycle.
```

- [ ] **Step 16.5.2: Add to the existing `### Changed` block**

```markdown
- **Issue template rename: "Redesign feedback" → "Portal Enhancements".** The air-theme redesign is now just "the site," so the template covering site-wide bugs/suggestions has been renamed and broadened. File renamed `.github/ISSUE_TEMPLATE/redesign-feedback.yml` → `portal_enhancement.yml`; label `redesign` → `portal-enhancement`. The template's "Which page?" dropdown now includes `Backlog tracker` as an option.
- **Label rename: `feedback` → `discussion`.** Distinguishes open-ended threads from the existing `question` label (which implies a specific answer is wanted).
```

- [ ] **Step 16.5.3: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(changelog): record backlog tracker + template/label changes"
```

---

## Task 17: Push branch + open PR (Phase B)

**Files:** none

- [ ] **Step 17.1: Push the branch**

```bash
git push -u origin dewain/issues-tracker
```

- [ ] **Step 17.2: Open the PR**

```bash
gh pr create --repo microsoft/mcs-labs \
  --title "Backlog tracker + new template + label cleanup" \
  --body "$(cat <<'EOF'
## Summary
- Adds `/tracker/` — a static page showing GitHub issues across 5 categories with an Insights tab (KPIs, donut, trend, aging heatmap) and a Board tab (Kanban with filter chips and smart new-issue button).
- 15-minute GitHub Actions workflow (`tracker-data.yml`, cron `*/15 * * * *`) refreshes a committed `assets/data/issues.json` snapshot. Idempotent — only commits when content has changed.
- New issue template `bootcamp_feature.yml` for bootcamp process/tooling/management work.
- Renames issue template `redesign-feedback.yml` → `portal_enhancement.yml` and label `redesign` → `portal-enhancement` to reflect the post-redesign reality.
- Renames label `feedback` → `discussion` to distinguish from `question`.
- Adds labels `status: triage`, `status: backlog`, `status: in-progress`, `type: bootcamp-feature`.
- Home-page footer link added (home page only, not site-wide).
- 100% public — any deeper interaction deep-links to GitHub. (OAuth-gated maintainer detail was scoped out of v1.)

Design spec: `docs/issues-tracker-design.md`
Implementation plan: `docs/issues-tracker-plan.md`

## Test plan
- [x] Local Docker: page renders, both tabs work, deep links open correct templates, OAuth completes, no console errors
- [ ] PR CI: build-and-deploy, lighthouse, tracker-data workflow_dispatch all green
- [ ] Post-merge production: cron runs within 15m, snapshot commits, page live at microsoft.github.io/mcs-labs/tracker/, OAuth works against live app, footer link works
EOF
)"
```

- [ ] **Step 17.3: Verify CI checks**

```bash
gh pr checks --repo microsoft/mcs-labs --watch
```

Expected: `build-and-deploy`, `lighthouse`, `tracker-data` (workflow_dispatch) all pass.

- [ ] **Step 17.4: If a check fails, fix locally, commit, push, and update PR notes per the user's PR workflow memory**

---

## Task 18: Post-merge production verification (Phase C)

**Files:** none — runs after user merges PR.

- [ ] **Step 18.1: Wait for next cron firing (≤15 min) and confirm workflow ran**

```bash
gh run list --repo microsoft/mcs-labs --workflow=tracker-data.yml --limit 3
```

Expected: a recent successful run on `main`.

- [ ] **Step 18.2: Verify the page is live**

```bash
curl -sI https://microsoft.github.io/mcs-labs/tracker/ | head -3
```

Expected: `HTTP/2 200`.

- [ ] **Step 18.3: Browser smoke test on production**

- [ ] Open `https://microsoft.github.io/mcs-labs/`, scroll to bottom, click `Backlog tracker →`.
- [ ] Backlog tracker loads with current data.
- [ ] All `+ New issue` template links open correctly.
- [ ] No console errors.

- [ ] **Step 18.4: Update PR notes to reflect completion (per user's PR notes memory rule)**

```bash
gh pr edit <PR-NUMBER> --repo microsoft/mcs-labs --body "..."  # appends "✅ Phase C verified" + timestamp
```

---

## Self-Review (run before handoff)

**Spec coverage:**
- §2 Categories — Tasks 3, 12, 13 ✓
- §3 Status lifecycle — Task 2 (in-progress label), Task 3 (deriveStatus) ✓
- §4 Architecture — Tasks 3, 4, 5, 10, 14 ✓
- §5 Page structure — Tasks 8, 9, 12, 13, 14, 15 ✓
- §6 Data pipeline — Tasks 3, 4, 5 ✓
- §7 Auth — dropped from v1 ✓
- §8 Edge cases — handled in 10 (stale), 14 (missing snapshot) ✓
- §9 Perf budget — verified in Task 17 via existing lighthouse CI ✓
- §10 Repo prep — Tasks 1, 2 ✓
- §11 Testing — Tasks 16 (A), 17 (B), 18 (C) ✓

**Placeholders:** none — all task content is concrete.

**Type consistency:** function names match across modules — `load`/`get`/`snapshotAgeMs`/`isStale` (data.js), `render` (insights.js, board.js). CSS class names use `.tracker-*` prefix consistently. Category keys (`bug`, `newLab`, `contentUpdate`, `portalEnhancement`, `bootcampFeature`) are identical in the shaping script (Task 3) and the renderers (Tasks 12, 13).
