# Lab Doc Sync Check Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `pull_request` CI check that fails when `labs/<slug>/README.md` changes without the rendered `_labs/<slug>.md` (the file the site builds from), preventing the "README updated but site not updated" bug (#420).

**Architecture:** A pure function `findUnsyncedLabs(changedFiles, {readmeSlugs})` in `scripts/check-lab-sync.js` (unit-tested) plus a thin CLI that reads the PR's changed-file list from stdin and exits non-zero on violations. A small GitHub Actions workflow computes the changed files and runs the CLI.

**Tech Stack:** Node 20+ (CommonJS, `node:test`), GitHub Actions. No new dependencies.

**Spec:** `docs/superpowers/specs/2026-06-17-lab-doc-sync-check-design.md`

## File Structure

- **Create `scripts/check-lab-sync.js`** — pure `findUnsyncedLabs` + CLI. One responsibility: decide which labs have an out-of-sync README/`_labs` pair.
- **Create `scripts/check-lab-sync.test.js`** — unit tests for the pure function + a CLI integration test.
- **Create `.github/workflows/lab-doc-sync.yml`** — runs the check on pull requests.
- **Modify `CHANGELOG.md`** and **`docs/CONTENT_FEED.md`** — document the README↔`_labs/` relationship and the check.

---

### Task 1: Scaffold `scripts/check-lab-sync.js`

**Files:** Create `scripts/check-lab-sync.js`

- [ ] **Step 1: Create the skeleton**

```js
'use strict';

module.exports = {};

// findUnsyncedLabs is added in the next task; the CLI entry is added last.
```

- [ ] **Step 2: Verify the existing suite still runs**

Run: `npm test`
Expected: PASS — existing tests still green; no new tests yet.

- [ ] **Step 3: Commit**

```bash
git add scripts/check-lab-sync.js
git commit -m "chore(lab-sync): scaffold lab-doc-sync check"
```

---

### Task 2: `findUnsyncedLabs` pure function

**Files:** Modify `scripts/check-lab-sync.js`; Test `scripts/check-lab-sync.test.js`

- [ ] **Step 1: Write the failing tests (create the test file)**

Create `scripts/check-lab-sync.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { findUnsyncedLabs } = require('./check-lab-sync');

const slugs = (s) => new Set(s); // readmeSlugs helper

test('README changed without _labs → violation', () => {
  const r = findUnsyncedLabs(['labs/demo/README.md'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, ['demo']);
  assert.deepEqual(r.warnings, []);
});

test('README and _labs changed together → clean', () => {
  const r = findUnsyncedLabs(['labs/demo/README.md', '_labs/demo.md'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});

test('_labs changed without README (README exists) → warning, no violation', () => {
  const r = findUnsyncedLabs(['_labs/demo.md'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, ['demo']);
});

test('_labs changed for a README-less lab → clean (no warning)', () => {
  const r = findUnsyncedLabs(['_labs/mcs-orchestration.md'], { readmeSlugs: slugs([]) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});

test('image-only change → clean', () => {
  const r = findUnsyncedLabs(['labs/demo/images/x.png'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});

test('new README added without _labs → violation', () => {
  const r = findUnsyncedLabs(['labs/newlab/README.md'], { readmeSlugs: slugs(['newlab']) });
  assert.deepEqual(r.violations, ['newlab']);
});

test('multiple labs evaluated independently', () => {
  const r = findUnsyncedLabs(
    ['labs/a/README.md', 'labs/b/README.md', '_labs/b.md', '_labs/c.md'],
    { readmeSlugs: slugs(['a', 'b', 'c']) }
  );
  assert.deepEqual(r.violations, ['a']);   // a: README only
  assert.deepEqual(r.warnings, ['c']);     // c: _labs only, README exists
});

test('unrelated files are ignored', () => {
  const r = findUnsyncedLabs(['scripts/foo.js', 'README.md', '_data/x.yml'], { readmeSlugs: slugs(['demo']) });
  assert.deepEqual(r.violations, []);
  assert.deepEqual(r.warnings, []);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/check-lab-sync.test.js`
Expected: FAIL — `findUnsyncedLabs is not a function`.

- [ ] **Step 3: Implement `findUnsyncedLabs`**

Append to `scripts/check-lab-sync.js`:

