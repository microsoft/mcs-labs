const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const audit = require('./lab-audit');

const root = path.resolve(__dirname, '..');

test('heading ids follow kramdown GFM, including the emoji variation selector', () => {
  const id = text => audit.slugifyHeading(audit.headingRawText(text));
  assert.equal(id('🧭 Lab Details'), '-lab-details');
  // U+FE0F is a mark, so '🛠️' leaves it behind: the link must be #️-delegate..., not #-delegate....
  assert.equal(id('🛠️ Delegate: make the review'), '\uFE0F-delegate-make-the-review');
  assert.equal(id('Use Case #1: Configure **Agent** `Tests`'), 'use-case-1-configure-agent-tests');
  assert.equal(id('See [the docs](https://learn.microsoft.com) ![icon](i.png)'), 'see-the-docs');
  assert.equal(id('snake_case and _emphasis_'), 'snake_case-and-emphasis');
  assert.equal(id('Tags <<b>b> nest <i>here</i>'), 'tags-b-nest-here');
  assert.ok(!audit.headingRawText('Tags <<b>b> and a < b').includes('<'), 'no tag opener survives');
});

test('proseLines drops HTML comments, including several per line and multi-line ones', () => {
  const lines = ['a <!-- x --> b <!--y--> c', 'keep <!-- open', 'hidden', 'still --> after <!-- z --> end', '<!---->tail'];
  assert.deepEqual(audit.proseLines(lines), [
    { text: 'a  b  c', line: 1 }, { text: 'keep ', line: 2 }, { text: ' after  end', line: 4 }, { text: 'tail', line: 5 },
  ]);
});

test('collectAnchors numbers duplicates, skips code fences and keeps explicit ids', () => {
  const lines = [
    '## Lab Details', '', '```', '## Not a heading', '```', '', '## Lab Details',
    '## Custom {#my-id}', '<a id="html-id"></a>', 'Setext title', '------------',
  ];
  const { ids, headings } = audit.collectAnchors(lines);
  for (const id of ['lab-details', 'lab-details-1', 'my-id', 'html-id', 'setext-title']) assert.ok(ids.has(id), id);
  assert.ok(!ids.has('not-a-heading'));
  assert.deepEqual(headings.map(h => h.line), [1, 7, 8, 10]);
});

test('Lab Details parsing reads the house column table and colon lines', () => {
  const fields = audit.detailFields([
    '| Level | Persona | Duration | Purpose |',
    '| ----- | ------- | -------- | ------- |',
    '| 200 | Maker | 45 minutes | Learn |',
    '- **Time:** 1 hour 30 minutes',
  ]);
  assert.deepEqual(fields.map(f => [f.label, f.value]), [
    ['Level', '200'], ['Persona', 'Maker'], ['Duration', '45 minutes'], ['Purpose', 'Learn'], ['Time', '1 hour 30 minutes'],
  ]);
  assert.equal(audit.statedMinutes('45 minutes'), 45);
  assert.equal(audit.statedMinutes('1.5 hrs'), 90);
  assert.equal(audit.statedMinutes('1 h 30 min'), 90);
  assert.equal(audit.statedMinutes('30-45 minutes'), 30);
  assert.equal(audit.statedMinutes('Maker'), 0);
});

test('retired terms ignore URLs, link targets and lines that explain a rename', () => {
  const terms = audit.loadTerms();
  assert.ok(terms.length >= 5, 'the shared term list loads');
  const hits = audit.findRetiredTerms([
    'Open Power Virtual Agents.',
    'Copilot Studio (formerly Power Virtual Agents) builds agents.',
    'See [the guide](https://learn.microsoft.com/power-virtual-agents/).',
    'Sign in with Azure AD B2C.',
    'Use Azure AD to sign in.',
  ], terms);
  assert.deepEqual(hits.map(h => [h.term.term, h.lines]), [['Power Virtual Agents', [1]], ['Azure Active Directory', [5]]]);
});

