# Content Feed — Phase 1 (Producer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a build-time Node generator that publishes the portal's `modules`/`events`/`workshops`/`labs` as config-driven JSON feeds (raw markdown + metadata + absolute image URLs) on the GitHub Pages deploy.

**Architecture:** A single CommonJS script `scripts/build-feed.js` exposes small pure functions (config resolution, feed membership, image rewriting, hashing, item/feed assembly) plus a `require.main === module` CLI that reads `_data/feeds.yml` + the `_<collection>/<slug>.md` source docs, and writes `feed/<name>.json` + `feed/index.json` into an output dir. Unit-tested with Node's built-in test runner; wired into `.github/workflows/build-and-deploy.yml` to emit into `_site/feed/` after the Jekyll build.

**Tech Stack:** Node 20 (CommonJS, `node:test`, `node:crypto`, `node:child_process`), `gray-matter` (front-matter parsing), `js-yaml` (config parsing). No Jekyll/Liquid changes in Phase 1.

**Spec:** `docs/superpowers/specs/2026-06-16-content-feed-design.md`

## File Structure

- **Create `scripts/build-feed.js`** — generator: pure functions (module scope) + CLI block. One responsibility: turn collection sources + config into feed JSON.
- **Create `scripts/build-feed.test.js`** — unit + integration tests for the generator.
- **Create `_data/feeds.yml`** — feed publishing config (documents options; default = single `all` feed).
- **Modify `package.json`** — add `gray-matter` + `js-yaml` devDeps; add `test` and `build:feed` npm scripts.
- **Modify `.github/workflows/build-and-deploy.yml`** — Node setup + `npm install` + run generator after Jekyll build; extend trigger paths.

### Module shape (final state of `scripts/build-feed.js`)

Top-of-file constants + an additive `module.exports` (each task appends `module.exports.<name> = <name>;` after its function). Final exports: `resolveConfig`, `itemInFeed`, `orderItems`, `selectFeedItems`, `rewriteImages`, `contentHash`, `deriveReferences`, `buildItem`, `buildFeedFile`, `buildIndex`. The CLI block at the bottom does all file I/O and git calls (not unit-tested directly; covered by the integration test).

---

### Task 1: Scaffolding — deps, npm scripts, empty module

**Files:**
- Modify: `package.json`
- Create: `scripts/build-feed.js`

- [ ] **Step 1: Add devDependencies and scripts to `package.json`**

Replace the `"scripts"` and `"devDependencies"` blocks so the file reads:

```json
{
  "name": "mcs-labs-a11y-ci",
  "version": "0.0.0",
  "private": true,
  "description": "Accessibility tooling dev deps for mcs-labs. No runtime code ships from here.",
  "scripts": {
    "a11y": "pa11y-ci --config .pa11yci.json",
    "lighthouse": "lhci autorun",
    "test": "node --test scripts/",
    "build:feed": "node scripts/build-feed.js"
  },
  "devDependencies": {
    "@lhci/cli": "^0.14.0",
    "gray-matter": "^4.0.3",
    "http-server": "^14.1.1",
    "js-yaml": "^4.1.0",
    "pa11y-ci": "^3.1.0",
    "wait-on": "^7.2.0"
  }
}
```

- [ ] **Step 2: Install dependencies**

Run: `npm install --no-audit --no-fund`
Expected: completes, `node_modules/gray-matter` and `node_modules/js-yaml` exist.

- [ ] **Step 3: Create `scripts/build-feed.js` skeleton**

```js
'use strict';

const crypto = require('node:crypto');

const ALL_COLLECTIONS = ['events', 'workshops', 'modules', 'labs'];

module.exports = {};

// Pure functions are appended below by subsequent tasks.
// The CLI entry (if require.main === module) is added last.
```

- [ ] **Step 4: Verify the existing test suite still runs**

Run: `npm test`
Expected: PASS — the existing `build-tracker-data.test.js` tests pass; no `build-feed` tests yet.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json scripts/build-feed.js
git commit -m "chore(feed): scaffold build-feed generator + deps"
```

---

### Task 2: `resolveConfig` — defaults + everything-feed handling

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (create the test file)**

Create `scripts/build-feed.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const feed = require('./build-feed');

test('resolveConfig: empty config yields default "all" feed with all collections', () => {
  const r = feed.resolveConfig({}, { defaultBaseUrl: 'https://x.test/mcs-labs' });
  assert.equal(r.baseUrl, 'https://x.test/mcs-labs');
  assert.deepEqual(Object.keys(r.feeds), ['all']);
  assert.deepEqual(r.feeds.all.collections, ['events', 'workshops', 'modules', 'labs']);
});

test('resolveConfig: base_url override wins and trailing slash is trimmed', () => {
  const r = feed.resolveConfig({ base_url: 'https://o.test/p/' }, { defaultBaseUrl: 'https://x.test' });
  assert.equal(r.baseUrl, 'https://o.test/p');
});

test('resolveConfig: everything_feed:false removes the all feed', () => {
  const r = feed.resolveConfig({ everything_feed: false });
  assert.deepEqual(Object.keys(r.feeds), []);
});

test('resolveConfig: everything_feed:false plus custom feeds emits only those', () => {
  const r = feed.resolveConfig({ everything_feed: false, feeds: { 'labs-only': { collections: ['labs'] } } });
  assert.deepEqual(Object.keys(r.feeds), ['labs-only']);
  assert.deepEqual(r.feeds['labs-only'].collections, ['labs']);
});

test('resolveConfig: everything_feed object customises name and title', () => {
  const r = feed.resolveConfig({ everything_feed: { name: 'everything', title: 'All Of It' } });
  assert.ok(r.feeds.everything);
  assert.equal(r.feeds.everything.title, 'All Of It');
  assert.equal(r.feeds.all, undefined);
});

