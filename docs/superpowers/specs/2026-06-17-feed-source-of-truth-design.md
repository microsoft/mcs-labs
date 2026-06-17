# Feed as Source of Truth (Phase 3 + Consumer) — Design

**Date:** 2026-06-17
**Branch:** `feed-source-of-truth` (off `add-lab-feeds`)
**Builds on:** Phase 1 producer (PR #414, branch `add-lab-feeds`) — `scripts/build-feed.js`, `_data/feeds.yml`, the scalable `index.json` + per-feed `manifest.json` + per-item `feed/items/<collection>/<slug>.json` + optional bundle layout (schema 1.1).

## Summary

Make the portal **render its pages from the consumed feed** (its own feed plus any
subscribed external instances' feeds, filtered) instead of directly from the
collections — while keeping **authoring and the lab auditor unchanged**. This spec
folds in the **consumer (Phase 2)** because rendering-from-feed needs a consumed
dataset to render.

The visible payoff: with only the self-subscription the site looks identical (by
design); subscribe to another instance's feed and its labs/modules appear as new
pages on this portal, rendered with this portal's own layouts.

## The two "sources of truth" (why authoring + auditor are untouched)

| | Authoring source of truth | Rendering source of truth |
| --- | --- | --- |
| What | where content is *created*: `labs/<slug>/README.md` + images, committed `_<collection>/*.md`, `_data/lab-config.yml` | what the deployed *pages* are built from |
| Today | these files | these files (directly) |
| After this change | **unchanged — same files** | the **consumed feed** (derived from the authoring files) |

The feed is **downstream** of authoring. The lab auditor (`/audit-*`, `/build-lab`)
reads the authoring layer and is therefore **not affected**. The hard guardrail
below (never overwrite committed sources) is what preserves this.

## Decisions (locked)

| Decision | Choice |
| --- | --- |
| Render approach | **Option 1** — materialize consumed items into build-only collection docs; Jekyll renders them with the **existing layouts** |
| Consumer | Folded in: `_data/feed_subscriptions.yml`, self-subscribe to own feed by default, optional external feeds, `exclude` filters |
| Images | **Re-relativize own-origin** image URLs back to `images/…`; **keep external** images absolute (Decision A) |
| Slug collisions | **Own item wins**; colliding external item is dropped with a warning (Decision B) |
| Isolation guardrail | The consume/materialize step **never** writes to committed `_<collection>/*.md`; it writes to a git-ignored build dir |
| Auditor guardrail | No change to authoring/registration layout → lab auditor untouched |
| Round-trip | Consuming **own feed only** must render **identically** to today (CI gate) |

## Architecture — inverted build pipeline

Today: `jekyll build` → feed emitted after.
New (the feed is produced and consumed **before** Jekyll renders):

```
1. PRODUCE   build-feed.js → ./.feed-build/published/      (own feed: index/manifest/items/bundle)
2. CONSUME   consume-feed.js:
               - read _data/feed_subscriptions.yml
               - self subscription → read ./.feed-build/published/ (local files, no HTTP)
               - external subscriptions → fetch <url>/index.json → manifest.json → per-item docs
               - apply each subscription's exclude filters
               - merge into one item set (own wins on (collection, slug) collision)
3. MATERIALIZE  write each merged item → ./.feed-build/_<collection>/<slug>.md
               - front matter from item.metadata
               - body from item.content_markdown, own-origin images re-relativized
4. RENDER    jekyll build --config _config.yml,_config.feed.yml   (collections_dir: .feed-build)
5. PUBLISH   copy ./.feed-build/published/ → _site/feed/          (keep publishing the feed)
6. DEPLOY    upload _site
```

`.feed-build/` is git-ignored and ephemeral. Committed `_<collection>/*.md` are never
touched, so local builds don't dirty the working tree and the auditor/authoring
layer is untouched.

## Components and files

- **`scripts/consume-feed.js`** (new) — reads subscriptions, resolves the self feed
  from local files and external feeds over HTTP, applies filters, merges, and
  materializes collection docs into `.feed-build/`. Pure functions (filter, merge,
  collision, front-matter render, image re-relativize) + a CLI; unit + round-trip
  tested. Reuses `scripts/build-feed.js` helpers where natural.
- **`scripts/consume-feed.test.js`** (new) — unit tests + the round-trip gate.
- **`_data/feed_subscriptions.yml`** (new) — consumer config (schema below).
- **`_config.feed.yml`** (new) — Jekyll overlay: `collections_dir: .feed-build` (plus
  any minimal overrides needed so the materialized collections resolve).
- **`.gitignore`** (modify) — add `.feed-build/`.
- **`.github/workflows/build-and-deploy.yml`** (modify) — reorder to the inverted
  pipeline above (produce → consume → materialize → jekyll build with overlay →
  publish feed into `_site/feed` → deploy).

## Consumer config — `_data/feed_subscriptions.yml`

```yaml
subscriptions:
  - name: self                      # this instance consumes its OWN feed (default present)
    self: true                      # resolves to the locally produced feed (no HTTP)
    enabled: true
  - name: partner
    url: https://partner.example.com/mcs-labs/feed   # base feed dir (has index.json)
    enabled: true
    exclude:                        # omitted/empty ⇒ accept everything
      slugs: [some-lab]
      collections: [events]
```

- **Default:** if the file is absent, behave as a single `self: true` subscription
  (own feed only → identical render → safe default).
- **Filtering** is purely subtractive (drop by slug or whole collection), matching the
  producer-side `exclude` semantics; it can only remove what a feed publishes.
- `enabled: false` skips a subscription.

## Materialization details

For each merged item, write `.feed-build/_<collection>/<slug>.md`:

- **Front matter:** serialized from `item.metadata`. `layout` is intentionally absent
  (the producer strips it) — Jekyll's existing `_config.yml` `defaults` assign the
  correct layout per collection type, so materialized docs (own *and* external) render
  through `_layouts/{lab,module,event,workshop}.html` unchanged.
- **Body:** `item.content_markdown`, with **own-origin** image URLs
  (`<own_base_url>/<collection>/<slug>/images/…`) rewritten back to relative
  `images/…` (the inverse of the producer's absolutize step). **External** image URLs
  (any other origin) are left absolute so they load from the source site.
- **Collision:** items are merged by `(collection, slug)`; on collision the **self**
  item wins and the external one is dropped with a logged warning.

## Jekyll integration

- A build invoked as `jekyll build --config _config.yml,_config.feed.yml` where the
  overlay sets `collections_dir: .feed-build`. Jekyll then reads
  `.feed-build/_labs`, `.feed-build/_modules`, etc. instead of the committed dirs.
- Permalinks, layouts, `defaults`, search, and the tracker are defined in `_config.yml`
  and are **unchanged** — only the collections' *source directory* moves.
- **Risk / validation:** `collections_dir` behavior must be confirmed early in the
  plan (a smoke build). **Fallback** if it misbehaves: materialize into the real
  `_<collection>/` dirs but only in CI's ephemeral checkout (never committed), guarded
  so local runs use a temp dir.

## Round-trip safety gate (the regression guard)

A CI/test gate proving the pipeline is content-stable before any external feed is added:

- Run the pipeline with **self-subscription only**.
- Assert the **rendered** own pages are identical to a baseline `jekyll build` from the
  committed collections (HTML diff over the collection pages), **or** — cheaper and the
  primary check — assert each materialized `.feed-build/_<collection>/<slug>.md` body
  equals the committed source body after image-relativization, and that every committed
  item is present. Any divergence fails the build.

## Failure handling

- Missing `_data/feed_subscriptions.yml` → self-only (identical render).
- An external subscription that fails to fetch (network/404) → **warn and skip** that
  subscription; never break the deploy. Own content always renders.
- A malformed external feed document → warn and skip that item.
- An external slug colliding with own → own wins (warn).

## Guardrails (must hold)

1. **Committed sources are never written** by the pipeline (only `.feed-build/`).
2. **No change** to `labs/<slug>/README.md`, the `_<collection>/*.md` format, or
   `lab-config`/registration → the **lab auditor and `/build-lab` keep working**.
3. **Self-only render is identical** to today (round-trip gate).

## Testing

- Unit tests (`scripts/consume-feed.test.js`): subscription resolution + defaults,
  exclude filtering, merge + own-wins collision, image re-relativization (own vs
  external origin), front-matter rendering.
- **Round-trip gate** (above) in tests and CI.
- An integration test that consumes a small **synthetic external feed** fixture and
  asserts its items materialize as new collection docs with absolute external images.
- CI: the reordered workflow builds and deploys successfully; `_site/feed/` is still
  published.

## Out of scope

- Incremental/cached external pulls (always full fetch for now; the manifest +
  `content_hash` make caching a clean later optimization).
- A UI to manage subscriptions (config-file driven, per project convention).
- Authoring-through-the-feed (author once, everything downstream consumes) — explicitly
  **not** done; would change the auditor's inputs.

## Risks

- **`collections_dir` relocation** is load-bearing — validated first (with the CI
  ephemeral-checkout fallback).
- **Whole-site render change** — mitigated by the round-trip gate and by self-only being
  the default/identical case.
- **External content trust** — external markdown is rendered through our layouts;
  treat external feeds as semi-trusted (kramdown renders HTML in markdown). A future
  hardening pass (sanitization / allowlisted sources) is noted but out of scope here.
