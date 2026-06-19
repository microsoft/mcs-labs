# Publishing feeds (providing content to others)

How to make this portal's content available as a feed that **other** portals and
systems can consume. For the wire format see
[feed/FEED_FORMAT.md](feed/FEED_FORMAT.md); to ingest someone else's feed see
[CONSUMING_FEEDS.md](CONSUMING_FEEDS.md).

- **Producer script:** [`scripts/build-feed.js`](../scripts/build-feed.js)
- **Producer config:** [`_data/feeds.yml`](../_data/feeds.yml)
- **Authoring is unchanged.** Feeds are *derived* from the normal source files
  (`labs/<slug>/README.md`, `_<collection>/<slug>.md`) at build time. You never
  hand-edit feed JSON, and the producer never writes back to your content.

## What a feed is

A feed is a directory of static JSON describing your `labs`, `events`,
`workshops`, and `modules`. Anyone who can reach the URL can pull it — no API, no
database, no auth. On the deployed site it lives under `…/feed/`.

## Quick start — publish the default feed

Out of the box this portal already publishes an **everything feed** named `all`.
The default `_data/feeds.yml` is simply:

```yaml
everything_feed: true
```

Build it locally to see exactly what gets served:

```bash
node scripts/build-feed.js --out _site/feed
# wrote per-item documents, all/manifest.json + bundle, index.json
```

On the deployed site the same files are published at:

| File | URL | Purpose |
| --- | --- | --- |
| Discovery | `https://microsoft.github.io/mcs-labs/feed/index.json` | Lists every feed. Consumers start here. |
| Manifest | `…/feed/all/manifest.json` | Light item list + `content_hash` for incremental sync. |
| Per-item | `…/feed/items/<collection>/<slug>.json` | One item's full content. |
| Bundle | `…/feed/all.json` | Everything inline (simple consumers). |

Give a consumer **one** URL — the discovery `index.json` — and they can find
everything else from it.

## Producer configuration — `_data/feeds.yml`

```yaml
# Optional. Absolute base for rewriting image/link URLs so they resolve off-site.
# Defaults to the site's url + baseurl from _config.yml.
base_url: https://microsoft.github.io/mcs-labs

# The default "everything" feed:
#   true                      -> publish it as "all" (DEFAULT)
#   false                     -> don't publish it
#   { name:…, title:… }       -> publish it under a custom name/title
everything_feed: true

# Additional named feeds, published ALONGSIDE the everything feed.
feeds:
  labs-only:
    title: "Labs"
    description: "Just the hands-on labs"
    collections: [labs]            # whole-collection inclusion
    include: [some-event-slug]     # optional: add individual items from any collection
    exclude: [retired-lab]         # optional: block individual items by slug
    bundle: true                   # optional: also emit feed/labs-only.json (default true)
```

| Key | Meaning |
| --- | --- |
| `collections` | Include every item in these collections (`labs`, `events`, `workshops`, `modules`). |
| `include` | Add specific items by slug, regardless of collection. Wins over `exclude` (an item listed in both is included). |
| `exclude` | Block specific items by slug from this feed. |
| `bundle` | Whether to also emit the all-in-one `feed/<name>.json`. Default `true`. |

Rules:
- An item may appear in **multiple** feeds. Per-item documents are written **once**
  (deduplicated) and shared by every feed that includes them.
- `index` and `items` are **reserved** feed names — they collide with output paths
  and the build will refuse them.
- `exclude` here is the **producer's** blocklist: content excluded from a feed
  never reaches any consumer of that feed. This is your hard outbound boundary.

See [FILTERING.md](FILTERING.md) for producer vs. consumer filtering in depth.

## Recipe: a partner-only feed that withholds drafts

```yaml
everything_feed: true            # keep the public everything feed
feeds:
  partners:
    title: "Partner Distribution"
    collections: [labs, events]  # share labs + events…
    exclude: [internal-dry-run, unreleased-lab]   # …but never these
    bundle: false                # partners sync incrementally; skip the big bundle
```

The partner consumes `…/feed/partners/manifest.json`; the excluded slugs are not
present in it and cannot be requested.

## Recipe: a curated "featured" feed

```yaml
feeds:
  featured:
    title: "Featured"
    collections: []                       # nothing by bulk…
    include: [agent-builder-m365, mcs-orchestration]   # …only these, hand-picked
```

## How items are built (so you know what consumers get)

For each source doc `_<collection>/<slug>.md`, the producer emits an item with:

- `title`, `description`, `url` (canonical page), `metadata` (front matter, minus
  `layout`), and `references` (lab slugs derived from `labs:`/`lab:`).
- `content_markdown` — the **raw markdown body**, with relative `images/…` links
  rewritten to **absolute** URLs (under `base_url`) so they load off-site. The list
  of those URLs is in `images`.
- `last_modified` — the source file's last git commit time (ISO-8601), or `null`.
- `content_hash` — `sha256:` of the raw body, the primitive consumers use to detect
  change. See [FEED_FORMAT.md](feed/FEED_FORMAT.md#content_hash-semantics).

Every field is documented in
[FEED_FORMAT.md → The item object](feed/FEED_FORMAT.md#the-item-object-field-by-field).

## How the feed is deployed

The GitHub Actions deploy ([`.github/workflows/build-and-deploy.yml`](../.github/workflows/build-and-deploy.yml))
is **feed-first**:

```
build-feed.js  →  .feed-build/published          (produce JSON)
consume-feed.js →  .feed-build/_<collection>/…    (consume + materialize, see CONSUMING_FEEDS.md)
jekyll build   →  _site                           (render)
copy           →  _site/feed                      (publish the feed alongside the site)
deploy         →  GitHub Pages
```

So every deploy regenerates the feed from the current content. A consumer that
pulls after your deploy sees your latest. **There is nothing extra to run to
"publish an update" — committing content and letting the site deploy is enough.**

## Checklist for exposing a new feed

1. Add a block under `feeds:` in `_data/feeds.yml` (or rely on `everything_feed`).
2. `node scripts/build-feed.js --out _site/feed` and eyeball the output.
3. `npm test` — the producer unit tests cover membership, dedup, and reserved names.
4. Commit and let the site deploy. Hand consumers your `…/feed/index.json` URL.
5. (Optional) Add the new feed to your README/About so people know it exists — see
   the [About page](../about/index.md) "Syndicate our content" section for a model.
