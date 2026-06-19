# Feed format reference (schema 1.1)

This is the on-the-wire contract for the portal's content feed: the files a
**producer** emits and a **consumer** reads. If you are writing your own consumer
(in any language) or your own producer, this page is the specification. For the
day-to-day config, see [PUBLISHING_FEEDS.md](../PUBLISHING_FEEDS.md) and
[CONSUMING_FEEDS.md](../CONSUMING_FEEDS.md).

- **Producer:** [`scripts/build-feed.js`](../../scripts/build-feed.js)
- **Consumer:** [`scripts/consume-feed.js`](../../scripts/consume-feed.js)
- **`schema_version`:** `1.1` (every document carries it)

## The file tree a producer emits

A feed is a **directory of static JSON** — no server-side logic, no database. It
can be hosted anywhere static files can (GitHub Pages, blob storage, a CDN). For a
producer with one feed named `all`, `build-feed.js` writes:

```
feed/
├── index.json                      # discovery — lists every published feed
├── all/
│   └── manifest.json               # lightweight item list for feed "all"
├── all.json                        # optional bundle: every item inline
└── items/
    ├── labs/<slug>.json            # one full document per item …
    ├── events/<slug>.json          # … deduplicated across feeds
    ├── workshops/<slug>.json
    └── modules/<slug>.json
```

Two names are **reserved** because they collide with these paths: a feed may not be
named `index` or `items`.

### Why four document types?

| Document | Contains | You fetch it to… |
| --- | --- | --- |
| `index.json` | The list of feeds + their URLs | …discover what's published. **Start here.** |
| `<feed>/manifest.json` | One **light** entry per item (metadata + `content_hash`, **no body**) | …see what changed without downloading content. |
| `items/<collection>/<slug>.json` | One **full** item (body + metadata + images) | …pull a single item's content. |
| `<feed>.json` (bundle) | Every full item inline | …grab everything in one request (simple consumers). |

