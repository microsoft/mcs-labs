const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const event = slug => matter(read(path.join('_events', `${slug}.md`))).data;

test('the classic Architecture Bootcamp is discoverable with an event-specific ARCHIVED label', () => {
  const classic = event('bootcamp-latest');
  assert.equal(classic.title, 'Architecture Bootcamp');
  assert.equal(classic.event_id, 'bootcamp-latest');
  assert.equal(classic.deprecated, true);
  assert.equal(classic.deprecated_label, 'ARCHIVED');
  assert.equal(classic.superseded_by, 'architecture-bootcamp');
  assert.notEqual(classic.unlisted, true);
  assert.notEqual(classic.search, false);
  assert.notEqual(classic.sitemap, false);
  assert.equal(classic.labs.length, 11);

  const current = event(classic.superseded_by);
  assert.equal(current.title, 'Copilot & Agents Bootcamp');
  assert.equal(current.event_id, 'architecture-bootcamp');
  assert.notEqual(current.deprecated, true);
  assert.notEqual(current.unlisted, true);
  assert.notEqual(current.search, false);
  assert.notEqual(current.sitemap, false);
  assert.equal(current.labs.length, 11);
  assert.notDeepEqual(classic.labs, current.labs);
  assert.ok(current.order < classic.order, 'The guided curriculum remains the first listed edition');
  assert.match(classic.description, /use Copilot & Agents Bootcamp for the guided missions edition/);
  assert.match(read(path.join('_events', 'bootcamp-latest.md')), /\[Copilot & Agents Bootcamp\]\({{ '\/events\/architecture-bootcamp\/' \| relative_url }}\)/);
});

test('restoring the classic edition does not list the original or preview events', () => {
  for (const slug of ['bootcamp', 'bootcamp-preview']) {
    const hidden = event(slug);
    assert.equal(hidden.unlisted, true, slug);
    assert.equal(hidden.search, false, slug);
    assert.equal(hidden.sitemap, false, slug);
    assert.equal(hidden.deprecated_label, undefined, `${slug}: no unrelated badge override`);
  }
});

test('guided lab links use the current display name without changing the route', () => {
  for (const { slug } of event('architecture-bootcamp').labs) {
    if (slug === 'cowork-zava-sales') continue; // Shared lab has no event-specific introduction.
    for (const file of [path.join('_labs', `${slug}.md`), path.join('labs', slug, 'README.md')]) {
      assert.ok(read(file).includes('[Copilot & Agents Bootcamp](https://microsoft.github.io/mcs-labs/events/architecture-bootcamp/)'), file);
    }
  }
});

test('homepage and Events index retain listed deprecated events and label their cards', () => {
  for (const [file, variable, pillClass] of [
    ['index.md', 'event', 'journey-pill'],
    [path.join('events', 'index.md'), 'ws', 'ws-idx-pill'],
  ]) {
    const source = read(file);
    assert.match(source, /assign all_events = site\.events \| where_exp: "event", "event\.unlisted != true" \| sort: "order"/);
    assert.ok(source.includes(`{% if ${variable}.deprecated %}<span class="${pillClass} ws-idx-pill-deprecated">{{ ${variable}.deprecated_label | default: "Deprecated" }}</span>{% endif %}`));
  }
  const styles = read(path.join('assets', 'css', 'main.scss'));
  assert.match(styles, /\.journey-pill\.ws-idx-pill-deprecated,\s*\.ws-idx-pill\.ws-idx-pill-deprecated,\s*\.event-status-badge\s*\{[^}]*background: var\(--color-danger\);[^}]*color: var\(--color-on-danger\);[^}]*font-weight: 700;/);
});

test('the event header keeps the existing deprecation badge and successor lookup', () => {
  const layout = read(path.join('_layouts', 'event.html'));
  assert.match(layout, /if page\.deprecated[\s\S]*?assign successor = site\.events \| where: "event_id", page\.superseded_by \| first/);
  assert.match(layout, /{{ page\.deprecated_label \| default: "Deprecated" }}<\/span>/);
  assert.match(layout, /<span class="event-status-badge">{{ page\.deprecated_label/);
  assert.match(layout, /Superseded by <a href="{{ successor\.url \| relative_url }}"/);
});
