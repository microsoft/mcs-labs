const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const producer = require('./build-feed');
const consumer = require('./consume-feed');

const root = path.resolve(__dirname, '..');
const slug = 'cowork-zava-sales';
const document = matter(fs.readFileSync(path.join(root, '_labs', `${slug}.md`), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'labs', slug, 'README.md'), 'utf8');
const lab = document.data.mission_lab;
const prompts = lab.missions.flatMap(mission => mission.steps.filter(step => step.prompt).map(step => step.prompt));
const fencedPrompts = text => [...text.matchAll(/```text\r?\n([\s\S]*?)\r?\n```/g)].map(match => match[1].replace(/\r\n/g, '\n'));

test('Zava Sales preserves every supplied prompt verbatim in all reading surfaces', () => {
  // Independent fingerprints of the supplied prompts catch drift even if all copies change together.
  const expected = [
    'ed36c3912c4f5521b0c1e2fef39e125f19278fa6edc55906fb2a12775c507689',
    '162a6e7d7b8706342dd65b4e73f5eb7de3ed3ed25f602fc2f11f5b3765fe3041',
    '2283c90484539ef5e5dbe28224a6d0c330fa429f0518f6ca9f0064593d4f83a1',
    '8e6bccccae11603d1af43bc59819e732dfd48a018c9cca8ddd07766e75e34016',
    'bff231b662979cee80b6bca1b3d5c6b0d836c2353466b4ab3c67cde3bc0df6b6',
    '70c82d4e401571297182d281f7411f2d716014b34c73fb21fb0d6378d4590a42',
    '299be9288a8ed4f599ea0de653764c87f07dddf5c91fc2bf8d73da3d8a7312b5',
    '3e8f8f61fc032c4988caf18ffc1a29bd61ea40f478ab12679d4bc147d23d85a1',
    '8810ec18c154e5fb38210afe854a6f0230660df2a88771062b14c5943cb3c546',
    'f53b331abe5a626126cd76151b8dd28110d47d15ef56acc4cfb9fe87a470ba38',
  ];
  assert.equal(prompts.filter(prompt => prompt === '/cost').length, 1);
  assert.deepEqual(prompts.filter(prompt => prompt !== '/cost').map(prompt =>
    crypto.createHash('sha256').update(prompt).digest('hex')), expected);
  assert.deepEqual(fencedPrompts(document.content), prompts);
  assert.deepEqual(fencedPrompts(readme), prompts);
});

