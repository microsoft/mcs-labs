'use strict';

const crypto = require('node:crypto');

const ALL_COLLECTIONS = ['events', 'workshops', 'modules', 'labs'];

module.exports = {};

function normalizeFeedDef(name, def = {}) {
  return {
    name,
    title: def.title || name,
    description: def.description || '',
    collections: [...(def.collections || [])],
    include: [...(def.include || [])],
    exclude: [...(def.exclude || [])],
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

// Pure functions are appended below by subsequent tasks.
// The CLI entry (if require.main === module) is added last.

function itemInFeed(item, feedDef) {
  if (feedDef.include.includes(item.slug)) return true;
  if (feedDef.collections.includes(item.collection) && !feedDef.exclude.includes(item.slug)) return true;
  return false;
}
module.exports.itemInFeed = itemInFeed;

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

function selectFeedItems(allItems, feedDef) {
  return orderItems(allItems.filter((it) => itemInFeed(it, feedDef)));
}
module.exports.selectFeedItems = selectFeedItems;
