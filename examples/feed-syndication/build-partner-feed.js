'use strict';

/*
 * Generates a static "Contoso Copilot Labs" content feed — a stand-in for a
 * *second* mcs-labs-style portal that this portal can syndicate from. The output
 * is the same on-the-wire shape that scripts/build-feed.js emits (schema 1.1), so
 * the real scripts/consume-feed.js can ingest it unmodified.
 *
 *   node examples/feed-syndication/build-partner-feed.js
 *     -> writes examples/feed-syndication/partner-feed/{index.json,<feed>/manifest.json,<feed>.json,items/...}
 *
 * The committed output under partner-feed/ is what the `partner` container serves;
 * you only need to re-run this if you change the sample items below.
 */

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const OUT = path.join(__dirname, 'partner-feed');
const BASE_URL = 'https://contoso.github.io/copilot-labs';
const SCHEMA_VERSION = '1.1';
const GENERATED = '2026-06-19T00:00:00.000Z'; // fixed so the committed feed is deterministic

const hash = (s) => 'sha256:' + crypto.createHash('sha256').update(String(s), 'utf8').digest('hex');

// --- Sample content: a small cross-collection set from the fictional partner ----
const SOURCE = [
  {
    collection: 'labs', slug: 'contoso-intro-to-agents',
    fm: { layout: 'lab', title: 'Contoso: Intro to Copilot Agents', order: 145, duration: 60, difficulty: 100, section: 'core_learning_path', description: 'Build your first declarative agent on the Contoso reference stack and ground it in a product catalog.' },
    body: `## Overview\n\nThis partner lab from **Contoso Copilot Labs** walks you through building your\nfirst declarative agent and grounding it in the Contoso product catalog.\n\n## What you'll build\n\n- A declarative agent with a focused set of instructions\n- A knowledge source over the Contoso catalog\n- A tested conversation starter\n\n## Steps\n\n1. Create a new agent in Copilot Studio.\n2. Add the catalog knowledge source.\n3. Add three conversation starters and test them.\n\n> Syndicated from Contoso Copilot Labs via the content feed.`,
  },
  {
    collection: 'labs', slug: 'contoso-agent-governance',
    fm: { layout: 'lab', title: 'Contoso: Agent Governance & DLP', order: 520, duration: 90, difficulty: 300, section: 'advanced_labs', description: 'Apply DLP policies, environment routing, and governance guardrails to agents at Contoso scale.' },
    body: `## Overview\n\nA 300-level partner lab covering governance: data-loss-prevention policies,\nenvironment strategy, and guardrails for agents deployed across a large tenant.\n\n## Topics\n\n- DLP policy zones\n- Managed environments and routing\n- Audit and monitoring\n\n> Syndicated from Contoso Copilot Labs via the content feed.`,
  },
  {
    collection: 'events', slug: 'contoso-agent-day',
    fm: { title: 'Contoso Agent Day', event_id: 'contoso-agent-day', order: 9,
      description: 'A one-day Contoso-hosted event pairing two hands-on agent labs with architecture guidance.',
      labs: [ { slug: 'contoso-intro-to-agents', label: 'Lab 1' }, { slug: 'contoso-agent-governance', label: 'Lab 2' } ] },
    body: `## Contoso Agent Day\n\nA one-day partner event. Attendees complete two hands-on labs and leave with a\nreference architecture for agents in regulated environments.\n\n> Syndicated from Contoso Copilot Labs via the content feed.`,
  },
  {
    collection: 'workshops', slug: 'contoso-partner-workshop',
    fm: { title: 'Contoso Partner Enablement Workshop', event_id: 'contoso-partner-workshop', order: 9,
      description: 'A full-day partner enablement workshop covering agent design, governance, and ALM on the Contoso stack.',
      labs: [ { slug: 'contoso-intro-to-agents', label: 'Lab 1' }, { slug: 'contoso-agent-governance', label: 'Lab 2' } ] },
    body: `## Contoso Partner Enablement Workshop\n\nA full-day workshop for Contoso partners covering agent design, governance, and\napplication lifecycle management.\n\n> Syndicated from Contoso Copilot Labs via the content feed.`,
  },
  {
    collection: 'modules', slug: 'contoso-responsible-ai',
    fm: { layout: 'module', title: 'Contoso: Responsible AI for Agents', order: 1200, duration: 30, difficulty: 200, section: 'specialized_modules', description: 'A short module on Responsible AI practices applied to Copilot agents.' },
    body: `## Responsible AI for Agents\n\nA short partner module on Responsible AI: transparency, grounding, evaluation,\nand human oversight for production agents.\n\n> Syndicated from Contoso Copilot Labs via the content feed.`,
  },
];

