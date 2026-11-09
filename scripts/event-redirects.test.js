const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { labSourcePath } = require('./lab-files');

const root = path.resolve(__dirname, '..');
const legacyId = 'bootcamp-v3';
const currentId = 'bootcamp-latest';
const storageKey = 'mcs-labs.event-context.v1';
const aliases = yaml.load(fs.readFileSync(path.join(root, '_data', 'event-aliases.yml'), 'utf8'));

function documentData(folder, slug) {
  const file = folder === '_labs' ? labSourcePath(root, slug) : path.join(root, folder, `${slug}.md`);
  return matter(fs.readFileSync(file, 'utf8')).data;
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
    ['_events', 'architecture-bootcamp'],
    ['_workshops', 'agent-in-a-day-v3'],
    ['_workshops', 'ghcp-in-a-day'],
  ].map(([folder, slug]) => {
    const event = documentData(folder, slug);
    const agenda = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', `${slug}.yml`), 'utf8'));
    return {
      event_id: event.event_id,
      title: event.title,
      kind: folder === '_events' ? 'event' : 'workshop',
      unlisted: event.unlisted === true,
      url: `${baseurl}/${folder === '_events' ? 'events' : 'workshops'}/${slug}/`,
      schedule: agenda.schedule.map((row) => {
        if (!['module', 'lab'].includes(row.type)) return { ...row };
        const collection = row.type === 'module' ? 'modules' : 'labs';
        const metadata = documentData(`_${collection}`, row.slug);
        const item = { ...row, title: row.title || metadata.title, url: `${baseurl}/${collection}/${row.slug}/` };
        if (row.type === 'module' && row.companion_lab !== false) {
          const companionSlug = row.companion_lab || metadata.lab;
          if (companionSlug) {
            const lab = documentData('_labs', companionSlug);
            const labRow = agenda.schedule.find(entry => entry.type === 'lab' && entry.slug === companionSlug);
            item.companion_lab = {
              slug: companionSlug, title: lab.title, description: lab.description,
              url: `${baseurl}/labs/${companionSlug}/`,
              difficulty: lab.difficulty, duration: labRow?.duration || lab.duration,
            };
          }
        }
        if (row.slides && row.slides.startsWith('/')) item.slides = baseurl + row.slides;
        return item;
      }),
    };
  });
}

function element() {
  const attributes = new Map();
  const listeners = {};
  return {
    hidden: true,
    children: [],
    classList: { add() {} },
    appendChild(child) { this.children.push(child); },
    setAttribute(name, value) { attributes.set(name, value); },
    getAttribute(name) { return attributes.get(name); },
    removeAttribute(name) { attributes.delete(name); },
    listeners,
    addEventListener(name, callback) { listeners[name] = callback; },
    querySelector() { return null; },
  };
}

