const test = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
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

test('contentHash: deterministic, prefixed, and content-sensitive', () => {
  const h1 = feed.contentHash('hello');
  const h2 = feed.contentHash('hello');
  const h3 = feed.contentHash('world');
  assert.equal(h1, h2);
  assert.notEqual(h1, h3);
  assert.match(h1, /^sha256:[0-9a-f]{64}$/);
});

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

test('buildFeedFile: wraps items with schema metadata', () => {
  const def = feed.resolveConfig({}).feeds.all;
  const out = feed.buildFeedFile(def, [{ slug: 'a' }], { baseUrl: 'https://x.test', generated: '2026-06-16T00:00:00Z' });
  assert.equal(out.schema_version, '1.1');
  assert.equal(out.generated, '2026-06-16T00:00:00Z');
  assert.deepEqual(out.feed, { name: 'all', title: 'MCS Labs — All Content', description: 'All modules, events, workshops, and labs' });
  assert.deepEqual(out.site, { base_url: 'https://x.test' });
  assert.equal(out.items.length, 1);
});

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

test('CLI: generates index.json and all.json from real collections', () => {
  let out;
  try {
    out = fs.mkdtempSync(path.join(os.tmpdir(), 'mcs-feed-'));
    execFileSync('node', ['scripts/build-feed.js', '--out', out], { cwd: process.cwd(), stdio: 'pipe' });

    const index = JSON.parse(fs.readFileSync(path.join(out, 'index.json'), 'utf8'));
    assert.equal(index.schema_version, '1.1');
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
  } finally {
    if (out) fs.rmSync(out, { recursive: true, force: true });
  }
});

test('buildItem: includes a content_url to the per-item feed document', () => {
  const item = feed.buildItem({
    collection: 'labs', slug: 'demo', frontMatter: { title: 'Demo' }, body: 'x',
    baseUrl: 'https://x.test/mcs-labs',
  });
  assert.equal(item.content_url, 'https://x.test/mcs-labs/feed/items/labs/demo.json');
});

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

test('buildPerItemDoc: wraps the full item in an envelope', () => {
  const full = feed.buildItem({ collection: 'labs', slug: 'd', frontMatter: { title: 'D' }, body: 'b', baseUrl: 'https://x.test' });
  const doc = feed.buildPerItemDoc(full, { baseUrl: 'https://x.test', generated: '2026-06-16T00:00:00Z' });
  assert.equal(doc.schema_version, '1.1');
  assert.deepEqual(doc.site, { base_url: 'https://x.test' });
  assert.equal(doc.item.slug, 'd');
  assert.equal(doc.item.content_markdown, 'b');
});

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
