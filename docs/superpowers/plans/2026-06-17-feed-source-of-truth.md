# Feed as Source of Truth (Phase 3 + Consumer) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the portal render its pages from the consumed feed (own + filtered external) by materializing consumed items into a git-ignored build dir that Jekyll renders via a `collections_dir` overlay — without touching committed sources or the lab auditor.

**Architecture:** A new Node consumer `scripts/consume-feed.js` reads `_data/feed_subscriptions.yml`, loads this instance's own feed from local files and external feeds over HTTP, applies `exclude` filters, merges (own wins on collision), and **materializes** each item as `.feed-build/_<collection>/<slug>.md` (front matter from `metadata`, body from `content_markdown` with own-origin images re-relativized). The deploy reorders to: produce feed → consume/materialize → `jekyll build --config _config.yml,_config.feed.yml` (where the overlay sets `collections_dir: .feed-build`) → publish feed → deploy. Most logic is pure Node and unit-tested; the round-trip gate asserts own-only materialization reproduces committed bodies exactly.

**Tech Stack:** Node 20+ (CommonJS, `node:test`), `js-yaml` + `gray-matter` (already devDeps from Phase 1), Jekyll `collections_dir` overlay. Builds on the Phase 1 producer (`scripts/build-feed.js`).

**Spec:** `docs/superpowers/specs/2026-06-17-feed-source-of-truth-design.md`

## File Structure

- **Create `scripts/consume-feed.js`** — consumer: pure functions (subscription resolution, filter, merge, image re-relativize, front-matter render, materialize) + a CLI that does feed I/O and writes `.feed-build/`.
- **Create `scripts/consume-feed.test.js`** — unit + integration + round-trip tests.
- **Create `_data/feed_subscriptions.yml`** — consumer config (default: self only).
- **Create `_config.feed.yml`** — Jekyll overlay setting `collections_dir: .feed-build`.
- **Modify `.gitignore`** — ignore `.feed-build/`.
- **Modify `.github/workflows/build-and-deploy.yml`** — reorder to the inverted pipeline.
- **Modify `package.json`** — add a `consume:feed` script (optional convenience).

### Module shape (`scripts/consume-feed.js`)

Top-of-file requires (`node:crypto` not needed; `js-yaml` at top for `renderFrontMatter`). Additive `module.exports.<name> = <name>;`. Final exports: `resolveSubscriptions`, `itemPassesFilter`, `mergeItems`, `relativizeImages`, `renderFrontMatter`, `materializeDoc`. The CLI block does all file/HTTP I/O.

### How own-image round-trip works (why the gate is Node-only)

Producer: committed body `B` → `content_markdown = absolutize(B)` (rewrites `](images/x)` → `](<base>/<collection>/<slug>/images/x)`). Consumer: `relativizeImages(content_markdown)` rewrites `<base>/<collection>/<slug>/images/` → `images/`, yielding `B` exactly. So `gray-matter(materializeDoc(ownItem)).content === B`. The round-trip gate asserts this for every own item — no Jekyll required.

---

### Task 1: Scaffold consumer + gitignore

**Files:**
- Create: `scripts/consume-feed.js`
- Modify: `.gitignore`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/consume-feed.js` skeleton**

```js
'use strict';

const yaml = require('js-yaml');

module.exports = {};

// Pure functions are appended below by subsequent tasks.
// The CLI entry (if require.main === module) is added last.
```

- [ ] **Step 2: Ignore the build dir**

Append to `.gitignore` (a new line at the end):

```
.feed-build/
```

- [ ] **Step 3: Add a convenience npm script**

In `package.json`, add to the `"scripts"` block (after `"build:feed"`):

```json
    "consume:feed": "node scripts/consume-feed.js",