The split exists so consumers can **sync incrementally**: read the small manifest,
compare each `content_hash` to what you already have, and download only the full
per-item documents that changed. See *Incremental refresh* in
[CONSUMING_FEEDS.md](../CONSUMING_FEEDS.md#refreshing-when-the-source-changes).

## Document schemas

### `index.json` — discovery

```jsonc
{
  "schema_version": "1.1",
  "generated": "2026-06-19T12:00:00.000Z",   // ISO-8601, build time
  "site": { "title": "Microsoft Copilot Agents Labs",
            "base_url": "https://microsoft.github.io/mcs-labs" },
  "feeds": [
    {
      "name": "all",
      "title": "MCS Labs — All Content",
      "description": "All modules, events, workshops, and labs",
      "manifest_url": "https://…/feed/all/manifest.json",
      "bundle_url":   "https://…/feed/all.json",   // null when bundle disabled
      "item_count": 78
    }
  ]
}
```

### `<feed>/manifest.json` — the change list

```jsonc
{
  "schema_version": "1.1",
  "generated": "2026-06-19T12:00:00.000Z",
  "feed": { "name": "all", "title": "…", "description": "…" },
  "site": { "base_url": "https://…/mcs-labs" },
  "items": [ /* one LIGHT item per member (see below) */ ]
}
```

A **light item** is a full item with `content_markdown`, `images`, and `metadata`
omitted — just enough to identify it and detect change:

```jsonc
{
  "collection": "labs",
  "slug": "agent-builder-web",
  "title": "Build an agent for the web",
  "description": "…",
  "url":         "https://…/mcs-labs/labs/agent-builder-web/",      // canonical page
  "content_url": "https://…/mcs-labs/feed/items/labs/agent-builder-web.json",
  "references":  { "labs": [] },
  "last_modified": "2026-05-30T09:14:02Z",   // git commit time, or null
  "content_hash": "sha256:1f3a…"             // hash of the raw markdown body
}
```

### `items/<collection>/<slug>.json` — a full item

```jsonc
{
  "schema_version": "1.1",
  "generated": "2026-06-19T12:00:00.000Z",
  "site": { "base_url": "https://…/mcs-labs" },
  "item": {
    "collection": "labs",
    "slug": "agent-builder-web",
    "title": "Build an agent for the web",
    "description": "…",
    "url":         "https://…/mcs-labs/labs/agent-builder-web/",
    "content_url": "https://…/mcs-labs/feed/items/labs/agent-builder-web.json",
    "metadata":    { /* the page's front matter, minus `layout` */ },
    "references":  { "labs": [] },
    "content_markdown": "## Overview\n…",   // raw markdown, image URLs absolutized
    "images":      [ "https://…/labs/agent-builder-web/images/step1.png" ],
    "last_modified": "2026-05-30T09:14:02Z",
    "content_hash":  "sha256:1f3a…"
  }
}
```

### `<feed>.json` — bundle

Same envelope as a manifest, but `items` holds **full** items (the bundle is just
every per-item document inlined). Disable per feed with `bundle: false`.

## The item object, field by field

| Field | Type | Notes |
| --- | --- | --- |
| `collection` | string | One of `labs`, `events`, `workshops`, `modules`. Matches `^[A-Za-z0-9_-]+$`. |
| `slug` | string | Stable id within the collection. Matches `^[A-Za-z0-9_-]+$`. `collection/slug` is the global key. |
| `title` | string | Falls back to `slug`. |
| `description` | string | May be empty. |
| `url` | string | Canonical page on the **producing** site (informational). |
| `content_url` | string | Absolute URL of this item's full document. |
| `metadata` | object | The source front matter verbatim, **minus `layout`**. Drives rendering (`order`, `duration`, `difficulty`, `section`, `labs`, …). |
| `references.labs` | string[] | Lab slugs this item points at (derived from `labs:`/`lab:` front matter). Lets consumers reason about cross-references. |
| `content_markdown` | string | Raw markdown body. Relative `images/…` refs are rewritten to **absolute** producer URLs so they resolve off-site. |
| `images` | string[] | Every absolutized image URL found in the body. |
| `last_modified` | string \| null | Last git commit time of the source file (ISO-8601), or `null` if unavailable. |
| `content_hash` | string | `sha256:<hex>` of the **raw markdown body**. The change-detection primitive. |

### `content_hash` semantics

- It hashes **only the markdown body**, not metadata, not the JSON envelope.
- It is **stable**: the same body always produces the same hash, regardless of when
  or where the feed was built (the hash never includes `generated`).
- Consumers diff `content_hash` to decide whether to re-download an item. A changed
  body ⇒ changed hash ⇒ re-fetch. (A metadata-only edit does *not* change the hash;
  if you must detect those too, compare the light item as a whole.)

## Versioning & compatibility

- `schema_version` is `MAJOR.MINOR`. **Minor** bumps are additive — new optional
  fields only; existing fields keep their meaning. A consumer should ignore unknown
  fields and keep working across minor versions.
- A **major** bump signals a breaking change; consumers should check the major and
  refuse (or branch) on an unfamiliar one.
- Practical rule for your own consumer: pin the **major**, tolerate the **minor**,
  ignore unknown keys.

## Trust model (read before consuming third-party feeds)

A consumed item becomes a **rendered page on your site**. Treat external feeds the
way you'd treat any external content source:

- **Feeds are public and unauthenticated.** Anything in a feed is world-readable;
  don't publish anything to a feed you wouldn't publish on the open web.
- **`collection`/`slug` are validated** against `^[A-Za-z0-9_-]+$` on both produce
  and consume, so a malicious feed can't path-traverse out of `_<collection>/`.
- **Markdown is rendered as-is.** A feed you don't control can ship arbitrary
  markdown/HTML. Only subscribe to sources you trust, exactly as you'd vet a guest
  author. Use [filtering](../FILTERING.md) to narrow what you accept.
- **Filters are subtractive only.** A subscriber can drop items, never inject ones
  the source withheld — so producer-side exclusion is a hard boundary.
- **On a `collection/slug` collision, the local (`self`) item always wins** — an
  external feed can never overwrite your own page.

See [FILTERING.md](../FILTERING.md) for the precedence rules in full.
