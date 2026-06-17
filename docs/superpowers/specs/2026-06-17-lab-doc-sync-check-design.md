# Lab Doc Sync Check — Design

**Date:** 2026-06-17
**Branch:** `dewain/lab-doc-sync-check`

## Problem

The site renders each lab from its **collection doc** `_labs/<slug>.md`, **not** from
`labs/<slug>/README.md` (the README is excluded from the Jekyll build). The two are
meant to hold the same content (README for GitHub browsing, `_labs/` for the site),
but nothing keeps them in sync and there is no generator in the repo. So a PR that
edits a README without updating `_labs/<slug>.md` ships content that **never appears on
the live site** — exactly what happened with PR #420 (Use Case #2 was added to the
mcs-workflows README but not to `_labs/mcs-workflows.md`, so it didn't render).

## Why not auto-generate `_labs/` from READMEs

A blanket "regenerate every `_labs/` from its README at build time" is **unsafe**.
Measured across the 32 labs on `main`:

- **17 in sync**, **12 drifted**, **3 have no README** (`mcs-orchestration`,
  `agent-academy-recruit`, `copilot-studio-lite` — authored directly as `_labs/`).
- Drift is **inconsistent in direction**: sometimes the README is newer
  (`mcs-workflows`), sometimes `_labs/` has *more* content than the README
  (`agent-builder-m365` — `_labs/` is ~21% longer).

So there is no single source of truth. Auto-generating would **delete** the extra
`_labs/` content on drifted labs and **break** the README-less labs. Reconciling all
that is a separate, larger effort. This design instead adds a **guard** that prevents
the bug going forward without touching existing content.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Approach | A **CI co-edit guard** (PR check), not auto-generation |
| Primary rule | **Hard fail** when a `labs/<slug>/README.md` changes but `_labs/<slug>.md` does not |
| Reverse direction | **Soft warning** only when `_labs/<slug>.md` changes without its README (legitimate for drifted/README-less labs and metadata tweaks) |
| Local helper | **Deferred** — a faithful README→`_labs/` generator is hard given the drift; the guard + a docs note is the starting point |
| Existing drift | **Left alone** — the 12 drifted labs are not touched unless their README is edited in a future PR |

## The rule

Given the set of files changed in a PR (vs the base branch) and the set of slugs that
have a `labs/<slug>/README.md` in the repo:

- **Violation (hard fail):** `labs/<slug>/README.md` is in the changed set **and**
  `_labs/<slug>.md` is **not**. (Covers edits *and* newly added READMEs.)
- **Warning (non-blocking):** `_labs/<slug>.md` is in the changed set, its README
  exists in the repo, but `labs/<slug>/README.md` is **not** in the changed set.
- **Ignored:** anything other than `labs/<slug>/README.md` and `_labs/<slug>.md`
  (e.g. `labs/<slug>/images/**`), and any lab with no README (never violates).

A slug is paired by filename: `labs/<slug>/README.md` ↔ `_labs/<slug>.md`.

## Components

### `scripts/check-lab-sync.js`

- **Pure function** `findUnsyncedLabs(changedFiles, { readmeSlugs })` →
  `{ violations: string[], warnings: string[] }` (slugs). No filesystem/network — fully
  unit-testable. `readmeSlugs` is the set of slugs that have a README in the repo
  (passed in so the function stays pure).
- **CLI** (`require.main`): reads the changed-file list (newline-separated on stdin),
  computes `readmeSlugs` from the filesystem (`labs/*/README.md`), calls the pure
  function, prints a clear report, and exits **1** if there are violations (warnings
  print but do not fail).

CommonJS + `node:test`, matching the repo's existing `scripts/*.js` convention.

### `.github/workflows/lab-doc-sync.yml`

- Trigger: `pull_request` (all branches).
- Steps: `actions/checkout` with `fetch-depth: 0`; compute changed files with
  `git diff --name-only origin/${{ github.base_ref }}...HEAD`; pipe to
  `node scripts/check-lab-sync.js`. The job fails iff the script exits non-zero.

## Messages

- **Violation:**
  `❌ <slug>: labs/<slug>/README.md changed but _labs/<slug>.md was not. The site renders from _labs/<slug>.md — update it so your change appears. (See docs/CONTENT_FEED.md / the README↔_labs note.)`
- **Warning:**
  `⚠️ <slug>: _labs/<slug>.md changed without labs/<slug>/README.md — the GitHub README may now be out of date.`

## Testing

Unit tests for `findUnsyncedLabs` (`scripts/check-lab-sync.test.js`):

- README-only change → violation.
- README + `_labs/` changed together → clean.
- `_labs/`-only change, README exists → warning, no violation.
- `_labs/`-only change, README-less lab → clean (no warning).
- Image-only change (`labs/<slug>/images/x.png`) → clean.
- New lab (README added, `_labs/` added) → clean; README added without `_labs/` → violation.
- Multiple labs in one PR → each evaluated independently.
- Unrelated files (e.g. `scripts/foo.js`) → ignored.

## Out of scope

- Auto-generating or reconciling `_labs/` content (the drift).
- A `generate-labs` author helper (deferred).
- Enforcing README parity as a hard failure (kept as a soft warning).

## Documentation

A short note (in `CHANGELOG.md`, and a line in `docs/CONTENT_FEED.md` or the
contributing docs) that lab content lives in **both** `labs/<slug>/README.md` (GitHub)
and `_labs/<slug>.md` (the rendered site), and that the PR check enforces updating the
latter when the former changes.
