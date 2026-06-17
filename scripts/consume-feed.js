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

function relativizeImages(markdown, ownBaseUrl, collection, slug) {
  const absPrefix = `${ownBaseUrl}/${collection}/${slug}/images/`;
  const escaped = absPrefix.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(escaped, 'g');
  return String(markdown == null ? '' : markdown).replace(re, 'images/');
}
module.exports.relativizeImages = relativizeImages;

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
      console.warn(`[consume-feed] could not read own base_url from ${feedDirArg}/index.json; using default`);
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
      for (const f of files) {
        const parsed = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
        if (parsed && parsed.item) out.push(parsed.item);
      }
    }
    return out;
  };

  // Safe collection/slug name guard (re-checked at write time below).
  const SAFE_NAME = /^[A-Za-z0-9_-]+$/;

  // external: read the subscription's manifest, then each per-item doc
  const readExternalItems = async (sub) => {
    const manifest = await readJson(joinBase(sub.url, `${sub.feed}/manifest.json`));
    const out = [];
    for (const mi of manifest.items) {
      if (!SAFE_NAME.test(mi.collection || '') || !SAFE_NAME.test(mi.slug || '')) {
        console.warn(`[consume-feed] skipping external item with unsafe collection/slug: ${mi.collection}/${mi.slug}`);
        continue;
      }
      const doc = await readJson(joinBase(sub.url, `items/${mi.collection}/${mi.slug}.json`));
      if (doc && doc.item) out.push(doc.item);
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
        if (sub.self) {
          console.error(`[consume-feed] FATAL: own feed could not be read (${err.message})`);
          process.exit(1);
        }
        console.warn(`[consume-feed] subscription "${sub.name}" failed: ${err.message}; skipping`);
        continue;
      }
      taggedLists.push({ source: sub.name, items: items.filter((it) => itemPassesFilter(it, sub)) });
    }

    const { items, collisions } = mergeItems(taggedLists);
    for (const c of collisions) console.warn(`[consume-feed] collision ${c.key}: dropped from "${c.droppedSource}" (own wins)`);

    for (const item of items) {
      if (!SAFE_NAME.test(item.collection || '') || !SAFE_NAME.test(item.slug || '')) {
        console.warn(`[consume-feed] skipping item with unsafe collection/slug: ${item.collection}/${item.slug}`);
        continue;
      }
      const dir = path.join(outDir, `_${item.collection}`);
      fs.mkdirSync(dir, { recursive: true });
      fs.writeFileSync(path.join(dir, `${item.slug}.md`), materializeDoc(item, ownBaseUrl));
    }
    console.log(`[consume-feed] materialized ${items.length} items into ${outDir}`);
  })();
}
