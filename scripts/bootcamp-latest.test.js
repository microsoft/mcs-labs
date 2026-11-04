const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const eventId = 'bootcamp-latest';
const retiredId = 'bootcamp-v3';

function readDocument(folder, slug) {
  return matter(fs.readFileSync(path.join(root, folder, `${slug}.md`), 'utf8'));
}

function readAgenda(slug = eventId) {
  return yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', `${slug}.yml`), 'utf8'));
}

test('Bootcamp Latest canonical filenames and event identities agree', () => {
  for (const [folder, filename] of [
    ['_events', `${eventId}.md`],
    [path.join('_data', 'agendas'), `${eventId}.yml`],
    ['presentations', eventId],
  ]) {
    assert.ok(fs.existsSync(path.join(root, folder, filename)), `${folder}: canonical path exists`);
    assert.equal(fs.existsSync(path.join(root, folder, filename.replace(eventId, retiredId))), false,
      `${folder}: retired path is absent`);
  }

  assert.equal(readDocument('_events', eventId).data.event_id, eventId);
  assert.equal(readAgenda().event_id, eventId);
  assert.equal(readDocument('_events', 'bootcamp').data.superseded_by, eventId);
  assert.equal(readDocument('_workshops', 'agent-in-a-day-v3').data.event_id, 'agent-in-a-day-v3');
  assert.equal(readAgenda('agent-in-a-day-v3').event_id, 'agent-in-a-day-v3');
});

