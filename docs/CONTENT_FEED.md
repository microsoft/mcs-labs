# Content Feed

The portal publishes its content (`modules`, `events`, `workshops`, `labs`) as a
set of machine-readable **JSON feeds**, and can **render its own pages from a
consumed feed**. This lets sibling mcs-labs instances and external systems pull the
content, and lets one portal syndicate content from another.

There are two halves:

- **Producer** — `scripts/build-feed.js` turns the site's collections into JSON feeds.
- **Consumer** — `scripts/consume-feed.js` reads feeds (its own and/or external
  instances'), filters them, and **materializes** collection docs that Jekyll renders.

> **Authoring is unchanged.** The feed is *derived from* the normal source files
> (`labs/<slug>/README.md`, `_<collection>/<slug>.md`). You still author content the
> same way; the feed pipeline runs at build time and never writes to those files. The
> lab auditor (`/audit-*`, `/build-lab`) is therefore unaffected.

## Published URLs

On the deployed site (base `https://microsoft.github.io/mcs-labs`):

| Resource | URL | Use |
| --- | --- | --- |
| **Discovery** | `…/feed/index.json` | Lists every published feed + its manifest/bundle URLs. **Start here.** |
| **Manifest** (lightweight) | `…/feed/<name>/manifest.json` | Per-item metadata + `content_hash` + `content_url`; **no markdown**. For incremental sync. |
| **Per-item document** | `…/feed/items/<collection>/<slug>.json` | One item's full content (markdown + metadata + images). Deduplicated across feeds. |
| **Bundle** (optional) | `…/feed/<name>.json` | Every item inline, in one file. Convenient for simple consumers. |

The default feed is named `all` (every collection). Example:
`https://microsoft.github.io/mcs-labs/feed/index.json`.

`schema_version` is `1.1`.

## Producer configuration — `_data/feeds.yml`

Declares which feeds this instance **publishes**.

```yaml
# Optional. Absolute base for image/link rewriting (defaults to site url + baseurl).
base_url: https://microsoft.github.io/mcs-labs

# The default "everything" feed. true (default) | false (remove) | { name, title }.
everything_feed: true

# Optional additional named feeds, emitted alongside the everything feed.
feeds:
  labs-only:
    title: "Labs"
    collections: [labs]          # whole-collection inclusion
    include: [some-extra-slug]   # optional: add individual items (any collection)
    exclude: [some-slug]         # optional: block individual items
    bundle: true                 # optional: also emit the inline feed/<name>.json (default true)
```

- Membership is per feed, so a single item can appear in multiple feeds.
- `exclude` is the feed owner's blocklist (content blocked here never reaches the feed).
- `index` and `items` are **reserved** feed names (they collide with output paths).

## Consumer configuration — `_data/feed_subscriptions.yml`

Declares which feeds this instance **ingests** and renders from.

```yaml
subscriptions:
  - name: self          # consume THIS instance's own feed (no HTTP)
    self: true
    enabled: true
  # - name: partner
  #   url: https://partner.example.com/mcs-labs/feed   # base dir containing index.json
  #   feed: all                                        # which named feed to pull (default all)
  #   exclude:                                         # optional local filter (default: none)
  #     slugs: [some-lab]
  #     collections: [events]
```

- **Default** (file absent or self-only): the portal renders exactly its own content —
  identical to building from the collections directly.
- On a slug collision between sources, the **self** item wins (external is dropped).
- `exclude` is subtractive: a subscriber can drop items, never add ones the source withheld.

## Build pipeline

The deploy (`.github/workflows/build-and-deploy.yml`) is **feed-first**:

```
Produce feed (build-feed.js → .feed-build/published)
  → Consume + materialize (consume-feed.js → .feed-build/_<collection>/…)
  → Jekyll build --config _config.yml,_config.feed.yml   (collections_dir: .feed-build)
  → Publish feed (.feed-build/published → _site/feed)
  → Deploy _site
```

`_config.feed.yml` points Jekyll's collections at the materialized `.feed-build/`
(git-ignored), so pages render **from the consumed feed** while the committed
`_<collection>/*.md` are never modified. With only the self-subscription the rendered
site is byte-identical to a normal build (a CI round-trip test enforces this).

## Consuming the feed from another system

Incremental sync (recommended):

1. `GET …/feed/index.json` → find the feed and its `manifest_url`.
2. `GET …/feed/<name>/manifest.json` → list of items with `content_hash` + `content_url`.
3. Diff each `content_hash` against what you already have.
4. `GET` only the changed `content_url` (per-item documents) — not the whole feed.

Simple one-shot: `GET …/feed/<name>.json` (the bundle) for everything inline.

Each item carries: `collection`, `slug`, `title`, `description`, `url` (canonical page),
`metadata` (front matter), `references` (lab slugs, for events/workshops/modules),
`content_markdown` (raw markdown, absolute image URLs), `images`, `last_modified`,
`content_hash`.

## Local preview (Docker)

The feed pipeline is pure Node; Jekyll renders the result. To preview the
feed-sourced site locally:

```powershell
# 1. Materialize the feed on the host (Node only)
node scripts/build-feed.js --out .feed-build/published
node scripts/consume-feed.js --out .feed-build --feed-dir .feed-build/published

# 2. Serve the materialized site with Jekyll (container only needs Ruby)
docker run --rm -p 4000:4000 -v "${PWD}:/work" -w /work mcr.microsoft.com/devcontainers/ruby:3.1 `
  bash -lc 'bundle install && bundle exec jekyll serve --no-watch --host 0.0.0.0 --config _config.yml,_config.feed.yml'
```

- **Wait for the `Server running...` log line** before opening the browser — the first
  build takes 1–3 minutes (`bundle install` + Jekyll build). An early request returns
  `ERR_CONNECTION_REFUSED` simply because the server isn't up yet.
- Open **http://localhost:4000/mcs-labs/** (note the `/mcs-labs/` base path).
- The container must bind `--host 0.0.0.0` (a container's loopback ≠ the host). To
  restrict exposure to your machine, publish with `-p 127.0.0.1:4000:4000`.

## Files

| File | Role |
| --- | --- |
| `scripts/build-feed.js` | Producer — emits `feed/*` JSON |
| `scripts/consume-feed.js` | Consumer — ingests feeds, materializes `.feed-build/` |
| `_data/feeds.yml` | Producer config (what to publish) |
| `_data/feed_subscriptions.yml` | Consumer config (what to ingest) |
| `_config.feed.yml` | Jekyll overlay (`collections_dir: .feed-build`) |
| `.feed-build/` | Build-only output (git-ignored), never committed |

Tests: `npm test` (Node's built-in runner) — includes the producer/consumer unit tests
and the self-feed round-trip gate.

## Design references

The full design and implementation notes live under
[`docs/superpowers/`](./superpowers/) (`*-content-feed-design.md`,
`*-feed-source-of-truth-design.md`, and the matching plans).