function moduleLabElement() {
  const section = element();
  section.hidden = false;
  const fields = Object.fromEntries([
    '.mod-lab-card', '.mod-lab-title', '.mod-lab-desc',
    '[data-module-lab-level]', '[data-module-lab-level-text]', '[data-module-lab-duration]', '[data-module-lab-minutes]',
  ].map(selector => [selector, element()]));
  fields['.mod-lab-card'].href = '/labs/original/';
  fields['.mod-lab-title'].textContent = 'Original companion';
  fields['.mod-lab-desc'].textContent = 'Original description';
  section.querySelector = selector => fields[selector] || null;
  section.cloneNode = () => {
    const clone = moduleLabElement();
    clone.hidden = section.hidden;
    for (const [selector, field] of Object.entries(fields)) {
      Object.assign(clone.querySelector(selector), field);
    }
    return clone;
  };
  return section;
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
  let moduleLab = type === 'module' ? moduleLabElement() : null;
  if (moduleLab) moduleLab.parentNode = {
    replaceChild(replacement) { moduleLab = replacement; },
  };
  const document = {
    documentElement: { dataset: {} },
    getElementById(id) { return nodes[id] || null; },
    querySelector(selector) {
      if (selector === 'a.mod-button[download]') return download;
      return selector === '.mod-lab' ? moduleLab : null;
    },
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
      removeItem(key) {
        if (blockedStorage) throw new Error('Storage disabled');
        storage.delete(key);
      },
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
        assert.equal(result.storage.get(storageKey), currentId, 'The listed classic event remains sticky');
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
  assert.equal(result.storage.get(storageKey), currentId, 'The listed classic event remains sticky');
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

test('saved legacy context resolves to the listed classic event', () => {
  const result = runNavigation({ slug: 'standard-harness', query: '', sticky: legacyId });
  assert.equal(result.redirects.length, 0);
  assert.equal(result.historyUpdates.length, 0);
  assert.equal(result.storage.get(storageKey), currentId);
  assert.equal(result.document.documentElement.dataset.eventContext, currentId);
  assert.equal(result.nodes['event-rail'].hidden, false);
});

test('saved legacy context is cleared when its destination is unlisted', () => {
  const events = eventFixtures('/mcs-labs');
  events.find(event => event.event_id === currentId).unlisted = true;
  const result = runNavigation({ slug: 'standard-harness', query: '', sticky: legacyId, events });
  assert.equal(result.storage.get(storageKey), undefined);
  assert.equal(result.document.documentElement.dataset.eventContext, undefined);
  assert.equal(result.nodes['event-rail'].hidden, true);
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

test('module companion cards use the active Bootcamp edition at root and project base URLs', () => {
  for (const baseurl of ['', '/mcs-labs']) {
    for (const eventId of ['architecture-bootcamp', currentId]) {
      const event = eventFixtures(baseurl).find(item => item.event_id === eventId);
      for (const row of event.schedule.filter(item => item.type === 'module' && item.companion_lab)) {
        const result = runNavigation({ slug: row.slug, baseurl, query: `event=${eventId}` });
        const section = result.document.querySelector('.mod-lab');
        const href = new URL(section.querySelector('.mod-lab-card').href);
        assert.equal(href.pathname, `${baseurl}/labs/${row.companion_lab.slug}/`);
        assert.equal(href.searchParams.get('event'), eventId);
        assert.equal(section.querySelector('.mod-lab-title').textContent, row.companion_lab.title);
        assert.equal(section.querySelector('[data-module-lab-minutes]').textContent, row.companion_lab.duration);
        assert.equal(section.hidden, false);
        assert.equal(result.errors.length, 0);
      }
    }
  }
});

test('an explicitly absent companion is hidden only inside the event', () => {
  const styles = fs.readFileSync(path.join(root, 'assets', 'css', 'main.scss'), 'utf8');
  assert.match(styles, /\.mod-lab\[hidden\]\s*\{\s*display:\s*none\s*;\s*\}/,
    'The hidden companion section must override the theme section display rule.');
  const result = runNavigation({
    slug: 'harnesses-and-component-models-latest', query: 'event=architecture-bootcamp',
  });
  assert.equal(result.document.querySelector('.mod-lab').hidden, true);
  result.nodes['event-rail-exit'].listeners.click();
  assert.equal(result.document.querySelector('.mod-lab').hidden, false);
  assert.equal(result.document.querySelector('.mod-lab').querySelector('.mod-lab-title').textContent, 'Original companion');
  assert.equal(result.location.searchParams.has('event'), false);
});

test('Exit restores the standalone companion without leaving a modern-event URL behind', () => {
  const result = runNavigation({ slug: 'standard-harness', query: 'event=architecture-bootcamp' });
  assert.equal(result.storage.get(storageKey), 'architecture-bootcamp');
  result.nodes['event-rail-exit'].listeners.click();
  const section = result.document.querySelector('.mod-lab');
  assert.equal(section.querySelector('.mod-lab-card').href, '/labs/original/');
  assert.equal(section.querySelector('.mod-lab-title').textContent, 'Original companion');
  assert.equal(section.querySelector('.mod-lab-desc').textContent, 'Original description');
  assert.equal(result.storage.has(storageKey), false);
});

test('both listed Bootcamp editions retain their own saved context', () => {
  for (const eventId of ['architecture-bootcamp', currentId]) {
    const result = runNavigation({ slug: 'standard-harness', query: '', sticky: eventId });
    assert.equal(result.document.documentElement.dataset.eventContext, eventId);
    assert.equal(result.storage.get(storageKey), eventId);
    assert.equal(result.nodes['event-rail'].hidden, false);
  }
});

test('an unlisted event still requires an explicit URL and is never remembered', () => {
  const events = eventFixtures('/mcs-labs');
  events.find(event => event.event_id === currentId).unlisted = true;
  const classic = runNavigation({ slug: 'standard-harness', query: '', sticky: currentId, events });
  assert.equal(classic.nodes['event-rail'].hidden, true);
  assert.equal(classic.storage.has(storageKey), false);
  assert.equal(classic.document.querySelector('.mod-lab').querySelector('.mod-lab-title').textContent, 'Original companion');
  const explicit = runNavigation({ slug: 'standard-harness', query: `event=${currentId}`, events });
  assert.equal(explicit.nodes['event-rail'].hidden, false);
  assert.equal(explicit.storage.has(storageKey), false);
});

test('invalid companion metadata fails closed instead of linking a different edition', () => {
  for (const companion of [null, { title: 'Bad link', url: 'https://other.example/lab' },
    { title: 'Bad link', url: 'javascript:alert(1)' }, { url: '/labs/example/' }]) {
    const events = eventFixtures('/mcs-labs');
    const event = events.find(item => item.event_id === 'architecture-bootcamp');
    event.schedule.find(item => item.slug === 'standard-harness').companion_lab = companion;
    const result = runNavigation({ slug: 'standard-harness', query: 'event=architecture-bootcamp', events });
    assert.equal(result.document.querySelector('.mod-lab').hidden, true);
    assert.equal(result.errors.length, 1);
  }
});
