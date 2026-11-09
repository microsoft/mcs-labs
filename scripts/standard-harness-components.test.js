const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { labSourcePath } = require('./lab-files');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const page = matter(read(labSourcePath(root, 'standard-harness-components')));
const readme = read(path.join(root, 'labs', 'standard-harness-components', 'README.md'));
const mission = id => page.data.mission_lab.missions.find(item => item.id === id);
const copies = instruction => [instruction, page.content, readme];

test('component lab preserves all exact prompts in both readable copies', () => {
  const prompts = page.data.mission_lab.missions.flatMap(item => item.steps.filter(step => step.prompt).map(step => step.prompt));
  assert.equal(prompts.length, 27);
  for (const prompt of prompts) {
    for (const copy of [page.content, readme]) {
      assert.ok(copy.includes('```text\n' + prompt + '\n```'), `Missing exact prompt: ${prompt.slice(0,70)}`);
    }
  }
});

test('component lab treats generated messages and assessment headings as variable', () => {
  for (const copy of copies(mission('author').steps[1].instruction)) {
    assert.match(copy, /a welcome message is not required/);
  }
  for (const copy of copies(mission('extend').steps[8].instruction)) {
    assert.match(copy, /Overall Verdict/);
    assert.match(copy, /not required wording/);
  }
});

test('component lab verifies actual weather outputs instead of unsupported additions', () => {
  for (const copy of copies(mission('extend').steps[3].instruction)) {
    assert.match(copy, /actual location, units and output values/);
    assert.match(copy, /air quality or a precipitation forecast/);
    assert.match(copy, /unverified unless the returned data supports them/);
  }
});

test('component lab covers current prompt creation and persisted configuration', () => {
  for (const copy of copies(mission('extend').steps[4].instruction)) {
    assert.match(copy, /Add tool → Add new Prompt/);
    assert.match(copy, /previous weather selection/);
    assert.match(copy, /clear its search/);
  }
  for (const copy of copies(mission('extend').steps[6].instruction)) {
    assert.match(copy, /verify the full description persisted/);
  }
  for (const copy of copies(mission('extend').steps[1].instruction)) {
    assert.match(copy, /Save tool with errors\?/);
    assert.match(copy, /select \*\*Cancel\*\*/);
  }
});

test('component lab verifies web setting and observed retrieval separately', () => {
  for (const copy of copies(mission('ground').steps[2].instruction)) {
    assert.match(copy, /verify the setting persisted/);
    assert.match(copy, /switch alone is not proof/);
  }
});

test('component lab expands live variable scope without requiring new nodes', () => {
  for (const copy of copies(mission('inspect').steps[3].instruction)) {
    assert.match(copy, /Expand \*\*Topic\*\* in \*\*Variables → Test\*\*/);
  }
  for (const copy of copies(mission('inspect').steps[2].help)) {
    assert.match(copy, /inspect the menu only, rather than adding them/);
    assert.match(copy, /did not execute a Set a variable value action/);
  }
});

test('component lab checks child knowledge readiness and assignment', () => {
  for (const copy of copies(mission('delegate').steps[2].help)) {
    assert.match(copy, /See all → Refresh knowledge status/);
    assert.match(copy, /Available to\*\* names \*\*CARE Prompt Guidance/);
  }
});

test('component lab retains timing and honest deployment boundaries', () => {
  const missions = page.data.mission_lab.missions;
  assert.deepEqual(missions.map(item => item.id), ['configure', 'author', 'ground', 'extend', 'inspect', 'delegate', 'publish']);
  assert.equal(missions.filter(item => !item.optional).reduce((sum, item) => sum + item.minutes, 0), 30);
  assert.equal(page.data.duration, 30);
  for (const item of missions) assert.equal(item.check.options.filter(option => option.correct).length, 1);
  assert.equal(mission('publish').optional, true);
  assert.match(mission('publish').steps[3].notice, /Ask the facilitator if launch or sharing is blocked/);
  assert.doesNotMatch(mission('publish').steps[3].notice, /fresh.account|launcher stalled|remain unverified/);
});
