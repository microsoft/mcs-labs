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

test('itemPassesFilter: drops by slug or collection, default passes', () => {
  const sub = consume.resolveSubscriptions({ subscriptions: [{ url: 'x', exclude: { slugs: ['a'], collections: ['events'] } }] })[0];
  assert.equal(consume.itemPassesFilter({ collection: 'labs', slug: 'a' }, sub), false);
  assert.equal(consume.itemPassesFilter({ collection: 'events', slug: 'b' }, sub), false);
  assert.equal(consume.itemPassesFilter({ collection: 'labs', slug: 'b' }, sub), true);
  const open = consume.resolveSubscriptions({ subscriptions: [{ url: 'x' }] })[0];
  assert.equal(consume.itemPassesFilter({ collection: 'labs', slug: 'a' }, open), true);
});

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
