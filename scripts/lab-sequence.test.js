const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const read = slug => matter(fs.readFileSync(path.join(root, '_labs', `${slug}.md`), 'utf8').replace(/\r\n/g, '\n'));
const pairs = [
  ['mcs-m365-copilot-latest', 'copilot-chat-workiq', ['ask', 'reason', 'apply', 'verify', 'publish', 'research', 'model']],
  ['mcs-copilot-code', 'copilot-code-web-app', ['build', 'style', 'label', 'navigate', 'publish', 'extend']],
  ['mcs-copilot-harness-latest', 'declarative-agent-skill-reuse', ['inspect', 'build', 'ground', 'verify', 'share', 'version']],
  ['mcs-standard-harness', 'standard-harness-components', ['configure', 'author', 'ground', 'extend', 'inspect', 'delegate', 'publish']],
  ['mcs-skills-authoring', 'instructions-skills-authoring', ['configure', 'inspect', 'test', 'verify', 'author', 'explore', 'generate']],
  ['mcs-hooks', 'hooks-knowledge-travel-policy', ['profile', 'policy', 'redact', 'guard']],
  ['mcs-customer-conversation-harness', 'customer-assist-agent', ['build', 'route', 'speak', 'extend']],
  ['mcs-managed-apps', 'managed-apps-build', ['build', 'prepare', 'prove', 'protect', 'repair']],
  ['mcs-workflows-latest', 'workflows-autonomous', ['time-block', 'isolate', 'route', 'review', 'inventory', 'specialist']],
  ['mcs-agent-integration', 'agent-integration-team', ['coordinate', 'ground', 'connect', 'prove', 'challenge']],
];
const blocks = text => [...text.matchAll(/^([ \t]*)```([^\n`]*)\n([\s\S]*?)^\1```[ \t]*$/gm)]
  .map(([, indent, info, block]) => ({
    language: info.trim(),
    text: block.replace(/\n$/, '').split('\n').map(line => line.startsWith(indent) ? line.slice(indent.length) : line).join('\n'),
  }));
const normalize = text => text.replaceAll('/events/bootcamp-latest/', '/events/architecture-bootcamp/')
  // The guided lab already explicitly requests both formats after the live-run fix.
  .replace(/^Export the latest snapshot\.$/, 'Export the latest snapshot as JSON and Markdown.');

for (const [classic, guided, order] of pairs) {
  test(`${guided}: retains creator sequence, including optional material`, () => {
    const source = read(classic);
    const page = read(guided);
    assert.deepEqual(page.data.mission_lab.missions.map(m => m.id), order);
    const expected = blocks(source.content).filter(b => ['', 'text'].includes(b.language)).map(b => normalize(b.text));
    for (const copy of [page.content, fs.readFileSync(path.join(root, 'labs', guided, 'README.md'), 'utf8').replace(/\r\n/g, '\n')]) {
      const actual = blocks(copy).map(b => b.text);
      let cursor = 0;
      for (const prompt of expected) {
        const index = actual.indexOf(prompt, cursor);
        assert.ok(index >= 0, `Missing or reordered original block: ${prompt.slice(0, 65)}`);
        cursor = index + 1;
      }
    }
  });
}

test('model selection follows deeper reasoning within the original public-web use case', () => {
  const missions = read('copilot-chat-workiq').data.mission_lab.missions;
  assert.ok(!missions[0].steps.some(s => s.title === 'Inspect response modes and change the model'));
  const reason = missions.find(m => m.id === 'reason');
  assert.equal(reason.steps.at(-1).title, 'Inspect response modes and change the model');
  assert.notEqual(reason.optional, true);
});

test('shared Cowork keeps its established scenario sequence', () => {
  const missions = read('cowork-zava-sales').data.mission_lab.missions;
  assert.deepEqual(missions.map(m => m.id), ['ask', 'agent', 'delegate', 'repeat', 'record', 'improve', 'specialize']);
});

test('guided Bootcamp extensions follow all required missions', () => {
  for (const slug of [...pairs.map(([, guided]) => guided), 'cowork-zava-sales']) {
    let optionalStarted = false;
    for (const mission of read(slug).data.mission_lab.missions) {
      if (mission.optional) optionalStarted = true;
      else assert.equal(optionalStarted, false, `${slug}: required ${mission.id} follows an optional mission`);
    }
  }
});

test('optional navigation checks for later required work before offering the finish', () => {
  const template = fs.readFileSync(path.join(root, '_includes', 'lab-missions.html'), 'utf8');
  assert.match(template, /remaining_missions = lab\.missions \| slice: forloop\.index, lab\.missions\.size/);
  assert.match(template, /remaining_core = remaining_missions \| where_exp: "item", "item\.optional != true"/);
  assert.match(template, /if remaining_core\.size > 0[\s\S]*href="#{{ remaining_core\.first\.id \| escape }}"[\s\S]*elsif mission\.optional != true[\s\S]*href="#lab-finish"/);
});
