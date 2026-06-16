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
