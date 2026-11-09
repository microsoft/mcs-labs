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

test('ownership verification precedes the conditional copy fallback', () => {
  // The list named the attendee as Owner, but the prepared designer blocked Publish.
  for (const copy of [...modern, classic, classicReadme]) {
    assert.match(copy, /Only the flow's owner can publish or test this flow/);
    assert.match(copy, /For your assigned starter only/);
    assert.match(copy, /never edit, copy, or take ownership of another attendee's asset/i);
    assert.match(copy, /repeat all connection and dispatch checks/);
    assert.doesNotMatch(copy, /continue only in that copy|starter is unchanged|copy protects the starter/i);
  }
  for (const value of [
    document.data.description, document.data.mission_lab.promise,
    missions[0].title, missions[0].outcome,
  ]) assert.doesNotMatch(value, /copy/i);
});

test('connections are reused and approval reflects the actual Outlook card', () => {
  for (const copy of [...modern, classic, classicReadme]) {
    assert.match(copy, /connection to resolve and reuse it/);
    assert.match(copy, /Only if it is missing or incorrect/);
    assert.match(copy, /\*\*Yes\*\* under \*\*Approve\*\*/);
    assert.match(copy, /\*\*No → Submit\*\*/);
    assert.match(copy, /Reply to email\*\* is skipped/);
    assert.match(copy, /rejection does not complete the approved-reply outcome/i);
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

test('the core preserves sender, reviewer, recipient, actual-output and cleanup gates', () => {
  for (const copy of modern) {
    assert.match(copy, /string\('Order Management'\)/);
    assert.match(copy, /From/);
    assert.match(copy, /reviewer/);
    assert.match(copy, /To = From/);
    assert.match(copy, /empty \*\*CC\/BCC\*\*/);
    assert.match(copy, /node-only test does not execute/i);
    assert.match(copy, /received reply/i);
    assert.match(copy, /Workflow disabled/);
    assert.match(copy, /reload/);
    assert.match(copy, /Running\/Waiting/);
    assert.match(copy, /other labs' workflows unchanged/);
  }
});

test('validation distinguishes the blocked direct route from verified fallback and retained images', () => {
  for (const copy of [document.data.mission_lab, document.content, readme].map(value =>
    typeof value === 'string' ? value : JSON.stringify(value))) {
    assert.match(copy, /Direct publication was blocked/);
    assert.match(copy, /A copy was therefore required for this account/);
    assert.match(copy, /Screenshots are retained earlier-run illustrations/);
    assert.doesNotMatch(copy, /Not live-exercised|No\/rejection is not a validated fallback/);
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