```

- [ ] **Step 4: Verify the suite still runs**

Run: `npm test`
Expected: PASS — existing tests still green; no consumer tests yet.

- [ ] **Step 5: Commit**

```bash
git add scripts/consume-feed.js .gitignore package.json
git commit -m "chore(consume): scaffold feed consumer + ignore .feed-build"
```

---

### Task 2: `resolveSubscriptions`

**Files:** Modify `scripts/consume-feed.js`; Test `scripts/consume-feed.test.js`

- [ ] **Step 1: Write the failing test (create the test file)**

Create `scripts/consume-feed.test.js`:

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const consume = require('./consume-feed');

test('resolveSubscriptions: empty/missing config yields a single self subscription', () => {
  assert.deepEqual(consume.resolveSubscriptions({}), [
    { name: 'self', self: true, url: null, feed: 'all', enabled: true, exclude: { slugs: [], collections: [] } },
  ]);
  assert.equal(consume.resolveSubscriptions({ subscriptions: [] }).length, 1);
});

test('resolveSubscriptions: normalizes explicit subscriptions', () => {
  const subs = consume.resolveSubscriptions({
    subscriptions: [
      { name: 'self', self: true },
      { name: 'partner', url: 'https://p.test/feed', exclude: { slugs: ['x'] } },
      { name: 'off', url: 'https://o.test/feed', enabled: false },
    ],
  });
  assert.equal(subs.length, 3);
  assert.equal(subs[1].url, 'https://p.test/feed');
  assert.equal(subs[1].feed, 'all');
  assert.deepEqual(subs[1].exclude, { slugs: ['x'], collections: [] });
  assert.equal(subs[2].enabled, false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/consume-feed.test.js`
Expected: FAIL — `consume.resolveSubscriptions is not a function`.

- [ ] **Step 3: Implement `resolveSubscriptions`**

Append to `scripts/consume-feed.js`:

```js
function normalizeSubscription(sub = {}) {
  const ex = sub.exclude || {};
  return {
    name: sub.name || (sub.self ? 'self' : sub.url || 'unnamed'),
    self: sub.self === true,
    url: sub.url || null,
    feed: sub.feed || 'all',
    enabled: sub.enabled !== false,
    exclude: { slugs: ex.slugs || [], collections: ex.collections || [] },
  };
}

function resolveSubscriptions(raw = {}) {
  const list = Array.isArray(raw.subscriptions) ? raw.subscriptions : [];
  if (list.length === 0) return [normalizeSubscription({ name: 'self', self: true })];
  return list.map(normalizeSubscription);
}
module.exports.resolveSubscriptions = resolveSubscriptions;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/consume-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/consume-feed.js scripts/consume-feed.test.js
git commit -m "feat(consume): resolve subscriptions with self default"
```

---

### Task 3: `itemPassesFilter`

**Files:** Modify `scripts/consume-feed.js`; Test `scripts/consume-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('itemPassesFilter: drops by slug or collection, default passes', () => {
  const sub = consume.resolveSubscriptions({ subscriptions: [{ url: 'x', exclude: { slugs: ['a'], collections: ['events'] } }] })[0];
  assert.equal(consume.itemPassesFilter({ collection: 'labs', slug: 'a' }, sub), false);
  assert.equal(consume.itemPassesFilter({ collection: 'events', slug: 'b' }, sub), false);
  assert.equal(consume.itemPassesFilter({ collection: 'labs', slug: 'b' }, sub), true);
  const open = consume.resolveSubscriptions({ subscriptions: [{ url: 'x' }] })[0];
  assert.equal(consume.itemPassesFilter({ collection: 'labs', slug: 'a' }, open), true);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/consume-feed.test.js`
Expected: FAIL — `consume.itemPassesFilter is not a function`.

- [ ] **Step 3: Implement `itemPassesFilter`**

Append to `scripts/consume-feed.js`:

```js
function itemPassesFilter(item, sub) {
  if (sub.exclude.slugs.includes(item.slug)) return false;
  if (sub.exclude.collections.includes(item.collection)) return false;
  return true;
}
module.exports.itemPassesFilter = itemPassesFilter;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/consume-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/consume-feed.js scripts/consume-feed.test.js
git commit -m "feat(consume): per-subscription exclude filter"
```

