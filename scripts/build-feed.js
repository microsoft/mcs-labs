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

function contentHash(content) {
  return 'sha256:' + crypto.createHash('sha256').update(String(content == null ? '' : content), 'utf8').digest('hex');
}
module.exports.contentHash = contentHash;

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
    content_hash: contentHash(markdown),
  };
}
module.exports.buildItem = buildItem;

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