test('resolveConfig: explicit feeds.all replaces the synthesized everything feed', () => {
  const r = feed.resolveConfig({ feeds: { all: { collections: ['labs'] } } });
  assert.deepEqual(r.feeds.all.collections, ['labs']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.resolveConfig is not a function`.

- [ ] **Step 3: Implement `resolveConfig`**

Append to `scripts/build-feed.js` (above any CLI block):

```js
function normalizeFeedDef(name, def = {}) {
  return {
    name,
    title: def.title || name,
    description: def.description || '',
    collections: def.collections || [],
    include: def.include || [],
    exclude: def.exclude || [],
  };
}

function resolveConfig(raw = {}, { defaultBaseUrl = 'https://microsoft.github.io/mcs-labs' } = {}) {
  const baseUrl = String(raw.base_url || defaultBaseUrl).replace(/\/+$/, '');
  const feeds = {};

  const ef = raw.everything_feed;
  if (ef !== false) {
    const obj = ef && typeof ef === 'object' ? ef : {};
    const name = obj.name || 'all';
    feeds[name] = normalizeFeedDef(name, {
      title: obj.title || 'MCS Labs — All Content',
      description: obj.description || 'All modules, events, workshops, and labs',
      collections: ALL_COLLECTIONS,
    });
  }

  for (const [name, def] of Object.entries(raw.feeds || {})) {
    feeds[name] = normalizeFeedDef(name, def);
  }

  return { baseUrl, feeds };
}
module.exports.resolveConfig = resolveConfig;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS — all 6 `resolveConfig` tests pass.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): resolveConfig with default + removable everything feed"
```

---

### Task 3: `itemInFeed` — per-feed membership rule

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('itemInFeed: included when collection listed and slug not excluded', () => {
  const def = feed.resolveConfig({ feeds: { f: { collections: ['labs'] } } }).feeds.f;
  assert.equal(feed.itemInFeed({ collection: 'labs', slug: 'a' }, def), true);
  assert.equal(feed.itemInFeed({ collection: 'modules', slug: 'a' }, def), false);
});

test('itemInFeed: exclude blocks an item whose collection is included', () => {
  const def = feed.resolveConfig({ feeds: { f: { collections: ['labs'], exclude: ['a'] } } }).feeds.f;
  assert.equal(feed.itemInFeed({ collection: 'labs', slug: 'a' }, def), false);
});

test('itemInFeed: include adds an item whose collection is not listed', () => {
  const def = feed.resolveConfig({ feeds: { f: { collections: [], include: ['a'] } } }).feeds.f;
  assert.equal(feed.itemInFeed({ collection: 'labs', slug: 'a' }, def), true);
});

test('itemInFeed: an item can belong to multiple feeds', () => {
  const r = feed.resolveConfig({ feeds: { f1: { collections: ['labs'] }, f2: { collections: ['labs'] } } });
  const it = { collection: 'labs', slug: 'a' };
  assert.equal(feed.itemInFeed(it, r.feeds.f1), true);
  assert.equal(feed.itemInFeed(it, r.feeds.f2), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.itemInFeed is not a function`.

- [ ] **Step 3: Implement `itemInFeed`**

Append to `scripts/build-feed.js`:

```js
function itemInFeed(item, feedDef) {
  if (feedDef.include.includes(item.slug)) return true;
  if (feedDef.collections.includes(item.collection) && !feedDef.exclude.includes(item.slug)) return true;
  return false;
}
module.exports.itemInFeed = itemInFeed;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): per-feed membership rule (collections/include/exclude)"
```

---

### Task 4: `orderItems` — deterministic ordering

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('orderItems: sorts by collection, then metadata.order, then slug', () => {
  const items = [
    { collection: 'labs', slug: 'b', metadata: { order: 20 } },
    { collection: 'labs', slug: 'a', metadata: { order: 10 } },
    { collection: 'events', slug: 'z', metadata: {} },
    { collection: 'labs', slug: 'a2', metadata: { order: 10 } },
  ];
  const sorted = feed.orderItems(items).map((i) => `${i.collection}/${i.slug}`);
  assert.deepEqual(sorted, ['events/z', 'labs/a', 'labs/a2', 'labs/b']);
});

test('orderItems: items missing order sort after items with order', () => {
  const items = [
    { collection: 'labs', slug: 'noorder', metadata: {} },
    { collection: 'labs', slug: 'first', metadata: { order: 5 } },
  ];
  const sorted = feed.orderItems(items).map((i) => i.slug);
  assert.deepEqual(sorted, ['first', 'noorder']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.orderItems is not a function`.

- [ ] **Step 3: Implement `orderItems`**

Append to `scripts/build-feed.js`:

```js
function orderItems(items) {
  const ord = (i) => (typeof i.metadata?.order === 'number' ? i.metadata.order : Number.POSITIVE_INFINITY);
  return [...items].sort(
    (a, b) =>
      a.collection.localeCompare(b.collection) ||
      ord(a) - ord(b) ||
      a.slug.localeCompare(b.slug)
  );
}
module.exports.orderItems = orderItems;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): deterministic item ordering"
```

---

### Task 5: `selectFeedItems` — filter + order for one feed

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('selectFeedItems: returns only matching items, ordered', () => {
  const def = feed.resolveConfig({ feeds: { f: { collections: ['labs'] } } }).feeds.f;
  const items = [
    { collection: 'labs', slug: 'b', metadata: { order: 2 } },
    { collection: 'modules', slug: 'm', metadata: { order: 1 } },
    { collection: 'labs', slug: 'a', metadata: { order: 1 } },
  ];
  const got = feed.selectFeedItems(items, def).map((i) => i.slug);
  assert.deepEqual(got, ['a', 'b']);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.selectFeedItems is not a function`.

- [ ] **Step 3: Implement `selectFeedItems`**

Append to `scripts/build-feed.js`:

```js
function selectFeedItems(allItems, feedDef) {
  return orderItems(allItems.filter((it) => itemInFeed(it, feedDef)));
}
module.exports.selectFeedItems = selectFeedItems;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): selectFeedItems (filter + order)"
```

---

### Task 6: `rewriteImages` — absolutize relative image URLs

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('rewriteImages: rewrites markdown image refs and collects absolute URLs', () => {
  const md = '![alt](images/a.png) and ![b](./images/sub/b.jpg)';
  const { markdown, images } = feed.rewriteImages(md, 'https://x.test/mcs-labs', 'labs', 'demo');
  assert.match(markdown, /\]\(https:\/\/x\.test\/mcs-labs\/labs\/demo\/images\/a\.png\)/);
  assert.match(markdown, /\]\(https:\/\/x\.test\/mcs-labs\/labs\/demo\/images\/sub\/b\.jpg\)/);
  assert.deepEqual(images.sort(), [
    'https://x.test/mcs-labs/labs/demo/images/a.png',
    'https://x.test/mcs-labs/labs/demo/images/sub/b.jpg',
  ]);
});

test('rewriteImages: rewrites HTML src (single and double quotes)', () => {
  const md = '<img src="images/c.png"> <img src=\'images/d.png\'>';
  const { markdown, images } = feed.rewriteImages(md, 'https://x.test', 'labs', 'demo');
  assert.match(markdown, /src="https:\/\/x\.test\/labs\/demo\/images\/c\.png"/);
  assert.match(markdown, /src='https:\/\/x\.test\/labs\/demo\/images\/d\.png'/);
  assert.equal(images.length, 2);
});

test('rewriteImages: leaves absolute, protocol-relative, and root-relative refs untouched', () => {
  const md = '![a](https://cdn.test/x.png) ![b](//cdn.test/y.png) ![c](/z.png)';
  const { markdown, images } = feed.rewriteImages(md, 'https://x.test', 'labs', 'demo');
  assert.equal(markdown, md);
  assert.deepEqual(images, []);
});

test('rewriteImages: de-duplicates repeated images', () => {
  const md = '![a](images/a.png) again ![a](images/a.png)';
  const { images } = feed.rewriteImages(md, 'https://x.test', 'labs', 'demo');
  assert.equal(images.length, 1);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.rewriteImages is not a function`.

- [ ] **Step 3: Implement `rewriteImages`**

Append to `scripts/build-feed.js`:

```js
function rewriteImages(markdown, baseUrl, collection, slug) {
  const base = `${baseUrl}/${collection}/${slug}`;
  const images = new Set();
  const abs = (rel) => {
    const url = `${base}/${rel}`;
    images.add(url);
    return url;
  };
  let out = String(markdown == null ? '' : markdown);
  // Markdown image/link refs: ](images/...) or ](./images/...)
  out = out.replace(/\]\((?:\.\/)?images\/([^)\s]+)/g, (_m, p) => `](${abs('images/' + p)}`);
  // HTML src="images/..." / src="./images/..."
  out = out.replace(/src="(?:\.\/)?images\/([^"]+)"/g, (_m, p) => `src="${abs('images/' + p)}"`);
  // HTML src='images/...'
  out = out.replace(/src='(?:\.\/)?images\/([^']+)'/g, (_m, p) => `src='${abs('images/' + p)}'`);
  return { markdown: out, images: [...images] };
}
module.exports.rewriteImages = rewriteImages;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): absolutize relative image URLs"
```

---

### Task 7: `contentHash` — stable sha256 of content

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('contentHash: deterministic, prefixed, and content-sensitive', () => {
  const h1 = feed.contentHash('hello');
  const h2 = feed.contentHash('hello');
  const h3 = feed.contentHash('world');
  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
  assert.match(h1, /^sha256:[0-9a-f]{64}$/);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.contentHash is not a function`.

