const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');
const { labSourcePath } = require('./lab-files');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
const page = matter(read(labSourcePath(root, 'instructions-skills-authoring')));
const readme = read(path.join(root, 'labs', 'instructions-skills-authoring', 'README.md'));
const mission = id => page.data.mission_lab.missions.find(item => item.id === id);
const copies = instruction => [instruction, page.content, readme];

test('skills lab preserves exact prompts in both readable copies', () => {
  const prompts = page.data.mission_lab.missions.flatMap(item => item.steps.filter(step => step.prompt).map(step => step.prompt));
  assert.equal(prompts.length, 20);
  for (const prompt of prompts) {
    for (const copy of [page.content, readme]) {
      assert.ok(copy.includes('```text\n' + prompt + '\n```'), `Missing exact prompt: ${prompt.slice(0, 70)}`);
    }
  }
});

test('skills lab safely exits an unchanged Work IQ review', () => {
  for (const copy of copies(mission('configure').steps[3].instruction)) {
    assert.match(copy, /\*\*Done\*\* is disabled/);
    assert.match(copy, /discard only that unchanged tool review/);
  }
});

test('skills lab separates skill upload, saving, and publication', () => {
  for (const copy of copies(mission('inspect').steps[1].notice)) {
    assert.match(copy, /does not confirm that all configuration is saved/);
    assert.match(copy, /Your agent has been saved/);
    assert.match(copy, /Draft\*\* badge can remain on a saved, unpublished agent/);
  }
});

test('skills lab waits for first save, then attaches the process in a new Preview chat', () => {
  for (const copy of copies(mission('author').steps[1].instruction)) {
    assert.match(copy, /first save finish/);
    assert.match(copy, /return you to \*\*Build\*\*/);
  }
  assert.match(mission('author').steps[1].instruction, /Instructions empty/);
  // The attachment is its own visible step, never only in collapsed help: the authoring prompt depends on it.
  assert.equal(mission('author').steps[2].title, 'Attach the process to a new Preview chat');
  for (const copy of copies(mission('author').steps[2].instruction)) {
    assert.match(copy, /Once the save finishes and the page settles, open \*\*Preview\*\* and select \*\*New chat\*\*/);
    assert.match(copy, /attach only `project-intake-process-v2\.docx` to this conversation/);
  }
  assert.match(mission('author').steps[3].instruction, /In the same \*\*Preview chat\*\*, with the document attached/);
});

test('skills lab checks proposal artifacts rather than relying on chat caveats', () => {
  for (const copy of copies(mission('test').steps[3].notice)) {
    assert.match(copy, /submission-date placeholders, and internal section references in both files/);
    assert.match(copy, /warning in chat does not fix/);
    assert.match(copy, /different installed library and layout/);
  }
});

test('skills lab distinguishes artifact verification from hidden execution', () => {
  assert.match(mission('verify').steps[1].notice, /Compare the chart with the extracted table and the RFP evaluation criteria/);
  assert.doesNotMatch(mission('verify').steps[1].notice, /record it as|reference chart run/);
  assert.match(mission('explore').steps[4].notice, /Not visible does not mean unsupported/);
  assert.match(mission('generate').steps[2].notice, /not a claim that this generation path passed/);
  for (const copy of copies(mission('explore').steps[5].instruction)) {
    assert.match(copy, /Installed-package metadata is not an import or rendering test/);
    assert.match(copy, /Flag absolute capability claims that the snapshot did not test/);
  }
});

test('skills lab explicitly requests both snapshot formats and verifies durable files', () => {
  assert.equal(mission('explore').steps[6].prompt, 'Export the latest snapshot as JSON and Markdown.');
  for (const copy of copies(mission('explore').steps[6].notice)) {
    assert.match(copy, /generic export request may return JSON only/);
    assert.match(copy, /rather than assuming memory retained the snapshot/);
  }
});

test('skills lab retains pacing, conditional repair, and safety boundaries', () => {
  const missions = page.data.mission_lab.missions;
  assert.deepEqual(missions.map(item => item.id), ['configure', 'inspect', 'test', 'verify', 'author', 'explore', 'generate']);
  assert.equal(missions.filter(item => !item.optional).reduce((sum, item) => sum + item.minutes, 0), 30);
  assert.equal(page.data.duration, 30);
  for (const item of missions) assert.equal(item.check.options.filter(option => option.correct).length, 1);
  assert.match(mission('author').steps[15].instruction, /If both tests pass, record the result and stop/);
  assert.match(mission('explore').steps[3].prompt, /Do not install packages, make network requests, run active-safe probes/);
  assert.match(page.data.mission_lab.finish.cleanup, /No publishing, scheduled jobs, or customer sends/);
});
