const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const yaml = require('js-yaml');
const producer = require('./build-feed');
const consumer = require('./consume-feed');

const root = path.resolve(__dirname, '..');
const slug = 'cowork-zava-sales';
const document = matter(fs.readFileSync(path.join(root, '_labs', `${slug}.md`), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'labs', slug, 'README.md'), 'utf8');
const lab = document.data.mission_lab;
const prompts = lab.missions.flatMap(mission => mission.steps.filter(step => step.prompt).map(step => step.prompt));
const fencedPrompts = text => [...text.matchAll(/```text\r?\n([\s\S]*?)\r?\n```/g)].map(match => match[1].replace(/\r\n/g, '\n'));
const bootcampLabs = [
  ['mcs-m365-copilot-latest', 'copilot-chat-workiq', 108],
  ['mcs-copilot-code', 'copilot-code-web-app', 121],
  ['mcs-copilot-harness-latest', 'declarative-agent-skill-reuse', 127],
  ['mcs-standard-harness', 'standard-harness-components', 136],
  ['mcs-skills-authoring', 'instructions-skills-authoring', 298],
  ['mcs-hooks', 'hooks-knowledge-travel-policy', 146],
  ['mcs-customer-conversation-harness', 'customer-assist-agent', 122],
  ['mcs-managed-apps', 'managed-apps-build', 123],
  ['mcs-workflows-latest', 'workflows-autonomous', 342],
  ['mcs-agent-integration', 'agent-integration-team', 124],
];
const bootcampAgenda = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', 'bootcamp-latest.yml'), 'utf8'));
const normalizeCopy = text => text.replace(/\r\n/g, '\n')
  .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
  .replace(/\]\(#[\uFE0F-]+/g, '](#').trim();
const indentedBlocks = (text, language) => [...text.matchAll(
  /^([ \t]*)```([^\r\n`]*)\r?\n([\s\S]*?)^\1```[ \t]*$/gm)]
  .filter(([, , info]) => info.trim() === language)
  .map(([, indent, , prompt]) => prompt.replace(/\r?\n$/, '').split(/\r?\n/)
    .map(line => line.startsWith(indent) ? line.slice(indent.length) : line).join('\n'));
const indentedPrompts = text => indentedBlocks(text, 'text');

test('fence extraction distinguishes unlabelled samples from closing fences and prose', () => {
  const markdown = ['```text', 'Input', '```', '', 'Explanation, not a sample.', '',
    '  ```', '  Subject', '', '  Body', '  ```', '', '```output', 'Expected response', '```'].join('\r\n');
  assert.deepEqual(indentedPrompts(markdown), ['Input']);
  assert.deepEqual(indentedBlocks(markdown, ''), ['Subject\n\nBody']);
  assert.deepEqual(indentedBlocks(markdown, 'output'), ['Expected response']);
});

// Reads canvas dimensions without introducing an image-processing test dependency.
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
    .replace(/\]\(#\uFE0F?-/g, '](#').trim();
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
  // Only the cropped slide is theme-neutral; every product UI screenshot needs both captures.
  assert.deepEqual([...new Set(images.filter(image => !image.src_dark).map(image => image.src))],
    [`/labs/${slug}/images/pipeline-three-slides.webp`]);
  for (const image of images) {
    assert.ok(image.alt && image.caption);
    assert.ok(image.width > 0 && image.height > 0);
    for (const src of [image.src, image.src_dark].filter(Boolean)) {
      assert.ok(src.startsWith(`/labs/${slug}/images/`));
      const file = path.join(root, ...src.split('/'));
      assert.ok(fs.statSync(file).isFile(), src);
      assert.deepEqual(webpSize(file), [image.width, image.height], `${src}: declared dimensions`);
      assert.ok(feed.images.includes(`https://microsoft.github.io/mcs-labs${src}`), `${src}: body reference`);
    }
    if (image.src_dark) {
      assert.ok(document.content.includes(`srcset="images/${path.posix.basename(image.src_dark)}"`), `${image.src_dark}: body picture`);
      assert.notDeepEqual(fs.readFileSync(path.join(root, ...image.src.split('/'))),
        fs.readFileSync(path.join(root, ...image.src_dark.split('/'))), `${image.src}: distinct theme captures`);
    }
  }
});

