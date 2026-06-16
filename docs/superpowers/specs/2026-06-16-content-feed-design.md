# Content Syndication Feed for mcs-labs — Design

**Date:** 2026-06-16
**Branch:** `add-lab-feeds`
**Status:** Draft for review

## Goal

Add a build-time **producer** to the mcs-labs portal that emits machine-readable
**JSON feed(s)** of the portal's content — `modules`, `events`, `workshops`, and
`labs`. Each feed item carries the full **raw-markdown instructions**, all
front-matter **metadata**, and **absolute image URLs**, so that:

- other **sibling mcs-labs portals** (forks/deployments of this same Jekyll site) can
  pull a curated subset of the canonical content and re-host it, and
- **arbitrary external systems** (other portals, apps, LMSes) can consume the same
  clean, self-describing format.

Scope is **producer-only**: this repo emits the feed(s) as static files on its
GitHub Pages deployment. Consumer-side pull/ingest/render is explicitly out of scope
(see [Out of Scope](#out-of-scope)), though the feed is designed to make that a clean
follow-up.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Consumers | Both sibling portals **and** arbitrary external systems |
| Format | Single static **JSON** manifest per feed |
| Item payload | **Raw markdown** + front-matter metadata + **absolute** image URLs |
| Build scope | Producer only |
| Generation mechanism | **Tested Node script** wired into the deploy workflow |
| Change-detection | Yes — `generated` timestamp + `schema_version`; per-item `last_modified` + `content_hash` |
| Cross-references | **By reference** (lab slugs), not denormalized/inlined |
| Selection | **Config-file driven** (`_data/feeds.yml`), not a UI element |
| Feed multiplicity | **One or many** named feeds; a single item may appear in **multiple** feeds |
| Everything feed | A default **`all`** feed (every collection) is emitted **by default**, and can be **explicitly disabled** |

## How the portal is built (context)

- Jekyll site (Minimal Mistakes theme) deployed to GitHub Pages.
- `_config.yml` defines four output collections: `modules`, `labs`, `events`,
  `workshops`.
- The instruction content lives in `labs/<slug>/README.md` (source of truth) plus
  `labs/<slug>/images/`. `scripts/Generate-Labs.ps1` regenerates the Jekyll
  collection docs (`_labs/<slug>.md`) from those sources — but this is a **local
  authoring convenience**; the committed `_labs/*.md` are what the deploy builds.
- `modules`/`events`/`workshops` are hand-authored front-matter docs in
  `_modules/`, `_events/`, `_workshops/`. They mostly carry metadata and **reference
  labs by slug** (e.g. `_events/bootcamp.md` lists 11 lab slugs).
- Deploy workflow `.github/workflows/build-and-deploy.yml` runs **plain
  `bundle exec jekyll build`** → uploads `_site/` → deploys to Pages. There is no
  Node/PowerShell step in the deploy path today.
- Lab images under `labs/<slug>/images/` are published as-is (only
  `labs/*/README.md` and `local-dist/` are excluded from the Jekyll build).

## Configuration — `_data/feeds.yml`

A single config file declares which feeds this instance **publishes** and routes
content into them. Feed membership is evaluated **per feed, independently**, so the
same item can appear in any number of feeds.

### Schema

```yaml
# Optional. Absolute base used to rewrite relative image refs and build item URLs.
# Defaults to "<site.url><site.baseurl>" (e.g. https://microsoft.github.io/mcs-labs).
base_url: https://microsoft.github.io/mcs-labs

# Optional. Controls the default "everything" feed (every collection).
# Default: true (emitted as feed "all"). Accepts:
#   everything_feed: true            # emit default "all" feed (DEFAULT)
#   everything_feed: false           # REMOVE the everything feed
#   everything_feed:                 # emit it, but customise name/title
#     name: all
#     title: "MCS Labs — All Content"
everything_feed: true

# Optional. Additional named feeds, emitted ALONGSIDE the everything feed.
# If omitted, only the everything feed is produced.
feeds:
  <feed-name>:
    title: "Human-readable feed title"          # optional; defaults to feed-name
    description: "What this feed contains"       # optional
    collections: [events, workshops, modules, labs]  # whole-collection inclusion
    include: [<slug>, ...]   # optional: extra individual items (any collection)
    exclude: [<slug>, ...]   # optional: remove individual items from this feed
```

### Membership rule (per feed)

An item belongs to feed `F` if **either**:

- its collection is listed in `F.collections`, **and** its slug is not in `F.exclude`; **or**
- its slug is listed in `F.include`.

Because each feed applies this rule on its own, a single item naturally appears in
as many feeds as match it.

### Default behavior

The **everything feed** is the default. If `_data/feeds.yml` is absent, or present
without `feeds:`/`everything_feed:` keys, the producer emits exactly one feed,
equivalent to:

```yaml
everything_feed: true     # → feed "all" with every collection
# (no additional feeds)
```

which yields a single `feed/all.json` containing all `events`, `workshops`,
`modules`, and `labs`.

### Removing the everything feed

Set `everything_feed: false` to suppress it. When disabled, only the feeds listed
under `feeds:` are produced. If `everything_feed` is `false` **and** `feeds:` is
empty/absent, no feeds are emitted and the generator logs a warning (non-fatal).

If a user-defined feed under `feeds:` is itself named `all` (or matches the
`everything_feed.name`), that explicit definition **replaces** the auto-generated
everything feed — explicit config always wins.

### Examples

Keep the default everything feed and add a focused labs feed plus a hand-picked
"featured" feed (items appear in `all` **and** their custom feed):

```yaml
# everything_feed defaults to true → 'all' is still emitted
feeds:
  labs-only:
    title: "Labs"
    collections: [labs]                                # labs ALSO appear here
  featured:
    title: "Featured"
    collections: []
    include: [agent-builder-m365, mcs-orchestration]   # also present in 'all'
```

Remove the everything feed and publish only curated feeds:

```yaml
everything_feed: false
feeds:
  curriculum:
    collections: [events, workshops]
  content:
    collections: [modules, labs]
```

### Reserved (not implemented in this scope)

A `subscriptions:` key is reserved for the **consumer** direction (a portal instance
declaring which external feed URLs it pulls). It is intentionally **not** implemented
here; documenting the reservation keeps the config forward-compatible.

## Generator — `scripts/build-feed.js`

A Node script following the repo's existing `scripts/*.js` + `*.test.js` convention
(`build-tracker-data.js`).

### Inputs

- `_data/feeds.yml` (or defaults).
- Collection sources:
  - **labs** → raw body from `labs/<slug>/README.md` (source of truth) + front
    matter (from the README and/or `_labs/<slug>.md`).
  - **modules / events / workshops** → `_<collection>/<slug>.md` via `gray-matter`.

### Processing

1. Resolve the effective feed config (apply defaults): synthesize the `all`
   everything feed unless `everything_feed: false`, then merge in any `feeds:`
   (an explicit feed named `all` replaces the synthesized one).
2. Enumerate all items per collection; parse front matter + raw markdown body.
3. **Absolutize images:** rewrite relative references — markdown `](images/…)` and
   HTML `src="images/…"` — to `<base_url>/labs/<slug>/images/…`. Absolute URLs
   (`http(s)://…`, protocol-relative `//…`, root-relative `/…`) are left untouched.
   Collect the resulting absolute image URLs into `images[]`.
4. Compute `content_hash` = `sha256` of the raw markdown body (post image-rewrite,
   so a moved image changes the hash).
5. Compute `last_modified` from `git log -1 --format=%cI -- <source-file>`.
6. For each configured feed, select members via the membership rule and emit
   `feed/<name>.json`.
7. Emit `feed/index.json` discovery manifest.

### Output location

Writes into `_site/feed/` **after** the Jekyll build (so Jekyll never processes or
overwrites it). The deploy workflow uploads `_site/` as-is.

### Determinism

Items are ordered by `(collection, front-matter order, slug)` so output — and
therefore hashes and diffs — are stable across builds.

### Failure handling

- Missing/empty config → default `all` feed.
- A slug referenced in `include` (or a routed collection) whose source file is
  missing → **warn and skip** (non-fatal; the deploy must never break on feed
  generation).
- A feed that ends up with no members → emitted with `items: []` plus a warning.
- Non-zero exit only on unrecoverable errors (e.g. malformed `_data/feeds.yml`).

## Feed JSON schema

### `feed/index.json` (discovery manifest)

```json
{
  "schema_version": "1.0",
  "generated": "2026-06-16T12:00:00Z",
  "site": {
    "title": "Microsoft Copilot Agents Labs",
    "base_url": "https://microsoft.github.io/mcs-labs"
  },
  "feeds": [
    {
      "name": "all",
      "title": "MCS Labs — All Content",
      "description": "All modules, events, workshops, and labs",
      "url": "https://microsoft.github.io/mcs-labs/feed/all.json",
      "item_count": 42
    }
  ]
}
```

### `feed/<name>.json`

```json
{
  "schema_version": "1.0",
  "generated": "2026-06-16T12:00:00Z",
  "feed": { "name": "all", "title": "MCS Labs — All Content", "description": "…" },
  "site": { "base_url": "https://microsoft.github.io/mcs-labs" },
  "items": [
    {
      "collection": "labs",
      "slug": "agent-builder-m365",
      "title": "Build Progressive AI Assistants with Agent Builder in Microsoft 365",
      "description": "Master agent creation from basic web-grounded assistants …",
      "url": "https://microsoft.github.io/mcs-labs/labs/agent-builder-m365/",
      "metadata": {
        "order": 140,
        "duration": 30,
        "difficulty": 100,
        "section": "core_learning_path",
        "journeys": ["quick-start", "business-user"],
        "module": "agent-builder"
      },
      "references": { "labs": [] },
      "content_markdown": "# Build Progressive AI Assistants …\n\n![alt](https://microsoft.github.io/mcs-labs/labs/agent-builder-m365/images/agent-builder.png)\n…",
      "images": [
        "https://microsoft.github.io/mcs-labs/labs/agent-builder-m365/images/agent-builder.png"
      ],
      "last_modified": "2026-05-01T12:00:00Z",
      "content_hash": "sha256:…"
    }
  ]
}
```

### Field notes

- `metadata` carries **all** front-matter fields for the item (the example shows a
  representative subset); shape varies by collection.
- `references` is populated for `events`/`workshops`/`modules` (their referenced lab
  slugs, **by reference** — not inlined). For `labs` it is empty/omitted.
- `content_markdown` is the raw markdown body with image URLs absolutized.
- `url` is the item's canonical page on the producing site.

## Deploy integration

Edit `.github/workflows/build-and-deploy.yml` to add, between **Build Jekyll** and
**Upload artifact**:

```yaml
- name: Setup Node
  uses: actions/setup-node@v5
  with:
    node-version: "20"
- name: Install feed deps
  run: npm ci
- name: Build content feed
  run: node scripts/build-feed.js --out _site/feed
```

`package.json` gains `gray-matter` (and `js-yaml` if not already transitively
available) in `devDependencies`. The `a11y.yml` and `lighthouse.yml` workflows
already do `npm install`, so a Node toolchain in CI is established precedent.

## Testing

- **Unit tests** `scripts/build-feed.test.js` (Node's built-in test runner, matching
  `build-tracker-data.test.js`) covering pure functions:
  - config resolution + default behavior,
  - everything-feed default on, `everything_feed: false` removal, and customised
    name/title (plus explicit `feeds.all` replacing the synthesized one),
  - per-feed membership rule (collections, include, exclude, multi-feed membership),
  - image-URL absolutization (relative vs absolute vs root-relative inputs),
  - content hashing + deterministic ordering,
  - emitted JSON shape for `index.json` and `<name>.json`.
- **Smoke validation:** after generation, assert every `feed/*.json` parses and
  matches the documented schema (lightweight inline checks; no new heavy dep).

## Out of scope

- Consumer-side pull / ingest / render (a sibling instance fetching and re-hosting).
- The `subscriptions:` consumer config (format reserved, not implemented).
- Rendered-HTML payloads (raw markdown was chosen).
- Denormalized/inlined cross-references (by-reference chosen).

The `feed/index.json` discovery manifest plus this documented schema make the
consumer side a clean future increment.
