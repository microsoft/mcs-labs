const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const yaml = require('js-yaml');

const root = path.resolve(__dirname, '..');
const slug = 'customer-assist-agent';
const classicSlug = 'mcs-customer-conversation-harness';
const document = matter(fs.readFileSync(path.join(root, '_labs', `${slug}.md`), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'labs', slug, 'README.md'), 'utf8');
const classic = matter(fs.readFileSync(path.join(root, '_labs', `${classicSlug}.md`), 'utf8'));
const classicReadme = fs.readFileSync(path.join(root, 'labs', classicSlug, 'README.md'), 'utf8');
const lab = document.data.mission_lab;
const missions = lab.missions;
const steps = missions.flatMap(mission => mission.steps);
const prompts = steps.filter(step => step.prompt).map(step => step.prompt);
const step = title => steps.find(candidate => candidate.title === title);
const indentedBlocks = (text, language) => [...text.matchAll(
  /^([ \t]*)```([^\r\n`]*)\r?\n([\s\S]*?)^\1```[ \t]*$/gm)]
  .filter(([, , info]) => info.trim() === language)
  .map(([, indent, , block]) => block.replace(/\r?\n$/, '').split(/\r?\n/)
    .map(line => line.startsWith(indent) ? line.slice(indent.length) : line).join('\n'));
const normalize = text => text.replace(/\r\n/g, '\n')
  .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
  .replace(/\]\(#[\uFE0F-]+/g, '](#').trim();
const webpSize = file => {
  const bytes = fs.readFileSync(file);
  assert.equal(bytes.toString('ascii', 0, 4) + bytes.toString('ascii', 8, 12), 'RIFFWEBP', file);
  const chunk = bytes.toString('ascii', 12, 16);
  if (chunk === 'VP8X') return [1 + bytes.readUIntLE(24, 3), 1 + bytes.readUIntLE(27, 3)];
  if (chunk === 'VP8L') {
    const bits = bytes.readUInt32LE(21);
    return [(bits & 0x3fff) + 1, ((bits >>> 14) & 0x3fff) + 1];
  }
  assert.equal(chunk, 'VP8 ', file);
  return [bytes.readUInt16LE(26) & 0x3fff, bytes.readUInt16LE(28) & 0x3fff];
};

test('customer assist copies and copyable prompts stay synchronized', () => {
  assert.equal(normalize(readme), normalize(document.content));
  assert.deepEqual(indentedBlocks(document.content, 'text'), prompts);
  assert.deepEqual(indentedBlocks(readme, 'text'), prompts);
  // Match the shared classic block contract without loading feed, agenda-wide or presentation data.
  for (const copy of [classic.content, classicReadme]) {
    const remaining = [...prompts];
    for (const block of indentedBlocks(copy, 'text')) {
      const index = remaining.indexOf(block);
      assert.ok(index >= 0, `Missing shared classic block: ${block.slice(0, 80)}`);
      remaining.splice(index, 1);
    }
  }
});

test('core mission minutes match the page and the Architecture Bootcamp slot', () => {
  const agenda = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', 'architecture-bootcamp.yml'), 'utf8'));
  const row = agenda.schedule.find(entry => entry.type === 'lab' && entry.slug === slug);
  const core = missions.filter(mission => !mission.optional).reduce((sum, mission) => sum + mission.minutes, 0);
  assert.equal(core, document.data.duration);
  assert.equal(row.duration, document.data.duration);
  assert.match(lab.pacing, new RegExp(`Plan ${core} minutes`));
});

test('skill steps use the observed Add skill field label', () => {
  const skillSteps = steps.filter(candidate => /Generative/.test(candidate.instruction) && /Add skill/.test(candidate.instruction));
  assert.equal(skillSteps.length, 5);
  for (const candidate of skillSteps) {
    assert.match(candidate.instruction, /Set \*\*Skill name\*\* to `[a-z-]+`/);
  }
  for (const copy of [document.content, readme]) {
    assert.doesNotMatch(copy, /Set \*\*Name\*\* to `/);
    assert.equal((copy.match(/Set \*\*Skill name\*\* to `/g) || []).length, 5);
  }
  for (const copy of [classic.content, classicReadme]) {
    assert.match(copy, /\| Skill name \| `identify-caller-intent` \|/);
    assert.match(copy, /\| Skill name \| `cancel-subscription-flow` \|/);
  }
  assert.match(step('Check the saved build').instruction, /\*\*Identify caller intent\*\* and \*\*Cancel subscription flow\*\*/);
});

test('the baseline and trace guidance match the latest observed behavior', () => {
  assert.match(step('Observe the primary without a specialist').instruction,
    /cancellation details such as your subscription ID \(it may ask for the reason now or later\)/);
  assert.match(step('Read the complete trace').notice, /red \*\*Cancelled\*\* status[\s\S]*final \*\*Completed\*\* return/);
  for (const copy of [classic.content, classicReadme]) {
    assert.match(copy, /asks for cancellation details, such as your subscription ID; it may ask for the reason now or later\./);
  }
});

test('voice instructions teach the exercise without the automated runners test history', () => {
  assert.equal(lab.validation, undefined);
  const speak = missions.find(mission => mission.id === 'speak');
  const speakText = JSON.stringify(speak);
  assert.doesNotMatch(speakText, /source run|latest run|not reported successes|remain unverified|Record connection separately/);
  assert.match(step('Connect and check the transcript').instruction,
    /greeting under \*\*Bot said:\*\*/);
  assert.match(step('Compare voice with chat').instruction, /Live Transcript/);
  assert.match(speak.check.question, /Voice instructions/);
});

test('every mission screenshot exists in both themes with declared dimensions', () => {
  const images = [lab.hero_image, ...steps.map(candidate => candidate.screenshot)].filter(Boolean);
  for (const image of images) {
    assert.ok(image.alt && image.caption);
    for (const src of [image.src, image.src_dark].filter(Boolean)) {
      assert.ok(src.startsWith(`/labs/${slug}/images/`), src);
      assert.deepEqual(webpSize(path.join(root, ...src.split('/'))), [image.width, image.height], src);
    }
    if (image.src_dark) {
      for (const copy of [document.content, readme]) {
        assert.ok(copy.includes(`srcset="images/${path.posix.basename(image.src_dark)}"`), image.src_dark);
      }
    }
  }
});
