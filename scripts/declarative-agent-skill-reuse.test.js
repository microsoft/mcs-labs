const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const page = matter(fs.readFileSync(path.join(root, '_labs', 'declarative-agent-skill-reuse.md'), 'utf8'));
const readme = fs.readFileSync(path.join(root, 'labs', 'declarative-agent-skill-reuse', 'README.md'), 'utf8');
const mission = id => page.data.mission_lab.missions.find(item => item.id === id);

test('skill reuse waits for a populated Preview request before sending', () => {
  for (const copy of [mission('verify').steps[0].instruction, page.content, readme]) {
    assert.match(copy, /wait until the complete request is visible in the message box/);
    assert.match(copy, /\*\*Cannot send empty message\.\*\*/);
    assert.match(copy, /confirm the text before sending/);
  }
});

test('skill reuse reopens the saved private agent instead of creating duplicates', () => {
  for (const copy of [mission('share').steps[0].instruction, page.content, readme]) {
    assert.match(copy, /Keep the window open until the success dialog/);
    assert.match(copy, /browser reload returns you to \*\*Build your own specialist agent\*\*/);
    assert.match(copy, /open \*\*My agents\*\* and select \*\*Contoso Operations agent\*\*/);
    assert.match(copy, /do not create a duplicate/);
  }
});

test('skill reuse preserves every prompt across the mission and readable copies', () => {
  const prompts = page.data.mission_lab.missions.flatMap(item => item.steps.filter(step => step.prompt).map(step => step.prompt));
  assert.equal(prompts.length, 5);
  for (const prompt of prompts) {
    assert.ok(page.content.includes('```text\n' + prompt + '\n```'));
    assert.ok(readme.includes('```text\n' + prompt + '\n```'));
  }
});

test('skill reuse labels the no-action response as expected draft-only behavior', () => {
  const step = mission('verify').steps.find(item => item.prompt_label === 'Preview · no-action test');
  for (const copy of [step.instruction, page.content, readme]) {
    assert.match(copy, /no write actions are configured/);
    assert.match(copy, /expected boundary test, not a failed email or Planner integration/);
    assert.match(copy, /Reusing a skill does not add authenticated tools/);
  }
  assert.equal(step.screenshot.title, 'Expected result: draft-only behavior');
  assert.match(step.screenshot.caption, /Expected refusal from this lab's draft-only agent/);
});

test('classic skill reuse explains the same deliberate no-action boundary', () => {
  for (const relativePath of [
    ['_labs', 'mcs-copilot-harness-latest.md'],
    ['labs', 'mcs-copilot-harness-latest', 'README.md'],
  ]) {
    const copy = fs.readFileSync(path.join(root, ...relativePath), 'utf8');
    assert.match(copy, /expected boundary test, not a failed email or Planner integration/);
    assert.match(copy, /No write actions are configured/);
    assert.match(copy, /Reusing a skill does not add authenticated tools/);
  }
});

test('skill reuse keeps core timing, optional boundaries and one correct answer per check', () => {
  const missions = page.data.mission_lab.missions;
  assert.equal(missions.filter(item => !item.optional).reduce((sum, item) => sum + item.minutes, 0), 30);
  assert.equal(mission('version').minutes, 25);
  assert.equal(mission('version').optional, true);
  for (const item of missions) assert.equal(item.check.options.filter(option => option.correct).length, 1);
  assert.match(mission('share').steps[1].notice, /mark the handoff blocked/);
});