```js
const README_RE = /^labs\/([^/]+)\/README\.md$/;
const LABS_RE = /^_labs\/([^/]+)\.md$/;

function findUnsyncedLabs(changedFiles, { readmeSlugs } = {}) {
  const readmes = readmeSlugs || new Set();
  const changedReadmes = new Set();
  const changedLabs = new Set();
  for (const f of changedFiles) {
    const r = String(f).match(README_RE);
    if (r) { changedReadmes.add(r[1]); continue; }
    const l = String(f).match(LABS_RE);
    if (l) { changedLabs.add(l[1]); }
  }
  const violations = [];
  for (const slug of changedReadmes) {
    if (!changedLabs.has(slug)) violations.push(slug);
  }
  const warnings = [];
  for (const slug of changedLabs) {
    if (!changedReadmes.has(slug) && readmes.has(slug)) warnings.push(slug);
  }
  return { violations: violations.sort(), warnings: warnings.sort() };
}
module.exports.findUnsyncedLabs = findUnsyncedLabs;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/check-lab-sync.test.js`
Expected: PASS — all 8 tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-lab-sync.js scripts/check-lab-sync.test.js
git commit -m "feat(lab-sync): findUnsyncedLabs pairing rule"
```

---

### Task 3: CLI entry + integration test

**Files:** Modify `scripts/check-lab-sync.js`; Test `scripts/check-lab-sync.test.js`

- [ ] **Step 1: Write the failing integration tests (append)**

These run the real CLI against the real `labs/` directory in the repo, feeding the changed-file list on stdin. `mcs-workflows` is an existing lab with both a README and a `_labs/` doc.

```js
const { execFileSync } = require('node:child_process');

function runCli(changedFiles) {
  try {
    const stdout = execFileSync('node', ['scripts/check-lab-sync.js'], {
      cwd: process.cwd(),
      input: changedFiles.join('\n'),
      encoding: 'utf8',
    });
    return { code: 0, stdout };
  } catch (err) {
    return { code: err.status, stdout: (err.stdout || '') + (err.stderr || '') };
  }
}

test('CLI: README-only change for a real lab exits 1', () => {
  const { code, stdout } = runCli(['labs/mcs-workflows/README.md']);
  assert.equal(code, 1);
  assert.match(stdout, /mcs-workflows/);
  assert.match(stdout, /_labs\/mcs-workflows\.md was not/);
});

test('CLI: README + _labs changed together exits 0', () => {
  const { code } = runCli(['labs/mcs-workflows/README.md', '_labs/mcs-workflows.md']);
  assert.equal(code, 0);
});

