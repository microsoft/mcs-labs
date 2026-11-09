const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const slug = 'managed-apps-build';
const document = matter(fs.readFileSync(path.join(root, '_labs', `${slug}.md`), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'labs', slug, 'README.md'), 'utf8');
const missions = document.data.mission_lab.missions;
const steps = missions.flatMap(mission => mission.steps);
const prompts = steps.filter(step => step.prompt).map(step => step.prompt);
const classic = matter(fs.readFileSync(path.join(root, '_labs', 'mcs-managed-apps.md'), 'utf8'));
const classicReadme = fs.readFileSync(path.join(root, 'labs', 'mcs-managed-apps', 'README.md'), 'utf8');
const fences = text => [...text.matchAll(/```text\r?\n([\s\S]*?)\r?\n```/g)]
  .map(match => match[1].replace(/\r\n/g, '\n'));
const normalize = text => text.replace(/\r\n/g, '\n')
  .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
  .replace(/\]\(#[\uFE0F-]+/g, '](#').trim();
const step = title => steps.find(item => item.title === title)?.instruction ?? '';

test('managed apps portable copies and copyable prompts stay synchronized', () => {
  assert.equal(document.data.lab_format, 'missions');
  assert.equal(normalize(readme), normalize(document.content));
  for (const copy of [document.content, readme]) {
    const blocks = fences(copy);
    for (const prompt of prompts) assert.ok(blocks.includes(prompt), prompt.slice(0, 80));
  }
});

test('the upload gate separates the text-only proof question from a fresh upload', () => {
  // Live run: one message asking for proof and a new upload skipped the prose answer.
  for (const copy of [step('Approve only a confirmed missing CSV'), document.content, readme]) {
    assert.match(copy, /add "Don't request an upload yet" so Copilot answers in text/);
    assert.match(copy, /request a fresh fail-on-name-conflict upload in a separate message/);
  }
});

test('the folder step explains where the parent location is shown', () => {
  // Live run: the Create folder? card shows only an editable Name field.
  const modern = /The card shows only the folder name; check Copilot's message above it for the parent location\./;
  for (const copy of [step('Verify or create the dedicated folders'), document.content, readme]) {
    assert.match(copy, modern);
  }
  assert.notEqual(classic.data.lab_format, 'missions');
  const shared = /The prompt shows only the folder name; check Copilot's message above it for the parent location\./;
  for (const copy of [classic.content, classicReadme]) assert.match(copy, shared);
});

test('mission screenshots resolve to existing light and dark images', () => {
  for (const shot of steps.map(item => item.screenshot).filter(Boolean)) {
    for (const src of [shot.src, shot.src_dark]) {
      assert.ok(src, `${shot.title} needs light and dark images`);
      assert.ok(fs.existsSync(path.join(root, src)), src);
    }
  }
});
