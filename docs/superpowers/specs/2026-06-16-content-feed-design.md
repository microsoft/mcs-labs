# Content Syndication Feed for mcs-labs — Design

**Date:** 2026-06-16
**Branch:** `add-lab-feeds`
**Status:** Draft for review
**This spec covers:** Phase 1 (Producer). Phases 2–3 are captured in the
[Roadmap](#roadmap) and will each get their own spec.

## Summary

Make the mcs-labs portal able to **publish** its content (`modules`, `events`,
`workshops`, `labs`) as machine-readable JSON **feeds**, and ultimately **render its
own pages from a consumed feed** — so the same mechanism that lets sibling portals and
external systems pull content also drives this instance. We build this in three
phases; **this spec details Phase 1 (the Producer)** and is the only phase to be
implemented before its own verification.

## Roadmap

The full effort is three sequenced subsystems. Each phase is built, tested, and
verified before the next; the site stays working throughout.

| Phase | Subsystem | Deliverables | Status |
| --- | --- | --- | --- |
| **1** | **Producer** | `_data/feeds.yml`, `scripts/build-feed.js`, emits `feed/<name>.json` + `feed/index.json`, unit tests, deploy wiring | **This spec** |
| 2 | Consumer | `_data/feed_subscriptions.yml`, a consume step that **self-subscribes to this instance's own feed**, fetches + applies `exclude` filters → consolidated dataset, tests | Future spec |
| 3 | Feed as source of truth | Pre-build orchestration; pages render **from the consumed feed** (consumed items written into the docs Jekyll renders); external items rendered; URLs/layouts preserved | Future spec |

A condensed design for Phases 2–3 is in [Future phases](#future-phases) so the
decisions behind them aren't lost.

## Goal (Phase 1)

A build-time **producer** that emits machine-readable **JSON feed(s)** of the portal's
content. Each feed item carries the full **raw-markdown instructions**, all
front-matter **metadata**, and **absolute image URLs**, consumable by sibling
mcs-labs portals *and* arbitrary external systems. Selection is **config-file
driven**. One or many named feeds; a single item may appear in multiple feeds; a
default everything feed is emitted unless disabled.

## Decisions (locked)

These hold across all phases unless a later phase's spec revises them.

| Decision | Choice |
| --- | --- |
| Consumers | Both sibling portals **and** arbitrary external systems |
| Format | Single static **JSON** manifest per feed |
| Item payload | **Raw markdown** + front-matter metadata + **absolute** image URLs |
| Overall direction | Bidirectional: instance **publishes** feeds and (Phase 3) **renders from its own consumed feed** |
| Generation mechanism | **Tested Node script** (`scripts/build-feed.js`) |
| Change-detection | `generated` timestamp + `schema_version`; per-item `last_modified` + `content_hash` |
| Cross-references | **By reference** (lab slugs), not denormalized/inlined |
| Selection | **Config-file driven** (`_data/*.yml`), not a UI element |
| Feed multiplicity | One or many named feeds; an item may appear in **multiple** feeds |
| Everything feed | A default **`all`** feed is emitted **by default** and can be **explicitly disabled** |
| Curation | **Two subtractive layers**: producer `exclude` (block at source) + consumer `exclude` (drop on intake) |

## How the portal is built (context)

- Jekyll site (Minimal Mistakes theme) deployed to GitHub Pages.
- `_config.yml` defines four output collections: `modules`, `labs`, `events`,
  `workshops`.
- Instruction content lives in `labs/<slug>/README.md` (source of truth) plus
  `labs/<slug>/images/`. `scripts/Generate-Labs.ps1` regenerates the Jekyll
  collection docs (`_labs/<slug>.md`) from those sources — a **local authoring
  convenience**; the committed `_labs/*.md` are what the deploy builds. *(Phase 3
  effectively replaces this script with the feed pipeline.)*
- `modules`/`events`/`workshops` are hand-authored front-matter docs in
  `_modules/`, `_events/`, `_workshops/`. They mostly carry metadata and **reference
  labs by slug** (e.g. `_events/bootcamp.md` lists 11 lab slugs).
- Deploy workflow `.github/workflows/build-and-deploy.yml` runs **plain
  `bundle exec jekyll build`** → uploads `_site/` → deploys to Pages. No Node step in
  the deploy path today. *(Phase 1 adds a Node step after the build; Phase 3 moves
  feed generation before the build.)*
- Lab images under `labs/<slug>/images/` are published as-is (only
  `labs/*/README.md` and `local-dist/` are excluded from the Jekyll build).

## Roles

A portal instance can play two independent roles; an instance may be a producer, a
consumer, or both (this instance becomes both by Phase 3).

| Role | Config file | Responsibility |
| --- | --- | --- |
| **Feed owner** (producer) | `_data/feeds.yml` | Which feeds this instance **publishes**, and curation — `include` to hand-pick, `exclude` to **block** items from a feed. *(Phase 1)* |
| **Portal owner** (consumer) | `_data/feed_subscriptions.yml` | Which feeds this instance **subscribes to** and per-feed local **exclude** filters (default: filter nothing). *(Phase 2)* |

---

# Phase 1 — Producer

## Configuration — `_data/feeds.yml`

A single config file declares which feeds this instance **publishes** and routes
content into them. Membership is evaluated **per feed, independently**, so the same
item can appear in any number of feeds.

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
    exclude: [<slug>, ...]   # optional: remove/block individual items from this feed
```

### Membership rule (per feed)

An item belongs to feed `F` if **either**:

- its collection is listed in `F.collections`, **and** its slug is not in `F.exclude`; **or**
- its slug is listed in `F.include`.

Because each feed applies this rule on its own, a single item naturally appears in as
many feeds as match it.

### Default behavior

The **everything feed** is the default. If `_data/feeds.yml` is absent, or present
without `feeds:`/`everything_feed:` keys, the producer emits exactly one feed,
equivalent to:

```yaml
everything_feed: true     # → feed "all" with every collection
# (no additional feeds)
```

yielding a single `feed/all.json` containing all `events`, `workshops`, `modules`,
and `labs`.

### Removing the everything feed

Set `everything_feed: false` to suppress it. When disabled, only the feeds listed
under `feeds:` are produced. If `everything_feed` is `false` **and** `feeds:` is
empty/absent, no feeds are emitted and the generator logs a warning (non-fatal).

If a user-defined feed under `feeds:` is itself named `all` (or matches the
`everything_feed.name`), that explicit definition **replaces** the auto-generated
everything feed — explicit config always wins.

### Producer-side blocking

A feed's `exclude` list is the feed owner's **blocklist**: any slug in `exclude` is
withheld from that feed even though its collection is otherwise included. Combined
with `include` (hand-pick) and `collections` (bulk include), this lets the feed owner
fully curate — and block — what each published feed carries.

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

## Generator — `scripts/build-feed.js`

A Node script following the repo's existing `scripts/*.js` + `*.test.js` convention
(`build-tracker-data.js`).

### Inputs

- `_data/feeds.yml` (or defaults).
- `_config.yml` (for the default `base_url` and site title).
- Collection sources — all four collections are read uniformly from
  `_<collection>/<slug>.md` via `gray-matter` (front matter + body). For **labs**
  this is `_labs/<slug>.md`, the committed/rendered body the site publishes (the
  sibling `labs/<slug>/README.md` has no front matter and is only an authoring
  source, so it is not read directly). One code path serves every collection.

### Processing

1. Resolve the effective feed config (apply defaults): synthesize the `all`
   everything feed unless `everything_feed: false`, then merge in any `feeds:`
   (an explicit feed named `all` replaces the synthesized one).
2. Enumerate all items per collection; parse front matter + raw markdown body.
3. **Absolutize images:** rewrite relative references — markdown `](images/…)` and
   HTML `src="images/…"` — to `<base_url>/labs/<slug>/images/…`. Absolute URLs
   (`http(s)://…`, protocol-relative `//…`, root-relative `/…`) are left untouched.
   Collect the resulting absolute image URLs into `images[]`.
4. Compute `content_hash` = `sha256` of the raw markdown body (before image rewrite — so content and image-path changes are captured without churning when `base_url` changes).
5. Compute `last_modified` from `git log -1 --format=%cI -- <source-file>`.
6. For each configured feed, select members via the membership rule and emit
   `feed/<name>.json`.
7. Emit `feed/index.json` discovery manifest.

### Output location (Phase 1)

Writes into `_site/feed/` **after** the Jekyll build, so Jekyll never processes or
overwrites it. *(Phase 3 moves generation before the build; see Future phases.)*

### Determinism

Items are ordered by `(collection, front-matter order, slug)` so output — and
therefore hashes and diffs — is stable across builds.

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

- `metadata` carries **all** front-matter fields for the item (example shows a
  representative subset); shape varies by collection.
- `references` is populated for `events`/`workshops`/`modules` (their referenced lab
  slugs, **by reference** — not inlined). For `labs` it is empty/omitted.
- `content_markdown` is the raw markdown body with image URLs absolutized.
- `url` is the item's canonical page on the producing site.

## Deploy integration (Phase 1)

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

`package.json` gains `gray-matter` (and `js-yaml` if not already available) in
`devDependencies`. The `a11y.yml` and `lighthouse.yml` workflows already run
`npm install`, so a Node toolchain in CI is established precedent.

## Testing (Phase 1)

- **Unit tests** `scripts/build-feed.test.js` (Node's built-in test runner, matching
  `build-tracker-data.test.js`) covering pure functions:
  - config resolution + default behavior,
  - everything-feed default on, `everything_feed: false` removal, customised
    name/title, and explicit `feeds.all` replacing the synthesized one,
  - per-feed membership rule (collections, include, exclude, multi-feed membership),
  - image-URL absolutization (relative vs absolute vs root-relative inputs),
  - content hashing + deterministic ordering,
  - emitted JSON shape for `index.json` and `<name>.json`.
- **Smoke validation:** after generation, assert every `feed/*.json` parses and
  matches the documented schema (lightweight inline checks; no new heavy dep).

## Out of scope (Phase 1)

- Everything in Phases 2–3 (consumer runtime, feed-as-source-of-truth rendering).
- Rendered-HTML payloads (raw markdown chosen).
- Denormalized/inlined cross-references (by-reference chosen).

---

# Future phases

Condensed designs so the decisions behind Phases 2–3 are preserved. Each will be
expanded into its own spec when we reach it.

## Phase 2 — Consumer (config + intake)

**Config — `_data/feed_subscriptions.yml`** declares which external feeds this
instance subscribes to and optional local `exclude` filters (default: filter
nothing):

```yaml
subscriptions:
  - name: self                          # this instance consumes its OWN feed
    url: /feed/all.json                 # resolved locally during build
    enabled: true
  - name: partner-labs
    url: https://partner.example.com/mcs-labs/feed/all.json
    enabled: true
    exclude:                            # omitted/empty ⇒ accept everything (default)
      slugs: [some-lab]                 # drop these items
      collections: [events]             # drop whole collections from this feed
```

**Filtering semantics:** default = no filtering; an item is rejected if its `slug` is
in `exclude.slugs` **or** its `collection` is in `exclude.collections`;
`enabled: false` skips a subscription. The consumer filter is purely **subtractive** —
it can only remove items a feed already publishes, never add or un-block ones the feed
owner withheld.

**Self-subscription:** by default this instance subscribes to its **own** feed,
making the produce → consume → filter loop verifiable in one instance.

**Output:** a consolidated consumed dataset (e.g. `_data/feed_consumed.json`).
Two-layer curation: producer `exclude` blocks at source; consumer `exclude` drops on
intake.

## Phase 3 — Feed as source of truth

The portal's pages render **from the consumed feed** rather than directly from the
collections.

- **Build-order inversion:** feed generation + consumption run **before** Jekyll.
  Produce `feed/*.json` from canonical sources → consume subscriptions (own +
  external) with filters → Jekyll renders the consumed result.
- **Lowest-risk mechanism:** the consume step writes the filtered, consumed items
  back out as the collection docs Jekyll already renders (`_labs/*.md`,
  `_modules/*.md`, …) — effectively replacing `Generate-Labs.ps1` with the feed
  pipeline. Existing layouts, URLs, and images are preserved; external subscribed
  items render as additional pages via the same layouts.
- **Round-trip guarantee:** consuming its own feed must regenerate byte-stable pages
  (source → feed → consumed → identical render).
- **Risk surface:** core site build — URLs, TOC anchors, images, search, tracker.
  Requires careful regression verification, which is why it is sequenced last.