---

### Task 4: `mergeItems` (own wins on collision)

**Files:** Modify `scripts/consume-feed.js`; Test `scripts/consume-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('mergeItems: first source wins on (collection, slug) collision', () => {
  const { items, collisions } = consume.mergeItems([
    { source: 'self', items: [{ collection: 'labs', slug: 'a', v: 'own' }] },
    { source: 'partner', items: [{ collection: 'labs', slug: 'a', v: 'ext' }, { collection: 'labs', slug: 'b', v: 'ext' }] },
  ]);
  assert.equal(items.length, 2);
  assert.equal(items.find((i) => i.slug === 'a').v, 'own');
  assert.equal(items.find((i) => i.slug === 'b').v, 'ext');
  assert.deepEqual(collisions, [{ key: 'labs/a', droppedSource: 'partner' }]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/consume-feed.test.js`
Expected: FAIL — `consume.mergeItems is not a function`.

- [ ] **Step 3: Implement `mergeItems`**

Append to `scripts/consume-feed.js`:

```js
function mergeItems(taggedLists) {
  const byKey = new Map();
  const collisions = [];
  for (const { source, items } of taggedLists) {
    for (const item of items) {
      const key = `${item.collection}/${item.slug}`;
      if (byKey.has(key)) {
        collisions.push({ key, droppedSource: source });
        continue;
      }
      byKey.set(key, item);
    }
  }
  return { items: [...byKey.values()], collisions };
}
module.exports.mergeItems = mergeItems;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/consume-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/consume-feed.js scripts/consume-feed.test.js
git commit -m "feat(consume): merge items, self wins on collision"
```

---

### Task 5: `relativizeImages` (inverse of producer absolutize)

**Files:** Modify `scripts/consume-feed.js`; Test `scripts/consume-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('relativizeImages: own-origin image URLs become relative, others untouched', () => {
  const base = 'https://microsoft.github.io/mcs-labs';
  const md =
    '![a](https://microsoft.github.io/mcs-labs/labs/demo/images/a.png) ' +
    '<img src="https://microsoft.github.io/mcs-labs/labs/demo/images/b.png"> ' +
    '![ext](https://partner.example.com/mcs-labs/labs/other/images/c.png) ' +
    '![root](/x.png)';
  const out = consume.relativizeImages(md, base, 'labs', 'demo');
  assert.match(out, /\]\(images\/a\.png\)/);
  assert.match(out, /src="images\/b\.png"/);
  assert.match(out, /partner\.example\.com\/mcs-labs\/labs\/other\/images\/c\.png/); // external untouched
  assert.match(out, /\]\(\/x\.png\)/); // root-relative untouched
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/consume-feed.test.js`
Expected: FAIL — `consume.relativizeImages is not a function`.

- [ ] **Step 3: Implement `relativizeImages`**

Append to `scripts/consume-feed.js`:

```js
function relativizeImages(markdown, ownBaseUrl, collection, slug) {
  const absPrefix = `${ownBaseUrl}/${collection}/${slug}/images/`;
  const escaped = absPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  return String(markdown == null ? '' : markdown).replace(re, 'images/');
}
module.exports.relativizeImages = relativizeImages;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/consume-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/consume-feed.js scripts/consume-feed.test.js
git commit -m "feat(consume): re-relativize own-origin image URLs"
```

---

### Task 6: `renderFrontMatter` + `materializeDoc`

**Files:** Modify `scripts/consume-feed.js`; Test `scripts/consume-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
const matter = require('gray-matter');

test('renderFrontMatter: emits a YAML front-matter block', () => {
  const fm = consume.renderFrontMatter({ title: 'Demo', order: 10 });
  assert.match(fm, /^---\n/);
  assert.match(fm, /title: Demo/);
  assert.match(fm, /order: 10/);
  assert.match(fm, /---\n$/);
});

test('materializeDoc: round-trips body and carries metadata', () => {
  const base = 'https://x.test/mcs-labs';
  const item = {
    collection: 'labs', slug: 'demo',
    metadata: { title: 'Demo', order: 5 },
    content_markdown: 'Intro ![a](https://x.test/mcs-labs/labs/demo/images/a.png)',
  };
  const doc = consume.materializeDoc(item, base);
  const parsed = matter(doc);
  assert.equal(parsed.data.title, 'Demo');
  assert.equal(parsed.data.order, 5);
  assert.equal(parsed.content.trim(), 'Intro ![a](images/a.png)');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/consume-feed.test.js`