- [ ] **Step 3: Implement `contentHash`**

Append to `scripts/build-feed.js`:

```js
function contentHash(content) {
  return 'sha256:' + crypto.createHash('sha256').update(String(content == null ? '' : content), 'utf8').digest('hex');
}
module.exports.contentHash = contentHash;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): content hashing for change detection"
```

---

### Task 8: `deriveReferences` — lab-slug cross-references

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('deriveReferences: events/workshops map labs list (objects or strings) to slugs', () => {
  const fm = { labs: [{ slug: 'l1', label: 'Lab 1' }, { slug: 'l2', label: 'Lab 2' }] };
  assert.deepEqual(feed.deriveReferences('events', fm), { labs: ['l1', 'l2'] });
  assert.deepEqual(feed.deriveReferences('workshops', { labs: ['l3'] }), { labs: ['l3'] });
});

test('deriveReferences: modules map single lab field', () => {
  assert.deepEqual(feed.deriveReferences('modules', { lab: 'l9' }), { labs: ['l9'] });
  assert.deepEqual(feed.deriveReferences('modules', {}), { labs: [] });
});

test('deriveReferences: labs and missing data yield empty refs', () => {
  assert.deepEqual(feed.deriveReferences('labs', { title: 'x' }), { labs: [] });
  assert.deepEqual(feed.deriveReferences('events', {}), { labs: [] });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.deriveReferences is not a function`.

- [ ] **Step 3: Implement `deriveReferences`**

Append to `scripts/build-feed.js`:

```js
function deriveReferences(collection, frontMatter = {}) {
  if (collection === 'events' || collection === 'workshops') {
    const list = Array.isArray(frontMatter.labs) ? frontMatter.labs : [];
    return { labs: list.map((l) => (typeof l === 'string' ? l : l && l.slug)).filter(Boolean) };
  }
  if (collection === 'modules') {
    return { labs: frontMatter.lab ? [frontMatter.lab] : [] };
  }
  return { labs: [] };
}
module.exports.deriveReferences = deriveReferences;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): derive lab-slug cross-references"
```

---

### Task 9: `buildItem` — assemble one feed item

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('buildItem: assembles a lab item with absolutized images and hash', () => {
  const item = feed.buildItem({
    collection: 'labs',
    slug: 'demo',
    frontMatter: { layout: 'lab', title: 'Demo Lab', description: 'd', order: 10, duration: 30 },
    body: 'Intro ![x](images/x.png)',
    baseUrl: 'https://x.test/mcs-labs',
    lastModified: '2026-05-01T00:00:00Z',
  });
  assert.equal(item.collection, 'labs');
  assert.equal(item.slug, 'demo');
  assert.equal(item.title, 'Demo Lab');
  assert.equal(item.url, 'https://x.test/mcs-labs/labs/demo/');
  assert.equal(item.metadata.layout, undefined); // layout stripped
  assert.equal(item.metadata.order, 10);
  assert.deepEqual(item.references, { labs: [] });
  assert.deepEqual(item.images, ['https://x.test/mcs-labs/labs/demo/images/x.png']);
  assert.match(item.content_markdown, /images\/x\.png/);
  assert.match(item.content_hash, /^sha256:/);
  assert.equal(item.last_modified, '2026-05-01T00:00:00Z');
});

test('buildItem: module item carries lab reference and slug fallback title', () => {
  const item = feed.buildItem({
    collection: 'modules',
    slug: 'mod-a',
    frontMatter: { lab: 'lab-a' },
    body: '',
    baseUrl: 'https://x.test',
  });
  assert.equal(item.title, 'mod-a');
  assert.deepEqual(item.references, { labs: ['lab-a'] });
  assert.equal(item.url, 'https://x.test/modules/mod-a/');
  assert.equal(item.last_modified, null);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.buildItem is not a function`.

- [ ] **Step 3: Implement `buildItem`**

Append to `scripts/build-feed.js`:

```js
function buildItem({ collection, slug, frontMatter = {}, body = '', baseUrl, lastModified = null }) {
  const { markdown, images } = rewriteImages(body, baseUrl, collection, slug);
  const metadata = { ...frontMatter };
  delete metadata.layout;
  return {
    collection,
    slug,
    title: frontMatter.title || slug,
    description: frontMatter.description || '',
    url: `${baseUrl}/${collection}/${slug}/`,
    metadata,
    references: deriveReferences(collection, frontMatter),
    content_markdown: markdown,
    images,
    last_modified: lastModified,
    content_hash: contentHash(body),
  };
}
module.exports.buildItem = buildItem;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): assemble feed items from front matter + body"
```

---

### Task 10: `buildFeedFile` + `buildIndex` — top-level documents

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('buildFeedFile: wraps items with schema metadata', () => {
  const def = feed.resolveConfig({}).feeds.all;
  const out = feed.buildFeedFile(def, [{ slug: 'a' }], { baseUrl: 'https://x.test', generated: '2026-06-16T00:00:00Z' });
  assert.equal(out.schema_version, '1.0');
  assert.equal(out.generated, '2026-06-16T00:00:00Z');
  assert.deepEqual(out.feed, { name: 'all', title: 'MCS Labs — All Content', description: 'All modules, events, workshops, and labs' });
  assert.deepEqual(out.site, { base_url: 'https://x.test' });
  assert.equal(out.items.length, 1);
});

test('buildIndex: lists feeds with urls and counts', () => {
  const resolved = feed.resolveConfig({ feeds: { extra: { collections: ['labs'] } } });
  const out = feed.buildIndex(resolved, { all: 42, extra: 7 }, {
    baseUrl: 'https://x.test/mcs-labs',
    generated: '2026-06-16T00:00:00Z',
    siteTitle: 'Site',
  });
  assert.equal(out.schema_version, '1.0');
  assert.deepEqual(out.site, { title: 'Site', base_url: 'https://x.test/mcs-labs' });
  const all = out.feeds.find((f) => f.name === 'all');
  assert.equal(all.url, 'https://x.test/mcs-labs/feed/all.json');
  assert.equal(all.item_count, 42);
  assert.equal(out.feeds.find((f) => f.name === 'extra').item_count, 7);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.buildFeedFile is not a function`.

- [ ] **Step 3: Implement `buildFeedFile` and `buildIndex`**

Append to `scripts/build-feed.js`:

```js
function buildFeedFile(feedDef, items, { baseUrl, generated }) {
  return {
    schema_version: '1.0',
    generated,
    feed: { name: feedDef.name, title: feedDef.title, description: feedDef.description },
    site: { base_url: baseUrl },
    items,
  };
}
module.exports.buildFeedFile = buildFeedFile;

function buildIndex(resolved, counts, { baseUrl, generated, siteTitle }) {
  return {
    schema_version: '1.0',
    generated,
    site: { title: siteTitle, base_url: baseUrl },
    feeds: Object.values(resolved.feeds).map((f) => ({
      name: f.name,
      title: f.title,
      description: f.description,
      url: `${baseUrl}/feed/${f.name}.json`,
      item_count: counts[f.name] ?? 0,
    })),
  };
}
module.exports.buildIndex = buildIndex;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): build feed-file and index documents"
```

---

### Task 11: CLI entry + end-to-end integration test

**Files:**
- Modify: `scripts/build-feed.js`
- Test: `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing integration test (append)**

```js
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('CLI: generates index.json and all.json from real collections', () => {
  const out = fs.mkdtempSync(path.join(os.tmpdir(), 'mcs-feed-'));
  execFileSync('node', ['scripts/build-feed.js', '--out', out], { cwd: process.cwd(), stdio: 'pipe' });

  const index = JSON.parse(fs.readFileSync(path.join(out, 'index.json'), 'utf8'));
  assert.equal(index.schema_version, '1.0');
  const allEntry = index.feeds.find((f) => f.name === 'all');
  assert.ok(allEntry, 'index lists the all feed');
  assert.ok(allEntry.item_count > 0, 'all feed has items');

  const all = JSON.parse(fs.readFileSync(path.join(out, 'all.json'), 'utf8'));
  const slugs = all.items.map((i) => i.slug);
  assert.ok(slugs.includes('agent-builder-m365'), 'includes a known lab slug');

  const lab = all.items.find((i) => i.slug === 'agent-builder-m365');
  assert.equal(lab.collection, 'labs');
  assert.match(lab.content_hash, /^sha256:/);
  assert.ok(lab.content_markdown.length > 0);
  // every image URL is absolute
  for (const img of lab.images) assert.match(img, /^https?:\/\//);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — the CLI writes nothing yet, so reading `index.json` throws ENOENT.

- [ ] **Step 3: Implement the CLI block**

Append to the END of `scripts/build-feed.js`:

```js
// CLI entry: node scripts/build-feed.js [--out <dir>]
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');
  const yaml = require('js-yaml');
  const matter = require('gray-matter');
  const { execFileSync } = require('node:child_process');

  const root = process.cwd();
  const args = process.argv.slice(2);
  const outArgIdx = args.indexOf('--out');
  const outArg = outArgIdx >= 0 ? args[outArgIdx + 1] : '_site/feed';
  const outDir = path.isAbsolute(outArg) ? outArg : path.join(root, outArg);

  const readYaml = (rel) => {
    try {
      return yaml.load(fs.readFileSync(path.join(root, rel), 'utf8')) || {};
    } catch {
      return null;
    }
  };

  const cfg = readYaml('_config.yml') || {};
  const defaultBaseUrl = `${cfg.url || ''}${cfg.baseurl || ''}`.replace(/\/+$/, '') || 'https://microsoft.github.io/mcs-labs';
  const siteTitle = cfg.title || 'Microsoft Copilot Agents Labs';

  let rawConfig = readYaml('_data/feeds.yml');
  if (rawConfig === null) {
    console.warn('[build-feed] no _data/feeds.yml found; using defaults');
    rawConfig = {};
  }

  const resolved = resolveConfig(rawConfig, { defaultBaseUrl });
  if (Object.keys(resolved.feeds).length === 0) {
    console.warn('[build-feed] no feeds configured (everything_feed disabled and no feeds:); nothing to emit');
  }

  const gitDate = (relFile) => {
    try {
      const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', relFile], { cwd: root }).toString().trim();
      return out || null;
    } catch {
      return null;
    }
  };

  const allItems = [];
  for (const collection of ALL_COLLECTIONS) {
    const dir = path.join(root, `_${collection}`);
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const file of files) {
      const slug = file.replace(/\.md$/, '');
      const full = path.join(dir, file);
      const parsed = matter(fs.readFileSync(full, 'utf8'));
      allItems.push(
        buildItem({
          collection,
          slug,
          frontMatter: parsed.data,
          body: parsed.content,
          baseUrl: resolved.baseUrl,
          lastModified: gitDate(path.relative(root, full).split(path.sep).join('/')),
        })
      );
    }
  }

  fs.mkdirSync(outDir, { recursive: true });
  const generated = new Date().toISOString();
  const counts = {};
  for (const feedDef of Object.values(resolved.feeds)) {
    const items = selectFeedItems(allItems, feedDef);
    counts[feedDef.name] = items.length;
    const fileObj = buildFeedFile(feedDef, items, { baseUrl: resolved.baseUrl, generated });
    fs.writeFileSync(path.join(outDir, `${feedDef.name}.json`), JSON.stringify(fileObj, null, 2));
    console.log(`[build-feed] wrote ${feedDef.name}.json (${items.length} items)`);
  }
  const index = buildIndex(resolved, counts, { baseUrl: resolved.baseUrl, generated, siteTitle });
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`[build-feed] wrote index.json (${Object.keys(resolved.feeds).length} feeds) → ${outDir}`);
}
```

- [ ] **Step 4: Run the full test suite to verify it passes**

Run: `npm test`
Expected: PASS — all `build-feed` unit tests plus the integration test, and the existing tracker tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): CLI entry that emits feed files + integration test"
```

