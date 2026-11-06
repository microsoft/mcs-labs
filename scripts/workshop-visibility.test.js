const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('all five external Agent Academy offerings remain listed with their current links', () => {
  const offerings = [
    ['recruit', 'https://aka.ms/agent-academy-recruit'],
    ['operative', 'https://aka.ms/agent-academy-operative'],
    ['commander', 'https://microsoft.github.io/agent-academy/commander/'],
    ['special-ops', 'https://microsoft.github.io/agent-academy/special-ops/'],
    ['cowork-collective', 'https://microsoft.github.io/agent-academy/cowork-collective/'],
  ];
  for (const [slug, url] of offerings) {
    const { data } = matter(read(`_workshops/agent-academy-${slug}.md`));
    assert.equal(data.event_id, `agent-academy-${slug}`);
    assert.equal(data.external, true);
    assert.equal(data.external_url, url);
    assert.equal(data.repository, 'microsoft/agent-academy');
    assert.notEqual(data.unlisted, true);
    assert.notEqual(data.search, false);
    assert.notEqual(data.sitemap, false);
  }
});

test('Academy descriptions distinguish ranked paths from independent missions', () => {
  for (const rank of ['recruit', 'operative']) {
    const { data } = matter(read(`_workshops/agent-academy-${rank}.md`));
    assert.match(data.description, /standard/);
    assert.match(data.description, /Microsoft Copilot harness/);
  }
  const commander = matter(read('_workshops/agent-academy-commander.md')).data.description;
  assert.match(commander, /third rank/);
  assert.doesNotMatch(commander, /coming soon/i);
  assert.match(matter(read('_workshops/agent-academy-special-ops.md')).data.description, /No rank completion is required/);
  assert.match(matter(read('_workshops/agent-academy-cowork-collective.md')).data.description, /independent of the Academy rank progression/);
});

test('workshop listings filter unlisted entries before counting or splitting them', () => {
  const homepage = read('index.md');
  const catalogue = read('workshops/index.md');
  const filteredAssignment = /assign all_workshops = site\.workshops \| where_exp: "ws", "ws\.unlisted != true" \| sort: "order"/;

  assert.match(homepage, filteredAssignment);
  assert.match(homepage, /{{ all_workshops\.size }}<\/strong><span>Workshops<\/span>/);
  assert.equal((homepage.match(/for ws in all_workshops/g) || []).length, 2);
  assert.match(catalogue, filteredAssignment);
  assert.match(catalogue, /assign internal_workshops = all_workshops \| where_exp:/);
  assert.match(catalogue, /assign external_workshops = all_workshops \| where:/);
});
