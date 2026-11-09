const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const matter = require('gray-matter');

const root = path.resolve(__dirname, '..');
const read = file => fs.readFileSync(path.join(root, file), 'utf8');
const document = matter(read('_labs/workflows-autonomous.md'));
const readme = read('labs/workflows-autonomous/README.md');
const missions = document.data.mission_lab.missions;
const steps = missions.flatMap(mission => mission.steps);
const instructions = JSON.stringify(document.data.mission_lab);
const modern = [instructions, document.content, readme];
const classic = matter(read('_labs/mcs-workflows-latest.md')).content;
const classicReadme = read('labs/mcs-workflows-latest/README.md');
const normalize = text => text.replace(/\r\n/g, '\n')
  .replace(/^(#{1,6})\s+[\p{Extended_Pictographic}\uFE0F\u200D]+\s+/gmu, '$1 ')
  .replace(/\]\(#[\uFE0F-]+/g, '](#').trim();
const fences = text => [...text.matchAll(/```text\r?\n([\s\S]*?)\r?\n```/g)]
  .map(match => match[1].replace(/\r\n/g, '\n').trim());

test('workflow portable copies and every mission prompt stay synchronized', () => {
  assert.equal(document.data.lab_format, 'missions');
  assert.equal(normalize(readme), normalize(document.content));
  assert.equal(normalize(classicReadme), normalize(classic));
  const prompts = steps.filter(step => step.prompt).map(step => step.prompt.trim());
  assert.ok(prompts.length > 10);
  for (const copy of [document.content, readme]) {
    assert.deepEqual(fences(copy), prompts);
  }
});

test('prepared workflow opens directly without runner-specific setup gates', () => {
  for (const copy of [...modern, classic, classicReadme]) {
    assert.doesNotMatch(copy, /Only the flow's owner|Create a copy|sender restriction|repeat all connection and dispatch checks/i);
  }
  assert.equal(missions[0].steps.length, 2);
  assert.match(missions[0].steps[0].instruction, /Workflows → Order Management Workflow → Build/);
  assert.match(missions[0].steps[1].instruction, /Classify/);
  assert.doesNotMatch(JSON.stringify(missions[0]), /owner|connection|restriction/i);
  assert.match(document.data.mission_lab.self_setup, /Import/);
});

test('connections are reused and approval reflects the actual Outlook card', () => {
  for (const copy of [...modern, classic, classicReadme]) {
    assert.match(copy, /connection to resolve and reuse it/);
    assert.match(copy, /Only if it is missing or incorrect/);
    assert.match(copy, /\*\*Yes\*\* under \*\*Approve\*\*/);
    assert.match(copy, /\*\*No → Submit\*\*/);
    assert.match(copy, /Reply to email\*\* is skipped/);
  }
  for (const slug of ['mcs-workflows-latest', 'mcs-workflows']) {
    for (const file of [`_labs/${slug}.md`, `labs/${slug}/README.md`]) {
      const copy = read(file);
      assert.match(copy, /\*\*Yes\*\* under \*\*Approve\*\*/);
      assert.match(copy, /Wait for operations to load before choosing \*\*Done\*\*/);
      assert.match(copy, /\*\*Send draft message\*\*/);
    }
  }
});

test('the core teaches approval, outcomes and cleanup without tenant-warning checklists', () => {
  for (const copy of modern) {
    assert.match(copy, /Subject filter/);
    assert.match(copy, /Approve Equals Yes/);
    assert.match(copy, /Run node/);
    assert.match(copy, /received reply/i);
    assert.match(copy, /Workflow disabled/);
    assert.match(copy, /reload/);
    assert.match(copy, /Running\/Waiting/);
    assert.match(copy, /other labs' workflows unchanged/);
    assert.doesNotMatch(copy, /Check ownership|CC\/BCC|consume.*credits|self-only|sender restriction/i);
  }
});

test('maintainer evidence stays out of learner-facing text', () => {
  assert.equal(document.data.mission_lab.validation, undefined);
  for (const copy of modern) {
    assert.doesNotMatch(copy, /fresh.account|What was tested|earlier.run illustrations|verified run|tested card|credit totals/i);
  }
});

test('optional outputs require persisted records, genuine tool data and self-only dispatch', () => {
  for (const copy of modern) {
    assert.match(copy, /Next Friday/);
    assert.match(copy, /timezones/);
    assert.match(copy, /Created On/);
    assert.match(copy, /stale/i);
    assert.match(copy, /Send draft message/);
    assert.match(copy, /actual quote/);
    assert.match(copy, /read_query/);
  }
  assert.ok(fences(document.content).some(prompt => prompt.includes('Create exactly one Task row')));
});

test('mission screenshot illustrations have existing light and dark pairs', () => {
  for (const shot of steps.map(step => step.screenshot).filter(Boolean)) {
    for (const src of [shot.src, shot.src_dark]) {
      assert.ok(src, 'Every mission illustration needs both themes');
      assert.ok(fs.existsSync(path.join(root, src)), src);
    }
  }
  assert.doesNotMatch(document.content, /^#{1,6}.*\p{Extended_Pictographic}/mu);
});