---

### Task 12: Default config file `_data/feeds.yml`

**Files:**
- Create: `_data/feeds.yml`

- [ ] **Step 1: Create `_data/feeds.yml`**

```yaml
# Feed publishing configuration for this portal instance (Phase 1: producer).
# Full design: docs/superpowers/specs/2026-06-16-content-feed-design.md
#
# base_url:        Absolute base for image/link rewriting. Defaults to the site's
#                  url + baseurl from _config.yml when omitted.
# everything_feed: Emit a default "all" feed containing every collection.
#                  true  -> emit feed "all" (DEFAULT)
#                  false -> do not emit it
#                  { name: <n>, title: <t> } -> emit it under a custom name/title
# feeds:           Additional named feeds, emitted alongside the everything feed.
#                  Each feed: collections (bulk include), include (extra slugs),
#                  exclude (block slugs). An item may appear in multiple feeds.

everything_feed: true

# Example additional feeds (uncomment / edit to use):
# feeds:
#   labs-only:
#     title: "Labs"
#     collections: [labs]
#   featured:
#     title: "Featured"
#     collections: []
#     include: [agent-builder-m365, mcs-orchestration]
```

- [ ] **Step 2: Verify the generator honors the config (still emits `all`)**

Run: `npm run build:feed -- --out /tmp/feedcheck && node -e "const i=require('/tmp/feedcheck/index.json'); if(!i.feeds.find(f=>f.name==='all')) throw new Error('all feed missing'); console.log('OK', i.feeds.map(f=>f.name))"`
Expected: prints `OK [ 'all' ]`.