test('copy comparison ignores README emoji, anchor dashes, indentation and site link style', () => {
  const site = [
    '## Lab Details', '- [Lab Details](#lab-details)', '    > [!NOTE]',
    "Part of [Bootcamp]({{ '/events/bootcamp-latest/' | relative_url }}).",
    'Start with the [web lab]({% link _labs/agent-builder-web.md %}).',
  ];
  const readme = [
    '## 🧭 Lab Details', '- [🧭 Lab Details](#-lab-details)', '> [!NOTE]',
    'Part of [Bootcamp](https://microsoft.github.io/mcs-labs/events/bootcamp-latest/).',
    'Start with the [web lab](../agent-builder-web/README.md).',
  ];
  assert.equal(audit.diffStats(audit.comparableLines(site), audit.comparableLines(readme)).changed, 0);
  const drift = audit.diffStats(audit.comparableLines(['Select **Save**.']), audit.comparableLines(['Select **Publish**.']));
  assert.equal(drift.changed, 2);
  assert.equal(drift.firstA, 1);
});

test('fenced prompts are de-indented and kept in order', () => {
  const prompts = audit.fencedPrompts(['1. Paste:', '', '    ```text', '    First line', '    Second line', '    ```', '```text', 'Next', '```']);
  assert.deepEqual(prompts, ['First line\nSecond line', 'Next']);
});

test('parseArgs accepts slugs or either copy path and validates options', () => {
  const opts = audit.parseArgs(['labs/mcs-hooks/README.md', '_labs/cowork-zava-sales.md', 'agent-builder-web', '--format', 'json', '--min-severity=error', '--strict']);
  assert.deepEqual(opts.slugs, ['mcs-hooks', 'cowork-zava-sales', 'agent-builder-web']);
  assert.equal(opts.format, 'json');
  assert.equal(opts.minSeverity, 'error');
  assert.equal(opts.strict, true);
  assert.deepEqual(opts.errors, []);
  assert.equal(audit.parseArgs([]).minSeverity, 'warn');
  assert.equal(audit.parseArgs(['--changed']).changed, 'origin/main');
  assert.equal(audit.parseArgs(['--changed=upstream/main']).changed, 'upstream/main');
  assert.equal(audit.parseArgs(['--format=xml', '--bogus']).errors.length, 2);
  assert.equal(audit.parseArgs(['--all', 'x']).errors.length, 1);
});