test('portable lab copies stay in sync apart from GitHub heading emojis and anchors', () => {
  const normalize = text => text.replace(/\r\n/g, '\n')
    .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
    .replace(/\]\(#-/g, '](#').trim();
  assert.equal(normalize(readme), normalize(document.content));
});

test('mission IDs, guided steps and knowledge checks have a complete authoring contract', () => {
  assert.equal(document.data.lab_format, 'missions');
  assert.equal(document.data.duration, 30);
  assert.equal(document.data.unlisted, undefined);
  assert.equal(lab.missions.length, 6);
  assert.equal(new Set(lab.missions.map(mission => mission.id)).size, lab.missions.length);
  assert.equal(lab.missions.filter(mission => !mission.optional).reduce((sum, mission) => sum + mission.minutes, 0), 30);
  assert.deepEqual(lab.missions.filter(mission => mission.optional).map(mission => mission.id), ['improve', 'specialize']);
  assert.ok(lab.missions.find(mission => mission.id === 'repeat').steps.some(step => step.prompt === '/cost'));
  for (const mission of lab.missions) {
    assert.match(mission.id, /^[a-z][a-z0-9-]*$/);
    for (const key of ['verb', 'title', 'tool', 'brief', 'outcome']) assert.ok(mission[key], `${mission.id}: ${key}`);
    assert.ok(mission.steps.length >= 2, `${mission.id}: guided steps`);
    assert.ok(mission.reveal.line && mission.reveal.explanation && mission.reveal.flow.length >= 2);
    assert.equal(mission.check.options.filter(option => option.correct === true).length, 1);
    for (const option of mission.check.options) assert.ok(option.text && option.feedback);
    for (const step of mission.steps) assert.ok(step.title && step.instruction);
  }
});

test('all mission screenshots exist and are discoverable by portable feed consumers', () => {
  const images = [lab.hero_image, ...lab.missions.flatMap(mission =>
    mission.steps.filter(step => step.screenshot).map(step => step.screenshot))];
  const feed = producer.buildItem({
    collection: 'labs', slug, frontMatter: document.data, body: document.content,
    baseUrl: 'https://microsoft.github.io/mcs-labs',
  });
  for (const image of images) {
    assert.ok(image.alt && image.caption);
    assert.ok(image.width > 0 && image.height > 0);
    assert.ok(image.src.startsWith(`/labs/${slug}/images/`));
    assert.ok(fs.statSync(path.join(root, ...image.src.split('/'))).isFile(), image.src);
    assert.ok(feed.images.includes(`https://microsoft.github.io/mcs-labs${image.src}`), `${image.src}: body reference`);
  }
});

test('feed materialization retains mission data, exact prompts and the readable body', () => {
  const item = producer.buildItem({
    collection: 'labs', slug, frontMatter: document.data, body: document.content,
    baseUrl: 'https://microsoft.github.io/mcs-labs',
  });
  assert.equal(item.metadata.layout, undefined);
  assert.deepEqual(item.metadata.mission_lab, lab);
  const materialized = matter(consumer.materializeDoc(item, 'https://microsoft.github.io/mcs-labs'));
  assert.equal(materialized.data.lab_format, 'missions');
  assert.deepEqual(materialized.data.mission_lab, lab);
  assert.deepEqual(fencedPrompts(materialized.content), prompts);
  const demoHubLink = materialized.content.match(/\[Cowork Demo Hub\]\(([^)]+)\)/);
  assert.equal(demoHubLink?.[1], 'https://aka.ms/CoworkDemoHub');
});

test('only Zava Sales opts into missions and the retired prototype is absent', () => {
  const missionLabs = fs.readdirSync(path.join(root, '_labs')).filter(filename =>
    filename.endsWith('.md') && matter(fs.readFileSync(path.join(root, '_labs', filename), 'utf8')).data.lab_format === 'missions');
  assert.deepEqual(missionLabs, [`${slug}.md`]);
  assert.equal(fs.existsSync(path.join(root, '_labs', 'mcs-cowork-preview.md')), false);
  assert.equal(fs.existsSync(path.join(root, 'labs', 'mcs-cowork-preview', 'README.md')), false);
  for (const filename of ['app.js', 'lab.js', 'styles.css', 'index.html']) {
    assert.equal(fs.existsSync(path.join(root, 'prototypes', 'lab-format-v2', filename)), false);
  }
  for (const folder of ['_labs', 'labs']) {
    const file = folder === '_labs' ? ['mcs-cowork-latest.md'] : ['mcs-cowork-latest', 'README.md'];
    assert.ok(fs.existsSync(path.join(root, folder, ...file)), 'Classic lab remains available');
  }
});

test('mission content is server rendered and enhanced without prototype controls', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  assert.match(template, /step\.prompt \| escape/);
  assert.match(template, /step\.instruction \| markdownify/);
  assert.match(template, /include event-nav\/nav-pair\.html/);
  assert.match(template, /include event-nav\/rail\.html/);
  assert.ok(template.indexOf('assign lab = page.mission_lab') > template.indexOf('include event-nav/manifest.html'),
    'The manifest assigns lab in the shared Liquid scope; restore mission data afterwards');
  assert.doesNotMatch(template, /data-mode|data-notes|Design notes|Explorer|window\.LAB|prototypes\//);
  assert.doesNotMatch(JSON.stringify(lab), /mock product|Fabrikam|Design notes|Explorer|45.minute/i);
});