test('CLI: empty input exits 0', () => {
  const { code } = runCli([]);
  assert.equal(code, 0);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/check-lab-sync.test.js`
Expected: FAIL — the CLI does nothing yet, so a README-only change exits 0 instead of 1.

- [ ] **Step 3: Implement the CLI block**

Append to the END of `scripts/check-lab-sync.js`:

```js
// CLI: read newline-separated changed files on stdin, exit 1 on violations.
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');

  let input = '';
  try { input = fs.readFileSync(0, 'utf8'); } catch { input = ''; }
  const changedFiles = input.split('\n').map((s) => s.trim()).filter(Boolean);

  const readmeSlugs = new Set();
  try {
    for (const slug of fs.readdirSync('labs')) {
      if (fs.existsSync(path.join('labs', slug, 'README.md'))) readmeSlugs.add(slug);
    }
  } catch { /* no labs/ dir — leave empty */ }

  const { violations, warnings } = findUnsyncedLabs(changedFiles, { readmeSlugs });

  for (const slug of warnings) {
    console.log(`::warning::⚠️ ${slug}: _labs/${slug}.md changed without labs/${slug}/README.md — the GitHub README may now be out of date.`);
  }
  if (violations.length) {
    for (const slug of violations) {
      console.error(`::error::❌ ${slug}: labs/${slug}/README.md changed but _labs/${slug}.md was not. The site renders from _labs/${slug}.md — update it so your change appears. (See docs/CONTENT_FEED.md.)`);
    }
    console.error(`\nlab-doc-sync: ${violations.length} lab(s) need their _labs/<slug>.md updated.`);
    process.exit(1);
  }
  console.log(`lab-doc-sync: OK${warnings.length ? ` (${warnings.length} warning(s))` : ''}`);
}
```

- [ ] **Step 4: Run the full suite to verify it passes**

Run: `npm test`
Expected: PASS — the CLI integration tests plus all earlier tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/check-lab-sync.js scripts/check-lab-sync.test.js
git commit -m "feat(lab-sync): CLI reads changed files from stdin, fails on violations"
```

---

### Task 4: Pull-request workflow

**Files:** Create `.github/workflows/lab-doc-sync.yml`

- [ ] **Step 1: Create the workflow**

```yaml
name: Lab Doc Sync

on:
  pull_request:

permissions:
  contents: read

jobs:
  lab-doc-sync:
    name: Lab Doc Sync
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v5
        with:
          fetch-depth: 0

      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: "20"

      - name: Check README ↔ _labs sync
        run: |
          git diff --name-only "${{ github.event.pull_request.base.sha }}...HEAD" | node scripts/check-lab-sync.js
```

> Using `pull_request.base.sha` (an ancestor guaranteed present with `fetch-depth: 0`)
> rather than `origin/<base_ref>` (not always a local tracking ref after checkout).

- [ ] **Step 2: Validate the workflow YAML and the diff command shape**

Run:
```
node -e "const y=require('js-yaml'),fs=require('fs'); const d=y.load(fs.readFileSync('.github/workflows/lab-doc-sync.yml','utf8')); const on=d.on||d[true]; if(!('pull_request' in on)) throw new Error('no pull_request trigger'); const steps=d.jobs['lab-doc-sync'].steps.map(s=>s.name); console.log(steps.join(' -> ')); const run=d.jobs['lab-doc-sync'].steps.find(s=>s.name && s.name.includes('Check')).run; if(!/check-lab-sync\.js/.test(run)) throw new Error('does not run the check'); console.log('OK')"
```
Expected: prints the step list and `OK`.

- [ ] **Step 3: Locally simulate the check against the current branch (sanity)**

Run:
```
git diff --name-only origin/main...HEAD | node scripts/check-lab-sync.js
```
Expected: `lab-doc-sync: OK` (this branch changes only `scripts/`, `.github/`, and `docs/` — no lab README/`_labs` pairs — so there are no violations). Exit code 0.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/lab-doc-sync.yml
git commit -m "ci(lab-sync): run README ↔ _labs check on pull requests"
```

---

### Task 5: Documentation + final verification

**Files:** Modify `CHANGELOG.md`, `docs/CONTENT_FEED.md`

- [ ] **Step 1: Add a CHANGELOG entry**

Add under the Unreleased/Added section in `CHANGELOG.md`:

```markdown
- Added a `Lab Doc Sync` pull-request check (`scripts/check-lab-sync.js` + `.github/workflows/lab-doc-sync.yml`) that fails when `labs/<slug>/README.md` changes without the rendered `_labs/<slug>.md` — the file the site actually builds from. Prevents lab content updates from silently not appearing on the live portal.
```

- [ ] **Step 2: Add a note to `docs/CONTENT_FEED.md`**

Append a short section to `docs/CONTENT_FEED.md`:

```markdown
## Lab content: README ↔ `_labs/`

Each lab's content lives in two files: `labs/<slug>/README.md` (browsable on GitHub)
and `_labs/<slug>.md` (the collection doc the **site renders from**). When you change a
lab's `README.md`, you must update `_labs/<slug>.md` too, or the change won't appear on
the live site. The **Lab Doc Sync** pull-request check enforces this.
```

- [ ] **Step 3: Run the full suite**

Run: `npm test`
Expected: PASS (all tests, including the new lab-sync tests).

- [ ] **Step 4: Verify the check catches the real bug pattern**

Run:
```
printf 'labs/mcs-workflows/README.md\n' | node scripts/check-lab-sync.js; echo "exit: $?"
```
Expected: prints the `::error::` for `mcs-workflows` and `exit: 1` — proving it would have caught PR #420.

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md docs/CONTENT_FEED.md
git commit -m "docs(lab-sync): document README ↔ _labs check"
```

---

## Notes for the implementer

- **Pure vs IO:** `findUnsyncedLabs` is pure (takes `readmeSlugs` as input) so it's fully unit-testable; the CLI block is the only part that reads stdin and the filesystem.
- **`fs.readFileSync(0, 'utf8')`** reads stdin (fd 0). Empty stdin yields no changed files → exit 0.
- **GitHub annotations:** `::error::`/`::warning::` lines surface inline on the PR. They also print as plain text locally, which the tests match on.
- **Line endings:** the repo has `core.autocrlf=true` + `core.safecrlf=true`. If `git add`/`commit` errors with "LF would be replaced by CRLF", use `git -c core.safecrlf=false ...`.
- **Test command:** `npm test` runs `node --test scripts/*.test.js`, which picks up `check-lab-sync.test.js` automatically.
