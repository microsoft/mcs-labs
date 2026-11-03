const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const legacyId = 'bootcamp-v3';
const currentId = 'bootcamp-latest';
const storageKey = 'mcs-labs.event-context.v1';
const aliases = yaml.load(fs.readFileSync(path.join(root, '_data', 'event-aliases.yml'), 'utf8'));

function documentData(folder, slug) {
  return matter(fs.readFileSync(path.join(root, folder, `${slug}.md`), 'utf8')).data;
}

function scriptFrom(filename) {
  const source = fs.readFileSync(path.join(root, filename), 'utf8');
  return source.match(/<script>([\s\S]*?)<\/script>/)[1];
}

const navigationScript = scriptFrom(path.join('_includes', 'event-nav', 'script.html'));
const redirectScript = scriptFrom(path.join('_layouts', 'redirect.html'));

function eventFixtures(baseurl) {
  return [
    ['_events', currentId],
    ['_workshops', 'agent-in-a-day-v3'],
    ['_workshops', 'ghcp-in-a-day'],
  ].map(([folder, slug]) => {
    const event = documentData(folder, slug);
    const agenda = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', `${slug}.yml`), 'utf8'));
    return {
      event_id: event.event_id,
      title: event.title,
      kind: folder === '_events' ? 'event' : 'workshop',
      url: `${baseurl}/${folder === '_events' ? 'events' : 'workshops'}/${slug}/`,
      schedule: agenda.schedule.map((row) => {
        if (!['module', 'lab'].includes(row.type)) return { ...row };
        const collection = row.type === 'module' ? 'modules' : 'labs';
        const metadata = documentData(`_${collection}`, row.slug);
        const item = { ...row, title: row.title || metadata.title, url: `${baseurl}/${collection}/${row.slug}/` };
        if (row.slides && row.slides.startsWith('/')) item.slides = baseurl + row.slides;
        return item;
      }),
    };
  });
}

function element() {
  const attributes = new Map();
  return {
    hidden: true,
    children: [],
    classList: { add() {} },
    appendChild(child) { this.children.push(child); },
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name); },
    removeAttribute(name) { attributes.delete(name); },
    addEventListener() {},
    querySelector() { return null; },
  };
}

function runNavigation({ type = 'module', slug, query = `event=${legacyId}`, baseurl = '/mcs-labs',
  sticky = null, aliasText = JSON.stringify(aliases), events = eventFixtures(baseurl), blockedStorage = false }) {
  const collection = type === 'module' ? 'modules' : 'labs';
  const location = new URL(`https://example.test${baseurl}/${collection}/${slug}/${query ? `?${query}` : ''}#module-title`);
  const redirects = [];
  const historyUpdates = [];
  const errors = [];
  const warnings = [];
  location.replace = (url) => redirects.push(url);
  const storage = new Map(sticky ? [[storageKey, sticky]] : []);
  const nodes = {};
  for (const id of ['event-rail', 'event-rail-event', 'event-rail-event-name', 'event-rail-position',
    'event-rail-prev', 'event-rail-next', 'event-rail-expand', 'event-rail-exit',
    'event-rail-agenda', 'event-rail-agenda-list']) nodes[id] = element();
  nodes['mcs-events-manifest'] = { textContent: JSON.stringify(events) };
  nodes['mcs-lab-context'] = { textContent: JSON.stringify({ type, slug, title: slug }) };
  if (aliasText !== null) nodes['mcs-event-aliases'] = { textContent: aliasText };
  const download = element();
  const document = {
    documentElement: { dataset: {} },
    getElementById(id) { return nodes[id] || null; },
    querySelector(selector) { return selector === 'a.mod-button[download]' ? download : null; },
    createElement() { return element(); },
    createDocumentFragment() { return element(); },
    addEventListener() {},
  };
  const history = {
    replaceState(_state, _title, url) {
      historyUpdates.push(url);
      location.href = url;
    },
  };
  vm.runInNewContext(navigationScript, {
    document, window: { location, history }, history, URL, URLSearchParams,
    sessionStorage: {
      getItem(key) { return storage.get(key) || null; },
      setItem(key, value) {
        if (blockedStorage) throw new Error('Storage disabled');
        storage.set(key, value);
      },
      removeItem(key) { storage.delete(key); },
    },
    console: { error(...args) { errors.push(args); }, warn(...args) { warnings.push(args); } },
  });
  return { location, redirects, historyUpdates, errors, warnings, storage, nodes, document, download };
}