test('paired screenshots follow the island theme and the hero stays a single priority image', () => {
  const screenshot = fs.readFileSync(path.join(root, '_includes', 'lab-missions-screenshot.html'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'assets', 'css', 'lab-missions.css'), 'utf8');
  assert.match(screenshot, /include\.image\.src_dark/);
  assert.match(screenshot, /class="shot-\{\{ variant \}\}"/);
  assert.match(screenshot, /loading="lazy"/, 'The hidden variant must not download');
  assert.match(css, /\.visual figure a\.shot-light, &\[data-theme="light"\] \.visual figure a\.shot-dark \{ display: none; \}/);
  assert.match(css, /&\[data-theme="light"\] \.visual figure a\.shot-light \{ display: block; \}/);
  assert.equal(lab.hero_image.src_dark, undefined);
  assert.equal(lab.hero_image.src, `/labs/${slug}/images/pipeline-three-slides.webp`,
    'The single eager hero is document content, not dark application chrome');
});

test('prompts stay copyable in place while PDF export downloads locally', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  const script = fs.readFileSync(path.join(root, 'assets', 'js', 'lab-missions.js'), 'utf8');
  assert.doesNotMatch(template, /Take my prompts/i);
  assert.doesNotMatch(script, /downloadPrompts/);
  assert.match(template, /data-action="download-pdf"[^>]*>[\s\S]*?Download my lab PDF<\/button>/);
  assert.match(template, /data-pdf-library="\{\{ '[^']*html2pdf\.bundle\.min\.js' \| relative_url \}\}"/,
    'Load the self-hosted PDF generator only when a learner requests an export');
  assert.match(script, /dataset\.action === 'download-pdf'[\s\S]*?downloadPdf\(button\)/);
  assert.match(script, /function loadPdfLibrary\(button\)/);
  assert.match(script, /window\.html2pdf\(\)\.set\([\s\S]*?\.from\(clone\)\.save\(\)/);
  assert.match(script, /reflectionText\.textContent = reflection\.value/);
  assert.doesNotMatch(script, /window\.print\(\)/);
  assert.ok(fs.statSync(path.join(root, 'assets', 'js', 'vendor', 'html2pdf.bundle.min.js')).size > 100_000);
  assert.ok(fs.statSync(path.join(root, 'assets', 'js', 'vendor', 'html2pdf.bundle.min.js.LICENSE.txt')).isFile());
});

test('click-by-click help starts open because these labs depend on exact clicks and prompts', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  assert.match(template, /<details class="step-help" open>/);
  assert.ok(lab.missions.some(mission => mission.steps.some(step => step.help)), 'The lab uses step help');
});