Expected: FAIL — `consume.renderFrontMatter is not a function`.

- [ ] **Step 3: Implement both functions**

Append to `scripts/consume-feed.js`:

```js
function renderFrontMatter(metadata) {
  const body = yaml.dump(metadata || {}, { lineWidth: -1, noRefs: true });
  return `---\n${body}---\n`;
}
module.exports.renderFrontMatter = renderFrontMatter;

function materializeDoc(item, ownBaseUrl) {
  const body = relativizeImages(item.content_markdown, ownBaseUrl, item.collection, item.slug);
  return `${renderFrontMatter(item.metadata)}\n${body}`;
}
module.exports.materializeDoc = materializeDoc;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test scripts/consume-feed.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add scripts/consume-feed.js scripts/consume-feed.test.js
git commit -m "feat(consume): render front matter + materialize collection docs"
```

---

### Task 7: CLI — consume self + external, filter, merge, materialize

**Files:** Modify `scripts/consume-feed.js`; Test `scripts/consume-feed.test.js`

- [ ] **Step 1: Write the failing integration test (append)**

This test produces the real own feed with `build-feed.js`, hand-builds a tiny **external** fixture feed with a distinct slug, runs the consumer, and asserts both own and external items materialize.

```js
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

test('CLI: materializes own + external items into .feed-build', () => {
  let work;
  try {
    work = fs.mkdtempSync(path.join(os.tmpdir(), 'mcs-consume-'));
    const published = path.join(work, 'published');
    const out = path.join(work, 'build');

    // 1. produce this repo's own feed
    execFileSync('node', ['scripts/build-feed.js', '--out', published], { cwd: process.cwd(), stdio: 'pipe' });

    // 2. hand-build a tiny external fixture feed (distinct slug, external origin)
    const extBase = path.join(work, 'ext');
    fs.mkdirSync(path.join(extBase, 'all'), { recursive: true });
    fs.mkdirSync(path.join(extBase, 'items', 'labs'), { recursive: true });
    const extItem = {
      collection: 'labs', slug: 'partner-demo',
      title: 'Partner Demo', metadata: { title: 'Partner Demo', order: 999 },
      content_markdown: '# Partner Demo\n\n![p](https://partner.example.com/mcs-labs/labs/partner-demo/images/p.png)',
    };
    fs.writeFileSync(path.join(extBase, 'all', 'manifest.json'),
      JSON.stringify({ items: [{ collection: 'labs', slug: 'partner-demo' }] }));
    fs.writeFileSync(path.join(extBase, 'items', 'labs', 'partner-demo.json'),
      JSON.stringify({ item: extItem }));

    // 3. subscriptions config: self + the local external fixture
    const cfg = path.join(work, 'subs.yml');
    fs.writeFileSync(cfg,
      `subscriptions:\n  - name: self\n    self: true\n  - name: partner\n    url: ${extBase}\n    feed: all\n`);

    // 4. consume
    execFileSync('node',
      ['scripts/consume-feed.js', '--out', out, '--feed-dir', published, '--config', cfg],
      { cwd: process.cwd(), stdio: 'pipe' });

    // own item present (round-tripped to relative images)
    const ownDoc = fs.readFileSync(path.join(out, '_labs', 'agent-builder-m365.md'), 'utf8');
    assert.match(ownDoc, /\]\(images\//, 'own images are relative');
    assert.doesNotMatch(ownDoc, /microsoft\.github\.io\/mcs-labs\/labs\/agent-builder-m365\/images/, 'no own-absolute images');

    // external item materialized, external image stays absolute
    const extDoc = fs.readFileSync(path.join(out, '_labs', 'partner-demo.md'), 'utf8');
    assert.match(extDoc, /partner\.example\.com\/mcs-labs\/labs\/partner-demo\/images\/p\.png/);
  } finally {
    if (work) fs.rmSync(work, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test scripts/consume-feed.test.js`