function runPageRedirect(source, target) {
  const location = new URL(source);
  const redirects = [];
  const errors = [];
  location.replace = (url) => redirects.push(url);
  vm.runInNewContext(redirectScript, {
    document: { getElementById() { return { href: target }; } },
    window: { location }, URL,
    console: { error(...args) { errors.push(args); } },
  });
  return { redirects, errors };
}

test('legacy aliases resolve only to current scheduled modules and labs', () => {
  for (const [oldId, alias] of Object.entries(aliases)) {
    const agenda = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', `${alias.event_id}.yml`), 'utf8'));
    assert.notEqual(oldId, alias.event_id);
    assert.equal(documentData('_events', alias.event_id).event_id, alias.event_id);
    for (const [collection, type] of [['modules', 'module'], ['labs', 'lab']]) {
      for (const target of Object.values(alias[collection])) {
        assert.ok(agenda.schedule.some(row => row.type === type && row.slug === target), `${oldId}: scheduled ${type} ${target}`);
        assert.ok(documentData(`_${collection}`, target));
      }
    }
  }
});

test('compatibility routes are pages rather than duplicate collection documents', () => {
  const eventPage = matter(fs.readFileSync(path.join(root, 'events', `${legacyId}.html`), 'utf8')).data;
  const labPage = matter(fs.readFileSync(path.join(root, 'labs', 'standard-harness-component-model', 'index.html'), 'utf8')).data;
  assert.equal(eventPage.layout, 'redirect');
  assert.equal(eventPage.permalink, `/events/${legacyId}/`);
  assert.equal(eventPage.redirect_to, `/events/${currentId}/`);
  assert.equal(eventPage.sitemap, false);
  assert.equal(labPage.layout, 'redirect');
  assert.equal(labPage.permalink, '/labs/standard-harness-component-model/');
  assert.equal(labPage.redirect_to, '/labs/mcs-standard-harness/');
  assert.equal(labPage.sitemap, false);
  assert.equal(fs.existsSync(path.join(root, '_events', `${legacyId}.md`)), false);
  assert.equal(fs.existsSync(path.join(root, '_labs', 'standard-harness-component-model.md')), false);
  const layout = fs.readFileSync(path.join(root, '_layouts', 'redirect.html'), 'utf8');
  assert.match(layout, /<noscript>\s*<meta http-equiv="refresh"/);
  assert.match(layout, /rel="canonical"/);
});

test('page redirects preserve queries and anchors at root and project base URLs', () => {
  for (const baseurl of ['', '/mcs-labs']) {
    const source = `https://example.test${baseurl}/events/${legacyId}/?source=external&tag=one&tag=two#day-2`;
    const result = runPageRedirect(source, `https://example.test${baseurl}/events/${currentId}/`);
    const target = new URL(result.redirects[0]);
    assert.equal(target.pathname, `${baseurl}/events/${currentId}/`);
    assert.equal(target.search, new URL(source).search);
    assert.equal(target.hash, '#day-2');
    assert.equal(result.errors.length, 0);
  }
});

test('page redirects reject external, unsafe and self-referencing targets', () => {
  const source = `https://example.test/events/${legacyId}/?source=external#day-2`;
  for (const target of ['https://other.example/events/latest/', 'javascript:alert(1)', source]) {
    const result = runPageRedirect(source, target);
    assert.equal(result.redirects.length, 0);
    assert.equal(result.errors.length, 1);
  }
});

test('all renamed and merged context links resolve at root and project base URLs', () => {
  for (const baseurl of ['', '/mcs-labs']) {
    for (const [collection, type] of [['modules', 'module'], ['labs', 'lab']]) {
      for (const [slug, targetSlug] of Object.entries(aliases[legacyId][collection])) {
        const result = runNavigation({ type, slug, baseurl, query: `event=${legacyId}&source=external&tag=one&tag=two` });
        assert.equal(result.redirects.length, 1, slug);
        const target = new URL(result.redirects[0]);
        assert.equal(target.pathname, `${baseurl}/${collection}/${targetSlug}/`, slug);
        assert.equal(target.searchParams.get('event'), currentId);
        assert.equal(target.searchParams.get('source'), 'external');
        assert.deepEqual(target.searchParams.getAll('tag'), ['one', 'two']);
        assert.equal(target.hash, '#module-title');
        assert.equal(result.storage.get(storageKey), currentId);
        assert.equal(result.errors.length, 0);
      }
    }
  }
});