- [ ] **Step 3: Commit**

```bash
git add _data/feeds.yml
git commit -m "feat(feed): default feeds.yml config (single all feed)"
```

---

### Task 13: Wire the generator into the deploy workflow

**Files:**
- Modify: `.github/workflows/build-and-deploy.yml`

- [ ] **Step 1: Add generator trigger paths**

In `.github/workflows/build-and-deploy.yml`, under `on.push.paths`, add three entries to the existing list (after the `- "labs/**"` line):

```yaml
      - "scripts/**"
      - "package.json"
```

(The list already includes `_data/**` and the workflow file itself.)

- [ ] **Step 2: Add Node setup + feed build steps after the Jekyll build**

In the same file, between the `Build Jekyll` step and the `Setup Pages` step, insert:

```yaml
      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: "20"

      - name: Install feed deps
        run: npm install --no-audit --no-fund

      - name: Build content feed
        run: node scripts/build-feed.js --out _site/feed
```

The surrounding steps must end up ordered: `Build Jekyll` → `Setup Node` → `Install feed deps` → `Build content feed` → `Setup Pages` → `Upload artifact` → `Deploy to GitHub Pages`.

- [ ] **Step 3: Validate the workflow YAML parses**

Run: `node -e "const y=require('js-yaml'); const fs=require('node:fs'); const d=y.load(fs.readFileSync('.github/workflows/build-and-deploy.yml','utf8')); const steps=d.jobs['build-and-deploy'].steps.map(s=>s.name); console.log(steps); const i=steps.indexOf('Build content feed'); if(!(steps.indexOf('Build Jekyll')<i && i<steps.indexOf('Setup Pages'))) throw new Error('step order wrong')"`
Expected: prints the step names in the order above and does not throw.

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/build-and-deploy.yml
git commit -m "ci(feed): generate content feed into _site after Jekyll build"
```

---

### Task 14: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Run the full test suite**

Run: `npm test`
Expected: PASS — all tests green (tracker + feed unit + feed integration).

- [ ] **Step 2: Generate the feed into a real output dir and inspect**

Run: `npm run build:feed -- --out _site/feed`
Then: `node -e "const fs=require('node:fs'); const idx=require('./_site/feed/index.json'); console.log('feeds:', idx.feeds.map(f=>f.name+':'+f.item_count)); const all=require('./_site/feed/all.json'); const byC={}; for(const it of all.items){byC[it.collection]=(byC[it.collection]||0)+1;} console.log('by collection:', byC); const withImgs=all.items.find(i=>i.images.length); console.log('sample image:', withImgs && withImgs.images[0]);"`
Expected: prints feed names with non-zero counts, a per-collection breakdown covering events/workshops/modules/labs, and a sample absolute image URL beginning with `https://`.