Expected: FAIL — the CLI does nothing yet, so `.feed-build/_labs/agent-builder-m365.md` is absent (ENOENT).

- [ ] **Step 3: Implement the CLI block**

Append to the END of `scripts/consume-feed.js`:

```js
// CLI: node scripts/consume-feed.js [--out <dir>] [--feed-dir <dir>] [--config <path>]
if (require.main === module) {
  const fs = require('node:fs');
  const path = require('node:path');

  const root = process.cwd();
  const args = process.argv.slice(2);
  const argVal = (flag, def) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] !== undefined ? args[i + 1] : def;
  };
  const outArg = argVal('--out', '.feed-build');
  const feedDirArg = argVal('--feed-dir', path.join('.feed-build', 'published'));
  const configArg = argVal('--config', path.join('_data', 'feed_subscriptions.yml'));
  const outDir = path.isAbsolute(outArg) ? outArg : path.join(root, outArg);
  const feedDir = path.isAbsolute(feedDirArg) ? feedDirArg : path.join(root, feedDirArg);
  const configPath = path.isAbsolute(configArg) ? configArg : path.join(root, configArg);

  const isHttp = (s) => /^https?:\/\//.test(s);
  const joinBase = (base, rel) => (isHttp(base) ? `${base.replace(/\/+$/, '')}/${rel}` : path.join(base, rel));
  const readJson = async (loc) => {
    if (isHttp(loc)) {
      const res = await fetch(loc);
      if (!res.ok) throw new Error(`fetch ${loc} -> ${res.status}`);
      return res.json();
    }
    return JSON.parse(fs.readFileSync(loc, 'utf8'));
  };

  // own base_url comes from the produced feed's index.json
  const readOwnBaseUrl = () => {
    try {
      return JSON.parse(fs.readFileSync(path.join(feedDir, 'index.json'), 'utf8')).site.base_url;
    } catch {
      return 'https://microsoft.github.io/mcs-labs';
    }
  };

  // self: read every per-item doc under <feedDir>/items/<collection>/<slug>.json
  const readSelfItems = () => {
    const itemsRoot = path.join(feedDir, 'items');
    const out = [];
    let collections = [];
    try { collections = fs.readdirSync(itemsRoot); } catch { return out; }
    for (const collection of collections) {
      const dir = path.join(itemsRoot, collection);
      let files = [];
      try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.json')); } catch { continue; }
      for (const f of files) out.push(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')).item);
    }
    return out;
  };

  // external: read the subscription's manifest, then each per-item doc
  const readExternalItems = async (sub) => {
    const manifest = await readJson(joinBase(sub.url, `${sub.feed}/manifest.json`));
    const out = [];
    for (const mi of manifest.items) {
      const doc = await readJson(joinBase(sub.url, `items/${mi.collection}/${mi.slug}.json`));
      out.push(doc.item);
    }
    return out;
  };

  (async () => {
    let rawConfig = {};
    try { rawConfig = yaml.load(fs.readFileSync(configPath, 'utf8')) || {}; }
    catch { console.warn(`[consume-feed] no ${configArg}; using self-only default`); }

    const subs = resolveSubscriptions(rawConfig).filter((s) => s.enabled);
    // self always evaluated first so own items win collisions
    subs.sort((a, b) => (a.self === b.self ? 0 : a.self ? -1 : 1));

    const ownBaseUrl = readOwnBaseUrl();
    const taggedLists = [];
    for (const sub of subs) {
      let items = [];
      try {
        items = sub.self ? readSelfItems() : await readExternalItems(sub);
      } catch (err) {
        console.warn(`[consume-feed] subscription "${sub.name}" failed: ${err.message}; skipping`);
        continue;
      }
      taggedLists.push({ source: sub.name, items: items.filter((it) => itemPassesFilter(it, sub)) });
    }

    const { items, collisions } = mergeItems(taggedLists);
    for (const c of collisions) console.warn(`[consume-feed] collision ${c.key}: dropped from "${c.droppedSource}" (own wins)`);

    for (const item of items) {
      const dir = path.join(outDir, `_${item.collection}`);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${item.slug}.md`), materializeDoc(item, ownBaseUrl));
    }
    console.log(`[consume-feed] materialized ${items.length} items into ${outDir}`);
  })();
}
```

- [ ] **Step 4: Run the full suite to verify it passes**

Run: `npm test`
Expected: PASS — the consumer integration test plus all earlier tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/consume-feed.js scripts/consume-feed.test.js
git commit -m "feat(consume): CLI consumes self + external feeds and materializes docs"
```

