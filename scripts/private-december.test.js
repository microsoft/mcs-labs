const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const { labSourcePath } = require('./lab-files');
const { buildItem, selectFeedItems, selectItemDocs } = require('./build-feed');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const event = matter(read('_events/private-december.md'));
const agenda = yaml.load(read('_data/agendas/private-december.yml'));
const original = yaml.load(read('_data/agendas/architecture-bootcamp.yml'));

test('private delivery slots match the three-day timetable without gaps or overlaps', () => {
  const expected = [
    '09:00-09:30 09:30-10:00 10:00-10:15 10:15-10:30 10:30-11:15 11:15-11:45 11:45-12:00 12:00-12:30 12:30-13:30 13:30-14:00 14:00-14:30 14:30-14:45 14:45-15:15 15:15-15:45 15:45-16:00',
    '09:00-09:15 09:15-09:45 09:45-10:15 10:15-10:45 10:45-11:30 11:30-12:00 12:00-13:00 13:00-13:45 13:45-14:15 14:15-14:30 14:30-15:00 15:00-15:30 15:30-16:00 16:00-16:30 16:30-18:00',
    '09:00-09:30 09:30-10:15 10:15-10:30 10:30-11:00 11:00-11:30 11:30-12:00 12:00-12:30 12:30-13:30 13:30-14:00 14:00-14:30 14:30-14:45 14:45-15:15 15:15-15:45 15:45-16:15 16:15-16:30',
  ];
  const minutes = value => value.split(':').reduce((hours, mins) => Number(hours) * 60 + Number(mins));
  const days = [];
  for (const row of agenda.schedule) {
    if (row.type === 'day') days.push([]);
    else days.at(-1).push(row);
  }
  assert.equal(days.length, expected.length);
  for (const [index, rows] of days.entries()) {
    const slots = expected[index].split(' ');
    assert.equal(rows.length, slots.length);
    for (const [position, row] of rows.entries()) {
      const [start, end] = slots[position].split('-');
      assert.equal(row.time, start);
      assert.equal(row.duration, minutes(end) - minutes(start));
      if (position) {
        const previous = rows[position - 1];
        assert.equal(minutes(row.time), minutes(previous.time) + previous.duration);
      }
    }
  }
});

test('private event retains guided lab identities, numbering and valid companion links', () => {
  const labs = agenda.schedule.filter(row => row.type === 'lab');
  const expectedLabs = original.schedule.filter(row => row.type === 'lab' && row.label !== 'Lab 5');
  assert.deepEqual(labs.map(({ slug, label }) => ({ slug, label })),
    expectedLabs.map(({ slug, label }) => ({ slug, label })));
  assert.deepEqual(event.data.labs, labs.map(({ slug, label }) => ({ slug, label })));
  assert.equal(labs.length, 10);
  for (const lab of labs) {
    const page = matter(fs.readFileSync(labSourcePath(root, lab.slug), 'utf8')).data;
    assert.equal(page.lab_format, 'missions', lab.slug);
    assert.ok(fs.existsSync(path.join(root, 'labs', lab.slug, 'README.md')));
  }
  for (const row of agenda.schedule.filter(row => row.type === 'module')) {
    assert.ok(fs.existsSync(path.join(root, '_modules', `${row.slug}.md`)));
    if (row.companion_lab) {
      assert.equal(row.lab, false);
      assert.ok(labs.some(lab => lab.slug === row.companion_lab));
    }
  }
  const parts = agenda.schedule.filter(row => row.slug === 'harnesses-and-component-models-latest');
  assert.equal(parts.length, 2);
  assert.equal(parts.reduce((sum, row) => sum + row.duration, 0), 60);
  const workflows = labs.find(row => row.slug === 'workflows-autonomous');
  assert.equal(workflows.duration, 30);
  assert.equal(original.schedule.find(row => row.slug === workflows.slug).duration, 45);
});

test('private module labels close the omitted module gap without changing curriculum links', () => {
  const modules = agenda.schedule.filter(row => row.type === 'module');
  const source = original.schedule.filter(row => row.type === 'module' && row.label !== 'Module 5');
  assert.deepEqual([...new Set(modules.map(row => row.slug))], source.map(row => row.slug));
  for (const [index, row] of source.entries()) {
    const delivered = modules.filter(module => module.slug === row.slug);
    const expected = index + 1;
    assert.deepEqual(delivered.map(module => module.label),
      delivered.length === 2
        ? [`Module ${expected} (Part 1)`, `Module ${expected} (Part 2)`]
        : [`Module ${expected}`]);
  }
});

test('private event remains directly publishable but excluded from discovery feeds', () => {
  assert.equal(agenda.event_id, event.data.event_id);
  assert.equal(event.data.unlisted, true);
  assert.equal(event.data.search, false);
  assert.equal(event.data.sitemap, false);
  assert.notEqual(event.data.latest, true);
  const item = buildItem({
    collection: 'events', slug: 'private-december', frontMatter: event.data,
    body: event.content, baseUrl: 'https://example.test/mcs-labs',
  });
  assert.deepEqual(selectFeedItems([item], { collections: ['events'], include: [], exclude: [] }), []);
  assert.deepEqual(selectItemDocs([item], {}), [item]);
  for (const row of agenda.schedule) {
    for (const key of ['speaker', 'assignment', 'email', 'comments']) assert.equal(row[key], undefined);
  }
  assert.doesNotMatch(event.content + JSON.stringify(agenda), /\bCFO\b|[\w.+-]+@[\w.-]+/i);
});
