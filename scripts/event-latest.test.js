const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { buildItem } = require('./build-feed');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');

test('only the two selected current curricula opt into the latest badge', () => {
  const flagged = [];
  for (const collection of ['events', 'workshops']) {
    for (const file of fs.readdirSync(path.join(root, `_${collection}`)).filter(name => name.endsWith('.md'))) {
      const { data } = matter(read(path.join(`_${collection}`, file)));
      if (data.latest) {
        assert.notEqual(data.deprecated, true);
        assert.notEqual(data.unlisted, true);
        flagged.push(data.title);
      }
    }
  }
  assert.deepEqual(flagged.sort(), ['Copilot & Agents Bootcamp', 'Deep dive in modern agents']);
});

test('homepage and both collection indexes display latest only when not deprecated', () => {
  for (const [file, variable, pill] of [
    ['index.md', 'event', 'journey-pill'],
    ['index.md', 'ws', 'journey-pill'],
    ['events/index.md', 'ws', 'ws-idx-pill'],
    ['workshops/index.md', 'ws', 'ws-idx-pill'],
  ]) {
    assert.ok(read(file).includes(`{% if ${variable}.latest and ${variable}.deprecated != true %}<span class="${pill} ws-idx-pill-latest">LATEST</span>{% endif %}`), file);
  }
});

test('shared event and workshop headers give archived status precedence', () => {
  const layout = read('_layouts/event.html');
  assert.match(layout, /if page\.deprecated[\s\S]*elsif page\.latest[\s\S]*event-status-badge--latest">LATEST/);
  assert.equal(matter(read('_layouts/workshop.html')).data.layout, 'event');
  const styles = read('assets/css/main.scss');
  assert.match(styles, /\.journey-pill\.ws-idx-pill-latest,\s*\.ws-idx-pill\.ws-idx-pill-latest,\s*\.event-status-badge\.event-status-badge--latest\s*\{[^}]*var\(--color-success\)[^}]*var\(--color-on-success\)/);
});

test('syndication preserves the opt-in flag and stable curriculum identifiers', () => {
  for (const [collection, slug] of [['events', 'architecture-bootcamp'], ['workshops', 'ghcp-in-a-day']]) {
    const doc = matter(read(`_${collection}/${slug}.md`));
    const item = buildItem({ collection, slug, frontMatter: doc.data, body: doc.content, baseUrl: 'https://example.test' });
    assert.equal(item.metadata.latest, true);
    assert.equal(item.metadata.event_id, slug);
    assert.equal(item.url, `https://example.test/${collection}/${slug}/`);
  }
});
