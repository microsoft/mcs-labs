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
    '4d0af0f096b4c991a0ab77a11941de0eaa43ac1571a82e673d9fa503dd8da99a',
    'ed36c3912c4f5521b0c1e2fef39e125f19278fa6edc55906fb2a12775c507689',
    'fab671063146c9010565848119eb39e8e6fa3a05b06c641f8ce5e04b8f4c22a6',
    '2b54b478899ac28a7cc32f6a4c49c215ab2ea2ccc1fabdbfaa73ad825ff6ab81',
    '2283c90484539ef5e5dbe28224a6d0c330fa429f0518f6ca9f0064593d4f83a1',
    '70c82d4e401571297182d281f7411f2d716014b34c73fb21fb0d6378d4590a42',
    '299be9288a8ed4f599ea0de653764c87f07dddf5c91fc2bf8d73da3d8a7312b5',
    '3e8f8f61fc032c4988caf18ffc1a29bd61ea40f478ab12679d4bc147d23d85a1',
    '8e6bccccae11603d1af43bc59819e732dfd48a018c9cca8ddd07766e75e34016',
    'bff231b662979cee80b6bca1b3d5c6b0d836c2353466b4ab3c67cde3bc0df6b6',
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
  assert.equal(lab.missions.length, 7);
  assert.equal(new Set(lab.missions.map(mission => mission.id)).size, lab.missions.length);
  assert.equal(lab.missions.filter(mission => !mission.optional).reduce((sum, mission) => sum + mission.minutes, 0), 30);
  assert.deepEqual(lab.missions.filter(mission => !mission.optional).map(mission => mission.id),
    ['ask', 'agent', 'delegate', 'repeat']);
  assert.deepEqual(lab.missions.filter(mission => mission.optional).map(mission => mission.id),
    ['record', 'improve', 'specialize']);
  assert.equal(lab.missions.filter(mission => mission.optional).reduce((sum, mission) => sum + mission.minutes, 0), 22);
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

