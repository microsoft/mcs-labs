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
