const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const agenda = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', 'ghcp-in-a-day.yml'), 'utf8'));
const workshop = readDocument('_workshops', 'ghcp-in-a-day');

function readDocument(folder, slug) {
  return matter(fs.readFileSync(path.join(root, folder, `${slug}.md`), 'utf8'));
}

test('GHCP workshop agenda titles match module pages and both lab copies', () => {
  for (const item of agenda.schedule.filter((entry) => ['module', 'lab'].includes(entry.type))) {
    const document = readDocument(item.type === 'module' ? '_modules' : '_labs', item.slug);
    assert.equal(item.title, document.data.title, `${item.label}: agenda and page title`);
    if (item.type !== 'lab') continue;

    const readme = fs.readFileSync(path.join(root, 'labs', item.slug, 'README.md'), 'utf8');
    assert.equal(document.content.match(/^# (.+)$/m)?.[1], item.title, `${item.label}: site heading`);
    assert.equal(readme.match(/^# (.+)$/m)?.[1], item.title, `${item.label}: GitHub heading`);
  }
});

test('GHCP workshop module lab cards, decks, and lab list match its agenda', () => {
  for (const [index, item] of agenda.schedule.entries()) {
    if (item.type !== 'module') continue;
    const module = readDocument('_modules', item.slug).data;
    const next = agenda.schedule[index + 1];
    if (next?.type === 'lab') {
      assert.equal(module.lab, next.slug, `${item.label}: associated lab`);
    }
    if (item.slug !== 'workflows') {
      assert.equal(item.slides, module.slides, `${item.label}: dedicated workshop slide deck`);
    }
    if (item.slides.startsWith('https://')) {
      assert.ok(new URL(item.slides).hostname, `${item.label}: external slide deck URL is valid`);
    } else {
      assert.ok(fs.existsSync(path.join(root, decodeURIComponent(item.slides).replace(/^\//, ''))),
        `${item.label}: slide deck exists`);
    }
  }

  assert.deepEqual(workshop.data.labs, agenda.schedule
    .filter((item) => item.type === 'lab')
    .map(({ slug, label }) => ({ slug, label })));
});

test('dedicated workshop modules preserve shared module and lab associations', () => {
  for (const [slug, lab] of [
    ['cowork', 'cowork-hands-on'],
    ['github-copilot-harness', 'mcs-github-harness'],
    ['instructions-and-descriptions', 'mcs-instructions'],
    ['agent-skills', 'mcs-skills'],
  ]) {
    assert.equal(readDocument('_modules', slug).data.lab, lab);
  }

  assert.equal(readDocument('_labs', 'mcs-github-harness').data.module, 'github-copilot-harness');
  for (const [slug, module] of [
    ['cowork-plugins-hands-on', 'ghcp-in-a-day-cowork'],
    ['mcs-skills-authoring', 'instructions-skills-runtime-and-sandbox'],
    ['mcs-hooks', 'metadata-and-hooks-deep-dive'],
  ]) {
    assert.equal(readDocument('_labs', slug).data.module, module);
    assert.equal(readDocument('_modules', module).data.lab, slug);
  }
});