test('notes say they stay in this browser and can be downloaded as a PDF', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  const script = fs.readFileSync(path.join(root, 'assets', 'js', 'lab-missions.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'assets', 'css', 'lab-missions.css'), 'utf8');
  assert.match(template, /class="saving-note"[^>]*>[^<]*local storage/);
  assert.match(template, /<p class="local-only" id="lab-reflection-storage">/);
  assert.match(template, /<textarea id="lab-reflection"[^>]*aria-describedby="lab-reflection-storage"/);
  assert.match(template, /data-action="download-pdf"[^>]*>[\s\S]*?Download my lab PDF<\/button>/);
  assert.match(template, /data-reflection-print/);
  assert.match(template, /data-print-stamp/);
  // The PDF button needs script; without it the server-rendered page never shows a dead control.
  assert.match(template, /<div class="keep-copy" data-requires-script hidden>/);
  assert.equal([...template.matchAll(/data-saving-note="[^"]+"/g)].length, 2, 'Both storage notices have a fallback');
  assert.match(script, /dataset\.action === 'download-pdf'[\s\S]*?downloadPdf\(button\)/);
  assert.match(script, /window\.html2pdf\(\)\.set\([\s\S]*?\.from\(clone\)\.save\(\)/);
  assert.match(script, /'beforeprint'/);
  assert.match(script, /'afterprint'/);
  assert.match(css, /@media print \{/);
  assert.match(css, /\.print-only \{ display: none; \}/);
});

test('the lab uses current product names and opens the scenario CRM', () => {
  const text = [JSON.stringify(lab), document.content, readme].join('\n');
  assert.doesNotMatch(text, /Copilot Home|Microsoft 365 Copilot|GitHub Copilot harness/);
  assert.ok(lab.prerequisites.some(item => item.includes('[Microsoft Copilot](https://copilot.cloud.microsoft/')));
  assert.ok(lab.prerequisites.some(item => item.includes('[Zava Sales Hub](https://aka.ms/ZavaSalesHub)')));
  for (const body of [document.content, readme]) assert.match(body, /\[Zava Sales Hub\]\(https:\/\/aka\.ms\/ZavaSalesHub\)/);
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

test('only Zava Sales and the parallel bootcamp labs opt into missions; the retired prototype is absent', () => {
  const missionLabs = fs.readdirSync(path.join(root, '_labs')).filter(filename =>
    filename.endsWith('.md') && matter(fs.readFileSync(path.join(root, '_labs', filename), 'utf8')).data.lab_format === 'missions');
  assert.deepEqual(missionLabs.sort(), [slug, ...bootcampLabs.map(([, modern]) => modern)].map(name => `${name}.md`).sort());
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

for (const [classic, modern, order] of bootcampLabs) {
  test(`${modern}: complete, unlisted missions preserve the classic lab and its prompts`, () => {
    const page = matter(fs.readFileSync(path.join(root, '_labs', `${modern}.md`), 'utf8'));
    const github = fs.readFileSync(path.join(root, 'labs', modern, 'README.md'), 'utf8');
    const original = matter(fs.readFileSync(path.join(root, '_labs', `${classic}.md`), 'utf8'));
    assert.ok(fs.existsSync(path.join(root, 'labs', classic, 'README.md')));
    assert.notEqual(original.data.lab_format, 'missions', 'The classic version remains available');
    assert.equal(page.data.lab_format, 'missions');
    assert.equal(page.data.order, order);
    // Shared classic labs can retain a longer workshop duration; this edition follows the Bootcamp slot.
    assert.equal(page.data.duration, bootcampAgenda.schedule.find(row => row.type === 'lab' && row.slug === classic).duration);
    assert.equal(page.data.unlisted, true);
    assert.equal(page.data.search, false);
    assert.equal(page.data.sitemap, false);
    assert.equal(normalizeCopy(github), normalizeCopy(page.content));
    const content = page.data.mission_lab;
    for (const key of ['headline', 'headline_emphasis', 'promise', 'scenario', 'pacing']) {
      assert.ok(content[key], `${modern}: ${key}`);
    }
    assert.ok(content.prerequisites.length > 0);
    const eventSetupNotice = /proctor.led[\s\S]{0,160}pre.provisioned[\s\S]{0,160}skip/i;
    assert.match(JSON.stringify([content.scenario, content.prerequisites, content.pacing]), eventSetupNotice,
      'Event attendees must see skip-setup guidance in the rendered introduction, not only the fallback body');
    assert.match(original.content, eventSetupNotice, 'The classic lab needs the same setup distinction');
    assert.ok(content.hero_image?.src, `${modern}: required light/content hero`);
    assert.equal(content.hero_image.src_dark, undefined, 'The eager hero uses one light/content image');
    assert.ok(content.missions.length > 0);
    assert.equal(new Set(content.missions.map(mission => mission.id)).size, content.missions.length);
    assert.equal(content.missions.filter(mission => !mission.optional)
      .reduce((sum, mission) => sum + mission.minutes, 0), page.data.duration);
    const guidedPrompts = [];
    const guidedOutputs = [];
    for (const mission of content.missions) {
      assert.match(mission.id, /^[a-z][a-z0-9-]*$/);
      assert.ok(Number.isInteger(mission.minutes) && mission.minutes > 0, `${mission.id}: minutes`);
      for (const key of ['verb', 'title', 'tool', 'brief', 'outcome']) assert.ok(mission[key], `${mission.id}: ${key}`);
      assert.ok(mission.steps.length > 0);
      assert.ok(mission.reveal.title && mission.reveal.line && mission.reveal.explanation);
      assert.ok(mission.reveal.flow.length >= 2);
      assert.ok(mission.check.question);
      assert.equal(mission.check.options.filter(option => option.correct === true).length, 1);
      for (const option of mission.check.options) {
        assert.equal(typeof option.correct, 'boolean');
        assert.ok(option.text && option.feedback);
      }
      for (const step of mission.steps) {
        assert.ok(step.title && step.instruction);
        if (step.prompt) guidedPrompts.push(step.prompt);
        guidedOutputs.push(...indentedBlocks(step.instruction, 'output'));
      }
    }
    assert.deepEqual(indentedPrompts(page.content), guidedPrompts);
    assert.deepEqual(indentedPrompts(github), guidedPrompts);
    assert.deepEqual(indentedBlocks(page.content, 'output'), guidedOutputs);
    assert.deepEqual(indentedBlocks(github, 'output'), guidedOutputs);
    // Classic fences also contain expected responses; preserve these as comparisons, not sendable prompts.
    // Workflows uses unlabelled fences for its sample emails and expressions.
    // Optional missions may move after the core, but every original block occurrence must remain.
    const remainingBlocks = [...guidedPrompts, ...guidedOutputs];
    for (const prompt of [...indentedPrompts(original.content), ...indentedBlocks(original.content, '')]) {
      const index = remainingBlocks.indexOf(prompt);
      assert.ok(index >= 0, `${modern}: missing or changed classic block: ${prompt.slice(0, 80)}`);
      remainingBlocks.splice(index, 1);
    }
    assert.ok(content.finish.title && content.finish.message && content.finish.reflection);
    assert.ok(content.finish.takeaways.length > 0);
    for (const takeaway of content.finish.takeaways) assert.ok(takeaway.label && takeaway.text);
    assert.ok(content.sources.length > 0);
    for (const source of content.sources) {
      assert.ok(source.title);
      assert.match(source.url, /^https:\/\//);
    }
    const item = producer.buildItem({
      collection: 'labs', slug: modern, frontMatter: page.data, body: page.content,
      baseUrl: 'https://microsoft.github.io/mcs-labs',
    });
    const images = [content.hero_image, ...content.missions.flatMap(mission =>
      mission.steps.map(step => step.screenshot))].filter(Boolean);
    for (const image of images) {
      assert.ok(image.alt && image.caption);
      assert.ok(image.width > 0 && image.height > 0);
      for (const src of [image.src, image.src_dark].filter(Boolean)) {
        assert.ok(src.startsWith(`/labs/${modern}/images/`));
        const file = path.join(root, ...src.split('/'));
        assert.deepEqual(webpSize(file), [image.width, image.height], `${src}: declared dimensions`);
        assert.ok(item.images.includes(`https://microsoft.github.io/mcs-labs${src}`), `${src}: portable body reference`);
      }
      if (image.src_dark) {
        assert.ok(page.content.includes(`srcset="images/${path.posix.basename(image.src_dark)}"`));
        assert.notDeepEqual(fs.readFileSync(path.join(root, ...image.src.split('/'))),
          fs.readFileSync(path.join(root, ...image.src_dark.split('/'))), `${image.src}: distinct theme captures`);
      }
    }
    const materialized = matter(consumer.materializeDoc(item, 'https://microsoft.github.io/mcs-labs'));
    assert.deepEqual(materialized.data.mission_lab, content);
    assert.equal(materialized.content.trim(), page.content.trim(), `${modern}: portable body round-trip`);
    assert.deepEqual(indentedPrompts(materialized.content), guidedPrompts);
    assert.deepEqual(indentedBlocks(materialized.content, 'output'), guidedOutputs);
  });
}

test('the unlisted missions event changes only lab references in the original bootcamp schedule', () => {
  const eventId = 'architecture-bootcamp';
  const classic = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', 'bootcamp-latest.yml'), 'utf8'));
  const modern = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', `${eventId}.yml`), 'utf8'));
  const replacements = new Map(bootcampLabs.map(([oldSlug, newSlug]) => [oldSlug, newSlug]));
  const schedule = classic.schedule.map(row => row.type === 'lab'
    ? { ...row, slug: replacements.get(row.slug) || row.slug } : row);
  assert.deepEqual(modern, { ...classic, event_id: eventId, schedule });
  const labRows = modern.schedule.filter(row => row.type === 'lab');
  assert.deepEqual(labRows.map(row => row.slug).sort(), [slug, ...replacements.values()].sort());
  const event = matter(fs.readFileSync(path.join(root, '_events', `${eventId}.md`), 'utf8')).data;
  assert.equal(event.event_id, eventId);
  assert.equal(event.order, 998);
  assert.equal(event.unlisted, true);
  assert.equal(event.search, false);
  assert.equal(event.sitemap, false);
  assert.deepEqual(event.labs, labRows.map(({ slug: labSlug, label }) => ({ slug: labSlug, label })));
});

test('mission content is server rendered and enhanced without prototype controls', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  assert.match(template, /step\.prompt \| escape/);
  assert.match(template, /step\.instruction \| markdownify/);
  assert.match(template, /include event-nav\/nav-pair\.html/);
  assert.match(template, /include event-nav\/rail\.html/);
  assert.match(template, /\{% if page\.slug == 'cowork-zava-sales' %\}\s*<div class="hero-actions"><a[^>]+href="https:\/\/aka\.ms\/CoworkDemoHub"/,
    'Only the Cowork lab should end with the Cowork-specific call to action');
  assert.ok(template.indexOf('assign lab = page.mission_lab') > template.indexOf('include event-nav/manifest.html'),
    'The manifest assigns lab in the shared Liquid scope; restore mission data afterwards');
  assert.doesNotMatch(template, /data-mode|data-notes|Design notes|Explorer|window\.LAB|prototypes\//);
  assert.doesNotMatch(JSON.stringify(lab), /mock product|Fabrikam|Design notes|Explorer|45.minute/i);
});