// A throwaway repository with one instance of each failure class the skills rely on.
function fixtureRepo() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lab-audit-'));
  const write = (rel, content) => {
    const file = path.join(dir, ...rel.split('/'));
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  };
  const png = (w, h) => {
    const b = Buffer.alloc(24);
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
    b.writeUInt32BE(13, 8);
    b.write('IHDR', 12, 'ascii');
    b.writeUInt32BE(w, 16);
    b.writeUInt32BE(h, 20);
    return b;
  };
  const webp = (w, h) => {
    const b = Buffer.alloc(30);
    b.write('RIFF', 0, 'ascii');
    b.writeUInt32LE(22, 4);
    b.write('WEBPVP8X', 8, 'ascii');
    b.writeUInt32LE(10, 16);
    b.writeUIntLE(w - 1, 24, 3);
    b.writeUIntLE(h - 1, 27, 3);
    return b;
  };
  const fm = (fields) => `---\n${fields}\n---\n`;
  const classic = (extra = '') => `layout: lab\ndescription: A lab.\nmodule: m1\nsection: intermediate_labs\ndifficulty: 200\nduration: 30\njourneys:\n  - developer${extra}`;

  write('_modules/m1.md', fm('title: Module one\nlab: good'));
  write('_events/main-event.md', fm('title: Main\nevent_id: main-event'));
  write('_events/preview-event.md', fm('title: Preview\nevent_id: preview-event\nunlisted: true'));
  write('_data/agendas/main-event.yml', 'event_id: main-event\nschedule:\n  - type: lab\n    slug: ghost\n    label: Lab 1\n  - type: lab\n    slug: bad\n    label: Lab 2\n    duration: 30\n  - type: module\n    slug: m1\n    label: Module 1\n');
  write('_data/agendas/preview-event.yml', 'event_id: preview-event\nschedule:\n  - type: lab\n    slug: bad\n    label: Lab 1\n');

  // A clean classic lab: README emoji headings and anchors are the house style.
  write('_labs/good.md', `${fm(`title: Good lab\norder: 1\n${classic()}`)}\n# Good lab\n\n- [Lab Details](#lab-details)\n\n## Lab Details\n\n| Level | Persona | Duration | Purpose |\n| --- | --- | --- | --- |\n| 200 | Maker | 30 minutes | Learn |\n\n![Pic](images/pic.png)\n`);
  write('labs/good/README.md', '# Good lab\n\n- [🧭 Lab Details](#-lab-details)\n\n## 🧭 Lab Details\n\n| Level | Persona | Duration | Purpose |\n| --- | --- | --- | --- |\n| 200 | Maker | 30 minutes | Learn |\n\n![Pic](images/pic.png)\n');
  write('labs/good/images/pic.png', png(10, 10));
  write('labs/good/images/leftover.png', png(10, 10));

  // A classic lab with one of everything wrong.
  write('_labs/bad.md', `${fm(`title: Bad lab\norder: 2\nunlisted: true\n${classic().replace('intermediate_labs', 'core_labs').replace('module: m1', 'module: nope').replace('duration: 30', 'duration: 45')}`)}\n# Bad lab\n\n- [Missing](#nowhere)\n\n## Lab Details\n\n| Level | Duration |\n| --- | --- |\n| 200 | 30 minutes |\n\n![Gone](images/gone.png)\n\nOpen Power Virtual Agents.\n\nCopilot Studio (formerly Power Virtual Agents) is fine.\n`);
  write('labs/bad/README.md', '# Bad lab\n\n- [Missing](#nowhere)\n\n## Lab Details\n\n| Level | Duration |\n| --- | --- |\n| 200 | 30 minutes |\n\n![Gone](images/gone.png)\n\nOpen Power Virtual Agents now.\n\nCopilot Studio (formerly Power Virtual Agents) is fine.\n');

  // A missions lab with a contract break in each area the layout and feed depend on.
  const mission = `lab_format: missions
mission_lab:
  headline: Headline
  headline_emphasis: Emphasis
  promise: Promise
  scenario: Scenario
  prerequisites: [Account]
  pacing: Pacing
  sources:
    - title: Docs
      url: https://learn.microsoft.com/
  hero_image: { src: /labs/mis/images/hero.webp, alt: Hero, width: 100, height: 50, caption: Hero }
  missions:
    - id: ask
      verb: Ask
      title: Ask a question
      minutes: 10
      tool: Copilot
      brief: Brief
      outcome: Outcome
      steps:
        - title: Paste
          instruction: Paste the prompt.
          prompt: |
            First prompt
          screenshot: { src: /labs/mis/images/step.webp, src_dark: /labs/mis/images/step-dark.webp, alt: Step, title: Step, width: 200, height: 100, caption: Step }
        - title: Again
          instruction: Paste the second prompt.
          prompt: Second prompt
      reveal: { title: Reveal, line: Line, explanation: Why, flow: [Ask, Answer] }
      check:
        question: Which?
        options:
          - { text: A, correct: true, feedback: Yes }
          - { text: B, correct: true, feedback: Also yes }
      stuck:
        - { problem: Stuck, solution: Retry }
  finish:
    title: Done
    message: Well done
    takeaways:
      - { label: One, text: Thing }
    reflection: Reflect`;
  const body = (prompts) => `\n# Mission lab\n\n![Hero](images/hero.webp)\n\n![Step](images/step.webp)\n\n![Step](images/step-dark.webp)\n\n${prompts.map(p => `\`\`\`text\n${p}\n\`\`\`\n`).join('\n')}`;
  write('_labs/mis.md', `${fm(`title: Mission lab\norder: 3\n${classic().replace('duration: 30', 'duration: 20')}\n${mission}`)}${body(['First prompt', 'Second prompt'])}`);
  write('labs/mis/README.md', body(['First prompt']).trimStart());
  write('labs/mis/images/hero.webp', webp(100, 50));
  write('labs/mis/images/step.webp', webp(300, 100));
  write('labs/mis/images/step-dark.webp', webp(200, 100));
  return dir;
}

test('fixture repo: each seeded problem is reported once, with the right severity', t => {
  const dir = fixtureRepo();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  const result = audit.auditAll({ root: dir });
  const codes = slug => result.findings.filter(f => f.slug === slug).map(f => `${f.severity} ${f.code} ${f.file}`);

  // The clean lab only reports what is informational.
  assert.deepEqual(codes('good'), ['info image-orphan labs/good/images']);

  const bad = codes('bad');
  for (const expected of [
    'error anchor-broken _labs/bad.md', 'error anchor-broken labs/bad/README.md',
    'error image-missing _labs/bad.md', 'error image-missing labs/bad/README.md',
    'error module-missing _labs/bad.md', 'warn fm-invalid _labs/bad.md', 'warn fm-unlisted _labs/bad.md',
    'warn copy-drift _labs/bad.md', 'warn details-mismatch _labs/bad.md', 'warn term-retired _labs/bad.md',
  ]) assert.ok(bad.includes(expected), `${expected}\n${bad.join('\n')}`);
  const term = result.findings.find(f => f.slug === 'bad' && f.code === 'term-retired' && f.file === '_labs/bad.md');
  assert.match(term.message, /Lines \d+\.$/, 'the "formerly" line is not reported');

  // Only the listed event is blocked from linking the unlisted lab.
  assert.ok(bad.includes('info agenda-usage _labs/bad.md'), 'agenda slots are listed for review');
  const references = result.findings.filter(f => /^agenda-(?!usage)/.test(f.code)).map(f => `${f.slug} ${f.code} ${f.file}`);
  assert.deepEqual(references.sort(), [
    'bad agenda-unlisted-lab _data/agendas/main-event.yml',
    'ghost agenda-unknown-lab _data/agendas/main-event.yml',
  ]);

  const mis = result.findings.filter(f => f.slug === 'mis');
  const has = (code, pattern) => mis.some(f => f.code === code && pattern.test(f.message));
  assert.ok(has('missions-minutes', /add up to 10; front matter duration is 20/));
  assert.ok(has('missions-contract', /2 correct options/));
  assert.ok(has('missions-image', /step\.webp is 300x100 but declares 200x100/));
  assert.ok(mis.some(f => f.code === 'missions-prompt' && f.file === 'labs/mis/README.md' && /Second prompt/.test(f.message)));
  assert.ok(!mis.some(f => f.code === 'missions-prompt' && f.file === '_labs/mis.md'), 'a block-scalar prompt matches its fenced copy');
  assert.ok(has('missions-test', /No scripts/));
  assert.ok(!mis.some(f => f.code === 'heading-emoji' || f.code === 'image-missing'));
});

test('fixture repo: changed paths map to labs, and agenda edits widen the reference scope', t => {
  const dir = fixtureRepo();
  t.after(() => fs.rmSync(dir, { recursive: true, force: true }));
  fs.mkdirSync(path.join(dir, 'labs', 'bootcamp'), { recursive: true });
  fs.writeFileSync(path.join(dir, 'labs', 'bootcamp', 'index.md'), '');
  assert.deepEqual(audit.classifyChanges(dir, ['labs/good/images/pic.png', '_labs/bad.md', 'labs/bootcamp/index.md', 'README.md']), { slugs: ['bad', 'good'], references: false });
  assert.deepEqual(audit.classifyChanges(dir, ['_data/agendas/main-event.yml']), { slugs: [], references: true });

  const scoped = audit.auditAll({ root: dir, slugs: ['good'] });
  assert.ok(!scoped.findings.some(f => f.slug === 'ghost'), 'reference checks follow the slug scope');
  const widened = audit.auditAll({ root: dir, slugs: ['good'], allReferences: true });
  assert.ok(widened.findings.some(f => f.slug === 'ghost' && f.code === 'agenda-unknown-lab'));
});

test('the real Zava Sales missions lab meets the missions contract and stays in sync', () => {
  const result = audit.auditAll({ root, slugs: ['cowork-zava-sales'] });
  const blocking = result.findings.filter(f => /^missions-/.test(f.code) || f.code === 'copy-drift' || f.code === 'image-missing');
  assert.deepEqual(blocking, []);
});

test('formatters summarize counts and render a markdown table', () => {
  const result = {
    labs: ['x'],
    findings: [{ slug: 'x', severity: 'warn', code: 'copy-drift', file: '_labs/x.md', line: 3, message: 'Drift | here \\| too.' }],
    summary: { error: 0, warn: 1, info: 0 },
  };
  assert.match(audit.formatText(result), /x\n {2}warn {3}copy-drift {2}_labs\/x\.md:3 {2}Drift/);
  const markdown = audit.formatMarkdown(result);
  assert.match(markdown, /\| `x` \| 🟡 warn \| `copy-drift` \| `_labs\/x\.md:3` \|/);
  assert.ok(markdown.includes('Drift \\| here \\\\\\| too.'), 'backslashes and pipes in messages are escaped');
  assert.match(audit.formatText(result, { minSeverity: 'error' }), /Showing 0/);
});