test('Zava separates work-file Chat, the agent MCP App, and Cowork plugin setup', () => {
  const [ask, agent, delegate, repeat] = lab.missions;
  assert.match(ask.steps[0].instruction, /Chat/);
  assert.match(ask.steps[1].instruction, /not Cowork/);
  assert.match(agent.steps[0].instruction, /new Copilot Chat session/);
  assert.match(agent.steps[1].instruction, /Try Zava Sales Hub/);
  assert.match(agent.steps[1].instruction, /same renewal prompt/);
  assert.match(agent.steps[1].notice, /Stop task/);
  assert.match(agent.steps[2].instruction, /same Zava Sales Hub agent conversation/);
  assert.match(agent.steps[2].instruction, /MCP App/);
  assert.match(agent.steps[2].help, /enter `50000` without the currency symbol or comma/);
  assert.match(agent.steps[2].notice, /do not overwrite the renewal amount/);
  assert.match(delegate.steps[0].instruction, /Agents & Plugins → Cowork → Microsoft Dataverse/);
  assert.match(delegate.steps[0].help, /https:\/\/zavasalesdemo\.crm\.dynamics\.com\//);
  assert.match(delegate.steps[1].instruction, /Zava PowerPoint/);
  assert.match(delegate.steps[2].instruction, /explicitly select \*\*Cowork/);
  assert.match(delegate.steps[2].notice, /plugin\/skill activity/);
  assert.match(repeat.steps[0].instruction, /Clear \*\*Run once now\*\*/);
  assert.match(repeat.steps[1].help, /skills\/weekly-deal-review/);
  assert.match(repeat.steps[1].help, /do not approve unexpected destinations or overwrites/);
  assert.match(repeat.steps[2].help, /Compare \*\*Next run\*\* with the recurrence/);
  for (const copy of [document.content, readme]) {
    assert.match(copy, /assigned training account, then select \*\*Allow\*\*/);
    assert.match(copy, /Stop task/);
    assert.match(copy, /enter `50000` without the currency symbol or comma/);
    assert.match(copy, /Clear \*\*Run once now\*\*/);
    assert.match(copy, /30 minutes for the four core missions/);
    assert.match(copy, /about 52 minutes for everything/);
    assert.doesNotMatch(copy, /ΓÇ|[\u200B\u200C]/);
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

test('result checks are optional server-rendered guidance, not progress controls', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  const block = template.match(/{% if mission\.result_check and mission\.result_check != empty %}([\s\S]*?){% endif %}/)?.[1];
  assert.ok(block, 'Missing and empty fields must not add a result block');
  assert.match(block, /<p class="result-check"><strong>Check your result<\/strong> {{ mission\.result_check \| escape }}<\/p>/);
  assert.doesNotMatch(block, /input|button|data-progress|data-complete|hidden|tabindex=/);
  assert.ok(template.indexOf('class="result-check"') < template.indexOf('<footer class="mission-actions">'),
    'PDF export removes mission-actions; evidence guidance must remain outside it');
  assert.match(template, /<p class="outcome"><strong>Your finish line<\/strong> {{ mission\.outcome \| escape }}/);
});

test('result checks mirror observable evidence in all three reading surfaces and the feed', () => {
  const representatives = [
    ['copilot-chat-workiq', 'publish', /open Page.*corrections/],
    ['workflows-autonomous', 'review', /Outlook mailbox.*matching run/],
    ['agent-integration-team', 'prove', /returned Zava.*usable LiftLine quote/],
  ];
  for (const [name, id, evidence] of representatives) {
    const page = matter(fs.readFileSync(path.join(root, '_labs', `${name}.md`), 'utf8'));
    const github = fs.readFileSync(path.join(root, 'labs', name, 'README.md'), 'utf8');
    const mission = page.data.mission_lab.missions.find(item => item.id === id);
    assert.equal(typeof mission.result_check, 'string');
    assert.match(mission.result_check, evidence);
    assert.notEqual(mission.result_check, mission.outcome, 'Evidence must add to the goal, not repeat it');
    assert.ok(mission.result_check.split(/\s+/).length <= 55, 'Keep the result cue short');
    for (const copy of [page.content, github]) {
      assert.equal(copy.split(`**Check your result:** ${mission.result_check}`).length - 1, 1);
    }
    const item = producer.buildItem({
      collection: 'labs', slug: name, frontMatter: page.data, body: page.content,
      baseUrl: 'https://microsoft.github.io/mcs-labs',
    });
    const restored = matter(consumer.materializeDoc(item, 'https://microsoft.github.io/mcs-labs'));
    assert.deepEqual(restored.data.mission_lab, page.data.mission_lab);
    assert.ok(restored.data.mission_lab.missions.some(item => item.result_check === undefined),
      'Other missions need no new field');
  }
});

test('click-by-click help starts closed so the step instruction leads', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  assert.match(template, /<details class="step-help">/);
  assert.doesNotMatch(template, /<details class="step-help"[^>]*\bopen/);
  assert.ok(lab.missions.some(mission => mission.steps.some(step => step.help)), 'The lab uses step help');
});

test('lab identity leads the hero while setup and test history use native, closed disclosures', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  const script = fs.readFileSync(path.join(root, 'assets', 'js', 'lab-missions.js'), 'utf8');
  const css = fs.readFileSync(path.join(root, 'assets', 'css', 'lab-missions.css'), 'utf8');
  assert.match(template, /<h1 id="lab-title">\{\{ page\.title \| escape \}\}<\/h1>/);
  assert.match(template, /<p class="tagline">\{\{ lab\.headline \| escape \}\}/);
  assert.ok(template.indexOf('id="lab-title"') < template.indexOf('class="tagline"'));
  assert.match(template, /\{% if lab\.self_setup %\}[\s\S]*?<details class="lab-setup">/);
  assert.match(template, /lab\.self_setup \| markdownify/);
  assert.match(template, /\{% if lab\.validation %\}[\s\S]*?<details class="lab-validation">/);
  assert.doesNotMatch(template, /<details[^>]*class="lab-(?:setup|validation)"[^>]*\bopen/);
  assert.match(template, /class="lab-setup-note">At a proctor-led event with a provided, pre-provisioned account\?/);
  assert.match(script, /clone\.querySelectorAll\('details'\)\.forEach\(details => \{ details\.open = true; \}\)/,
    'Downloaded PDFs retain the collapsed setup and test-history content');
  assert.match(script, /querySelectorAll\('details:not\(\[open\]\):not\(\.visual\):not\(\.stuck\)'\)/,
    'Printing opens supplementary disclosures, then restores their state');
  assert.match(css, /@media print \{[\s\S]*  :is\(\.lab-setup, \.lab-validation, \.step-help\):not\(\[open\]\) > :not\(summary\) \{ display: block; \}/,
      'Setup, test history and help also print with JavaScript disabled');
  assert.match(template, /data-progress-id="ready-\{\{ forloop\.index \}\}"/);
  assert.equal(lab.prerequisites.length, 5, 'Moving setup out of the Cowork checklist must not shift saved readiness IDs');
  assert.match(css, /\.lab-content \{ width: 100%; min-width: 0; max-width: 850px; \}/,
    'Auto-centered grid content must not size itself beyond the mobile column and get clipped');
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

test('Copilot Code escapes the switcher separator on every Markdown reading surface', () => {
  for (const name of ['mcs-copilot-code', 'copilot-code-web-app']) {
    const page = matter(fs.readFileSync(path.join(root, '_labs', `${name}.md`), 'utf8'));
    const copies = {
      body: page.content,
      readme: fs.readFileSync(path.join(root, 'labs', name, 'README.md'), 'utf8'),
    };
    if (page.data.mission_lab) {
      copies.instruction = page.data.mission_lab.missions.find(mission => mission.id === 'build').steps[0].instruction;
    }
    // Kramdown treats an unescaped pipe in a standalone instruction as a table.
    for (const [surface, text] of Object.entries(copies)) {
      assert.ok(text.includes('**Home &#124; Code**'), `${name}: ${surface} keeps the switcher label literal`);
      assert.ok(!text.includes('**Home | Code**'), `${name}: ${surface} must not create a table`);
    }
  }
});

for (const [classic, modern, order] of bootcampLabs) {
  test(`${modern}: published missions preserve the classic lab and its prompts`, () => {
    const page = matter(fs.readFileSync(path.join(root, '_labs', `${modern}.md`), 'utf8'));
    const github = fs.readFileSync(path.join(root, 'labs', modern, 'README.md'), 'utf8');
    const original = matter(fs.readFileSync(path.join(root, '_labs', `${classic}.md`), 'utf8'));
    assert.ok(fs.existsSync(path.join(root, 'labs', classic, 'README.md')));
    assert.notEqual(original.data.lab_format, 'missions', 'The classic version remains available');
    assert.equal(page.data.lab_format, 'missions');
    assert.equal(page.data.order, order);
    const curriculumRow = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', 'architecture-bootcamp.yml'), 'utf8'))
      .schedule.find(row => row.type === 'lab' && row.slug === modern);
    assert.equal(page.data.title, curriculumRow.title, `${modern}: page title matches the curriculum`);
    assert.equal(page.content.match(/^# (.+)$/m)?.[1], curriculumRow.title);
    assert.equal(github.match(/^# (.+)$/m)?.[1], curriculumRow.title);
    // Shared classic labs can retain a longer workshop duration; this edition follows the Bootcamp slot.
    assert.equal(page.data.duration, bootcampAgenda.schedule.find(row => row.type === 'lab' && row.slug === classic).duration);
    assert.notEqual(page.data.unlisted, true);
    assert.notEqual(page.data.search, false);
    assert.notEqual(page.data.sitemap, false);
    assert.equal(normalizeCopy(github), normalizeCopy(page.content));
    const content = page.data.mission_lab;
    for (const key of ['headline', 'headline_emphasis', 'promise', 'scenario', 'pacing']) {
      assert.ok(content[key], `${modern}: ${key}`);
    }
    assert.ok(content.prerequisites.length > 0);
    const eventSetupNotice = /proctor.led[\s\S]{0,160}provided, pre.provisioned[\s\S]{0,160}ready to start/i;
    assert.ok(content.self_setup?.trim(), 'The shared renderer needs own-tenant setup, separate from the scenario');
    assert.doesNotMatch(JSON.stringify([content.scenario, content.prerequisites]), /Skip tenant|Prerequisites for your own tenant|Own-tenant setup|Running (?:this lab )?in your own tenant/i,
      'Scenario and readiness must not repeat the provisioning wall of text');
    assert.equal(content.validation, undefined, 'Historical test notes belong in maintainer logs and PRs, not labs');
    assert.doesNotMatch(page.content, /<summary>What was tested<\/summary>/);
    assert.match(page.content, eventSetupNotice);
    assert.match(original.content, eventSetupNotice, 'The classic lab needs the same setup distinction');
    for (const copy of [page.content, github]) {
      assert.equal((copy.match(/<details class="lab-setup" markdown="1">/g) || []).length, 1);
      assert.equal((copy.match(/<p class="lab-setup-note">/g) || []).length, 1);
    }
    assert.doesNotMatch(JSON.stringify([content, page.content, github]), /CAT[\s-]+bootcamp|CAT team/i,
      'Prerequisite guidance applies to any proctor-led event with provided, pre-provisioned accounts');
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
    // Preserve every original block occurrence; the sequence contract also covers optional missions.
    const remainingBlocks = [...guidedPrompts, ...guidedOutputs];
    for (const prompt of [...indentedPrompts(original.content), ...indentedBlocks(original.content, '')]) {
      // Retain the guided edition's agenda URL and the existing explicit export-format clarification.
      const editionPrompt = prompt.replaceAll('/events/bootcamp-latest/', '/events/architecture-bootcamp/')
        .replace(/^Export the latest snapshot\.$/, 'Export the latest snapshot as JSON and Markdown.');
      const index = remainingBlocks.indexOf(editionPrompt);
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

test('the published missions event preserves the classic timetable and selects modern lab companions', () => {
  const eventId = 'architecture-bootcamp';
  const classic = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', 'bootcamp-latest.yml'), 'utf8'));
  const modern = yaml.load(fs.readFileSync(path.join(root, '_data', 'agendas', `${eventId}.yml`), 'utf8'));
  const replacements = new Map(bootcampLabs.map(([oldSlug, newSlug]) => [oldSlug, newSlug]));
  const schedule = classic.schedule.map(row => {
    if (row.type === 'lab') {
      const labSlug = replacements.get(row.slug) || row.slug;
      const page = matter(fs.readFileSync(path.join(root, '_labs', `${labSlug}.md`), 'utf8'));
      return { ...row, slug: labSlug, title: page.data.title };
    }
    return row.companion_lab
      ? { ...row, companion_lab: replacements.get(row.companion_lab) || row.companion_lab } : row;
  });
  assert.deepEqual(modern, { ...classic, event_id: eventId, schedule });
  const labRows = modern.schedule.filter(row => row.type === 'lab');
  assert.deepEqual(labRows.map(row => row.slug).sort(), [slug, ...replacements.values()].sort());
  const event = matter(fs.readFileSync(path.join(root, '_events', `${eventId}.md`), 'utf8')).data;
  assert.equal(event.event_id, eventId);
  assert.equal(event.order, 2);
  assert.notEqual(event.unlisted, true);
  assert.notEqual(event.search, false);
  assert.notEqual(event.sitemap, false);
  assert.deepEqual(event.labs, labRows.map(({ slug: labSlug, label }) => ({ slug: labSlug, label })));
  const moduleRows = modern.schedule.filter(row => row.type === 'module');
  assert.equal(moduleRows.length, 17);
  assert.equal(labRows.length, 11);
  for (const row of moduleRows) {
    const module = matter(fs.readFileSync(path.join(root, '_modules', `${row.slug}.md`), 'utf8'));
    assert.equal(row.title, module.data.title, `${row.label}: page and agenda naming agree`);
    assert.doesNotMatch(module.data.title, /\b(?:MCS|DAs|M365|New Copilot Studio)\b/);
    assert.doesNotMatch(module.data.description + module.content, /Module placeholder|Instructor content is coming soon/);
    if (row.companion_lab) {
      assert.equal(row.lab, false, `${row.label}: explicit labs control counts`);
      assert.ok(labRows.some(lab => lab.slug === row.companion_lab), `${row.label}: scheduled modern companion`);
    }
  }
  assert.equal(moduleRows.find(row => row.label === 'Module 4').title, 'Copilot Chat harness: declarative agents');
  assert.equal(moduleRows.find(row => row.label === 'Module 6').companion_lab, false);
  assert.equal(moduleRows.find(row => row.label === 'Module 8').companion_lab, 'hooks-knowledge-travel-policy');
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
