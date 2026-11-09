const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const slugs = [
  'agent-integration-team', 'copilot-chat-workiq', 'copilot-code-web-app',
  'cowork-zava-sales', 'customer-assist-agent', 'declarative-agent-skill-reuse',
  'hooks-knowledge-travel-policy', 'instructions-skills-authoring',
  'managed-apps-build', 'standard-harness-components', 'workflows-autonomous',
];
const normalize = text => text.replace(/\r\n/g, '\n')
  .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
  .replace(/\]\(#[\uFE0F-]+/g, '](#').trim();

test('all lab documents keep maintainer provenance and runner reports out of learner copy', () => {
  // Limit discovery to lab Markdown: module and presentation content is not part of this contract.
  const siteFiles = fs.readdirSync(path.join(root, '_labs'))
    .filter(name => name.endsWith('.md')).map(name => path.join(root, '_labs', name));
  const readmes = fs.readdirSync(path.join(root, 'labs'), { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => path.join(root, 'labs', entry.name, 'README.md')).filter(file => fs.existsSync(file));
  for (const file of [...siteFiles, ...readmes]) {
    const copy = fs.readFileSync(file, 'utf8');
    assert.doesNotMatch(copy, /Keep (?:Studio and this lab side by side|(?:this |the )lab beside)/i,
      path.relative(root, file));
    assert.doesNotMatch(copy,
      /What was tested|Run-through coverage and screenshot notes|fresh.account (?:run|test)|(?:in|from|during) the (?:live|training) run|not tested in the live run|recaptured live|genuinely captured|no verified dark captures|Image provenance:|spoken cancellation remain unverified|mark the handoff blocked|128\.09 credits/i,
      path.relative(root, file));
  }
});

for (const slug of slugs) {
  test(`${slug}: learner copies exclude maintainer test reports`, () => {
    const page = matter(fs.readFileSync(path.join(root, '_labs', `${slug}.md`), 'utf8'));
    const readme = fs.readFileSync(path.join(root, 'labs', slug, 'README.md'), 'utf8');
    assert.equal(normalize(readme), normalize(page.content));
    assert.equal(page.data.mission_lab.validation, undefined);
    for (const copy of [JSON.stringify(page.data.mission_lab), page.content, readme]) {
      assert.doesNotMatch(copy, /What was tested|Run-through coverage and screenshot notes|fresh.account run|fresh.account test|latest run|earlier.run illustrations|128\.09 credits/i);
    }
    const core = page.data.mission_lab.missions.filter(mission => !mission.optional);
    assert.equal(core.reduce((sum, mission) => sum + mission.minutes, 0), page.data.duration);
  });
}