---

### Task 8: Round-trip gate (own-only reproduces committed bodies)

**Files:** Test `scripts/consume-feed.test.js`

- [ ] **Step 1: Write the failing test (append)**

```js
test('round-trip: self-only materialized bodies equal committed collection bodies', () => {
  let work;
  try {
    work = fs.mkdtempSync(path.join(os.tmpdir(), 'mcs-roundtrip-'));
    const published = path.join(work, 'published');
    const out = path.join(work, 'build');
    const cfg = path.join(work, 'subs.yml');
    fs.writeFileSync(cfg, 'subscriptions:\n  - name: self\n    self: true\n');

    execFileSync('node', ['scripts/build-feed.js', '--out', published], { cwd: process.cwd(), stdio: 'pipe' });
    execFileSync('node', ['scripts/consume-feed.js', '--out', out, '--feed-dir', published, '--config', cfg], { cwd: process.cwd(), stdio: 'pipe' });

    // every committed collection doc must have a materialized twin with an identical body
    for (const collection of ['labs', 'modules', 'events', 'workshops']) {
      const srcDir = path.join(process.cwd(), `_${collection}`);
      for (const f of fs.readdirSync(srcDir).filter((x) => x.endsWith('.md'))) {
        const committed = matter(fs.readFileSync(path.join(srcDir, f), 'utf8')).content;
        const materializedPath = path.join(out, `_${collection}`, f);
        assert.ok(fs.existsSync(materializedPath), `materialized ${collection}/${f} exists`);
        const materialized = matter(fs.readFileSync(materializedPath, 'utf8')).content;
        assert.equal(materialized.trim(), committed.trim(), `${collection}/${f} body round-trips`);
      }
    }
  } finally {
    if (work) fs.rmSync(work, { recursive: true, force: true });
  }
});
```

- [ ] **Step 2: Run test to verify it (initially) fails or passes**

