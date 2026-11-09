'use strict';

const crypto = require('node:crypto');
const { sourceSlug } = require('./lab-files');

const ALL_COLLECTIONS = ['events', 'workshops', 'modules', 'labs'];
const SCHEMA_VERSION = '1.1';
const RESERVED_FEED_NAMES = new Set(['index', 'items']);

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
      bundle: obj.bundle,
    });
  }

  for (const [name, def] of Object.entries(raw.feeds || {})) {
    feeds[name] = normalizeFeedDef(name, def);
  }

  for (const name of Object.keys(feeds)) {
    if (RESERVED_FEED_NAMES.has(name)) {
      throw new Error(`[build-feed] feed name "${name}" is reserved (conflicts with feed/${name}.json or feed/items/)`);
    }
  }

  return { baseUrl, feeds };
}
module.exports.resolveConfig = resolveConfig;

function isUnlisted(item) {
  return item.metadata?.unlisted === true;
}
module.exports.isUnlisted = isUnlisted;

function itemInFeed(item, feedDef) {
  if (isUnlisted(item)) return false;
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

// Items that get a per-item document. The site's own build materializes every
// page from items/ (scripts/consume-feed.js reads the whole directory), so an
// unlisted page that is in no feed still needs one or it would 404 once
// deployed. It stays out of every manifest, bundle, and index count, and
// consumers only discover items through manifests.
function selectItemDocs(allItems, feedMembers) {
  const byKey = new Map();
  for (const item of [...Object.values(feedMembers).flat(), ...allItems.filter(isUnlisted)]) {
    byKey.set(`${item.collection}/${item.slug}`, item);
  }
  return [...byKey.values()];
}
module.exports.selectItemDocs = selectItemDocs;

// Lab-owned directories whose relative refs are absolutized for the feed. Feed
// consumers serve this markdown from their own origin, so a bare `images/x.png`
// or `assets/guide.pdf` would resolve against their site and 404. Bootcamp
// copies also reuse sibling labs' files via `../shared-lab/images/...`.
const OWN_DIRS = ['images', 'assets'];

function rewriteImages(markdown, baseUrl, collection, slug) {
  const base = `${baseUrl}/${collection}/${slug}`;
  const prefix = '(?:\\./|(?:\\.\\./)+(?:[^/\\s"\'()]+/)+)?';
  const images = new Set();
  let out = String(markdown == null ? '' : markdown);
  for (const dir of OWN_DIRS) {
    const abs = (rel) => {
      const url = rel.startsWith('../')
        ? new URL(rel, `${base}/`).href
        : `${base}/${rel.replace(/^\.\//, '')}`;
      // Only images/ feeds the manifest: assets/ holds the PDFs and solution
      // .zip files consumers link to rather than mirror, and `images` is part
      // of the published feed schema.
      if (dir === 'images') images.add(url);
      return url;
    };
    // dir is a fixed literal from OWN_DIRS, so it needs no escaping here.
    // Include sibling lab paths without duplicating their images or downloads.
    out = out.replace(new RegExp('\\]\\((' + prefix + dir + '/[^)\\s]+)', 'g'), (_m, rel) => `](${abs(rel)}`);
    out = out.replace(new RegExp('src="(' + prefix + dir + '/[^"]+)"', 'g'), (_m, rel) => `src="${abs(rel)}"`);
    // HTML src='<dir>/...'
    out = out.replace(new RegExp("src='(" + prefix + dir + "/[^']+)'", 'g'), (_m, rel) => `src='${abs(rel)}'`);
    // <picture><source srcset="..."> carries theme variants (e.g. a dark
    // screenshot). Rewrite every candidate URL, keeping width/density descriptors.
    const candidate = new RegExp('(^\\s*|,\\s*)(' + prefix + dir + '/[^\\s,]+)', 'g');
    out = out.replace(/\bsrcset=(["'])([^"']*)\1/g, (_m, quote, value) =>
      `srcset=${quote}${value.replace(candidate, (_c, lead, rel) => `${lead}${abs(rel)}`)}${quote}`);
  }
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
      bundle_url: f.bundle ? `${baseUrl}/feed/${f.name}.json` : null,
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

  const cfgIdx = args.indexOf('--config');
  const configPath = cfgIdx >= 0 ? args[cfgIdx + 1] : '_data/feeds.yml';

  const readYaml = (rel) => {
    try {
      const full = path.isAbsolute(rel) ? rel : path.join(root, rel);
      return yaml.load(fs.readFileSync(full, 'utf8')) || {};
    } catch {
      return null;
    }
  };

  const cfgRaw = readYaml('_config.yml');
  if (cfgRaw === null) console.warn('[build-feed] could not read _config.yml; using default base URL');
  const cfg = cfgRaw || {};
  const defaultBaseUrl = `${cfg.url || ''}${cfg.baseurl || ''}`.replace(/\/+$/, '') || 'https://microsoft.github.io/mcs-labs';
  const siteTitle = cfg.title || 'Microsoft Copilot Agents Labs';

  let rawConfig = readYaml(configPath);
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
  const itemKeys = new Set();
  for (const collection of ALL_COLLECTIONS) {
    const dir = path.join(root, `_${collection}`);
    let files = [];
    try {
      files = fs.readdirSync(dir).filter((f) => f.endsWith('.md'));
    } catch {
      continue;
    }
    for (const file of files) {
      const full = path.join(dir, file);
      const parsed = matter(fs.readFileSync(full, 'utf8'));
      const slug = sourceSlug(collection, file, parsed.data);
      const key = `${collection}/${slug}`;
      if (itemKeys.has(key)) throw new Error(`Duplicate feed identity: ${key}`);
      itemKeys.add(key);
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

  // Share Jekyll's resolver so syndicated pages retain the source's deck-derived date.
  const datedItems = allItems.filter((item) => ['labs', 'modules'].includes(item.collection));
  if (datedItems.length) {
    const dates = JSON.parse(execFileSync('ruby', [path.join(__dirname, 'resolve-content-dates.rb')], {
      cwd: root,
      input: JSON.stringify(datedItems.map(({ collection, slug, metadata }) => ({ collection, slug, metadata }))),
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'inherit'],
    }));
    for (const item of datedItems) {
      const date = dates[`${item.collection}/${item.slug}`];
      if (date) item.metadata.content_last_updated = date;
    }
  }

  fs.mkdirSync(outDir, { recursive: true });
  const generated = new Date().toISOString();

  // Per-feed membership (computed once, reused for manifest + bundle + published set).
  const feedMembers = {};
  for (const feedDef of Object.values(resolved.feeds)) {
    feedMembers[feedDef.name] = selectFeedItems(allItems, feedDef);
  }

  // Per-item documents: every item published in ≥1 feed plus unlisted pages, written once (deduped).
  const itemDocs = selectItemDocs(allItems, feedMembers);
  for (const item of itemDocs) {
    const dir = path.join(outDir, 'items', item.collection);
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(
      path.join(dir, `${item.slug}.json`),
      JSON.stringify(buildPerItemDoc(item, { baseUrl: resolved.baseUrl, generated }), null, 2)
    );
  }
  console.log(`[build-feed] wrote ${itemDocs.length} per-item documents`);

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

    if (feedDef.bundle) {
      fs.writeFileSync(
        path.join(outDir, `${feedDef.name}.json`),
        JSON.stringify(buildFeedFile(feedDef, members, { baseUrl: resolved.baseUrl, generated }), null, 2)
      );
    }
    console.log(`[build-feed] wrote ${feedDef.name}/manifest.json (${members.length} items)${feedDef.bundle ? ' + bundle' : ' [no bundle]'}`);
  }

  const index = buildIndex(resolved, counts, { baseUrl: resolved.baseUrl, generated, siteTitle });
  fs.writeFileSync(path.join(outDir, 'index.json'), JSON.stringify(index, null, 2));
  console.log(`[build-feed] wrote index.json (${Object.keys(resolved.feeds).length} feeds) → ${outDir}`);
}
