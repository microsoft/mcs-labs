'use strict';

const yaml = require('js-yaml');

module.exports = {};

// Pure functions are appended below by subsequent tasks.
// The CLI entry (if require.main === module) is added last.

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

function itemPassesFilter(item, sub) {
  if (sub.exclude.slugs.includes(item.slug)) return false;
  if (sub.exclude.collections.includes(item.collection)) return false;
  return true;
}
module.exports.itemPassesFilter = itemPassesFilter;