test('Bootcamp Latest agenda matches modules and both copies of each lab', () => {
  const agenda = readAgenda();
  const modules = agenda.schedule.filter((item) => item.type === 'module');
  const labs = agenda.schedule.filter((item) => item.type === 'lab');
  const sharedLabs = new Set(['mcs-hooks', 'mcs-skills-authoring']);
  assert.ok(modules.length > 0 && labs.length > 0);

  for (const [items, type, folder] of [
    [modules, 'Module', '_modules'],
    [labs, 'Lab', '_labs'],
  ]) {
    for (const [index, item] of items.entries()) {
      const document = readDocument(folder, item.slug);
      assert.equal(item.label, `${type} ${index + 1}`, `${item.slug}: sequential label`);
      assert.equal(item.title, document.data.title, `${item.label}: title`);
      assert.equal(item.duration, sharedLabs.has(item.slug) ? 30 : document.data.duration,
        `${item.label}: duration`);
      if (type === 'Module') {
        if (labs.some((lab) => lab.slug === document.data.lab)) {
          assert.equal(item.lab, false, `${item.label}: explicit lab controls hero totals`);
        }
        continue;
      }

      const readme = fs.readFileSync(path.join(root, 'labs', item.slug, 'README.md'), 'utf8');
      assert.equal(document.content.match(/^# (.+)$/m)?.[1], item.title, `${item.label}: site heading`);
      assert.equal(readme.match(/^# (.+)$/m)?.[1], item.title, `${item.label}: GitHub heading`);
      if (document.data.module) {
        if (!sharedLabs.has(item.slug)) {
          assert.equal(item.slug, `mcs-${document.data.module}`, `${item.label}: lab naming`);
        }
        assert.equal(readDocument('_modules', document.data.module).data.lab, item.slug,
          `${item.label}: associated module`);
      } else {
        assert.equal(item.slug, 'mcs-copilot-code', 'Standalone lab naming');
      }
    }
  }

  assert.deepEqual(readDocument('_events', eventId).data.labs,
    labs.map(({ slug, label }) => ({ slug, label })));
});

test('Bootcamp Latest deck numbering and all local presentation references resolve', () => {
  const modules = readAgenda().schedule.filter((item) => item.type === 'module');
  for (const [index, item] of modules.entries()) {
    const slides = readDocument('_modules', item.slug).data.slides;
    assert.ok(slides.startsWith(`/presentations/${eventId}/`), `${item.label}: canonical deck folder`);
    const filename = decodeURIComponent(slides).split('/').pop();
    if (item.slug === 'copilot-agent-kit') {
      assert.equal(filename, 'Copilot Studio Kit.pptx', `${item.label}: existing kit deck`);
    } else {
      assert.ok(filename.startsWith(`M${String(index + 1).padStart(2, '0')}.`),
        `${item.label}: deck number`);
    }
  }

  const references = [];
  for (const filename of fs.readdirSync(path.join(root, '_modules')).filter((name) => name.endsWith('.md'))) {
    const module = readDocument('_modules', path.basename(filename, '.md')).data;
    if (module.slides) references.push([filename, module.slides]);
  }
  for (const filename of fs.readdirSync(path.join(root, '_data', 'agendas')).filter((name) => name.endsWith('.yml'))) {
    for (const item of readAgenda(path.basename(filename, '.yml')).schedule) {
      if (item.slides) references.push([`${filename}: ${item.label}`, item.slides]);
    }
  }
  for (const [source, slides] of references) {
    assert.ok(!slides.includes(retiredId), `${source}: no retired deck URL`);
    if (!slides.startsWith('/presentations/')) continue;
    const deck = path.join(root, ...decodeURIComponent(slides).slice(1).split('/'));
    assert.ok(fs.statSync(deck).isFile(), `${source}: deck exists`);
  }
});

test('Bootcamp Latest ends with Copilot Agent Kit and Q&A by 16:00', () => {
  const agenda = readAgenda();
  assert.equal(agenda.schedule.filter((item) => item.type === 'module').length, 17);
  assert.deepEqual(agenda.schedule.slice(-2), [
    { type: 'module', slug: 'copilot-agent-kit', label: 'Module 17',
      title: 'Copilot Agent Kit', time: '15:00', duration: 30 },
    { type: 'break', title: 'General Q&A', time: '15:30', duration: 30 },
  ]);
  const module = readDocument('_modules', 'copilot-agent-kit');
  assert.equal(module.data.duration, 30);
  assert.equal(module.data.lab, undefined);
  assert.equal(module.data.slides,
    '/presentations/bootcamp-latest/Copilot%20Studio%20Kit.pptx');
  const repositoryLink = module.content.match(/^- \[Copilot Agent Kit on GitHub\]\(([^)\s]+)\)$/m);
  assert.equal(repositoryLink?.[1], 'https://github.com/microsoft/Power-CAT-Copilot-Studio-Kit');
});

test('standalone module decks remain independent of Bootcamp Latest merges', () => {
  for (const [slug, filename] of [
    ['agent-skills', 'M06. Deep Dive - Skills.pptx'],
    ['creation-github-harness', 'M11. Creation GitHub Harness from UX and from Chat.pptx'],
    ['github-copilot-harness', 'M10. GitHub Copilot Harness Component Model.pptx'],
    ['instructions-and-descriptions', 'M05. Deep Dive - Instructions and Descriptions.pptx'],
  ]) {
    assert.equal(decodeURIComponent(readDocument('_modules', slug).data.slides),
      `/presentations/shared/${filename}`, `${slug}: preserved standalone deck`);
  }

  assert.equal(readDocument('_modules', 'multi-agent').data.slides,
    '/presentations/bootcamp/11.%20Multi%20Agent_CB.pptx', 'Original Bootcamp keeps its Multi-Agent deck');
});

test('Bootcamp Latest Skills pacing preserves the shared workshop lab duration', () => {
  const lab = readAgenda().schedule.find((item) => item.label === 'Lab 6');
  assert.equal(lab.slug, 'mcs-skills-authoring');
  assert.equal(lab.time, '11:30');
  assert.equal(lab.duration, 30);
  assert.equal(readDocument('_labs', 'mcs-skills-authoring').data.duration, 60);
  assert.equal(readDocument('_labs', 'mcs-skills-authoring').data.module,
    'instructions-skills-runtime-and-sandbox');
  assert.equal(readDocument('_modules', 'instructions-and-skills').data.lab, lab.slug);
});

test('Bootcamp Latest Hooks pacing preserves the shared workshop lab duration', () => {
  const lab = readAgenda().schedule.find((item) => item.label === 'Lab 7');
  assert.equal(lab.slug, 'mcs-hooks');
  assert.equal(lab.time, '13:45');
  assert.equal(lab.duration, 30);
  assert.equal(readDocument('_labs', 'mcs-hooks').data.duration, 45);
  assert.equal(readDocument('_labs', 'mcs-hooks').data.module, 'metadata-and-hooks-deep-dive');
});

test('Bootcamp Latest Workflows pacing preserves the shared workshop lab duration', () => {
  assert.equal(readDocument('_labs', 'mcs-workflows').data.duration, 45);
  assert.equal(readDocument('_labs', 'mcs-workflows-latest').data.duration, 30);
  assert.equal(readDocument('_modules', 'workflows').data.lab, 'mcs-workflows');
  assert.equal(readDocument('_modules', 'workflows-latest').data.lab, 'mcs-workflows-latest');
});

test('Bootcamp Latest source links do not reference the retired event or deck directory', () => {
  const sources = ['README.md', 'CHANGELOG.md', path.join('.github', 'copilot-instructions.md')];
  for (const folder of ['_events', '_workshops', '_modules', '_labs', path.join('_data', 'agendas'), 'docs']) {
    for (const filename of fs.readdirSync(path.join(root, folder))) {
      if (/\.(md|ya?ml)$/.test(filename)) sources.push(path.join(folder, filename));
    }
  }
  for (const directory of fs.readdirSync(path.join(root, 'labs'), { withFileTypes: true })) {
    if (!directory.isDirectory()) continue;
    const readme = path.join('labs', directory.name, 'README.md');
    if (fs.existsSync(path.join(root, readme))) sources.push(readme);
  }
  for (const source of sources) {
    assert.ok(!fs.readFileSync(path.join(root, source), 'utf8').includes(retiredId),
      `${source}: retired event ID, URL, or deck directory`);
  }
});