function deriveReferences(collection, fm) {
  if (collection === 'events' || collection === 'workshops') {
    const list = Array.isArray(fm.labs) ? fm.labs : [];
    return { labs: list.map((l) => (typeof l === 'string' ? l : l && l.slug)).filter(Boolean) };
  }
  if (collection === 'modules') return { labs: fm.lab ? [fm.lab] : [] };
  return { labs: [] };
}

function buildItem(src) {
  const metadata = { ...src.fm };
  delete metadata.layout;
  return {
    collection: src.collection,
    slug: src.slug,
    title: src.fm.title || src.slug,
    description: src.fm.description || '',
    url: `${BASE_URL}/${src.collection}/${src.slug}/`,
    content_url: `${BASE_URL}/feed/items/${src.collection}/${src.slug}.json`,
    metadata,
    references: deriveReferences(src.collection, src.fm),
    content_markdown: src.body,
    images: [],
    last_modified: GENERATED,
    content_hash: hash(src.body),
  };
}

const lightItem = (item) => {
  const { content_markdown, images, metadata, ...light } = item;
  return light;
};

// Two published feeds, to demonstrate PRODUCER-side filtering:
//   all          -> every collection (the partner publishes everything)
//   labs-events  -> only labs + events (the partner deliberately limits what goes out)
const FEEDS = {
  all: { name: 'all', title: 'Contoso Copilot Labs — All Content', description: 'All labs, events, workshops, and modules', collections: ['labs', 'events', 'workshops', 'modules'] },
  'labs-events': { name: 'labs-events', title: 'Contoso — Labs & Events', description: 'Labs and events only (workshops and modules withheld)', collections: ['labs', 'events'] },
};

const items = SOURCE.map(buildItem);
const write = (rel, obj) => {
  const full = path.join(OUT, rel);
  fs.mkdirSync(path.dirname(full), { recursive: true });
  fs.writeFileSync(full, JSON.stringify(obj, null, 2));
};

fs.rmSync(OUT, { recursive: true, force: true });

// Per-item documents (deduped across feeds — written once each).
for (const item of items) {
  write(`items/${item.collection}/${item.slug}.json`, { schema_version: SCHEMA_VERSION, generated: GENERATED, site: { base_url: BASE_URL }, item });
}

// Per-feed manifest + bundle + the discovery index.
const indexFeeds = [];
for (const def of Object.values(FEEDS)) {
  const members = items.filter((it) => def.collections.includes(it.collection));
  write(`${def.name}/manifest.json`, { schema_version: SCHEMA_VERSION, generated: GENERATED, feed: { name: def.name, title: def.title, description: def.description }, site: { base_url: BASE_URL }, items: members.map(lightItem) });
  write(`${def.name}.json`, { schema_version: SCHEMA_VERSION, generated: GENERATED, feed: { name: def.name, title: def.title, description: def.description }, site: { base_url: BASE_URL }, items: members });
  indexFeeds.push({ name: def.name, title: def.title, description: def.description, manifest_url: `${BASE_URL}/feed/${def.name}/manifest.json`, bundle_url: `${BASE_URL}/feed/${def.name}.json`, item_count: members.length });
}
write('index.json', { schema_version: SCHEMA_VERSION, generated: GENERATED, site: { title: 'Contoso Copilot Labs', base_url: BASE_URL }, feeds: indexFeeds });

console.log(`[build-partner-feed] wrote ${items.length} items + ${indexFeeds.length} feeds to ${path.relative(process.cwd(), OUT)}`);
