'use strict';

const crypto = require('node:crypto');

const ALL_COLLECTIONS = ['events', 'workshops', 'modules', 'labs'];
const SCHEMA_VERSION = '1.1';

module.exports = {};

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
  // Matches any relative ref into the lab's images/ dir (images and linked assets); absolutized so consumers can fetch them.
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
    content_url: `${baseUrl}/feed/items/${collection}/${slug}.json`,
    metadata,
    references: deriveReferences(collection, frontMatter),
    content_markdown: markdown,
    images,
    last_modified: lastModified,
    content_hash: contentHash(body),
  };
}
module.exports.buildItem = buildItem;

function buildFeedFile(feedDef, items, { baseUrl, generated }) {
  return {
    schema_version: SCHEMA_VERSION,
    generated,
    feed: { name: feedDef.name, title: feedDef.title, description: feedDef.description },
    site: { base_url: baseUrl },
    items,
  };
}
module.exports.buildFeedFile = buildFeedFile;

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

function buildPerItemDoc(item, { baseUrl, generated }) {
  return { schema_version: SCHEMA_VERSION, generated, site: { base_url: baseUrl }, item };
}
module.exports.buildPerItemDoc = buildPerItemDoc;

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
  const outArg = (outArgIdx >= 0 && args[outArgIdx + 1] !== undefined) ? args[outArgIdx + 1] : '_site/feed';
  if (outArgIdx >= 0 && args[outArgIdx + 1] === undefined) {
    console.error('[build-feed] --out requires a path argument');
    process.exit(1);
  }
  const outDir = path.isAbsolute(outArg) ? outArg : path.join(root, outArg);

  const readYaml = (rel) => {
    try {
      return yaml.load(fs.readFileSync(path.join(root, rel), 'utf8')) || {};
    } catch {
      return null;
    }
  };

  const cfgRaw = readYaml('_config.yml');
  if (cfgRaw === null) console.warn('[build-feed] could not read _config.yml; using default base URL');
  const cfg = cfgRaw || {};
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