- [ ] **Step 3: Confirm `_site/feed/` is not committed**

Run: `git status --porcelain _site/`
Expected: empty output (the repo's `.gitignore` already ignores `_site/`). If anything shows, do NOT commit it.

- [ ] **Step 4: Update CHANGELOG**

Add an entry to the top of the appropriate section in `CHANGELOG.md`:

```markdown
- Added a content syndication feed (Phase 1, producer): build-time `scripts/build-feed.js` emits config-driven JSON feeds (`feed/<name>.json` + `feed/index.json`) of modules/events/workshops/labs with raw markdown, metadata, and absolute image URLs. Configured via `_data/feeds.yml`.
```

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(feed): note content feed producer in CHANGELOG"
```

---

## Addendum — Scalable output: manifest + per-item documents (Tasks 15–20)

These tasks extend the producer (already built in Tasks 1–14) so consumers can sync
**incrementally**: a lightweight per-feed `manifest.json` (no markdown) + deduped
per-item documents at `feed/items/<collection>/<slug>.json`, with the full inline
`feed/<name>.json` kept as an optional `bundle`. Bumps `schema_version` to `1.1`.
See the spec's "Feed output layout" and "Feed JSON schema" sections.

### Task 15: `SCHEMA_VERSION` constant + `bundle` config + index `manifest_url`/`bundle_url`

**Files:** Modify `scripts/build-feed.js`; Test `scripts/build-feed.test.js`

- [ ] **Step 1: Update the existing `buildFeedFile` and `buildIndex` tests to the 1.1 shape**

In `scripts/build-feed.test.js`, in the test `buildFeedFile: wraps items with schema metadata`, change `assert.equal(out.schema_version, '1.0');` to `assert.equal(out.schema_version, '1.1');`.

Replace the body of the test `buildIndex: lists feeds with urls and counts` with:

```js
test('buildIndex: lists feeds with manifest_url, bundle_url, and counts', () => {
  const resolved = feed.resolveConfig({ feeds: { extra: { collections: ['labs'], bundle: false } } });
  const out = feed.buildIndex(resolved, { all: 42, extra: 7 }, {
    baseUrl: 'https://x.test/mcs-labs',
    generated: '2026-06-16T00:00:00Z',
    siteTitle: 'Site',
  });
  assert.equal(out.schema_version, '1.1');
  assert.deepEqual(out.site, { title: 'Site', base_url: 'https://x.test/mcs-labs' });
  const all = out.feeds.find((f) => f.name === 'all');
  assert.equal(all.manifest_url, 'https://x.test/mcs-labs/feed/all/manifest.json');
  assert.equal(all.bundle_url, 'https://x.test/mcs-labs/feed/all.json');
  assert.equal(all.item_count, 42);
  const extra = out.feeds.find((f) => f.name === 'extra');
  assert.equal(extra.bundle_url, null); // bundle:false → no bundle_url
  assert.equal(extra.item_count, 7);
});

test('resolveConfig: bundle defaults true and can be disabled per feed', () => {
  const r = feed.resolveConfig({ feeds: { a: { collections: ['labs'] }, b: { collections: ['labs'], bundle: false } } });
  assert.equal(r.feeds.a.bundle, true);
  assert.equal(r.feeds.b.bundle, false);
  assert.equal(r.feeds.all.bundle, true);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `schema_version` is still `1.0`, `manifest_url`/`bundle_url`/`bundle` undefined.

- [ ] **Step 3: Implement the constant, `bundle`, and index changes**

In `scripts/build-feed.js`, add the constant next to `ALL_COLLECTIONS`:

```js
const SCHEMA_VERSION = '1.1';
```

In `normalizeFeedDef`, add a `bundle` field (default true):

```js
function normalizeFeedDef(name, def = {}) {
  return {
    name,
    title: def.title || name,
    description: def.description || '',
    collections: [...(def.collections || [])],
    include: [...(def.include || [])],
    exclude: [...(def.exclude || [])],
    bundle: def.bundle !== false,
  };
}
```

Update `buildFeedFile` to use the constant — change its `schema_version: '1.0'` to `schema_version: SCHEMA_VERSION`.

Replace `buildIndex` with:

```js
function buildIndex(resolved, counts, { baseUrl, generated, siteTitle }) {
  return {
    schema_version: SCHEMA_VERSION,
    generated,
    site: { title: siteTitle, base_url: baseUrl },
    feeds: Object.values(resolved.feeds).map((f) => ({
      name: f.name,
      title: f.title,
      description: f.description,
      manifest_url: `${baseUrl}/feed/${f.name}/manifest.json`,
      bundle_url: f.bundle === false ? null : `${baseUrl}/feed/${f.name}.json`,
      item_count: counts[f.name] ?? 0,
    })),
  };
}
module.exports.buildIndex = buildIndex;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): schema 1.1 — bundle config + index manifest/bundle URLs"
```

---

### Task 16: `content_url` on each item

**Files:** Modify `scripts/build-feed.js`; Test `scripts/build-feed.test.js`

- [ ] **Step 1: Extend the `buildItem` tests (append)**

```js
test('buildItem: includes a content_url to the per-item feed document', () => {
  const item = feed.buildItem({
    collection: 'labs', slug: 'demo', frontMatter: { title: 'Demo' }, body: 'x',
    baseUrl: 'https://x.test/mcs-labs',
  });
  assert.equal(item.content_url, 'https://x.test/mcs-labs/feed/items/labs/demo.json');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `item.content_url` is undefined.

- [ ] **Step 3: Add `content_url` to `buildItem`**

In `buildItem`, add the `content_url` field immediately after the `url` field:

```js
    url: `${baseUrl}/${collection}/${slug}/`,
    content_url: `${baseUrl}/feed/items/${collection}/${slug}.json`,
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS (the new test plus all existing `buildItem` tests).

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): add per-item content_url to items"
```

---

### Task 17: `buildManifestItem` + `buildManifest`

**Files:** Modify `scripts/build-feed.js`; Test `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing tests (append)**

```js
test('buildManifestItem: drops heavy fields, keeps pointers and hashes', () => {
  const full = feed.buildItem({
    collection: 'labs', slug: 'demo',
    frontMatter: { title: 'Demo', order: 1 }, body: '![a](images/a.png)',
    baseUrl: 'https://x.test',
  });
  const light = feed.buildManifestItem(full);
  assert.equal(light.content_markdown, undefined);
  assert.equal(light.images, undefined);
  assert.equal(light.metadata, undefined);
  assert.equal(light.slug, 'demo');
  assert.equal(light.content_url, full.content_url);
  assert.equal(light.content_hash, full.content_hash);
  assert.deepEqual(light.references, full.references);
});

test('buildManifest: light envelope with mapped items', () => {
  const def = feed.resolveConfig({}).feeds.all;
  const full = feed.buildItem({ collection: 'labs', slug: 'd', frontMatter: {}, body: 'b', baseUrl: 'https://x.test' });
  const m = feed.buildManifest(def, [full], { baseUrl: 'https://x.test', generated: '2026-06-16T00:00:00Z' });
  assert.equal(m.schema_version, '1.1');
  assert.deepEqual(m.feed, { name: 'all', title: 'MCS Labs — All Content', description: 'All modules, events, workshops, and labs' });
  assert.equal(m.items.length, 1);
  assert.equal(m.items[0].content_markdown, undefined);
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.buildManifestItem is not a function`.

- [ ] **Step 3: Implement both functions**

Append to `scripts/build-feed.js`:

```js
function buildManifestItem(item) {
  const { content_markdown, images, metadata, ...light } = item;
  return light;
}
module.exports.buildManifestItem = buildManifestItem;

function buildManifest(feedDef, items, { baseUrl, generated }) {
  return {
    schema_version: SCHEMA_VERSION,
    generated,
    feed: { name: feedDef.name, title: feedDef.title, description: feedDef.description },
    site: { base_url: baseUrl },
    items: items.map(buildManifestItem),
  };
}
module.exports.buildManifest = buildManifest;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): lightweight manifest items + buildManifest"
```

---

### Task 18: `buildPerItemDoc`

**Files:** Modify `scripts/build-feed.js`; Test `scripts/build-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('buildPerItemDoc: wraps the full item in an envelope', () => {
  const full = feed.buildItem({ collection: 'labs', slug: 'd', frontMatter: { title: 'D' }, body: 'b', baseUrl: 'https://x.test' });
  const doc = feed.buildPerItemDoc(full, { baseUrl: 'https://x.test', generated: '2026-06-16T00:00:00Z' });
  assert.equal(doc.schema_version, '1.1');
  assert.deepEqual(doc.site, { base_url: 'https://x.test' });
  assert.equal(doc.item.slug, 'd');
  assert.equal(doc.item.content_markdown, 'b');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `feed.buildPerItemDoc is not a function`.

- [ ] **Step 3: Implement `buildPerItemDoc`**

Append to `scripts/build-feed.js`:

```js
function buildPerItemDoc(item, { baseUrl, generated }) {
  return { schema_version: SCHEMA_VERSION, generated, site: { base_url: baseUrl }, item };
}
module.exports.buildPerItemDoc = buildPerItemDoc;
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `node --test scripts/build-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): per-item document envelope"
```

---

### Task 19: CLI emits per-item docs + manifests + conditional bundle

**Files:** Modify `scripts/build-feed.js` (CLI block); Test `scripts/build-feed.test.js`

- [ ] **Step 1: Extend the integration test (append a new test)**

```js
test('CLI: emits manifest, per-item docs, and bundle with the 1.1 layout', () => {
  let out;
  try {
    out = fs.mkdtempSync(path.join(os.tmpdir(), 'mcs-feed2-'));
    execFileSync('node', ['scripts/build-feed.js', '--out', out], { cwd: process.cwd(), stdio: 'pipe' });

    const index = JSON.parse(fs.readFileSync(path.join(out, 'index.json'), 'utf8'));
    assert.equal(index.schema_version, '1.1');
    const allEntry = index.feeds.find((f) => f.name === 'all');
    assert.match(allEntry.manifest_url, /\/feed\/all\/manifest\.json$/);
    assert.match(allEntry.bundle_url, /\/feed\/all\.json$/);

    const manifest = JSON.parse(fs.readFileSync(path.join(out, 'all', 'manifest.json'), 'utf8'));
    assert.equal(manifest.schema_version, '1.1');
    assert.ok(manifest.items.length > 0);
    assert.equal(manifest.items[0].content_markdown, undefined, 'manifest items carry no markdown');
    assert.ok(manifest.items[0].content_url, 'manifest items carry content_url');

    // a known per-item doc exists and has full content
    const itemDoc = JSON.parse(fs.readFileSync(path.join(out, 'items', 'labs', 'agent-builder-m365.json'), 'utf8'));
    assert.equal(itemDoc.item.slug, 'agent-builder-m365');
    assert.ok(itemDoc.item.content_markdown.length > 0);

    // bundle still present and full
    const bundle = JSON.parse(fs.readFileSync(path.join(out, 'all.json'), 'utf8'));
    assert.ok(bundle.items.find((i) => i.slug === 'agent-builder-m365').content_markdown.length > 0);
  } finally {
    if (out) fs.rmSync(out, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/build-feed.test.js`
Expected: FAIL — `all/manifest.json` and `items/labs/agent-builder-m365.json` do not exist yet.

- [ ] **Step 3: Update the CLI write loop**

In the CLI block of `scripts/build-feed.js`, replace the existing write loop (the section that starts at `fs.mkdirSync(outDir, { recursive: true });` and writes the per-feed bundle + `index.json`) with:

```js
  fs.mkdirSync(outDir, { recursive: true });
  const generated = new Date().toISOString();

  // Per-feed membership (computed once, reused for manifest + bundle + published set).
  const feedMembers = {};
  for (const feedDef of Object.values(resolved.feeds)) {
    feedMembers[feedDef.name] = selectFeedItems(allItems, feedDef);
  }

  // Per-item documents: every item published in ≥1 feed, written once (deduped).
  const seenItem = new Set();
  for (const members of Object.values(feedMembers)) {
    for (const item of members) {
      const key = `${item.collection}/${item.slug}`;
      if (seenItem.has(key)) continue;
      seenItem.add(key);
      const dir = path.join(outDir, 'items', item.collection);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(
        path.join(dir, `${item.slug}.json`),
        JSON.stringify(buildPerItemDoc(item, { baseUrl: resolved.baseUrl, generated }), null, 2)
      );
    }
  }
  console.log(`[build-feed] wrote ${seenItem.size} per-item documents`);

  const counts = {};
  for (const feedDef of Object.values(resolved.feeds)) {
    const members = feedMembers[feedDef.name];
    counts[feedDef.name] = members.length;

    const feedDir = path.join(outDir, feedDef.name);
    fs.mkdirSync(feedDir, { recursive: true });
    fs.writeFileSync(
      path.join(feedDir, 'manifest.json'),
      JSON.stringify(buildManifest(feedDef, members, { baseUrl: resolved.baseUrl, generated }), null, 2)
    );

    if (feedDef.bundle !== false) {
      fs.writeFileSync(
        path.join(outDir, `${feedDef.name}.json`),
        JSON.stringify(buildFeedFile(feedDef, members, { baseUrl: resolved.baseUrl, generated }), null, 2)
      );
    }
    console.log(`[build-feed] wrote ${feedDef.name}/manifest.json (${members.length} items)${feedDef.bundle === false ? ' [no bundle]' : ' + bundle'}`);
  }

  const index = buildIndex(resolved, counts, { baseUrl: resolved.baseUrl, generated, siteTitle });
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`[build-feed] wrote index.json (${Object.keys(resolved.feeds).length} feeds) → ${outDir}`);
```

- [ ] **Step 4: Run the full suite to verify it passes**

Run: `npm test`
Expected: PASS — the new integration test plus all earlier tests (the original Task 11 integration test still passes: `index.json` and `all.json` still exist).

- [ ] **Step 5: Commit**

```bash
git add scripts/build-feed.js scripts/build-feed.test.js
git commit -m "feat(feed): emit per-item docs + per-feed manifests + optional bundle"
```

---

### Task 20: Final verification + docs for the 1.1 layout

**Files:** none (verification) + `CHANGELOG.md`

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: PASS (all tests).

- [ ] **Step 2: Generate and inspect the layered output**

Run: `npm run build:feed -- --out _site/feed`
Then:
```
node -e "const fs=require('node:fs'),p=require('node:path'); const idx=require('./_site/feed/index.json'); console.log('schema:',idx.schema_version); console.log('feeds:',idx.feeds.map(f=>f.name+' manifest='+!!f.manifest_url+' bundle='+!!f.bundle_url)); const m=require('./_site/feed/all/manifest.json'); console.log('manifest items:',m.items.length,'first has markdown?',m.items[0].content_markdown!==undefined); const items=fs.readdirSync(p.join('_site','feed','items')); console.log('per-item collections:',items); const lab=require('./_site/feed/items/labs/agent-builder-m365.json'); console.log('per-item ok:',lab.item.slug, lab.item.content_markdown.length>0);"
```
Expected: `schema: 1.1`, the `all` feed with `manifest=true bundle=true`, manifest items with `first has markdown? false`, per-item collections including `labs`, and the sample per-item doc resolving with non-empty markdown.

- [ ] **Step 3: Confirm `_site/` is not tracked**

Run: `git status --porcelain _site/`
Expected: empty.

- [ ] **Step 4: Update CHANGELOG**

Add under the same Unreleased/Added entry (extend the existing feed bullet or add a sub-bullet):

```markdown
- Content feed now publishes a scalable layout (schema 1.1): a lightweight per-feed `manifest.json` (no markdown) plus deduplicated per-item documents at `feed/items/<collection>/<slug>.json`, so consumers sync incrementally. The full inline `feed/<name>.json` bundle remains (toggle per feed via `bundle:` in `_data/feeds.yml`).
```

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(feed): note scalable manifest + per-item layout (schema 1.1)"
```

---

## Notes for the implementer

- **Source of truth for content:** all four collections are read uniformly from `_<collection>/<slug>.md` via `gray-matter`. For labs, this file carries both the front matter and the normalized body the site renders (the sibling `labs/<slug>/README.md` has no front matter and is only an authoring source). This keeps one code path for every collection.
- **`generated` timestamp** uses `new Date()` only in the CLI block; all pure functions take `generated` as a parameter so unit tests stay deterministic.
- **Windows line endings:** the repo sets `core.autocrlf=true` with `core.safecrlf=true`. If `git add` fails with "LF would be replaced by CRLF", run the add/commit with `git -c core.safecrlf=false ...` (the repo still normalizes to LF on commit).
- **Output dir is never committed:** Phase 1 writes into `_site/feed/` (gitignored). Phase 3 will move generation before the Jekyll build.