Run: `node --test scripts/consume-feed.test.js`
Expected: PASS if the producer/consumer image transforms are exact inverses. If it FAILS, the diff reveals a non-round-tripping transform (e.g., an image ref pattern the producer absolutized but the consumer didn't relativize) — fix the mismatched regex in `relativizeImages`/`build-feed.js`'s `rewriteImages` so the pair is symmetric, then re-run. Do not weaken the assertion.

- [ ] **Step 3: Commit**

```bash
git add scripts/consume-feed.test.js
git commit -m "test(consume): round-trip gate — self-only reproduces committed bodies"
```

---

### Task 9: Consumer config + Jekyll overlay

**Files:**
- Create: `_data/feed_subscriptions.yml`
- Create: `_config.feed.yml`

- [ ] **Step 1: Create `_data/feed_subscriptions.yml`**

```yaml
# Consumer configuration — which feeds THIS portal instance ingests.
# Full design: docs/superpowers/specs/2026-06-17-feed-source-of-truth-design.md
#
# Default (this file present with only the self subscription, or absent entirely):
#   the portal renders exactly its own content — identical to building from the
#   collections directly.
#
# Each subscription:
#   name:     local identifier
#   self:     true to consume THIS instance's own produced feed (no HTTP)
#   url:      base feed URL of an external instance (the dir containing index.json)
#   feed:     which named feed to pull from that instance (default: all)
#   enabled:  default true
#   exclude:  { slugs: [...], collections: [...] } — subtractive local filter

subscriptions:
  - name: self
    self: true
    enabled: true

# Example external subscription (uncomment + edit to use):
#   - name: partner
#     url: https://partner.example.com/mcs-labs/feed
#     feed: all
#     exclude:
#       collections: [events]
```

- [ ] **Step 2: Create `_config.feed.yml`**

```yaml
# Jekyll overlay for feed-as-source-of-truth builds.
# Use: bundle exec jekyll build --config _config.yml,_config.feed.yml
# Points Jekyll's collections at the materialized build dir produced by
# scripts/consume-feed.js instead of the committed _<collection>/ dirs.
collections_dir: .feed-build
```

- [ ] **Step 3: Validate both files parse as YAML**

Run:
```
node -e "const y=require('js-yaml'),fs=require('fs'); const s=y.load(fs.readFileSync('_data/feed_subscriptions.yml','utf8')); if(!Array.isArray(s.subscriptions)||!s.subscriptions[0].self) throw new Error('bad subscriptions'); const o=y.load(fs.readFileSync('_config.feed.yml','utf8')); if(o.collections_dir!=='.feed-build') throw new Error('bad overlay'); console.log('OK', s.subscriptions.map(x=>x.name), o.collections_dir)"
```
Expected: `OK [ 'self' ] .feed-build`.

- [ ] **Step 4: Commit**

```bash
git add _data/feed_subscriptions.yml _config.feed.yml
git commit -m "feat(consume): default subscriptions config + Jekyll collections_dir overlay"
```

---

### Task 10: Reorder the deploy workflow to the inverted pipeline

**Files:** Modify `.github/workflows/build-and-deploy.yml`

> Jekyll itself can't be run in this environment; this task changes config only, validated by YAML + step-order assertions. The real render is verified in CI / your local Docker (Task 11 notes how).

- [ ] **Step 1: Replace the build/deploy steps**

In `.github/workflows/build-and-deploy.yml`, replace the current step sequence (from `Build Jekyll` through `Build content feed`) so the job's steps become exactly this order. Keep the existing `Checkout` and `Setup Ruby` steps before these, and the existing `Setup Pages` / `Upload artifact` / `Deploy to GitHub Pages` steps after them:

```yaml
      - name: Setup Node
        uses: actions/setup-node@v5
        with:
          node-version: "20"

      - name: Install feed deps
        run: npm install --no-audit --no-fund

      - name: Produce feed (own)
        run: node scripts/build-feed.js --out .feed-build/published

      - name: Consume feed and materialize
        run: node scripts/consume-feed.js --out .feed-build --feed-dir .feed-build/published

      - name: Build Jekyll from materialized feed
        run: bundle exec jekyll build --config _config.yml,_config.feed.yml
        env:
          JEKYLL_ENV: production

      - name: Publish feed alongside the site
        run: |
          mkdir -p _site/feed
          cp -r .feed-build/published/. _site/feed/
```

The final step order must be: `Checkout` → `Setup Ruby` → `Setup Node` → `Install feed deps` → `Produce feed (own)` → `Consume feed and materialize` → `Build Jekyll from materialized feed` → `Publish feed alongside the site` → `Setup Pages` → `Upload artifact` → `Deploy to GitHub Pages`.

- [ ] **Step 2: Validate the workflow YAML and ordering**

Run:
```
node -e "const y=require('js-yaml'),fs=require('fs'); const d=y.load(fs.readFileSync('.github/workflows/build-and-deploy.yml','utf8')); const s=d.jobs['build-and-deploy'].steps.map(x=>x.name); console.log(s.join(' -> ')); const order=['Produce feed (own)','Consume feed and materialize','Build Jekyll from materialized feed','Publish feed alongside the site','Setup Pages']; let p=-1; for(const n of order){const i=s.indexOf(n); if(i<=p) throw new Error('bad order at '+n); p=i;} console.log('ORDER OK')"
```
Expected: prints the step list and `ORDER OK`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/build-and-deploy.yml
git commit -m "ci(consume): inverted pipeline — produce, consume, render from feed, publish"
```

---

### Task 11: Final verification + docs

**Files:** Modify `CHANGELOG.md`

- [ ] **Step 1: Run the full suite**

Run: `npm test`
Expected: PASS — all producer + consumer tests, including the round-trip gate.

- [ ] **Step 2: Exercise the full Node pipeline locally (no Jekyll)**

Run:
```
node scripts/build-feed.js --out .feed-build/published && node scripts/consume-feed.js --out .feed-build --feed-dir .feed-build/published && node -e "const fs=require('fs'); for(const c of ['labs','modules','events','workshops']){const n=fs.readdirSync('.feed-build/_'+c).length; console.log(c, n);} "
```
Expected: each collection directory under `.feed-build/` is populated (labs/modules/events/workshops counts > 0), proving produce → consume → materialize works end-to-end. `.feed-build/` is git-ignored.

- [ ] **Step 3: Confirm nothing committed-source changed and `.feed-build` is ignored**

Run: `git status --porcelain`
Expected: empty (no modifications to `_labs/` etc.; `.feed-build/` does not appear because it is git-ignored). If anything under `_labs/`/`_modules/`/`_events/`/`_workshops/` shows as modified, STOP — the materializer wrote to committed sources; that violates the guardrail.

- [ ] **Step 4: Update CHANGELOG**

Add under the Unreleased/Added section:

```markdown
- The portal can now render from the consumed feed (feed-as-source-of-truth). `scripts/consume-feed.js` reads `_data/feed_subscriptions.yml` (self by default, optional external instances, `exclude` filters), merges (own wins), and materializes collection docs into a git-ignored `.feed-build/` that Jekyll renders via `_config.feed.yml` (`collections_dir`). Own content round-trips identically (verified gate); committed sources and the lab auditor are untouched.
```

- [ ] **Step 5: Commit**

```bash
git add CHANGELOG.md
git commit -m "docs(consume): note feed-as-source-of-truth in CHANGELOG"
```

- [ ] **Step 6: Jekyll render verification (CI / local Docker — cannot run here)**

This step is **manual / CI** because Jekyll needs Ruby. After the branch is pushed, verify in CI or local Docker:
- `bundle exec jekyll build --config _config.yml,_config.feed.yml` succeeds after the produce+consume steps.
- The built `_site/labs/agent-builder-m365/index.html` renders (own page identical to a baseline `_config.yml`-only build).
- With an example external subscription enabled, the external item appears as a new page.
Record the result on the PR. (The Node round-trip gate in Task 8 already guarantees the materialized *content* is correct; this step confirms Jekyll renders it.)

---

## Notes for the implementer

- **Own base URL** comes from the produced feed's `index.json` (`site.base_url`) — no need to re-read `_config.yml`.
- **Self is local-only:** the self subscription reads per-item docs straight from `--feed-dir`; only external subscriptions use `fetch`/HTTP (or a local fixture path in tests).
- **Symmetry matters:** `relativizeImages` must be the exact inverse of the producer's `rewriteImages`. The Task 8 round-trip gate is what proves it; if it fails, fix the regex pair — don't weaken the test.
- **Guardrail:** the materializer only ever writes under `--out` (`.feed-build/`). It must never write to `_labs/` etc. Task 11 Step 3 enforces this.
- **Line endings:** repo has `core.autocrlf=true` + `core.safecrlf=true`. If `git add`/`commit` errors with "LF would be replaced by CRLF", use `git -c core.safecrlf=false ...`.
- **Don't commit `.feed-build/`** — it's git-ignored.