test('unchanged legacy items rewrite history and activate canonical navigation', () => {
  const result = runNavigation({ slug: 'standard-harness', query: `event=${legacyId}&source=external` });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.historyUpdates.length, 1);
  assert.equal(result.location.searchParams.get('event'), currentId);
  assert.equal(result.location.searchParams.get('source'), 'external');
  assert.equal(result.location.hash, '#module-title');
  assert.equal(result.document.documentElement.dataset.eventContext, currentId);
  assert.equal(result.nodes['event-rail'].hidden, false);
  assert.equal(result.storage.get(storageKey), currentId);
  assert.equal(result.errors.length, 0);
});

test('removed curriculum items land on the latest agenda', () => {
  for (const [type, slug] of [['module', 'github-copilot-harness'], ['module', 'creation-github-harness'],
    ['module', 'multi-agent'], ['lab', 'mcs-github-harness']]) {
    const result = runNavigation({ type, slug });
    const target = new URL(result.redirects[0]);
    assert.equal(target.pathname, `/mcs-labs/events/${currentId}/`);
    assert.equal(target.searchParams.get('event'), currentId);
    assert.equal(target.hash, '#module-title');
    assert.equal(result.errors.length, 0);
  }
});

test('other workshop contexts retain their rail and deck override', () => {
  const result = runNavigation({ slug: 'workflows', query: 'event=ghcp-in-a-day' });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.historyUpdates.length, 0);
  assert.equal(result.document.documentElement.dataset.eventContext, 'ghcp-in-a-day');
  assert.equal(result.download.href, '/mcs-labs/presentations/ghcp-in-a-day/Module%204%20-%20Workflows.pptx');
  assert.equal(result.errors.length, 0);
});

test('unknown and inherited-property event IDs do not trigger redirects', () => {
  for (const eventId of ['unknown-event', 'constructor', 'toString', '__proto__']) {
    const result = runNavigation({ slug: 'standard-harness', query: `event=${eventId}` });
    assert.equal(result.redirects.length, 0);
    assert.equal(result.historyUpdates.length, 0);
    assert.equal(result.nodes['event-rail'].hidden, true);
    assert.equal(result.errors.length, 0);
  }
});

test('canonical event links are not redirected again', () => {
  const result = runNavigation({ slug: 'standard-harness', query: `event=${currentId}` });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.historyUpdates.length, 0);
  assert.equal(result.document.documentElement.dataset.eventContext, currentId);
  assert.equal(result.errors.length, 0);
});

test('saved legacy context is normalized for an item still in the latest agenda', () => {
  const result = runNavigation({ slug: 'standard-harness', query: '', sticky: legacyId });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.historyUpdates.length, 0);
  assert.equal(result.storage.get(storageKey), currentId);
  assert.equal(result.document.documentElement.dataset.eventContext, currentId);
});

test('saved legacy context never redirects unrelated standalone pages', () => {
  const result = runNavigation({ slug: 'm365-copilot', query: '', sticky: legacyId });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.historyUpdates.length, 0);
  assert.equal(result.storage.has(storageKey), false);
  assert.equal(result.nodes['event-rail'].hidden, true);
});

test('legacy links still redirect when browser storage is disabled', () => {
  const result = runNavigation({ slug: 'm365-copilot', blockedStorage: true });
  assert.equal(result.redirects.length, 1);
  assert.equal(new URL(result.redirects[0]).searchParams.get('event'), currentId);
  assert.equal(result.warnings.length, 1);
  assert.equal(result.errors.length, 0);
});

test('malformed alias metadata reports an error instead of redirecting', () => {
  for (const aliasText of ['{', '[]', 'null']) {
    const result = runNavigation({ slug: 'm365-copilot', aliasText });
    assert.equal(result.redirects.length, 0);
    assert.equal(result.errors.length, 1);
  }
});

test('a configured missing destination reports an error rather than falling back', () => {
  const invalidAliases = JSON.parse(JSON.stringify(aliases));
  invalidAliases[legacyId].modules['m365-copilot'] = 'missing-module';
  const result = runNavigation({ slug: 'm365-copilot', aliasText: JSON.stringify(invalidAliases) });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.errors.length, 1);
});

test('legacy context redirects reject cross-origin item URLs', () => {
  const events = eventFixtures('/mcs-labs');
  events[0].schedule.find(row => row.slug === 'm365-copilot-latest').url = 'https://other.example/modules/m365/';
  const result = runNavigation({ slug: 'm365-copilot', events });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.errors.length, 1);
});

test('event navigation remains compatible with pages without alias metadata', () => {
  const result = runNavigation({ slug: 'standard-harness', query: 'event=agent-in-a-day-v3', aliasText: null });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.errors.length, 0);
});
